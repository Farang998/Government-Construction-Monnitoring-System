import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticateJwt } from '../../middleware/authorization';

export const publicRouter = Router();
export const reportsRouter = Router();

// ==========================================
// PUBLIC UNAUTHENTICATED TRANSPARENCY ROUTES
// ==========================================
publicRouter.get('/projects', (req, res) => reportsController.getPublicProjects(req, res));
publicRouter.post('/feedback', (req, res) => reportsController.submitCitizenFeedback(req, res));

// ==========================================
// PROTECTED EXECUTIVE ANALYTICS & REPORTS ROUTES
// ==========================================
reportsRouter.use(authenticateJwt);

reportsRouter.get('/executive-analytics', (req, res) => reportsController.getExecutiveAnalytics(req, res));
reportsRouter.get('/feedback', (req, res) => reportsController.getCitizenFeedback(req, res));
reportsRouter.get('/projects/:id/dossier', (req, res) => reportsController.generateProjectDossier(req, res));
