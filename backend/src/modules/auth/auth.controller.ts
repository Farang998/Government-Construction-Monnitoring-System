import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginRequestSchema } from '@gov-platform/shared';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = LoginRequestSchema.parse(req.body);
      const result = await authService.login(validated, req.ip, req.headers['user-agent']);
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }
      const profile = await authService.getUserProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  }
}
