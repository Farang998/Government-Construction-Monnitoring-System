import { prisma } from '../../config/prisma';
import { WorkflowTaskStatus } from '@prisma/client';
import { WorkflowInstanceDto, WorkflowStageStatusDto } from '@gov-platform/shared';

export class WorkflowService {
  public async getTemplates() {
    return prisma.workflowTemplate.findMany({
      where: { isActive: true },
      include: {
        stageDefinitions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  public async getProjectWorkflow(projectId: string): Promise<WorkflowInstanceDto | null> {
    const instance = await prisma.workflowInstance.findUnique({
      where: { projectId },
      include: {
        template: {
          include: {
            stageDefinitions: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        tasks: {
          include: {
            assignedUser: {
              include: { designation: true },
            },
            approvalHistories: {
              include: {
                actor: { include: { designation: true } },
                delegatedTo: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!instance) return null;

    // Map stages and status
    const stageDefs = instance.template.stageDefinitions;
    const stages: WorkflowStageStatusDto[] = stageDefs.map((def: any) => {
      const stageTasks = instance.tasks.filter((t: any) => t.stageKey === def.stageKey);
      
      let status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REWORK_REQUESTED' = 'PENDING';
      
      if (stageTasks.length > 0) {
        const hasApproved = stageTasks.every((t: any) => t.status === WorkflowTaskStatus.APPROVED || t.status === WorkflowTaskStatus.RECOMMENDED);
        const hasRework = stageTasks.some((t: any) => t.status === WorkflowTaskStatus.REWORK_REQUESTED);
        const hasPending = stageTasks.some((t: any) => t.status === WorkflowTaskStatus.PENDING || t.status === WorkflowTaskStatus.IN_PROGRESS);

        if (hasApproved && !hasPending) {
          status = 'COMPLETED';
        } else if (hasRework) {
          status = 'REWORK_REQUESTED';
        } else if (hasPending) {
          status = 'IN_PROGRESS';
        }
      } else if (def.orderIndex < (stageDefs.find((s: any) => s.stageKey === instance.currentStageKey)?.orderIndex ?? 999)) {
        status = 'COMPLETED';
      } else if (def.stageKey === instance.currentStageKey) {
        status = 'IN_PROGRESS';
      }

      const completedTask = stageTasks.find((t: any) => t.status === WorkflowTaskStatus.APPROVED);

      return {
        stageKey: def.stageKey,
        stageName: def.stageName,
        orderIndex: def.orderIndex,
        executionType: def.executionType as unknown as any,
        prerequisiteStageKeys: def.prerequisiteStageKeys,
        status,
        completedAt: completedTask?.updatedAt ? completedTask.updatedAt.toISOString() : undefined,
        completedBy: completedTask?.assignedUser?.fullName,
        tasks: stageTasks.map((t: any) => ({
          id: t.id,
          projectId: instance.projectId,
          projectCode: '',
          projectName: '',
          stageKey: t.stageKey,
          stageName: def.stageName,
          executionType: def.executionType as unknown as any,
          status: t.status as unknown as any,
          assignedUserId: t.assignedUserId,
          assignedUserName: t.assignedUser?.fullName,
          assignedDesignationTitle: t.assignedUser?.designation.title,
          dueDate: t.dueDate.toISOString(),
          isEscalated: !!t.escalatedAt,
        })),
      };
    });

    // Flatten history
    const history = instance.tasks.flatMap((t: any) =>
      t.approvalHistories.map((h: any) => ({
        id: h.id,
        taskId: h.taskId,
        actorId: h.actorId,
        actorName: h.actor.fullName,
        actorDesignation: h.actor.designation.title,
        action: h.action as unknown as any,
        remarks: h.remarks,
        conditions: h.conditions,
        delegatedToId: h.delegatedToId,
        delegatedToName: h.delegatedTo?.fullName,
        createdAt: h.createdAt.toISOString(),
      }))
    );

    return {
      id: instance.id,
      projectId: instance.projectId,
      templateCode: instance.template.code,
      templateName: instance.template.name,
      currentStageKey: instance.currentStageKey,
      isCompleted: instance.isCompleted,
      stages,
      history,
    };
  }
}

export const workflowService = new WorkflowService();
