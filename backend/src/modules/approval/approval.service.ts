import { prisma } from '../../config/prisma';
import { ApprovalAction, WorkflowExecutionType, WorkflowTaskStatus, ProjectStatus } from '@prisma/client';
import { WorkflowActionRequestDto, WorkflowTaskDto } from '@gov-platform/shared';

// Map stage keys to Project Statuses for realistic workflow progression
const STAGE_TO_PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  PROPOSAL_SCRUTINY: ProjectStatus.UNDER_SCRUTINY,
  PRELIMINARY_FEASIBILITY: ProjectStatus.FEASIBILITY_APPROVED,
  ADMINISTRATIVE_SANCTION: ProjectStatus.ADMINISTRATIVELY_APPROVED,
  PARALLEL_STATUTORY_CLEARANCES: ProjectStatus.STATUTORY_CLEARANCES,
  FIRE_NOC: ProjectStatus.STATUTORY_CLEARANCES,
  ENV_CLEARANCE: ProjectStatus.STATUTORY_CLEARANCES,
  LAND_NOC: ProjectStatus.STATUTORY_CLEARANCES,
  DPR_TECHNICAL_SANCTION: ProjectStatus.TECHNICAL_SANCTIONED,
  FINANCIAL_CONCURRENCE: ProjectStatus.FINANCIAL_APPROVED,
  TENDER_AND_CONTRACT_AWARD: ProjectStatus.CONTRACT_AWARDED,
  WORK_ORDER_MOBILIZATION: ProjectStatus.SITE_MOBILIZATION,
};

export class ApprovalService {
  public async getOfficerInboxTasks(user: any): Promise<WorkflowTaskDto[]> {
    const tasks = await prisma.workflowTask.findMany({
      where: {
        status: { in: [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.IN_PROGRESS, WorkflowTaskStatus.REWORK_REQUESTED] },
        OR: [
          { assignedUserId: user.id || user.userId },
          { assignedOfficeId: user.officeId },
          { assignedDesignationId: user.designationId },
        ],
      },
      include: {
        stageDefinition: true,
        instance: {
          include: {
            project: {
              include: {
                implementingDepartment: true,
              },
            },
          },
        },
        assignedUser: {
          include: { designation: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((t: any) => ({
      id: t.id,
      projectId: t.instance.project.id,
      projectCode: t.instance.project.projectCode,
      projectName: t.instance.project.name,
      stageKey: t.stageKey,
      stageName: t.stageDefinition.stageName,
      executionType: t.stageDefinition.executionType as unknown as any,
      status: t.status as unknown as any,
      assignedUserId: t.assignedUserId,
      assignedUserName: t.assignedUser?.fullName,
      assignedDesignationTitle: t.assignedUser?.designation?.title,
      estimatedCostInr: Number(t.instance.project.estimatedCostInr),
      departmentName: t.instance.project.implementingDepartment.name,
      dueDate: t.dueDate.toISOString(),
      isEscalated: !!t.escalatedAt || t.dueDate < new Date(),
    }));
  }

  public async executeTaskAction(
    taskId: string,
    user: any,
    dto: WorkflowActionRequestDto
  ): Promise<{ message: string }> {
    const task = await prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: {
        stageDefinition: true,
        instance: {
          include: {
            project: true,
            template: {
              include: {
                stageDefinitions: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new Error('Workflow task not found');
    }

    if (task.status === WorkflowTaskStatus.APPROVED || task.status === WorkflowTaskStatus.REJECTED) {
      throw new Error('Task has already been finalized and cannot be modified');
    }

    const project = task.instance.project;
    const userId = user.id || user.userId;

    // 1. MAKER-CHECKER SEGREGATION CHECK
    // Submitting officer cannot approve their own submission
    const isSubmitter = project.createdById === userId || project.projectOwnerId === userId;
    if (isSubmitter && (dto.action === ApprovalAction.APPROVE || dto.action === ApprovalAction.RECOMMEND)) {
      const err: any = new Error('ABAC Security Violation: Separation of Duties policy prevents submitting officer from approving project proposal');
      err.statusCode = 403;
      throw err;
    }

    // 2. ABAC FINANCIAL CEILING CHECK
    const limit = Number(user.financialApprovalLimitInr || user.designation?.approvalLimitInr || user.designation?.financialApprovalLimitInr || 0);
    const cost = Number(project.estimatedCostInr || 0);
    if ((dto.action === ApprovalAction.APPROVE || dto.action === ApprovalAction.RECOMMEND) && limit > 0 && cost > limit) {
      const err: any = new Error(`ABAC Security Violation: Project cost (₹${(cost / 10000000).toFixed(2)} Cr) exceeds officer financial approval limit (₹${(limit / 10000000).toFixed(2)} Cr)`);
      err.statusCode = 403;
      throw err;
    }

    await prisma.$transaction(async (tx: any) => {
      // Record Approval History
      await tx.approvalHistory.create({
        data: {
          taskId: task.id,
          actorId: userId,
          action: dto.action as ApprovalAction,
          remarks: dto.remarks,
          conditions: dto.conditions || null,
          delegatedToId: dto.delegatedToId || null,
        },
      });

      // Audit Event Log
      await tx.auditEvent.create({
        data: {
          actorId: userId,
          projectId: project.id,
          action: `WORKFLOW_ACTION_${dto.action}`,
          entityName: 'WORKFLOW_TASK',
          entityId: task.id,
          newState: { action: dto.action, remarks: dto.remarks, stageKey: task.stageKey },
        },
      });

      if (dto.action === ApprovalAction.APPROVE || dto.action === ApprovalAction.RECOMMEND) {
        // Mark current task approved
        await tx.workflowTask.update({
          where: { id: task.id },
          data: { status: WorkflowTaskStatus.APPROVED },
        });

        // Check stage completeness
        const allStageTasks = await tx.workflowTask.findMany({
          where: {
            instanceId: task.instanceId,
            stageKey: task.stageKey,
          },
        });

        const isStageComplete = allStageTasks.every((t: any) => t.id === task.id || t.status === WorkflowTaskStatus.APPROVED);

        if (isStageComplete) {
          const currentStageIndex = task.stageDefinition.orderIndex;
          const nextStageDef = task.instance.template.stageDefinitions.find(
            (s: any) => s.orderIndex > currentStageIndex
          );

          if (nextStageDef) {
            // Advance stage
            await tx.workflowInstance.update({
              where: { id: task.instanceId },
              data: { currentStageKey: nextStageDef.stageKey },
            });

            const newProjectStatus = STAGE_TO_PROJECT_STATUS_MAP[nextStageDef.stageKey] || project.status;
            await tx.project.update({
              where: { id: project.id },
              data: {
                currentStage: nextStageDef.stageKey,
                status: newProjectStatus,
              },
            });

            await tx.projectStageHistory.create({
              data: {
                projectId: project.id,
                previousStage: task.stageKey,
                newStage: nextStageDef.stageKey,
                triggerAction: dto.action,
                remarks: dto.remarks,
                changedById: userId,
              },
            });

            // Spawn next stage task(s)
            if (nextStageDef.executionType === WorkflowExecutionType.PARALLEL_GATE) {
              const subClearances = ['FIRE_NOC', 'ENV_CLEARANCE', 'LAND_NOC'];
              for (const cl of subClearances) {
                await tx.workflowTask.create({
                  data: {
                    instanceId: task.instanceId,
                    stageDefinitionId: nextStageDef.id,
                    stageKey: cl,
                    status: WorkflowTaskStatus.PENDING,
                    dueDate: new Date(Date.now() + nextStageDef.slaHours * 3600 * 1000),
                  },
                });
              }
            } else {
              await tx.workflowTask.create({
                data: {
                  instanceId: task.instanceId,
                  stageDefinitionId: nextStageDef.id,
                  stageKey: nextStageDef.stageKey,
                  status: WorkflowTaskStatus.PENDING,
                  dueDate: new Date(Date.now() + nextStageDef.slaHours * 3600 * 1000),
                },
              });
            }
          } else {
            // Workflow complete
            await tx.workflowInstance.update({
              where: { id: task.instanceId },
              data: { isCompleted: true },
            });
            await tx.project.update({
              where: { id: project.id },
              data: { status: ProjectStatus.COMPLETION_CERTIFIED },
            });
          }
        }
      } else if (dto.action === ApprovalAction.RETURN_FOR_REWORK) {
        await tx.workflowTask.update({
          where: { id: task.id },
          data: { status: WorkflowTaskStatus.REWORK_REQUESTED },
        });

        const targetStage = dto.targetReworkStageKey || 'PROPOSAL_SCRUTINY';
        await tx.workflowInstance.update({
          where: { id: task.instanceId },
          data: { currentStageKey: targetStage },
        });

        await tx.project.update({
          where: { id: project.id },
          data: { currentStage: targetStage, status: ProjectStatus.UNDER_SCRUTINY },
        });

        await tx.projectStageHistory.create({
          data: {
            projectId: project.id,
            previousStage: task.stageKey,
            newStage: targetStage,
            triggerAction: 'RETURN_FOR_REWORK',
            remarks: dto.remarks,
            changedById: userId,
          },
        });

        // Spawn rework task for project manager
        await tx.workflowTask.create({
          data: {
            instanceId: task.instanceId,
            stageDefinitionId: task.stageDefinitionId,
            stageKey: targetStage,
            assignedUserId: project.projectOwnerId || project.createdById,
            status: WorkflowTaskStatus.PENDING,
            dueDate: new Date(Date.now() + 48 * 3600 * 1000),
          },
        });
      } else if (dto.action === ApprovalAction.REJECT) {
        await tx.workflowTask.update({
          where: { id: task.id },
          data: { status: WorkflowTaskStatus.REJECTED },
        });
        await tx.project.update({
          where: { id: project.id },
          data: { status: ProjectStatus.CANCELLED },
        });
      } else if (dto.action === ApprovalAction.DELEGATE) {
        if (!dto.delegatedToId) {
          throw new Error('Target officer ID is required for delegation');
        }
        await tx.workflowTask.update({
          where: { id: task.id },
          data: { assignedUserId: dto.delegatedToId },
        });
      }
    });

    return { message: `Task action ${dto.action} processed successfully` };
  }
}

export const approvalService = new ApprovalService();
