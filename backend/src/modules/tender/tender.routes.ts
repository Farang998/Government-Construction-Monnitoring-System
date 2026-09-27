import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { tenderController } from './tender.controller';

const router = Router();

router.get('/', authenticateJwt, (req, res) => tenderController.getTenders(req as any, res));
router.post('/', authenticateJwt, (req, res) => tenderController.createTender(req as any, res));
router.post('/bids', authenticateJwt, (req, res) => tenderController.submitBid(req as any, res));

export default router;
