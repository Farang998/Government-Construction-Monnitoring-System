import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authorization';
import { contractController } from './contract.controller';

const router = Router();

router.get('/contractors', authenticateJwt, (req, res) => contractController.getContractors(req as any, res));
router.get('/', authenticateJwt, (req, res) => contractController.getContracts(req as any, res));
router.post('/award', authenticateJwt, (req, res) => contractController.awardContract(req as any, res));

export default router;
