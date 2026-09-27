import { prisma } from '../../config/prisma';
import { AwardContractInput, ContractDto, ContractorDto } from '@gov-platform/shared';
import { MilestoneStatus, ProjectStatus } from '@prisma/client';

export class ContractService {
  public async getContractors(): Promise<ContractorDto[]> {
    const list = await prisma.contractor.findMany({
      orderBy: { companyName: 'asc' },
    });

    return list.map((c) => ({
      id: c.id,
      registrationNo: c.registrationNo,
      companyName: c.companyName,
      panNumber: c.panNumber,
      gstin: c.gstin,
      classGrade: c.classGrade,
      contactPerson: c.contactPerson,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  public async getContracts(projectId?: string): Promise<ContractDto[]> {
    const contracts = await prisma.contract.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
        tender: {
          select: {
            tenderNoticeNo: true,
          },
        },
        contractor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map((c: any) => ({
      id: c.id,
      projectId: c.projectId,
      projectCode: c.project.projectCode,
      projectName: c.project.name,
      tenderNoticeNo: c.tender.tenderNoticeNo,
      contractorId: c.contractorId,
      contractorName: c.contractor.companyName,
      contractAgreementNo: c.contractAgreementNo,
      workOrderNo: c.workOrderNo,
      workOrderDate: c.workOrderDate.toISOString(),
      originalValueInr: Number(c.originalValueInr),
      revisedValueInr: c.revisedValueInr ? Number(c.revisedValueInr) : null,
      scheduledStartDate: c.scheduledStartDate.toISOString(),
      scheduledEndDate: c.scheduledEndDate.toISOString(),
      actualEndDate: c.actualEndDate ? c.actualEndDate.toISOString() : null,
      pbgAmountInr: Number(c.pbgAmountInr),
      pbgValidityDate: c.pbgValidityDate.toISOString(),
      createdAt: c.createdAt.toISOString(),
    }));
  }

  public async awardContract(dto: AwardContractInput): Promise<ContractDto> {
    const tender = await prisma.tender.findUnique({
      where: { id: dto.tenderId },
      include: { project: true },
    });

    if (!tender) {
      throw new Error('Tender notice not found');
    }

    const year = new Date().getFullYear();
    const count = await prisma.contract.count();
    const serial = String(count + 1).padStart(4, '0');

    const agreementNo = dto.contractAgreementNo || `GJ-RNB-CON-${year}-${serial}`;
    const workOrderNo = dto.workOrderNo || `GJ-RNB-WO-${year}-${serial}`;

    const contract = await prisma.$transaction(async (tx: any) => {
      // 1. Create Contract
      const createdContract = await tx.contract.create({
        data: {
          projectId: tender.projectId,
          tenderId: dto.tenderId,
          contractorId: dto.contractorId,
          contractAgreementNo: agreementNo,
          workOrderNo: workOrderNo,
          workOrderDate: new Date(dto.workOrderDate),
          originalValueInr: dto.contractValueInr,
          scheduledStartDate: new Date(dto.scheduledStartDate),
          scheduledEndDate: new Date(dto.scheduledEndDate),
          pbgAmountInr: dto.pbgAmountInr,
          pbgValidityDate: new Date(dto.pbgValidityDate),
        },
      });

      // 2. Update Tender & Project Status
      await tx.tender.update({
        where: { id: dto.tenderId },
        data: { status: 'AWARDED' },
      });

      await tx.project.update({
        where: { id: tender.projectId },
        data: {
          status: ProjectStatus.CONTRACT_AWARDED,
          currentStage: 'WORK_ORDER_MOBILIZATION',
          contractValueInr: dto.contractValueInr,
          sanctionedCostInr: dto.contractValueInr,
        },
      });

      await tx.projectStageHistory.create({
        data: {
          projectId: tender.projectId,
          previousStage: tender.project.currentStage,
          newStage: 'WORK_ORDER_MOBILIZATION',
          triggerAction: 'AWARD_CONTRACT',
          remarks: `Contract awarded to contractor. Work Order #${workOrderNo} issued.`,
          changedById: tender.project.projectOwnerId,
        },
      });

      // 3. Initialize Standard Project Milestones
      const startDate = new Date(dto.scheduledStartDate);
      const endDate = new Date(dto.scheduledEndDate);
      const durationMs = endDate.getTime() - startDate.getTime();

      const milestonesData = [
        {
          title: 'Mobilization & Initial Foundation',
          weightagePct: 25.00,
          plannedStartDate: startDate,
          plannedEndDate: new Date(startDate.getTime() + durationMs * 0.25),
        },
        {
          title: 'Structural Frame & Superstructure',
          weightagePct: 35.00,
          plannedStartDate: new Date(startDate.getTime() + durationMs * 0.25),
          plannedEndDate: new Date(startDate.getTime() + durationMs * 0.60),
        },
        {
          title: 'Finishing, Utilities & Finishing Works',
          weightagePct: 25.00,
          plannedStartDate: new Date(startDate.getTime() + durationMs * 0.60),
          plannedEndDate: new Date(startDate.getTime() + durationMs * 0.85),
        },
        {
          title: 'Final Testing & Commissioning Handover',
          weightagePct: 15.00,
          plannedStartDate: new Date(startDate.getTime() + durationMs * 0.85),
          plannedEndDate: endDate,
        },
      ];

      for (const m of milestonesData) {
        await tx.milestone.create({
          data: {
            projectId: tender.projectId,
            title: m.title,
            weightagePct: m.weightagePct,
            plannedStartDate: m.plannedStartDate,
            plannedEndDate: m.plannedEndDate,
            status: MilestoneStatus.NOT_STARTED,
          },
        });
      }

      return createdContract;
    });

    const list = await this.getContracts(tender.projectId);
    return list.find((c) => c.id === contract.id)!;
  }
}

export const contractService = new ContractService();
