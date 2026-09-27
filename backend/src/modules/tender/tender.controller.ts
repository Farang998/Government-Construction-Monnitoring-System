import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { tenderService } from './tender.service';

export class TenderController {
  public async getTenders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = (req.query.projectId as string) || undefined;
      const tenders = await tenderService.getTenders(projectId);
      res.json({
        success: true,
        data: tenders,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch tenders',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async createTender(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tender = await tenderService.createTender(req.body);
      res.status(201).json({
        success: true,
        data: tender,
        message: 'Tender notice published successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to publish tender notice',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async submitBid(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await tenderService.submitBid(req.body);
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit contractor bid',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const tenderController = new TenderController();
