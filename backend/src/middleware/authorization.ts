import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { TokenPayload } from '../modules/auth/auth.service';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Missing Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authentication token missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`JWT verification failed: ${err instanceof Error ? err.message : err}`);
    throw new AppError('Invalid or expired authentication token. Please login again.', 401);
  }
};

export interface AbacPolicyRule {
  resourceType: 'project' | 'financial' | 'sanction' | 'inspection' | 'workflow';
  action: string;
  checkFinancialLimit?: boolean;
  checkDepartmentJurisdiction?: boolean;
  checkGeographicJurisdiction?: boolean;
  enforceMakerChecker?: boolean;
}

export const requireAbacPolicy = (rule: AbacPolicyRule) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      throw new AppError('Unauthenticated request', 401);
    }

    // Super Admin bypasses contextual guards for system management
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }

    const { projectId } = req.params;
    const { estimatedCostInr, administrativeDepartmentId, district: _district } = req.body;

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          estimatedCostInr: true,
          administrativeDepartmentId: true,
          implementingDepartmentId: true,
          district: true,
          createdById: true,
        },
      });

      if (!project) {
        throw new AppError('Target project not found', 404);
      }

      // 1. Financial Sanction Limit Guard
      if (rule.checkFinancialLimit) {
        const projectCost = Number(project.estimatedCostInr);
        if (user.financialApprovalLimitInr < projectCost) {
          logger.warn(
            `ABAC DENIAL: Officer ${user.employeeId} (${user.designationTitle}, limit ₹${user.financialApprovalLimitInr}) attempted action '${rule.action}' on project costing ₹${projectCost}`,
          );
          throw new AppError(
            `ABAC Security Violation: Your statutory financial sanction ceiling (₹${(user.financialApprovalLimitInr / 100000).toFixed(2)} Lakhs) is insufficient for this project (₹${(projectCost / 100000).toFixed(2)} Lakhs). Action must be escalated to a higher authority.`,
            403,
          );
        }
      }

      // 2. Departmental Jurisdiction Guard
      if (rule.checkDepartmentJurisdiction) {
        if (
          user.departmentId !== project.administrativeDepartmentId &&
          user.departmentId !== project.implementingDepartmentId &&
          user.role !== 'DEPT_SECRETARY'
        ) {
          logger.warn(
            `ABAC DENIAL: Officer ${user.employeeId} from Dept ${user.departmentId} attempted action on Project belonging to Dept ${project.administrativeDepartmentId}`,
          );
          throw new AppError(
            'ABAC Security Violation: You do not have departmental oversight over this project.',
            403,
          );
        }
      }

      // 3. Maker-Checker Segregation Guard
      if (rule.enforceMakerChecker) {
        if (project.createdById === user.userId) {
          logger.warn(
            `ABAC DENIAL: Officer ${user.employeeId} created project ${project.id} and attempted to approve it (Maker-Checker violation).`,
          );
          throw new AppError(
            'ABAC Security Violation: Separation of Duties policy prevents the submitting officer from approving their own project submission.',
            403,
          );
        }
      }
    } else {
      // Pre-creation ABAC check on request payload
      if (rule.checkFinancialLimit && estimatedCostInr) {
        if (user.financialApprovalLimitInr < estimatedCostInr) {
          throw new AppError(
            `ABAC Security Violation: Your financial limit (₹${user.financialApprovalLimitInr}) is lower than proposed cost (₹${estimatedCostInr}).`,
            403,
          );
        }
      }

      if (rule.checkDepartmentJurisdiction && administrativeDepartmentId) {
        if (user.departmentId !== administrativeDepartmentId && user.role !== 'DEPT_SECRETARY') {
          throw new AppError(
            'ABAC Security Violation: You can only submit proposals for your assigned department.',
            403,
          );
        }
      }
    }

    next();
  };
};
