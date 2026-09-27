import { Router } from 'express';
import { IdentityController } from './identity.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();
const identityController = new IdentityController();

router.use(authenticateJwt);

router.get('/organizations', (req, res, next) => identityController.getOrganizations(req, res, next));
router.get('/departments', (req, res, next) => identityController.getDepartments(req, res, next));
router.get('/offices', (req, res, next) => identityController.getOffices(req, res, next));
router.get('/designations', (req, res, next) => identityController.getDesignations(req, res, next));
router.get('/users', (req, res, next) => identityController.getUsers(req, res, next));
router.post('/users', (req, res, next) => identityController.createUser(req, res, next));

export default router;
