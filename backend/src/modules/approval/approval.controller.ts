import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { approvalService } from './approval.service';

export class ApprovalController {
  public async getOfficerInbox(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tasks = await approvalService.getOfficerInboxTasks(req.user);
      res.json({
        success: true,
        data: tasks,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch officer task inbox',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async executeTaskAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const taskId = req.params.taskId || '';
      const result = await approvalService.executeTaskAction(taskId, req.user, req.body);
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to execute approval action',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const approvalController = new ApprovalController();
