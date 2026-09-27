import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { inspectionController } from './inspection.controller';

const router = Router();

router.get('/', authenticateJwt, (req, res) => inspectionController.getInspections(req as any, res));
router.post('/', authenticateJwt, (req, res) => inspectionController.createInspection(req as any, res));
router.post('/:inspectionId/rectify', authenticateJwt, (req, res) => inspectionController.rectifyDefects(req as any, res));

export default router;
