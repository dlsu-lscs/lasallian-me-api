import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/shared/utils/logger.js';

/**
 * Custom error class for HTTP errors
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response
): void => {
  // Log the error details
  logger.error('Request Error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.headers['x-request-id']
  });

  // Handle Custom HTTP Errors
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {})
      }
    });
    return;
  }

  // Handle Zod Validation Errors (fallback if not handled in controller)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: err.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }
    });
    return;
  }

  // Handle JSON Parsing Errors (e.g. invalid JSON in request body)
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    res.status(400).json({
      error: {
        message: 'Invalid JSON payload',
        code: 'INVALID_JSON'
      }
    });
    return;
  }

  // Default to 500 for unknown errors
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: {
      message: isDev ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(isDev && { stack: err.stack })
    }
  });
};