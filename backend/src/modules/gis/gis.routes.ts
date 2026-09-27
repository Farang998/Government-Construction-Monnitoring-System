import { Router } from 'express';
import { gisController } from './gis.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();

// Apply JWT authentication
router.use(authenticateJwt);

// GIS Endpoints
router.get('/projects', (req, res) => gisController.getProjectGisMarkers(req, res));
router.get('/layers', (req, res) => gisController.getGisLayers(req, res));
router.put('/projects/:projectId/coordinates', (req, res) => gisController.updateProjectCoordinates(req, res));

export default router;
