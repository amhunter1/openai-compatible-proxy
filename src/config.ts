import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  provider: process.env.PROVIDER || 'claude',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || undefined,
  openaiBaseUrl: process.env.OPENAI_BASE_URL || undefined,
};
