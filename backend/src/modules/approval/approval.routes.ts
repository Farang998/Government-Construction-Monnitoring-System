import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { approvalController } from './approval.controller';

const router = Router();

router.get('/inbox', authenticateJwt, (req, res) => approvalController.getOfficerInbox(req as any, res));
router.post('/tasks/:taskId/action', authenticateJwt, (req, res) => approvalController.executeTaskAction(req as any, res));

export default router;
