import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { createApp } from './app';
import { connectDatabase } from '@/config/database';
import { config } from '@/config';
import { logger } from '@/utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    let server: http.Server | https.Server;

    // Conditionally create HTTPS server in production
    if (config.server.isProduction && config.server.sslKeyPath && config.server.sslCertPath) {
      const sslOptions = {
        key: fs.readFileSync(path.resolve(config.server.sslKeyPath)),
        cert: fs.readFileSync(path.resolve(config.server.sslCertPath)),
      };

      server = https.createServer(sslOptions, app);
      logger.info('🔒 HTTPS server created using provided SSL cert and key');
    } else {
      server = http.createServer(app);
      logger.info('🔓 HTTP server created (development or missing SSL cert/key)');
    }

    // Start server
    server.listen(config.server.port, config.server.host, () => {
      const protocol = server instanceof https.Server ? 'https' : 'http';
      logger.info(`Server is running on ${protocol}://${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(`Database: Connected`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('Server closed');

        try {
          await import('@/config/database').then(({ disconnectDatabase }) => disconnectDatabase());
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error closing database connection:', error);
        }

        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
