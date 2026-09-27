import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import identityRoutes from './modules/identity/identity.routes';
import projectRoutes from './modules/project/project.routes';
import workflowRoutes from './modules/workflow/workflow.routes';
import approvalRoutes from './modules/approval/approval.routes';
import tenderRoutes from './modules/tender/tender.routes';
import contractRoutes from './modules/contract/contract.routes';
import monitoringRoutes from './modules/monitoring/monitoring.routes';
import inspectionRoutes from './modules/inspection/inspection.routes';
import gisRoutes from './modules/gis/gis.routes';
import riskIssueRoutes from './modules/riskIssue/riskIssue.routes';
import financialRoutes from './modules/financial/financial.routes';
import completionRoutes from './modules/completion/completion.routes';
import { publicRouter, reportsRouter } from './modules/reports/reports.routes';

export const createApp = (): Application => {
  const app = express();

  // Security perimeter middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Rate limiting to mitigate brute-force and DoS
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  });
  app.use('/api', limiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request audit logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'Government Construction Monitoring Platform Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API v1 router mounting
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/identity', identityRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/workflows', workflowRoutes);
  app.use('/api/v1/approvals', approvalRoutes);
  app.use('/api/v1/tenders', tenderRoutes);
  app.use('/api/v1/contracts', contractRoutes);
  app.use('/api/v1/monitoring', monitoringRoutes);
  app.use('/api/v1/inspections', inspectionRoutes);
  app.use('/api/v1/gis', gisRoutes);
  app.use('/api/v1/governance', riskIssueRoutes);
  app.use('/api/v1/financials', financialRoutes);
  app.use('/api/v1/completion', completionRoutes);
  app.use('/api/v1/public', publicRouter);
  app.use('/api/v1/reports', reportsRouter);

  app.get('/api/v1', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'Government Construction Platform API',
      version: '1.0.0',
      documentation: '/docs',
      status: 'operational',
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
