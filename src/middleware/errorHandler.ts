import type { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const rawStatusCode = 'statusCode' in err ? err.statusCode : 500;
  const statusCode = typeof rawStatusCode === 'number' && 
    rawStatusCode >= 400 && rawStatusCode <= 599 ? rawStatusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

/**
 * Not found handler middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
