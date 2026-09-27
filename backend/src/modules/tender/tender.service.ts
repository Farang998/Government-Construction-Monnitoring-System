import { prisma } from '../../config/prisma';
import { CreateTenderInput, SubmitBidInput, TenderDto } from '@gov-platform/shared';
import { ProjectStatus } from '@prisma/client';

export class TenderService {
  public async getTenders(projectId?: string): Promise<TenderDto[]> {
    const tenders = await prisma.tender.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
        bids: {
          include: {
            contractor: true,
          },
          orderBy: [{ rank: 'asc' }, { bidAmountInr: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenders.map((t: any) => {
      const est = Number(t.estimatedTenderAmount);
      return {
        id: t.id,
        projectId: t.projectId,
        projectCode: t.project.projectCode,
        projectName: t.project.name,
        tenderNoticeNo: t.tenderNoticeNo,
        portalReferenceId: t.portalReferenceId,
        estimatedTenderAmount: est,
        nitPublishDate: t.nitPublishDate.toISOString(),
        bidSubmissionEndDate: t.bidSubmissionEndDate.toISOString(),
        bidOpeningDate: t.bidOpeningDate.toISOString(),
        status: t.status,
        bidCount: t.bids.length,
        bids: t.bids.map((b: any) => {
          const bidAmt = Number(b.bidAmountInr);
          const variancePct = est > 0 ? ((bidAmt - est) / est) * 100 : 0;
          return {
            id: b.id,
            tenderId: b.tenderId,
            contractorId: b.contractorId,
            contractorName: b.contractor.companyName,
            contractorGrade: b.contractor.classGrade,
            bidAmountInr: bidAmt,
            variancePct: Number(variancePct.toFixed(2)),
            submissionDate: b.submissionDate.toISOString(),
            isQualified: b.isQualified,
            rank: b.rank,
            remarks: b.remarks,
          };
        }),
        createdAt: t.createdAt.toISOString(),
      };
    });
  }

  public async createTender(dto: CreateTenderInput): Promise<TenderDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Target project not found');
    }

    const tender = await prisma.$transaction(async (tx: any) => {
      const createdTender = await tx.tender.create({
        data: {
          projectId: dto.projectId,
          tenderNoticeNo: dto.tenderNoticeNo,
          portalReferenceId: dto.portalReferenceId || null,
          estimatedTenderAmount: dto.estimatedTenderAmount,
          nitPublishDate: new Date(dto.nitPublishDate),
          bidSubmissionEndDate: new Date(dto.bidSubmissionEndDate),
          bidOpeningDate: new Date(dto.bidOpeningDate),
          status: 'PUBLISHED',
        },
      });

      await tx.project.update({
        where: { id: dto.projectId },
        data: { status: ProjectStatus.TENDER_PUBLISHED },
      });

      return createdTender;
    });

    const result = await this.getTenders(dto.projectId);
    return result.find((t) => t.id === tender.id)!;
  }

  public async submitBid(dto: SubmitBidInput): Promise<{ message: string }> {
    const tender = await prisma.tender.findUnique({
      where: { id: dto.tenderId },
    });

    if (!tender) {
      throw new Error('Tender notice not found');
    }

    await prisma.tenderBid.upsert({
      where: {
        tenderId_contractorId: {
          tenderId: dto.tenderId,
          contractorId: dto.contractorId,
        },
      },
      update: {
        bidAmountInr: dto.bidAmountInr,
        remarks: dto.remarks || null,
      },
      create: {
        tenderId: dto.tenderId,
        contractorId: dto.contractorId,
        bidAmountInr: dto.bidAmountInr,
        remarks: dto.remarks || null,
        isQualified: true,
      },
    });

    // Auto-evaluate rankings
    await this.evaluateBids(dto.tenderId);

    return { message: 'Bid submitted and comparative matrix recalculated successfully' };
  }

  public async evaluateBids(tenderId: string): Promise<void> {
    const bids = await prisma.tenderBid.findMany({
      where: { tenderId, isQualified: true },
      orderBy: { bidAmountInr: 'asc' },
    });

    for (let index = 0; index < bids.length; index++) {
      const b = bids[index]!;
      await prisma.tenderBid.update({
        where: { id: b.id },
        data: { rank: index + 1 },
      });
    }

    await prisma.tender.update({
      where: { id: tenderId },
      data: { status: 'EVALUATED' },
    });
  }
}

export const tenderService = new TenderService();
