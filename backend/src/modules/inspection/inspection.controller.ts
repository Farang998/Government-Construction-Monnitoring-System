import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { inspectionService } from './inspection.service';

export class InspectionController {
  public async getInspections(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = (req.query.projectId as string) || undefined;
      const inspections = await inspectionService.getInspections(projectId);
      res.json({
        success: true,
        data: inspections,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch field inspections',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async createInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const inspection = await inspectionService.createInspection(req.user, req.body);
      res.status(201).json({
        success: true,
        data: inspection,
        message: 'Quality inspection recorded successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record quality inspection',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async rectifyDefects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { inspectionId } = req.params;
      const result = await inspectionService.rectifyDefects(req.user, inspectionId || '', req.body.notes || 'Compliance verified');
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record defect rectification',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const inspectionController = new InspectionController();
