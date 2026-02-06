import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  provider: process.env.PROVIDER || 'claude',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Claude (Anthropic)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || undefined,

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || undefined,

  // Google Gemini
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  googleBaseUrl: process.env.GOOGLE_BASE_URL || undefined,

  // xAI (Grok)
  xaiApiKey: process.env.XAI_API_KEY || '',
  xaiBaseUrl: process.env.XAI_BASE_URL || undefined,

  // Mistral AI
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  mistralBaseUrl: process.env.MISTRAL_BASE_URL || undefined,

  // Cohere
  cohereApiKey: process.env.COHERE_API_KEY || '',
  cohereBaseUrl: process.env.COHERE_BASE_URL || undefined,

  // Perplexity
  perplexityApiKey: process.env.PERPLEXITY_API_KEY || '',
  perplexityBaseUrl: process.env.PERPLEXITY_BASE_URL || undefined,
};
