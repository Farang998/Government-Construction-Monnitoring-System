import { Router } from 'express';
import { riskIssueController } from './riskIssue.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();

router.use(authenticateJwt);

// Delays Endpoints
router.get('/delays', (req, res) => riskIssueController.getDelays(req, res));
router.post('/delays', (req, res) => riskIssueController.logDelay(req, res));

// Risks Endpoints
router.get('/risks', (req, res) => riskIssueController.getRisks(req, res));
router.post('/risks', (req, res) => riskIssueController.logRisk(req, res));

// Issues & Escalations Endpoints
router.get('/issues', (req, res) => riskIssueController.getIssues(req, res));
router.post('/issues', (req, res) => riskIssueController.raiseIssue(req, res));
router.patch('/issues/:id/resolve', (req, res) => riskIssueController.resolveIssue(req, res));

export default router;
