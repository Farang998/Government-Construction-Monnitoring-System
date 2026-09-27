import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateProjectProposalInput, ProjectStatus } from '@gov-platform/shared';
import { TokenPayload } from '../auth/auth.service';

export class ProjectService {
  /**
   * Generates a unique, immutable government project code.
   * Format: GJ-{DEPT_CODE}-{DISTRICT_SHORT}-{YEAR}-{SERIAL_6_DIGITS}
   * Example: GJ-RNB-AHM-2026-000145
   */
  async generateProjectCode(departmentId: string, district: string): Promise<string> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { code: true },
    });

    const deptCode = (department?.code || 'GEN').toUpperCase();
    const distShort = district.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();

    const count = await prisma.project.count({
      where: {
        administrativeDepartmentId: departmentId,
      },
    });

    const serialNo = (count + 1).toString().padStart(6, '0');
    return `GJ-${deptCode}-${distShort}-${year}-${serialNo}`;
  }

  async createProposal(input: CreateProjectProposalInput, creatorUser: TokenPayload) {
    const projectCode = await this.generateProjectCode(input.administrativeDepartmentId, input.district);

    // Run inside database transaction for atomic consistency
    const project = await prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          projectCode,
          name: input.name,
          shortDescription: input.shortDescription,
          detailedDescription: input.detailedDescription || null,
          projectTypeId: input.projectTypeId,
          administrativeDepartmentId: input.administrativeDepartmentId,
          implementingDepartmentId: input.implementingDepartmentId,
          executingOfficeId: input.executingOfficeId,
          projectOwnerId: input.projectOwnerId,
          projectManagerId: input.projectManagerId,
          createdById: creatorUser.userId,
          status: ProjectStatus.PROPOSED,
          currentStage: 'PROPOSAL_SUBMISSION',
          state: input.state,
          district: input.district,
          taluka: input.taluka,
          cityVillage: input.cityVillage,
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          estimatedCostInr: input.estimatedCostInr,
          sanctionedCostInr: input.estimatedCostInr,
          fundingSource: input.fundingSource,
          plannedStartDate: new Date(input.plannedStartDate),
          plannedEndDate: new Date(input.plannedEndDate),
          physicalProgressPct: 0.00,
          financialProgressPct: 0.00,
          plannedProgressPct: 0.00,
          scheduleVariancePct: 0.00,
        },
        include: {
          projectType: true,
          administrativeDepartment: true,
          executingOffice: true,
        },
      });

      // Record initial status history
      await tx.projectStatusHistory.create({
        data: {
          projectId: createdProject.id,
          previousStatus: ProjectStatus.PROPOSED,
          newStatus: ProjectStatus.PROPOSED,
          reason: `Project proposal submitted by ${creatorUser.fullName} (${creatorUser.employeeId}). Initial state set to PROPOSED.`,
          changedById: creatorUser.userId,
        },
      });

      return createdProject;
    });

    return project;
  }

  async getProjects(
    query: {
      search?: string;
      departmentId?: string;
      projectTypeId?: string;
      status?: string;
      district?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
    user?: TokenPayload,
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Apply ABAC scoping if officer is restricted by department
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'DEPT_SECRETARY') {
      where.OR = [
        { administrativeDepartmentId: user.departmentId },
        { implementingDepartmentId: user.departmentId },
      ];
    }

    if (query.departmentId) {
      where.administrativeDepartmentId = query.departmentId;
    }

    if (query.projectTypeId) {
      where.projectTypeId = query.projectTypeId;
    }

    if (query.status) {
      where.status = query.status as unknown as undefined;
    }

    if (query.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { projectCode: { contains: query.search, mode: 'insensitive' } },
            { name: { contains: query.search, mode: 'insensitive' } },
            { district: { contains: query.search, mode: 'insensitive' } },
            { cityVillage: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    const sortField = query.sortBy || 'createdAt';
    orderBy[sortField] = query.sortOrder || 'desc';

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          projectType: { select: { code: true, name: true } },
          administrativeDepartment: { select: { id: true, code: true, name: true } },
          executingOffice: { select: { id: true, name: true, district: true } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: projects.map((p) => ({
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        shortDescription: p.shortDescription,
        projectTypeCode: p.projectType.code,
        projectTypeName: p.projectType.name,
        departmentCode: p.administrativeDepartment.code,
        departmentName: p.administrativeDepartment.name,
        status: p.status,
        currentStage: p.currentStage,
        state: p.state,
        district: p.district,
        taluka: p.taluka,
        cityVillage: p.cityVillage,
        estimatedCostInr: Number(p.estimatedCostInr),
        sanctionedCostInr: p.sanctionedCostInr ? Number(p.sanctionedCostInr) : null,
        contractValueInr: p.contractValueInr ? Number(p.contractValueInr) : null,
        totalExpenditureInr: Number(p.totalExpenditureInr),
        physicalProgressPct: Number(p.physicalProgressPct),
        financialProgressPct: Number(p.financialProgressPct),
        plannedProgressPct: Number(p.plannedProgressPct),
        scheduleVariancePct: Number(p.scheduleVariancePct),
        plannedStartDate: p.plannedStartDate.toISOString().split('T')[0],
        plannedEndDate: p.plannedEndDate.toISOString().split('T')[0],
        createdAt: p.createdAt,
      })),
    };
  }

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        projectType: true,
        administrativeDepartment: true,
        implementingDepartment: true,
        executingOffice: true,
        projectOwner: { select: { id: true, fullName: true, designation: { select: { title: true } } } },
        projectManager: { select: { id: true, fullName: true, designation: { select: { title: true } } } },
        createdBy: { select: { id: true, fullName: true, employeeId: true } },
        statusHistories: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return {
      ...project,
      estimatedCostInr: Number(project.estimatedCostInr),
      sanctionedCostInr: project.sanctionedCostInr ? Number(project.sanctionedCostInr) : null,
      contractValueInr: project.contractValueInr ? Number(project.contractValueInr) : null,
      totalExpenditureInr: Number(project.totalExpenditureInr),
      physicalProgressPct: Number(project.physicalProgressPct),
      financialProgressPct: Number(project.financialProgressPct),
      plannedProgressPct: Number(project.plannedProgressPct),
      scheduleVariancePct: Number(project.scheduleVariancePct),
      plannedStartDate: project.plannedStartDate.toISOString().split('T')[0],
      plannedEndDate: project.plannedEndDate.toISOString().split('T')[0],
      actualStartDate: project.actualStartDate ? project.actualStartDate.toISOString().split('T')[0] : null,
      actualEndDate: project.actualEndDate ? project.actualEndDate.toISOString().split('T')[0] : null,
    };
  }

  async getProjectTypes() {
    return prisma.projectType.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
