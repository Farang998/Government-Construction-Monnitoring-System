import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { workflowController } from './workflow.controller';

const router = Router();

router.get('/templates', authenticateJwt, (req, res) => workflowController.getTemplates(req as any, res));
router.get('/projects/:projectId', authenticateJwt, (req, res) => workflowController.getProjectWorkflow(req as any, res));

export default router;
