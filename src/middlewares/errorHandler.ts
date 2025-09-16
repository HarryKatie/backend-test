import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string[]> | undefined;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // ✅ Handle custom ValidationError (from Zod middleware)
  if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  }
  // Handle other custom AppErrors
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Mongoose validation error
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const mongooseError = error as any;
    errors = {};
    Object.keys(mongooseError.errors).forEach((key) => {
      errors![key] = [mongooseError.errors[key].message];
    });
  }
  // Handle Mongoose duplicate key
  else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }
  // CastError (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  // JWT Errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle raw Zod errors (fallback)
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    const zodError = error as any;
    errors = {};
    zodError.errors.forEach((err: any) => {
      const field = err.path.join('.');
      if (!errors![field]) {
        errors![field] = [];
      }
      errors![field].push(err.message);
    });
  }

  const errorResponse: ErrorResponse = {
    statusCode,
    success: false,
    message,
    ...(errors && { errors }),
  };

  // if (config.server.isDevelopment && error.stack) {
  //   errorResponse.stack = error.stack;
  // }

  res.status(statusCode).json(errorResponse);
};


// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  };

  res.status(404).json(errorResponse);
}; 