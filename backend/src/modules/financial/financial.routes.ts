import { Router } from 'express';
import { financialController } from './financial.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();

router.use(authenticateJwt);

// Budget Sanctions
router.get('/sanctions', (req, res) => financialController.getBudgetSanctions(req, res));
router.post('/sanctions', (req, res) => financialController.createBudgetSanction(req, res));

// Expenditure RA Bills
router.get('/bills', (req, res) => financialController.getExpenditures(req, res));
router.post('/bills', (req, res) => financialController.createRaBill(req, res));

// Treasury Payment Disbursement
router.patch('/bills/:id/disburse', (req, res) => financialController.disbursePayment(req, res));

export default router;
