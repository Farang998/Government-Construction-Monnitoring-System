import { prisma } from '../../config/prisma';
import { ProjectGisMarkerDto, GisQueryFilterInput, GisLayerDto, ProjectStatus } from '@gov-platform/shared';

export class GisService {
  /**
   * Retrieves map markers for projects matching spatial and attribute filters
   */
  public async getProjectGisMarkers(filters: GisQueryFilterInput): Promise<ProjectGisMarkerDto[]> {
    const whereClause: any = {};

    if (filters.district) {
      whereClause.district = { equals: filters.district, mode: 'insensitive' };
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.departmentCode) {
      whereClause.administrativeDepartment = {
        code: filters.departmentCode,
      };
    }

    if (filters.minCostInr) {
      whereClause.estimatedCostInr = {
        ...whereClause.estimatedCostInr,
        gte: filters.minCostInr,
      };
    }

    if (filters.maxCostInr) {
      whereClause.estimatedCostInr = {
        ...whereClause.estimatedCostInr,
        lte: filters.maxCostInr,
      };
    }

    if (filters.search) {
      whereClause.OR = [
        { projectCode: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { district: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Fetch projects from database
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        administrativeDepartment: true,
        executingOffice: true,
        projectManager: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform and assign default GPS coordinates if null (centered around Gujarat locations)
    const defaultCoords: Record<string, [number, number]> = {
      AHMEDABAD: [23.0225, 72.5714],
      SURAT: [21.1702, 72.8311],
      VADODARA: [22.3072, 73.1812],
      RAJKOT: [22.3039, 70.8022],
      GANDHINAGAR: [23.2156, 72.6369],
      BHAVNAGAR: [21.7645, 72.1519],
      JAMNAGAR: [22.4707, 70.0577],
      JUNAGADH: [21.5222, 70.4579],
      KUTCH: [23.242, 69.6669],
      MEHSANA: [23.6000, 72.4000],
    };

    let result: ProjectGisMarkerDto[] = projects.map((p, idx) => {
      const distUpper = p.district.toUpperCase();
      const baseCoord = defaultCoords[distUpper] || [23.0225, 72.5714];
      
      // If lat/lng missing in DB, apply slight deterministic offset per index
      const lat = p.latitude ? Number(p.latitude) : baseCoord[0] + (idx * 0.015 - 0.03);
      const lng = p.longitude ? Number(p.longitude) : baseCoord[1] + (idx * 0.02 - 0.04);

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        departmentCode: p.administrativeDepartment.code,
        departmentName: p.administrativeDepartment.name,
        status: p.status as ProjectStatus,
        currentStage: p.currentStage,
        district: p.district,
        taluka: p.taluka,
        latitude: lat,
        longitude: lng,
        estimatedCostInr: Number(p.estimatedCostInr),
        sanctionedCostInr: p.sanctionedCostInr ? Number(p.sanctionedCostInr) : null,
        physicalProgressPct: Number(p.physicalProgressPct),
        financialProgressPct: Number(p.financialProgressPct),
        executingOfficeName: p.executingOffice?.name || 'Division Office',
        projectManagerName: p.projectManager?.fullName || 'Superintending Officer',
      };
    });

    // Haversine Radius Filter if radiusKm & centerLat/centerLng provided
    if (filters.radiusKm && filters.centerLat && filters.centerLng) {
      const cLat = filters.centerLat;
      const cLng = filters.centerLng;
      const rad = filters.radiusKm;

      result = result.filter((m) => {
        const dLat = (m.latitude - cLat) * (Math.PI / 180);
        const dLng = (m.longitude - cLng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(cLat * (Math.PI / 180)) *
            Math.cos(m.latitude * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = 6371 * c; // Earth radius in km
        return distanceKm <= rad;
      });
    }

    return result;
  }

  /**
   * Retrieves spatial boundary overlays (Districts, Circles)
   */
  public async getGisLayers(): Promise<GisLayerDto[]> {
    return [
      {
        id: 'layer-dist-ahm',
        layerName: 'Ahmedabad District Administration Boundary',
        layerType: 'DISTRICT_BOUNDARY',
        geoJson: {
          type: 'Feature',
          properties: { district: 'Ahmedabad', circleCode: 'CIR-AHM' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [72.45, 23.12],
                [72.70, 23.12],
                [72.70, 22.90],
                [72.45, 22.90],
                [72.45, 23.12],
              ],
            ],
          },
        },
      },
      {
        id: 'layer-dist-sur',
        layerName: 'Surat Circle Infrastructure Polygon',
        layerType: 'CIRCLE_JURISDICTION',
        geoJson: {
          type: 'Feature',
          properties: { district: 'Surat', circleCode: 'CIR-SUR' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [72.70, 21.30],
                [73.00, 21.30],
                [73.00, 21.00],
                [72.70, 21.00],
                [72.70, 21.30],
              ],
            ],
          },
        },
      },
    ];
  }

  /**
   * Updates project GPS latitude and longitude coordinates
   */
  public async updateProjectCoordinates(
    projectId: string,
    latitude: number,
    longitude: number,
    userId: string
  ): Promise<{ message: string; projectId: string; latitude: number; longitude: number }> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          latitude: latitude,
          longitude: longitude,
        },
      });

      await tx.auditEvent.create({
        data: {
          projectId: projectId,
          actorId: userId,
          action: 'GIS_COORDINATES_UPDATED',
          entityName: 'Project',
          entityId: projectId,
          newState: JSON.stringify({ latitude, longitude }),
          timestamp: new Date(),
        },
      });
    });

    return {
      message: 'Project GIS coordinates updated successfully',
      projectId,
      latitude,
      longitude,
    };
  }
}

export const gisService = new GisService();
