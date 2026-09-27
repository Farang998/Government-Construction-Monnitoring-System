import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { workflowService } from './workflow.service';

export class WorkflowController {
  public async getTemplates(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templates = await workflowService.getTemplates();
      res.json({
        success: true,
        data: templates,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch workflow templates',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getProjectWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.projectId || '';
      const workflow = await workflowService.getProjectWorkflow(projectId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: 'Workflow instance not found for project',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      res.json({
        success: true,
        data: workflow,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch project workflow',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const workflowController = new WorkflowController();
