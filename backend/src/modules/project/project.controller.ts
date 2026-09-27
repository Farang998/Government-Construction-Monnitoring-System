import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectProposalSchema } from '@gov-platform/shared';
import { AppError } from '../../middleware/errorHandler';

const projectService = new ProjectService();

export class ProjectController {
  async createProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required to submit proposals.', 401);
      }
      const validated = CreateProjectProposalSchema.parse(req.body);
      const project = await projectService.createProposal(validated, req.user);
      res.status(201).json({
        success: true,
        message: `Project proposal submitted successfully with code ${project.projectCode}`,
        data: project,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, departmentId, projectTypeId, status, district, sortBy, sortOrder, page, limit } = req.query;
      const result = await projectService.getProjects(
        {
          search: search as string,
          departmentId: departmentId as string,
          projectTypeId: projectTypeId as string,
          status: status as string,
          district: district as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as 'asc' | 'desc',
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 20,
        },
        req.user,
      );
      res.status(200).json({ success: true, ...result, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Project ID is required', 400);
      }
      const project = await projectService.getProjectById(id);
      res.status(200).json({ success: true, data: project, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  async getProjectTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = await projectService.getProjectTypes();
      res.status(200).json({ success: true, data: types, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }
}
