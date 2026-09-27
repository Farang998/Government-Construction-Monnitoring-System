import { prisma } from '../../config/prisma';
import { InspectionDto, ScheduleInspectionInput } from '@gov-platform/shared';
import { InspectionRating } from '@prisma/client';

export class InspectionService {
  public async getInspections(projectId?: string): Promise<InspectionDto[]> {
    const list = await prisma.inspection.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
        inspector: {
          include: { designation: true },
        },
        evidence: true,
      },
      orderBy: { inspectionDate: 'desc' },
    });

    return list.map((i: any) => ({
      id: i.id,
      projectId: i.projectId,
      projectCode: i.project.projectCode,
      projectName: i.project.name,
      inspectorId: i.inspectorId,
      inspectorName: i.inspector.fullName,
      inspectorDesignation: i.inspector.designation?.title || 'Quality Auditor',
      inspectionDate: i.inspectionDate.toISOString(),
      overallRating: i.overallRating as unknown as any,
      findings: i.findings,
      defectsIdentified: i.defectsIdentified,
      correctiveMeasures: i.correctiveMeasures,
      isRectified: i.isRectified,
      evidence: i.evidence.map((e: any) => ({
        id: e.id,
        inspectionId: e.inspectionId,
        title: e.title,
        mediaType: e.mediaType,
        fileUrl: e.fileUrl,
        latitude: e.latitude ? Number(e.latitude) : null,
        longitude: e.longitude ? Number(e.longitude) : null,
        capturedAt: e.capturedAt.toISOString(),
      })),
      createdAt: i.createdAt.toISOString(),
    }));
  }

  public async createInspection(user: any, dto: ScheduleInspectionInput): Promise<InspectionDto> {
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const userId = user.id || user.userId;

    const inspection = await prisma.$transaction(async (tx: any) => {
      const created = await tx.inspection.create({
        data: {
          projectId: dto.projectId,
          inspectorId: userId,
          inspectionDate: new Date(dto.inspectionDate),
          overallRating: dto.overallRating as InspectionRating,
          findings: dto.findings,
          defectsIdentified: dto.defectsIdentified || null,
          correctiveMeasures: dto.correctiveMeasures || null,
          isRectified: dto.overallRating === InspectionRating.OUTSTANDING || dto.overallRating === InspectionRating.SATISFACTORY,
        },
      });

      if (dto.evidenceFileUrl) {
        await tx.siteEvidence.create({
          data: {
            inspectionId: created.id,
            title: dto.evidenceTitle || 'Field Inspection Geo-Tagged Site Photograph',
            mediaType: 'PHOTO',
            fileUrl: dto.evidenceFileUrl,
            latitude: dto.latitude || project.latitude || 23.0225,
            longitude: dto.longitude || project.longitude || 72.5714,
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorId: userId,
          projectId: dto.projectId,
          action: 'QUALITY_INSPECTION_RECORDED',
          entityName: 'INSPECTION',
          entityId: created.id,
          newState: { rating: dto.overallRating, findings: dto.findings },
        },
      });

      return created;
    });

    const list = await this.getInspections(dto.projectId);
    return list.find((i) => i.id === inspection.id)!;
  }

  public async rectifyDefects(user: any, inspectionId: string, notes: string): Promise<{ message: string }> {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new Error('Inspection record not found');
    }

    const userId = user.id || user.userId;

    await prisma.$transaction(async (tx: any) => {
      await tx.inspection.update({
        where: { id: inspectionId },
        data: {
          isRectified: true,
          correctiveMeasures: inspection.correctiveMeasures
            ? `${inspection.correctiveMeasures}\n\nRectification Notes (${new Date().toLocaleDateString()}): ${notes}`
            : notes,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: userId,
          projectId: inspection.projectId,
          action: 'INSPECTION_DEFECTS_RECTIFIED',
          entityName: 'INSPECTION',
          entityId: inspectionId,
          newState: { isRectified: true, notes },
        },
      });
    });

    return { message: 'Defect rectification recorded and verified successfully' };
  }
}

export const inspectionService = new InspectionService();
