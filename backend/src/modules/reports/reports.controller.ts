import { Request, Response } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
  public async getExecutiveAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      const data = await reportsService.getExecutiveAnalytics();
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to compute executive analytics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getPublicProjects(req: Request, res: Response): Promise<void> {
    try {
      const { district, search } = req.query;
      const data = await reportsService.getPublicProjects({
        district: district ? String(district) : undefined,
        search: search ? String(search) : undefined,
      });
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch public transparency projects',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async submitCitizenFeedback(req: Request, res: Response): Promise<void> {
    try {
      const data = await reportsService.submitCitizenFeedback(req.body);
      res.status(201).json({
        success: true,
        message: 'Citizen feedback / grievance submitted successfully',
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to submit citizen feedback',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getCitizenFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await reportsService.getCitizenFeedback(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch citizen feedback',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async generateProjectDossier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await reportsService.generateProjectDossier(id!);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to generate project dossier',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const reportsController = new ReportsController();
