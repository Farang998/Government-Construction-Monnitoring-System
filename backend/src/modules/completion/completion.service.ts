import { prisma } from '../../config/prisma';
import type {
  CompletionCertificateDto,
  DlpDefectDto,
  AssetHandoverDto,
  IssueCompletionCertificateInput,
  LogDlpDefectInput,
  RectifyDlpDefectInput,
  ReleaseGuaranteeInput,
  CompleteAssetHandoverInput,
} from '@gov-platform/shared';

export class CompletionService {
  /**
   * Issue Provisional (PCC) or Final (FCC) Completion Certificate
   */
  public async issueCompletionCertificate(
    user: any,
    dto: IssueCompletionCertificateInput
  ): Promise<CompletionCertificateDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;
    const certType = dto.certificateType || 'PROVISIONAL';
    const certPrefix = certType === 'PROVISIONAL' ? 'PCC' : 'FCC';
    const certNumber = dto.certificateNumber || `${certPrefix}-2026-${project.projectCode.slice(-4)}-${Date.now().toString().slice(-4)}`;

    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();
    const dlpMonths = dto.dlpDurationMonths || 24; // Default 24 months DLP warranty
    const dlpEndDate = new Date(issueDate);
    dlpEndDate.setMonth(dlpEndDate.getMonth() + dlpMonths);

    const certificate = await prisma.$transaction(async (tx: any) => {
      const created = await tx.completionCertificate.create({
        data: {
          projectId: dto.projectId,
          certificateType: certType as any,
          certificateNumber: certNumber,
          issueDate,
          dlpStartDate: issueDate,
          dlpEndDate,
          dlpDurationMonths: dlpMonths,
          remarks: dto.remarks || `Provisional Completion Certificate issued with ${dlpMonths}-month Defect Liability Period.`,
          issuedById: userId,
        },
        include: {
          project: true,
        },
      });

      // Update project status to COMPLETION_CERTIFIED or DEFECT_LIABILITY
      const newStatus = certType === 'PROVISIONAL' ? 'COMPLETION_CERTIFIED' : 'DEFECT_LIABILITY';
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          status: newStatus as any,
          currentStage: certType === 'PROVISIONAL' ? 'Provisional Handover & DLP Warranty' : 'Final Handover Cleared',
          physicalProgressPct: 100.0,
        },
      });

      // Audit Log
      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'COMPLETION_CERTIFICATE_ISSUED',
          entityName: 'CompletionCertificate',
          entityId: created.id,
          newState: JSON.stringify({
            certificateNumber: certNumber,
            certificateType: certType,
            dlpMonths,
            dlpEndDate,
          }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    const issuer = await prisma.user.findUnique({ where: { id: userId } });

    return {
      id: certificate.id,
      projectId: certificate.projectId,
      projectCode: certificate.project.projectCode,
      projectName: certificate.project.name,
      certificateType: certificate.certificateType as any,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate.toISOString(),
      dlpStartDate: certificate.dlpStartDate.toISOString(),
      dlpEndDate: certificate.dlpEndDate.toISOString(),
      dlpDurationMonths: certificate.dlpDurationMonths,
      remarks: certificate.remarks,
      issuedByName: issuer?.fullName || 'Superintending Engineer',
      createdAt: certificate.createdAt.toISOString(),
    };
  }

  /**
   * Log Defect Liability Period (DLP) Warranty Defect Ticket
   */
  public async logDlpDefect(user: any, dto: LogDlpDefectInput): Promise<DlpDefectDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;

    const defect = await prisma.$transaction(async (tx: any) => {
      const created = await tx.dlpDefect.create({
        data: {
          projectId: dto.projectId,
          defectTitle: dto.defectTitle,
          description: dto.description,
          locationRef: dto.locationRef || 'Site Main Carriage Way',
          reportedDate: new Date(),
          severity: dto.severity || 'MEDIUM',
          isRectified: false,
          reportedById: userId,
        },
        include: {
          project: true,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'DLP_DEFECT_REPORTED',
          entityName: 'DlpDefect',
          entityId: created.id,
          newState: JSON.stringify({
            defectTitle: dto.defectTitle,
            severity: dto.severity,
          }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    const reporter = await prisma.user.findUnique({ where: { id: userId } });

    return {
      id: defect.id,
      projectId: defect.projectId,
      projectCode: defect.project.projectCode,
      projectName: defect.project.name,
      defectTitle: defect.defectTitle,
      description: defect.description,
      locationRef: defect.locationRef,
      reportedDate: defect.reportedDate.toISOString(),
      severity: defect.severity as any,
      isRectified: defect.isRectified,
      rectifiedDate: defect.rectifiedDate ? defect.rectifiedDate.toISOString() : null,
      rectificationNotes: defect.rectificationNotes,
      reportedByName: reporter?.fullName || 'Executive Engineer',
      createdAt: defect.createdAt.toISOString(),
    };
  }

  /**
   * Rectify DLP Defect Ticket
   */
  public async rectifyDlpDefect(
    user: any,
    dto: RectifyDlpDefectInput
  ): Promise<{ success: boolean; message: string }> {
    const defect = await prisma.dlpDefect.findUnique({
      where: { id: dto.defectId },
    });

    if (!defect) {
      throw new Error('DLP defect record not found');
    }

    const userId = user.id || user.userId;

    await prisma.$transaction(async (tx: any) => {
      await tx.dlpDefect.update({
        where: { id: dto.defectId },
        data: {
          isRectified: true,
          rectifiedDate: new Date(),
          rectificationNotes: dto.rectificationNotes,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: defect.projectId,
          actorId: userId,
          action: 'DLP_DEFECT_RECTIFIED',
          entityName: 'DlpDefect',
          entityId: dto.defectId,
          newState: JSON.stringify({
            rectificationNotes: dto.rectificationNotes,
            rectifiedAt: new Date().toISOString(),
          }),
          timestamp: new Date(),
        },
      });
    });

    return {
      success: true,
      message: 'DLP warranty defect marked as rectified and verified by inspecting officer.',
    };
  }

  /**
   * Release Retention Money Deposit (5%) and Performance Bank Guarantee (PBG)
   */
  public async releaseGuarantee(user: any, dto: ReleaseGuaranteeInput): Promise<{ success: boolean; message: string }> {
    if (!dto.executiveEngineerSignOff || !dto.superintendingEngineerSignOff) {
      throw new Error('Both Executive Engineer (EE) and Superintending Engineer (SE) digital sign-offs are required for guarantee release.');
    }

    const unrectifiedDefects = await prisma.dlpDefect.count({
      where: {
        projectId: dto.projectId,
        isRectified: false,
      },
    });

    if (unrectifiedDefects > 0) {
      throw new Error(`Cannot release security guarantee! There are ${unrectifiedDefects} active unrectified DLP defect tickets.`);
    }

    const userId = user.id || user.userId;

    await prisma.auditEvent.create({
      data: {
        projectId: dto.projectId,
        actorId: userId,
        action: 'GUARANTEE_RELEASE_APPROVED',
        entityName: 'Project',
        entityId: dto.projectId,
        newState: JSON.stringify({
          guaranteeType: dto.guaranteeType,
          eeSignOff: true,
          seSignOff: true,
          remarks: dto.remarks || 'DLP warranty expired cleanly. Security deposit and PBG released to contractor.',
        }),
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      message: 'Retention Security Deposit (5%) and Performance Bank Guarantee (PBG) release approved by EE and SE.',
    };
  }

  /**
   * Complete State Asset Handover & Final Project Closure
   */
  public async completeAssetHandover(user: any, dto: CompleteAssetHandoverInput): Promise<AssetHandoverDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;
    const assetCode = dto.assetCode || `AST-2026-${project.projectCode.slice(-4)}-${Date.now().toString().slice(-4)}`;

    const handover = await prisma.$transaction(async (tx: any) => {
      const created = await tx.assetHandover.create({
        data: {
          projectId: dto.projectId,
          assetCode,
          assetName: dto.assetName || project.name,
          handoverDate: new Date(),
          receivingDepartment: dto.receivingDepartment,
          assetValuationInr: dto.assetValuationInr || Number(project.sanctionedCostInr || project.estimatedCostInr),
          maintenanceDivision: dto.maintenanceDivision,
          handoverStatus: 'ACCEPTED',
          remarks: dto.remarks || 'Transferred to State Infrastructure Asset Register for regular O&M.',
          recordedById: userId,
        },
        include: {
          project: true,
        },
      });

      // Update project status to HANDED_OVER / CLOSED
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          status: 'CLOSED' as any,
          currentStage: 'State Asset Registered & Project Closed',
          actualEndDate: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: dto.projectId,
          actorId: userId,
          action: 'STATE_ASSET_HANDOVER_COMPLETED',
          entityName: 'AssetHandover',
          entityId: created.id,
          newState: JSON.stringify({
            assetCode,
            receivingDepartment: dto.receivingDepartment,
            assetValuationInr: dto.assetValuationInr,
          }),
          timestamp: new Date(),
        },
      });

      return created;
    });

    const officer = await prisma.user.findUnique({ where: { id: userId } });

    return {
      id: handover.id,
      projectId: handover.projectId,
      projectCode: handover.project.projectCode,
      projectName: handover.project.name,
      assetCode: handover.assetCode,
      assetName: handover.assetName,
      handoverDate: handover.handoverDate.toISOString(),
      receivingDepartment: handover.receivingDepartment,
      assetValuationInr: Number(handover.assetValuationInr),
      maintenanceDivision: handover.maintenanceDivision,
      handoverStatus: handover.handoverStatus,
      remarks: handover.remarks,
      recordedByName: officer?.fullName || 'Chief Engineer',
      createdAt: handover.createdAt.toISOString(),
    };
  }

  /**
   * Queries
   */
  public async getCompletionCertificates(projectId?: string): Promise<CompletionCertificateDto[]> {
    const certs = await prisma.completionCertificate.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      certs.map(async (c: any) => {
        const issuer = await prisma.user.findUnique({ where: { id: c.issuedById } });
        return {
          id: c.id,
          projectId: c.projectId,
          projectCode: c.project.projectCode,
          projectName: c.project.name,
          certificateType: c.certificateType as any,
          certificateNumber: c.certificateNumber,
          issueDate: c.issueDate.toISOString(),
          dlpStartDate: c.dlpStartDate.toISOString(),
          dlpEndDate: c.dlpEndDate.toISOString(),
          dlpDurationMonths: c.dlpDurationMonths,
          remarks: c.remarks,
          issuedByName: issuer?.fullName || 'Superintending Engineer',
          createdAt: c.createdAt.toISOString(),
        };
      })
    );
  }

  public async getDlpDefects(projectId?: string): Promise<DlpDefectDto[]> {
    const defects = await prisma.dlpDefect.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      defects.map(async (d: any) => {
        const reporter = await prisma.user.findUnique({ where: { id: d.reportedById } });
        return {
          id: d.id,
          projectId: d.projectId,
          projectCode: d.project.projectCode,
          projectName: d.project.name,
          defectTitle: d.defectTitle,
          description: d.description,
          locationRef: d.locationRef,
          reportedDate: d.reportedDate.toISOString(),
          severity: d.severity as any,
          isRectified: d.isRectified,
          rectifiedDate: d.rectifiedDate ? d.rectifiedDate.toISOString() : null,
          rectificationNotes: d.rectificationNotes,
          reportedByName: reporter?.fullName || 'Executive Engineer',
          createdAt: d.createdAt.toISOString(),
        };
      })
    );
  }

  public async getAssetHandovers(projectId?: string): Promise<AssetHandoverDto[]> {
    const handovers = await prisma.assetHandover.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      handovers.map(async (h: any) => {
        const officer = await prisma.user.findUnique({ where: { id: h.recordedById } });
        return {
          id: h.id,
          projectId: h.projectId,
          projectCode: h.project.projectCode,
          projectName: h.project.name,
          assetCode: h.assetCode,
          assetName: h.assetName,
          handoverDate: h.handoverDate.toISOString(),
          receivingDepartment: h.receivingDepartment,
          assetValuationInr: Number(h.assetValuationInr),
          maintenanceDivision: h.maintenanceDivision,
          handoverStatus: h.handoverStatus,
          remarks: h.remarks,
          recordedByName: officer?.fullName || 'Chief Engineer',
          createdAt: h.createdAt.toISOString(),
        };
      })
    );
  }
}

export const completionService = new CompletionService();
