import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 52428800, // 50MB (production-ready)
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 52428800, // 50MB (production-ready)
      maxFiles: 10,
    }),
  ],
});

export const logRequest = (method: string, path: string, provider: string) => {
  logger.info(`${method} ${path} - Provider: ${provider}`);
};

export const logError = (error: Error, context?: string) => {
  const message = context ? `${context}: ${error.message}` : error.message;
  logger.error(message, { stack: error.stack });
};

export const logProviderCall = (provider: string, model: string, stream: boolean) => {
  logger.info(`Provider call: ${provider} | Model: ${model} | Stream: ${stream}`);
};
