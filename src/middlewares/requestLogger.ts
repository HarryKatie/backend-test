import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent');

  // Log request start
  logger.info('Request started', {
    method,
    url: originalUrl,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Log request completion
    logger.info('Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    // Log slow requests (over 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        ip: req.ip,
      });
    }

    // Log very slow requests (over 5 seconds)
    if (duration > 5000) {
      logger.error('Very slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
  });

  next();
}; 