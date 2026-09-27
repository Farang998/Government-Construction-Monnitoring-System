import { prisma } from '../../config/prisma';
import type {
  ExecutiveAnalyticsDto,
  PublicProjectDto,
  CitizenFeedbackDto,
  CreateCitizenFeedbackInput,
} from '@gov-platform/shared';

export class ReportsService {
  /**
   * Get State Executive Command Analytics
   */
  public async getExecutiveAnalytics(): Promise<ExecutiveAnalyticsDto> {
    const projects = await prisma.project.findMany({
      include: {
        administrativeDepartment: true,
      },
    });

    const totalProjects = projects.length;
    let totalSanctionedCostInr = 0;
    let totalExpenditureInr = 0;
    let sumPhysicalProgress = 0;
    let sumFinancialProgress = 0;

    const districtMap: Record<string, { count: number; expenditure: number; sumPhysical: number }> = {};
    const deptMap: Record<string, { name: string; count: number; sanctionedCost: number }> = {};

    projects.forEach((p) => {
      const sanctioned = Number(p.sanctionedCostInr || p.estimatedCostInr);
      const expenditure = Number(p.totalExpenditureInr || 0);
      const physPct = Number(p.physicalProgressPct || 0);
      const finPct = Number(p.financialProgressPct || 0);

      totalSanctionedCostInr += sanctioned;
      totalExpenditureInr += expenditure;
      sumPhysicalProgress += physPct;
      sumFinancialProgress += finPct;

      // District metrics
      const dist = p.district || 'Statewide';
      if (!districtMap[dist]) {
        districtMap[dist] = { count: 0, expenditure: 0, sumPhysical: 0 };
      }
      districtMap[dist].count += 1;
      districtMap[dist].expenditure += expenditure;
      districtMap[dist].sumPhysical += physPct;

      // Department metrics
      const deptCode = p.administrativeDepartment?.code || 'R&B';
      const deptName = p.administrativeDepartment?.name || 'Roads & Buildings Department';
      if (!deptMap[deptCode]) {
        deptMap[deptCode] = { name: deptName, count: 0, sanctionedCost: 0 };
      }
      deptMap[deptCode].count += 1;
      deptMap[deptCode].sanctionedCost += sanctioned;
    });

    const activeEscalationsCount = await prisma.issueRecord.count({
      where: { isResolved: false, severity: { in: ['HIGH', 'CRITICAL'] as any } },
    });

    const dlpDefectsCount = await prisma.dlpDefect.count({
      where: { isRectified: false },
    });

    const districtMetrics = Object.entries(districtMap).map(([district, data]) => ({
      district,
      projectCount: data.count,
      expenditureInr: data.expenditure,
      avgPhysicalProgressPct: parseFloat((data.sumPhysical / data.count).toFixed(2)),
    }));

    const departmentMetrics = Object.entries(deptMap).map(([code, data]) => ({
      departmentCode: code,
      departmentName: data.name,
      projectCount: data.count,
      sanctionedCostInr: data.sanctionedCost,
    }));

    return {
      totalProjects,
      totalSanctionedCostInr,
      totalExpenditureInr,
      avgPhysicalProgressPct: totalProjects > 0 ? parseFloat((sumPhysicalProgress / totalProjects).toFixed(2)) : 0,
      avgFinancialProgressPct: totalProjects > 0 ? parseFloat((sumFinancialProgress / totalProjects).toFixed(2)) : 0,
      activeEscalationsCount,
      dlpDefectsCount,
      districtMetrics,
      departmentMetrics,
    };
  }

  /**
   * Public Citizen Transparency Registry (Unauthenticated)
   */
  public async getPublicProjects(filters?: { district?: string; search?: string }): Promise<PublicProjectDto[]> {
    const where: any = {};
    if (filters?.district) where.district = filters.district;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { projectCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        administrativeDepartment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return projects.map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      name: p.name,
      shortDescription: p.shortDescription,
      departmentName: p.administrativeDepartment.name,
      status: p.status,
      currentStage: p.currentStage,
      district: p.district,
      taluka: p.taluka,
      latitude: p.latitude ? Number(p.latitude) : null,
      longitude: p.longitude ? Number(p.longitude) : null,
      sanctionedCostInr: p.sanctionedCostInr ? Number(p.sanctionedCostInr) : Number(p.estimatedCostInr),
      physicalProgressPct: Number(p.physicalProgressPct),
      financialProgressPct: Number(p.financialProgressPct),
      plannedEndDate: p.plannedEndDate.toISOString().split('T')[0]!,
    }));
  }

  /**
   * Submit Public Citizen Feedback / Grievance
   */
  public async submitCitizenFeedback(dto: CreateCitizenFeedbackInput): Promise<CitizenFeedbackDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const feedback = await prisma.citizenFeedback.create({
      data: {
        projectId: dto.projectId,
        citizenName: dto.citizenName,
        contactPhone: dto.contactPhone || null,
        feedbackType: dto.feedbackType || 'DEFECT_REPORT',
        subject: dto.subject,
        details: dto.details,
        status: 'SUBMITTED',
      },
      include: {
        project: true,
      },
    });

    return {
      id: feedback.id,
      projectId: feedback.projectId,
      projectCode: feedback.project.projectCode,
      projectName: feedback.project.name,
      citizenName: feedback.citizenName,
      contactPhone: feedback.contactPhone,
      feedbackType: feedback.feedbackType,
      subject: feedback.subject,
      details: feedback.details,
      status: feedback.status,
      createdAt: feedback.createdAt.toISOString(),
    };
  }

  /**
   * Get Citizen Feedback entries
   */
  public async getCitizenFeedback(projectId?: string): Promise<CitizenFeedbackDto[]> {
    const list = await prisma.citizenFeedback.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      projectCode: f.project.projectCode,
      projectName: f.project.name,
      citizenName: f.citizenName,
      contactPhone: f.contactPhone,
      feedbackType: f.feedbackType,
      subject: f.subject,
      details: f.details,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    }));
  }

  /**
   * Generate Full Executive Project Dossier Summary
   */
  public async generateProjectDossier(projectId: string): Promise<any> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        administrativeDepartment: true,
        implementingDepartment: true,
        executingOffice: true,
        projectOwner: true,
        projectManager: true,
        contracts: true,
        milestones: true,
        inspections: true,
        delays: true,
        issues: true,
        risks: true,
        budgetSanctions: true,
        expenditures: true,
        completionCertificates: true,
        dlpDefects: true,
        assetHandovers: true,
        statusHistories: true,
      },
    });

    if (!project) throw new Error('Project not found');

    return {
      generatedAt: new Date().toISOString(),
      projectSummary: {
        id: project.id,
        code: project.projectCode,
        name: project.name,
        department: project.administrativeDepartment.name,
        district: project.district,
        status: project.status,
        stage: project.currentStage,
        estimatedCostInr: Number(project.estimatedCostInr),
        sanctionedCostInr: project.sanctionedCostInr ? Number(project.sanctionedCostInr) : null,
        totalExpenditureInr: Number(project.totalExpenditureInr),
        physicalProgressPct: Number(project.physicalProgressPct),
        financialProgressPct: Number(project.financialProgressPct),
      },
      ownership: {
        owner: `${project.projectOwner.fullName} (${project.projectOwner.email})`,
        manager: `${project.projectManager.fullName} (${project.projectManager.email})`,
        office: project.executingOffice.name,
      },
      contractsCount: project.contracts.length,
      inspectionsCount: project.inspections.length,
      delaysCount: project.delays.length,
      activeIssuesCount: project.issues.filter((i) => !i.isResolved).length,
      completionCertificatesCount: project.completionCertificates.length,
      assetHandoversCount: project.assetHandovers.length,
    };
  }
}

export const reportsService = new ReportsService();
