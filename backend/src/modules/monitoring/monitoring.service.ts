import { prisma } from '../../config/prisma';
import { LogProgressInput, MilestoneDto, ProgressUpdateDto } from '@gov-platform/shared';
import { MilestoneStatus } from '@prisma/client';

export class MonitoringService {
  public async getMilestones(projectId: string): Promise<MilestoneDto[]> {
    const list = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { plannedStartDate: 'asc' },
    });

    return list.map((m: any) => ({
      id: m.id,
      projectId: m.projectId,
      title: m.title,
      description: m.description,
      weightagePct: Number(m.weightagePct),
      completionPct: Number(m.completionPct),
      status: m.status as unknown as any,
      plannedStartDate: m.plannedStartDate.toISOString(),
      plannedEndDate: m.plannedEndDate.toISOString(),
      actualStartDate: m.actualStartDate ? m.actualStartDate.toISOString() : null,
      actualEndDate: m.actualEndDate ? m.actualEndDate.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  public async getProgressUpdates(projectId: string): Promise<ProgressUpdateDto[]> {
    const list = await prisma.progressUpdate.findMany({
      where: { projectId },
      include: {
        milestone: true,
      },
      orderBy: { reportingDate: 'desc' },
    });

    const userIds = list.map((u: any) => u.submittedById);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    return list.map((p: any) => ({
      id: p.id,
      projectId: p.projectId,
      milestoneId: p.milestoneId,
      milestoneTitle: p.milestone?.title,
      physicalProgressPct: Number(p.physicalProgressPct),
      financialExpenditureInr: Number(p.financialExpenditureInr),
      reportingDate: p.reportingDate.toISOString(),
      remarks: p.remarks,
      submittedByName: userMap.get(p.submittedById) || 'Field Engineer',
      createdAt: p.createdAt.toISOString(),
    }));
  }

  public async logProgressUpdate(user: any, dto: LogProgressInput): Promise<{ message: string; physicalProgressPct: number; financialProgressPct: number }> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update Milestone if provided
      if (dto.milestoneId && dto.milestoneCompletionPct !== undefined) {
        const pct = Math.min(100, Math.max(0, dto.milestoneCompletionPct));
        const status = pct === 100 ? MilestoneStatus.COMPLETED : pct > 0 ? MilestoneStatus.IN_PROGRESS : MilestoneStatus.NOT_STARTED;
        
        await tx.milestone.update({
          where: { id: dto.milestoneId },
          data: {
            completionPct: pct,
            status,
            actualStartDate: pct > 0 ? new Date() : undefined,
            actualEndDate: pct === 100 ? new Date() : undefined,
          },
        });
      }

      // 2. Recalculate Overall Project Physical Progress %
      const milestones = await tx.milestone.findMany({
        where: { projectId: dto.projectId },
      });

      let calculatedPhysicalPct = 0;
      if (milestones.length > 0) {
        for (const m of milestones) {
          calculatedPhysicalPct += (Number(m.completionPct) * Number(m.weightagePct)) / 100;
        }
      }
      calculatedPhysicalPct = Math.min(100, Number(calculatedPhysicalPct.toFixed(2)));

      // 3. Handle Financial Expenditure Voucher
      let updatedTotalExpenditure = Number(project.totalExpenditureInr);
      const expenditureAmount = dto.financialExpenditureInr || 0;

      if (expenditureAmount > 0) {
        updatedTotalExpenditure += expenditureAmount;

        const voucherNo = `EXP-VOUCH-${Date.now().toString().slice(-6)}`;
        await tx.expenditure.create({
          data: {
            projectId: dto.projectId,
            voucherNo,
            voucherDate: dto.reportingDate ? new Date(dto.reportingDate) : new Date(),
            amountInr: expenditureAmount,
            paymentMode: 'PUBLIC_TREASURY_IFMS',
            payeeName: 'Contractor Work Execution Voucher',
            headOfAccount: '8443-CIVIL-WORKS-HEAD',
            recordedById: userId,
          },
        });
      }

      const costBasis = Number(project.contractValueInr || project.sanctionedCostInr || project.estimatedCostInr || 1);
      const calculatedFinancialPct = Math.min(100, Number(((updatedTotalExpenditure / costBasis) * 100).toFixed(2)));

      // 4. Log Progress Update History Record
      await tx.progressUpdate.create({
        data: {
          projectId: dto.projectId,
          milestoneId: dto.milestoneId || null,
          physicalProgressPct: calculatedPhysicalPct,
          financialExpenditureInr: expenditureAmount,
          reportingDate: dto.reportingDate ? new Date(dto.reportingDate) : new Date(),
          remarks: dto.remarks,
          submittedById: userId,
        },
      });

      // 5. Update Project Summary
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          physicalProgressPct: calculatedPhysicalPct,
          financialProgressPct: calculatedFinancialPct,
          totalExpenditureInr: updatedTotalExpenditure,
        },
      });

      return {
        physicalProgressPct: calculatedPhysicalPct,
        financialProgressPct: calculatedFinancialPct,
      };
    });

    return {
      message: 'Physical progress update & expenditure voucher logged successfully',
      physicalProgressPct: result.physicalProgressPct,
      financialProgressPct: result.financialProgressPct,
    };
  }
}

export const monitoringService = new MonitoringService();
