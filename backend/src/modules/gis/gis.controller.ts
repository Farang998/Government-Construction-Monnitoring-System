import { Request, Response } from 'express';
import { gisService } from './gis.service';
import { ProjectStatus } from '@gov-platform/shared';

export class GisController {
  public async getProjectGisMarkers(req: Request, res: Response): Promise<void> {
    try {
      const {
        district,
        departmentCode,
        status,
        minCostInr,
        maxCostInr,
        centerLat,
        centerLng,
        radiusKm,
        search,
      } = req.query;

      const filters = {
        district: district ? String(district) : undefined,
        departmentCode: departmentCode ? String(departmentCode) : undefined,
        status: status ? (status as ProjectStatus) : undefined,
        minCostInr: minCostInr ? Number(minCostInr) : undefined,
        maxCostInr: maxCostInr ? Number(maxCostInr) : undefined,
        centerLat: centerLat ? Number(centerLat) : undefined,
        centerLng: centerLng ? Number(centerLng) : undefined,
        radiusKm: radiusKm ? Number(radiusKm) : undefined,
        search: search ? String(search) : undefined,
      };

      const markers = await gisService.getProjectGisMarkers(filters);

      res.status(200).json({
        success: true,
        data: markers,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch GIS project markers',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getGisLayers(_req: Request, res: Response): Promise<void> {
    try {
      const layers = await gisService.getGisLayers();
      res.status(200).json({
        success: true,
        data: layers,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch GIS layers',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async updateProjectCoordinates(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { latitude, longitude } = req.body;
      const user = (req as any).user || { id: 'usr-admin' };

      if (!projectId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
          success: false,
          message: 'projectId, latitude, and longitude are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userId = user.id || user.userId;
      const result = await gisService.updateProjectCoordinates(
        projectId,
        Number(latitude),
        Number(longitude),
        userId
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to update project GIS coordinates',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const gisController = new GisController();
