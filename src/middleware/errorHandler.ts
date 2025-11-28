import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`${err.name}: ${err.message}`);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
