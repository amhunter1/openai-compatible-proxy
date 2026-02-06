import express from 'express';
import { config } from './config';
import chatRoutes from './routes/chat';
import modelsRoutes from './routes/models';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/', chatRoutes);
app.use('/', modelsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: config.provider });
});

app.listen(config.port, () => {
  logger.info(`OpenAI-Compatible Proxy Server started`);
  logger.info(`Port: ${config.port}`);
  logger.info(`Provider: ${config.provider}`);
  logger.info(`Log Level: ${config.logLevel}`);
});
