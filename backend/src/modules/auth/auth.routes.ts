import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => authController.getMe(req, res, next));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
