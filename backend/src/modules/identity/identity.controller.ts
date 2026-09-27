import { Request, Response, NextFunction } from 'express';
import { IdentityService } from './identity.service';

const identityService = new IdentityService();

export class IdentityController {
  async getOrganizations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await identityService.getOrganizations();
      res.status(200).json({ success: true, data: orgs, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = req.query;
      const depts = await identityService.getDepartments(organizationId as string);
      res.status(200).json({ success: true, data: depts, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getOffices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId, parentOfficeId } = req.query;
      const offices = await identityService.getOffices(departmentId as string, parentOfficeId as string);
      res.status(200).json({ success: true, data: offices, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getDesignations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const designations = await identityService.getDesignations();
      res.status(200).json({ success: true, data: designations, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId, officeId, role, search, page, limit } = req.query;
      const result = await identityService.getUsers({
        departmentId: departmentId as string,
        officeId: officeId as string,
        role: role as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, ...result, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await identityService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User account created successfully',
        data: { id: user.id, employeeId: user.employeeId, fullName: user.fullName },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
