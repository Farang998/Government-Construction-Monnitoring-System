import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { monitoringController } from './monitoring.controller';

const router = Router();

router.get('/projects/:projectId/milestones', authenticateJwt, (req, res) => monitoringController.getMilestones(req as any, res));
router.get('/projects/:projectId/progress', authenticateJwt, (req, res) => monitoringController.getProgressUpdates(req as any, res));
router.post('/progress', authenticateJwt, (req, res) => monitoringController.logProgressUpdate(req as any, res));

export default router;
