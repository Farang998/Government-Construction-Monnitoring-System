import { Request, Response } from 'express';
import { completionService } from './completion.service';

export class CompletionController {
  public async issueCompletionCertificate(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await completionService.issueCompletionCertificate(user, req.body);
      res.status(201).json({
        success: true,
        message: 'Completion Certificate issued successfully and DLP Warranty registered',
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to issue completion certificate',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getCompletionCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await completionService.getCompletionCertificates(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch completion certificates',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async logDlpDefect(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await completionService.logDlpDefect(user, req.body);
      res.status(201).json({
        success: true,
        message: 'DLP Warranty Defect ticket logged successfully',
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to log DLP defect ticket',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async rectifyDlpDefect(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { rectificationNotes } = req.body;
      const result = await completionService.rectifyDlpDefect(user, { defectId: id!, rectificationNotes });
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to rectify DLP defect',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getDlpDefects(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await completionService.getDlpDefects(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch DLP defects',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async releaseGuarantee(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const result = await completionService.releaseGuarantee(user, req.body);
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to release security deposit and PBG',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async completeAssetHandover(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await completionService.completeAssetHandover(user, req.body);
      res.status(201).json({
        success: true,
        message: 'State Infrastructure Asset Handover completed and project closed',
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to complete asset handover',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getAssetHandovers(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await completionService.getAssetHandovers(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch asset handover register',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const completionController = new CompletionController();
