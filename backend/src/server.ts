import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🏛️ Government Construction Monitoring Platform Backend`);
  logger.info(`⚡ Server running on port ${config.PORT} [${config.NODE_ENV}]`);
  logger.info(`🔒 Security policies & Rate limiting initialized`);
  logger.info(`=======================================================`);
});

const handleTermination = (signal: string) => {
  logger.warn(`Received ${signal}. Gracefully shutting down server...`);
  server.close(() => {
    logger.info('HTTP server terminated. Database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
