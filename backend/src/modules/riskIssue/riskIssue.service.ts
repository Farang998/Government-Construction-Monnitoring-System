import { prisma } from '../../config/prisma';
import {
  DelayRecordDto,
  RiskRecordDto,
  IssueRecordDto,
  CreateDelayInput,
  CreateRiskInput,
  CreateIssueInput,
  ResolveIssueInput,
  DelayCategory,
  SeverityLevel,
} from '@gov-platform/shared';

export class RiskIssueService {
  /**
   * Log project delay record and recalculate project schedule variance %
   */
  public async logDelay(user: any, dto: CreateDelayInput): Promise<DelayRecordDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;
    const daysLost = dto.delayDays;

    const delayRecord = await prisma.$transaction(async (tx: any) => {
      const created = await tx.delayRecord.create({
        data: {
          projectId: dto.projectId,
          category: dto.category as DelayCategory,
          severity: 'MEDIUM',
          startDate: dto.reportingDate ? new Date(dto.reportingDate) : new Date(),
          daysLost: daysLost,
          reason: dto.reasonDescription,
          impactDescription: dto.financialImpactInr ? `Financial Impact: INR ${dto.financialImpactInr.toLocaleString()}` : 'Project Timeline Extension',
          correctiveAction: dto.mitigationPlan || 'Schedule Acceleration Plan',
          responsibleParty: user.fullName || user.username || 'Field Engineer',
          isResolved: false,
        },
        include: {
          project: true,
        },
      });

      // Calculate schedule variance % increase
      const currentVariance = Number(project.scheduleVariancePct || 0);
      const additionalVariance = (daysLost / 365) * 100;
      const updatedVariance = parseFloat((currentVariance + additionalVariance).toFixed(2));

      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          scheduleVariancePct: updatedVariance,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'PROJECT_DELAY_RECORDED',
          entityName: 'DelayRecord',
          entityId: created.id,
          newState: JSON.stringify({ daysLost, category: dto.category }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    return {
      id: delayRecord.id,
      projectId: delayRecord.projectId,
      projectCode: delayRecord.project.projectCode,
      projectName: delayRecord.project.name,
      category: delayRecord.category as DelayCategory,
      delayDays: delayRecord.daysLost || 0,
      financialImpactInr: dto.financialImpactInr || null,
      reasonDescription: delayRecord.reason,
      mitigationPlan: delayRecord.correctiveAction,
      reportingDate: delayRecord.startDate.toISOString(),
      reportedByName: delayRecord.responsibleParty,
      createdAt: delayRecord.createdAt.toISOString(),
    };
  }

  /**
   * Register project risk matrix entry
   */
  public async logRisk(user: any, dto: CreateRiskInput): Promise<RiskRecordDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const probScale = Math.min(5, Math.max(1, Math.round(dto.probabilityPct / 20)));

    const created = await prisma.riskRecord.create({
      data: {
        projectId: dto.projectId,
        title: dto.riskTitle,
        probability: probScale,
        impact: dto.severity === 'CRITICAL' ? 5 : dto.severity === 'HIGH' ? 4 : dto.severity === 'MEDIUM' ? 3 : 2,
        severity: dto.severity as SeverityLevel,
        mitigationPlan: dto.mitigationStrategy,
        ownerName: user.fullName || user.username || 'Assigned Officer',
        isMitigated: false,
      },
      include: {
        project: true,
      },
    });

    return {
      id: created.id,
      projectId: created.projectId,
      projectCode: created.project.projectCode,
      projectName: created.project.name,
      riskTitle: created.title,
      riskDescription: created.mitigationPlan,
      severity: created.severity as SeverityLevel,
      probabilityPct: created.probability * 20,
      mitigationStrategy: created.mitigationPlan,
      assignedOfficerName: created.ownerName,
      isMitigated: created.isMitigated,
      createdAt: created.createdAt.toISOString(),
    };
  }

  /**
   * Raise field blocker issue. Triggers automatic escalation for HIGH/CRITICAL severity.
   */
  public async raiseIssue(user: any, dto: CreateIssueInput): Promise<IssueRecordDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { administrativeDepartment: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;
    const isCritical = dto.severity === 'CRITICAL' || dto.severity === 'HIGH';
    const escalationRole = isCritical ? 'CHIEF_ENGINEER' : null;

    const issue = await prisma.$transaction(async (tx: any) => {
      const created = await tx.issueRecord.create({
        data: {
          projectId: dto.projectId,
          reportedById: userId,
          title: dto.issueTitle,
          description: dto.issueDescription,
          severity: dto.severity as SeverityLevel,
          isResolved: false,
        },
        include: {
          project: {
            include: { administrativeDepartment: true },
          },
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: isCritical ? 'ISSUE_RAISED_AND_ESCALATED' : 'ISSUE_RAISED',
          entityName: 'IssueRecord',
          entityId: created.id,
          newState: JSON.stringify({
            severity: dto.severity,
            isEscalated: isCritical,
            escalatedToRole: escalationRole,
          }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    return {
      id: issue.id,
      projectId: issue.projectId,
      projectCode: issue.project.projectCode,
      projectName: issue.project.name,
      issueTitle: issue.title,
      issueDescription: issue.description,
      severity: issue.severity as SeverityLevel,
      departmentCode: issue.project.administrativeDepartment.code,
      departmentName: issue.project.administrativeDepartment.name,
      isEscalated: isCritical,
      escalatedToRole: escalationRole,
      status: issue.isResolved ? 'RESOLVED' : 'OPEN',
      resolutionNotes: issue.resolutionNotes,
      raisedByName: user.fullName || user.username || 'Field Engineer',
      createdAt: issue.createdAt.toISOString(),
    };
  }

  /**
   * Resolve field issue
   */
  public async resolveIssue(user: any, dto: ResolveIssueInput): Promise<{ message: string; issueId: string }> {
    const issue = await prisma.issueRecord.findUnique({
      where: { id: dto.issueId },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const userId = user.id || user.userId;

    await prisma.$transaction(async (tx: any) => {
      await tx.issueRecord.update({
        where: { id: dto.issueId },
        data: {
          isResolved: true,
          resolutionNotes: dto.resolutionNotes,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: issue.projectId,
          actorId: userId,
          action: 'ISSUE_RESOLVED',
          entityName: 'IssueRecord',
          entityId: dto.issueId,
          newState: JSON.stringify({ isResolved: true, resolutionNotes: dto.resolutionNotes }),
          timestamp: new Date(),
        },
      });
    });

    return {
      message: 'Field issue resolved and compliance logged successfully',
      issueId: dto.issueId,
    };
  }

  /**
   * Get delay records for project
   */
  public async getProjectDelays(projectId?: string): Promise<DelayRecordDto[]> {
    const list = await prisma.delayRecord.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((d: any) => ({
      id: d.id,
      projectId: d.projectId,
      projectCode: d.project.projectCode,
      projectName: d.project.name,
      category: d.category as DelayCategory,
      delayDays: d.daysLost || 0,
      financialImpactInr: null,
      reasonDescription: d.reason,
      mitigationPlan: d.correctiveAction,
      reportingDate: d.startDate.toISOString(),
      reportedByName: d.responsibleParty,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  /**
   * Get risk records for project
   */
  public async getProjectRisks(projectId?: string): Promise<RiskRecordDto[]> {
    const list = await prisma.riskRecord.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      projectCode: r.project.projectCode,
      projectName: r.project.name,
      riskTitle: r.title,
      riskDescription: r.mitigationPlan,
      severity: r.severity as SeverityLevel,
      probabilityPct: r.probability * 20,
      mitigationStrategy: r.mitigationPlan,
      assignedOfficerName: r.ownerName,
      isMitigated: r.isMitigated,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Get field issues & escalations
   */
  public async getProjectIssues(projectId?: string): Promise<IssueRecordDto[]> {
    const list = await prisma.issueRecord.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          include: { administrativeDepartment: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((i: any) => {
      const isCritical = i.severity === 'CRITICAL' || i.severity === 'HIGH';
      return {
        id: i.id,
        projectId: i.projectId,
        projectCode: i.project.projectCode,
        projectName: i.project.name,
        issueTitle: i.title,
        issueDescription: i.description,
        severity: i.severity as SeverityLevel,
        departmentCode: i.project.administrativeDepartment.code,
        departmentName: i.project.administrativeDepartment.name,
        isEscalated: isCritical,
        escalatedToRole: isCritical ? 'CHIEF_ENGINEER' : null,
        status: i.isResolved ? 'RESOLVED' : 'OPEN',
        resolutionNotes: i.resolutionNotes,
        raisedByName: 'Field Officer',
        createdAt: i.createdAt.toISOString(),
      };
    });
  }
}

export const riskIssueService = new RiskIssueService();
