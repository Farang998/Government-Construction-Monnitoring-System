import { Router } from 'express';
import { completionController } from './completion.controller';
import { authenticateJwt } from '../../middleware/authorization';

const router = Router();

router.use(authenticateJwt);

// Completion Certificates (PCC / FCC)
router.get('/certificates', (req, res) => completionController.getCompletionCertificates(req, res));
router.post('/certificates', (req, res) => completionController.issueCompletionCertificate(req, res));

// DLP Warranty Defects
router.get('/dlp-defects', (req, res) => completionController.getDlpDefects(req, res));
router.post('/dlp-defects', (req, res) => completionController.logDlpDefect(req, res));
router.patch('/dlp-defects/:id/rectify', (req, res) => completionController.rectifyDlpDefect(req, res));

// Security Guarantee & Retention Release
router.post('/release-guarantee', (req, res) => completionController.releaseGuarantee(req, res));

// State Asset Handover & Project Closure
router.get('/handovers', (req, res) => completionController.getAssetHandovers(req, res));
router.post('/handovers', (req, res) => completionController.completeAssetHandover(req, res));

export default router;
