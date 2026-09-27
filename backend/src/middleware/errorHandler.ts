import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    logger.warn(`Validation failure on ${req.method} ${req.originalUrl}:`, { errors: errorMessages });
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message} [${err.statusCode}]`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.error(`Unhandled system exception on ${req.method} ${req.originalUrl}:`, {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error. Incident logged for security audit.',
    timestamp: new Date().toISOString(),
  });
};
