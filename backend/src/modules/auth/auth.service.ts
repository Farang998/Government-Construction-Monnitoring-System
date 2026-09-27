import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { LoginRequest } from '@gov-platform/shared';

export interface TokenPayload {
  userId: string;
  employeeId: string;
  fullName: string;
  role: string;
  officeId: string;
  departmentId: string;
  designationTitle: string;
  hierarchyLevel: number;
  financialApprovalLimitInr: number;
}

export class AuthService {
  async login(credentials: LoginRequest, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { employeeId: credentials.employeeId },
      include: {
        office: {
          include: { department: true },
        },
        designation: true,
        userRoles: {
          include: { role: true },
        },
        jurisdictions: true,
      },
    });

    if (!user) {
      await this.recordAudit(null, 'LOGIN_FAILED', 'User', credentials.employeeId, false, 'Invalid employee ID', ipAddress, userAgent);
      throw new AppError('Invalid credentials or account inactive', 401);
    }

    if (!user.isActive) {
      await this.recordAudit(user.id, 'LOGIN_FAILED', 'User', user.id, false, 'Account disabled', ipAddress, userAgent);
      throw new AppError('Your account has been deactivated. Please contact your Department Administrator.', 403);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordAudit(user.id, 'LOGIN_FAILED', 'User', user.id, false, 'Incorrect password', ipAddress, userAgent);
      throw new AppError('Invalid credentials or account inactive', 401);
    }

    const primaryRole = user.userRoles[0]?.role.roleType || 'PUBLIC_AUDITOR';
    const financialLimit = Number(user.designation.approvalLimitInr);

    const payload: TokenPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      role: primaryRole,
      officeId: user.officeId,
      departmentId: user.office.departmentId,
      designationTitle: user.designation.title,
      hierarchyLevel: user.designation.hierarchyLevel,
      financialApprovalLimitInr: financialLimit,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '8h',
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.recordAudit(user.id, 'LOGIN_SUCCESS', 'User', user.id, true, `Successful authentication as ${primaryRole}`, ipAddress, userAgent);
    logger.info(`User ${user.employeeId} (${user.fullName}) authenticated successfully [${primaryRole}]`);

    return {
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: primaryRole,
        designation: user.designation.title,
        hierarchyLevel: user.designation.hierarchyLevel,
        financialApprovalLimitInr: financialLimit,
        department: user.office.department.name,
        departmentCode: user.office.department.code,
        office: user.office.name,
        jurisdictions: user.jurisdictions,
      },
    };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        office: {
          include: { department: true },
        },
        designation: true,
        userRoles: {
          include: { role: true },
        },
        jurisdictions: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const primaryRole = user.userRoles[0]?.role.roleType || 'PUBLIC_AUDITOR';

    return {
      id: user.id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: primaryRole,
      designation: user.designation.title,
      hierarchyLevel: user.designation.hierarchyLevel,
      financialApprovalLimitInr: Number(user.designation.approvalLimitInr),
      department: user.office.department.name,
      departmentCode: user.office.department.code,
      office: user.office.name,
      jurisdictions: user.jurisdictions,
    };
  }

  private async recordAudit(
    actorId: string | null,
    action: string,
    entityName: string,
    entityId: string,
    success: boolean,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId,
          action,
          entityName,
          entityId,
          reason,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Government Web Client',
          newState: { success },
        },
      });
    } catch (e) {
      logger.error('Failed to log audit event:', e);
    }
  }
}
