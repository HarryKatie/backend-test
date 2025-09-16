import winston from 'winston';
import path from 'path';
import { config } from '@/config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create transports
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.server.isDevelopment ? consoleFormat : logFormat,
  }),
];

// Add file transport for production
if (config.server.isProduction) {
  const logDir = path.dirname(config.logging.file);
  const logFile = path.basename(config.logging.file);
  
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, `${logFile}.error`),
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, logFile),
      format: logFormat,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
}; 