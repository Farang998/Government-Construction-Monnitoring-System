import { Request, Response } from 'express';
import { riskIssueService } from './riskIssue.service';

export class RiskIssueController {
  // DELAYS
  public async getDelays(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await riskIssueService.getProjectDelays(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch project delays', timestamp: new Date().toISOString() });
    }
  }

  public async logDelay(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await riskIssueService.logDelay(user, req.body);
      res.status(201).json({ success: true, message: 'Project delay recorded successfully', data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to record project delay', timestamp: new Date().toISOString() });
    }
  }

  // RISKS
  public async getRisks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await riskIssueService.getProjectRisks(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch project risks', timestamp: new Date().toISOString() });
    }
  }

  public async logRisk(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await riskIssueService.logRisk(user, req.body);
      res.status(201).json({ success: true, message: 'Project risk entry registered', data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to register project risk', timestamp: new Date().toISOString() });
    }
  }

  // ISSUES & ESCALATIONS
  public async getIssues(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await riskIssueService.getProjectIssues(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch project issues', timestamp: new Date().toISOString() });
    }
  }

  public async raiseIssue(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await riskIssueService.raiseIssue(user, req.body);
      res.status(201).json({
        success: true,
        message: data.isEscalated ? `Issue raised and automatically escalated to ${data.escalatedToRole}` : 'Field issue raised successfully',
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to raise field issue', timestamp: new Date().toISOString() });
    }
  }

  public async resolveIssue(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const result = await riskIssueService.resolveIssue(user, { issueId: id!, resolutionNotes });
      res.status(200).json({ success: true, message: result.message, data: result, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to resolve issue', timestamp: new Date().toISOString() });
    }
  }
}

export const riskIssueController = new RiskIssueController();
