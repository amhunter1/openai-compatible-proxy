import express, { Request, Response, NextFunction } from 'express';
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

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

app.use('/v1/', (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const rateData = rateLimitMap.get(ip);

  if (!rateData || now > rateData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (rateData.count >= RATE_LIMIT_MAX) {
    res.status(429).json({
      error: {
        message: 'Rate limit exceeded. Please try again later.',
        type: 'rate_limit_error',
      }
    });
    return;
  }

  rateData.count++;
  next();
});

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/', chatRoutes);
app.use('/', modelsRoutes);

// Health check endpoint with detailed info
app.get('/health', (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    provider: config.provider,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    apiKeyConfigured: !!getApiKeyForProvider(config.provider),
  };
  res.json(health);
});

// Helper function to check if API key is configured
function getApiKeyForProvider(provider: string): string {
  const providerLower = provider.toLowerCase();
  switch (providerLower) {
    case 'claude':
    case 'anthropic':
      return config.anthropicApiKey;
    case 'openai':
      return config.openaiApiKey;
    case 'gemini':
    case 'google':
      return config.googleApiKey;
    case 'xai':
    case 'grok':
      return config.xaiApiKey;
    case 'mistral':
      return config.mistralApiKey;
    case 'cohere':
      return config.cohereApiKey;
    case 'perplexity':
      return config.perplexityApiKey;
    default:
      return '';
  }
}

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'internal_error',
    }
  });
});

// Startup API key validation
const startupApiKey = getApiKeyForProvider(config.provider);
if (!startupApiKey || startupApiKey.startsWith('your_')) {
  logger.warn(`WARNING: API key for provider "${config.provider}" is not configured or is a placeholder!`);
}

app.listen(config.port, () => {
  logger.info(`OpenAI-Compatible Proxy Server started`);
  logger.info(`Port: ${config.port}`);
  logger.info(`Provider: ${config.provider}`);
  logger.info(`Log Level: ${config.logLevel}`);
});
