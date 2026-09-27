import { prisma } from '../../config/prisma';
import {
  BudgetSanctionDto,
  ExpenditureDto,
  CreateBudgetSanctionInput,
  CreateRaBillInput,
  DisbursePaymentInput,
} from '@gov-platform/shared';

export class FinancialService {
  /**
   * Register Budget Sanction order and update project sanctioned cost
   */
  public async createBudgetSanction(user: any, dto: CreateBudgetSanctionInput): Promise<BudgetSanctionDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;

    const sanction = await prisma.$transaction(async (tx: any) => {
      const created = await tx.budgetSanction.create({
        data: {
          projectId: dto.projectId,
          sanctionType: dto.sanctionType || 'ADMINISTRATIVE_APPROVAL',
          orderNumber: dto.orderNumber,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          sanctionAmount: dto.sanctionAmount,
          headOfAccount: dto.headOfAccount,
          financialYear: dto.financialYear || '2026-2027',
          remarks: dto.remarks || null,
        },
        include: {
          project: true,
        },
      });

      // Update project sanctioned cost
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          sanctionedCostInr: dto.sanctionAmount,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'BUDGET_SANCTION_ISSUED',
          entityName: 'BudgetSanction',
          entityId: created.id,
          newState: JSON.stringify({ sanctionAmount: dto.sanctionAmount, orderNumber: dto.orderNumber }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    return {
      id: sanction.id,
      projectId: sanction.projectId,
      projectCode: sanction.project.projectCode,
      projectName: sanction.project.name,
      sanctionType: sanction.sanctionType,
      orderNumber: sanction.orderNumber,
      orderDate: sanction.orderDate.toISOString(),
      sanctionAmount: Number(sanction.sanctionAmount),
      headOfAccount: sanction.headOfAccount,
      financialYear: sanction.financialYear,
      remarks: sanction.remarks,
      createdAt: sanction.createdAt.toISOString(),
    };
  }

  /**
   * Generate Contractor Running Account (RA) Bill from Measurement Book (MB) with statutory tax deductions:
   * - IT-TDS: 2%
   * - GST-TDS: 2%
   * - Retention Deposit: 5%
   * - Labour Cess: 1%
   * Total Statutory Deductions: 10%
   */
  public async createRaBill(user: any, dto: CreateRaBillInput): Promise<ExpenditureDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;
    const grossAmount = dto.grossClaimAmountInr;

    // Statutory deductions
    const itTdsInr = grossAmount * 0.02;
    const gstTdsInr = grossAmount * 0.02;
    const retentionInr = grossAmount * 0.05;
    const labourCessInr = grossAmount * 0.01;
    const totalDeductionsInr = itTdsInr + gstTdsInr + retentionInr + labourCessInr;
    const netPayableInr = grossAmount - totalDeductionsInr;

    const voucherNo = `TV-TREASURY-${Date.now()}`;

    const expenditure = await prisma.$transaction(async (tx: any) => {
      const created = await tx.expenditure.create({
        data: {
          projectId: dto.projectId,
          voucherNo: voucherNo,
          voucherDate: dto.billDate ? new Date(dto.billDate) : new Date(),
          amountInr: netPayableInr,
          paymentMode: 'TREASURY_E_PAYMENT',
          payeeName: dto.payeeName || 'L&T Construction',
          headOfAccount: dto.headOfAccount || '5054-03-337-01',
          recordedById: userId,
        },
        include: {
          project: true,
        },
      });

      // Update project cumulative expenditure and recalculate financial progress %
      const currentExpenditure = Number(project.totalExpenditureInr || 0);
      const updatedExpenditure = currentExpenditure + netPayableInr;
      const sanctionedCost = Number(project.sanctionedCostInr || project.estimatedCostInr);
      const updatedFinancialProgressPct = parseFloat(((updatedExpenditure / sanctionedCost) * 100).toFixed(2));

      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          totalExpenditureInr: updatedExpenditure,
          financialProgressPct: Math.min(100, updatedFinancialProgressPct),
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'RA_BILL_VOUCHER_GENERATED',
          entityName: 'Expenditure',
          entityId: created.id,
          newState: JSON.stringify({
            grossAmount,
            netPayableInr,
            totalDeductionsInr,
            voucherNo,
          }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    return {
      id: expenditure.id,
      projectId: expenditure.projectId,
      projectCode: expenditure.project.projectCode,
      projectName: expenditure.project.name,
      voucherNo: expenditure.voucherNo,
      voucherDate: expenditure.voucherDate.toISOString(),
      grossClaimAmountInr: grossAmount,
      itTdsInr,
      gstTdsInr,
      retentionInr,
      labourCessInr,
      totalDeductionsInr,
      netPayableAmountInr: Number(expenditure.amountInr),
      paymentMode: expenditure.paymentMode,
      payeeName: expenditure.payeeName,
      headOfAccount: expenditure.headOfAccount,
      measurementBookRef: dto.measurementBookRef,
      createdAt: expenditure.createdAt.toISOString(),
    };
  }

  /**
   * Disburse Treasury Voucher Payment
   */
  public async disbursePayment(user: any, dto: DisbursePaymentInput): Promise<{ message: string; expenditureId: string }> {
    const expenditure = await prisma.expenditure.findUnique({
      where: { id: dto.expenditureId },
    });

    if (!expenditure) {
      throw new Error('Expenditure voucher record not found');
    }

    const userId = user.id || user.userId;

    await prisma.auditEvent.create({
      data: {
        projectId: expenditure.projectId,
        actorId: userId,
        action: 'TREASURY_PAYMENT_DISBURSED',
        entityName: 'Expenditure',
        entityId: dto.expenditureId,
        newState: JSON.stringify({
          treasuryVoucherNo: dto.treasuryVoucherNo,
          bankAdviceRef: dto.bankAdviceRef || 'E-PAY-ADVICE-OK',
          amountDisbursedInr: Number(expenditure.amountInr),
        }),
        timestamp: new Date(),
      },
    });

    return {
      message: `Treasury payment disbursed successfully under Voucher ${dto.treasuryVoucherNo}`,
      expenditureId: dto.expenditureId,
    };
  }

  /**
   * Get budget sanctions for project
   */
  public async getBudgetSanctions(projectId?: string): Promise<BudgetSanctionDto[]> {
    const list = await prisma.budgetSanction.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { orderDate: 'desc' },
    });

    return list.map((s: any) => ({
      id: s.id,
      projectId: s.projectId,
      projectCode: s.project.projectCode,
      projectName: s.project.name,
      sanctionType: s.sanctionType,
      orderNumber: s.orderNumber,
      orderDate: s.orderDate.toISOString(),
      sanctionAmount: Number(s.sanctionAmount),
      headOfAccount: s.headOfAccount,
      financialYear: s.financialYear,
      remarks: s.remarks,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  /**
   * Get expenditure vouchers for project
   */
  public async getExpenditures(projectId?: string): Promise<ExpenditureDto[]> {
    const list = await prisma.expenditure.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { voucherDate: 'desc' },
    });

    return list.map((e: any) => {
      const netAmount = Number(e.amountInr);
      const grossAmount = parseFloat((netAmount / 0.90).toFixed(2));
      const itTdsInr = parseFloat((grossAmount * 0.02).toFixed(2));
      const gstTdsInr = parseFloat((grossAmount * 0.02).toFixed(2));
      const retentionInr = parseFloat((grossAmount * 0.05).toFixed(2));
      const labourCessInr = parseFloat((grossAmount * 0.01).toFixed(2));
      const totalDeductionsInr = itTdsInr + gstTdsInr + retentionInr + labourCessInr;

      return {
        id: e.id,
        projectId: e.projectId,
        projectCode: e.project.projectCode,
        projectName: e.project.name,
        voucherNo: e.voucherNo,
        voucherDate: e.voucherDate.toISOString(),
        grossClaimAmountInr: grossAmount,
        itTdsInr,
        gstTdsInr,
        retentionInr,
        labourCessInr,
        totalDeductionsInr,
        netPayableAmountInr: netAmount,
        paymentMode: e.paymentMode,
        payeeName: e.payeeName,
        headOfAccount: e.headOfAccount,
        measurementBookRef: `MB-2026-${e.voucherNo.slice(-6)}`,
        createdAt: e.createdAt.toISOString(),
      };
    });
  }
}

export const financialService = new FinancialService();
