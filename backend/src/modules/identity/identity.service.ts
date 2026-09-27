import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler';

export class IdentityService {
  async getOrganizations() {
    return prisma.organization.findMany({
      include: {
        departments: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async getDepartments(organizationId?: string) {
    return prisma.department.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        offices: {
          select: { id: true, code: true, name: true, officeType: true, district: true },
        },
      },
    });
  }

  async getOffices(departmentId?: string, parentOfficeId?: string) {
    return prisma.office.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(parentOfficeId ? { parentOfficeId } : {}),
      },
      include: {
        department: { select: { id: true, code: true, name: true } },
        parentOffice: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async getDesignations() {
    return prisma.designation.findMany({
      orderBy: { hierarchyLevel: 'desc' },
    });
  }

  async getUsers(params: {
    departmentId?: string;
    officeId?: string;
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    if (params.officeId) {
      whereCondition.officeId = params.officeId;
    }

    if (params.departmentId) {
      whereCondition.office = { departmentId: params.departmentId };
    }

    if (params.search) {
      whereCondition.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereCondition }),
      prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          lastLoginAt: true,
          office: {
            select: {
              id: true,
              code: true,
              name: true,
              district: true,
              department: { select: { id: true, code: true, name: true } },
            },
          },
          designation: {
            select: { id: true, code: true, title: true, hierarchyLevel: true, approvalLimitInr: true },
          },
          userRoles: {
            select: { role: { select: { id: true, roleType: true, name: true } } },
          },
        },
        orderBy: { designation: { hierarchyLevel: 'desc' } },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: users.map((u) => ({
        id: u.id,
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        department: u.office.department.name,
        departmentCode: u.office.department.code,
        office: u.office.name,
        district: u.office.district,
        designation: u.designation.title,
        hierarchyLevel: u.designation.hierarchyLevel,
        approvalLimitInr: Number(u.designation.approvalLimitInr),
        role: u.userRoles[0]?.role.roleType || 'PUBLIC_AUDITOR',
      })),
    };
  }

  async createUser(data: {
    employeeId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    officeId: string;
    designationId: string;
    roleType: string;
    district?: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ employeeId: data.employeeId }, { email: data.email }],
      },
    });

    if (existing) {
      throw new AppError('User with this Employee ID or Email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        employeeId: data.employeeId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        officeId: data.officeId,
        designationId: data.designationId,
        isActive: true,
      },
    });

    const role = await prisma.role.findFirst({
      where: { roleType: data.roleType as unknown as undefined },
    });

    if (role) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }

    if (data.district) {
      await prisma.jurisdiction.create({
        data: {
          userId: user.id,
          state: 'Gujarat',
          district: data.district,
        },
      });
    }

    return user;
  }
}
