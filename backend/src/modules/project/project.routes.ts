import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticateJwt, requireAbacPolicy } from '../../middleware/authorization';

const router = Router();
const projectController = new ProjectController();

router.use(authenticateJwt);

router.get('/types', (req, res, next) => projectController.getProjectTypes(req, res, next));
router.get('/', (req, res, next) => projectController.getProjects(req, res, next));
router.get('/:id', (req, res, next) => projectController.getProjectById(req, res, next));

router.post(
  '/',
  requireAbacPolicy({
    resourceType: 'project',
    action: 'project:propose',
    checkDepartmentJurisdiction: true,
    checkFinancialLimit: true,
  }),
  (req, res, next) => projectController.createProposal(req, res, next),
);

export default router;
