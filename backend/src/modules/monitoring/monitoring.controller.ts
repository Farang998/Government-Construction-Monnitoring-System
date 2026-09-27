import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { monitoringService } from './monitoring.service';

export class MonitoringController {
  public async getMilestones(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.projectId || '';
      const milestones = await monitoringService.getMilestones(projectId);
      res.json({
        success: true,
        data: milestones,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch project milestones',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getProgressUpdates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.projectId || '';
      const list = await monitoringService.getProgressUpdates(projectId);
      res.json({
        success: true,
        data: list,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch progress updates history',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async logProgressUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await monitoringService.logProgressUpdate(req.user, req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          physicalProgressPct: result.physicalProgressPct,
          financialProgressPct: result.financialProgressPct,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to log progress update',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const monitoringController = new MonitoringController();
