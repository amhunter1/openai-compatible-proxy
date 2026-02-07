import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

// Model definitions by provider
const modelsByProvider: Record<string, any[]> = {
  claude: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'anthropic', actual_model: 'claude-opus-4-6' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'anthropic', actual_model: 'claude-sonnet-4-5-20250929' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'anthropic', actual_model: 'claude-haiku-4-5-20251001' },
  ],
  gemini: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'google', actual_model: 'gemini-3-pro-preview' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'google', actual_model: 'gemini-3-flash-preview' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'google', actual_model: 'gemini-2.5-flash' },
  ],
  openai: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'openai' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'openai' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'openai' },
  ],
  xai: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'xai', actual_model: 'grok-2-1212' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'xai', actual_model: 'grok-2-1212' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'xai', actual_model: 'grok-2-mini-1212' },
  ],
  mistral: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'mistral', actual_model: 'mistral-large-latest' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'mistral', actual_model: 'mistral-large-latest' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'mistral', actual_model: 'mistral-small-latest' },
  ],
  cohere: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'cohere', actual_model: 'command-r-plus-08-2024' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'cohere', actual_model: 'command-r-plus-08-2024' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'cohere', actual_model: 'command-r-08-2024' },
  ],
  perplexity: [
    { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'perplexity', actual_model: 'sonar-pro' },
    { id: 'gpt-4-turbo', object: 'model', created: 1687882411, owned_by: 'perplexity', actual_model: 'sonar' },
    { id: 'gpt-3.5-turbo', object: 'model', created: 1687882411, owned_by: 'perplexity', actual_model: 'sonar-reasoning' },
  ],
};

router.get('/v1/models', (req: Request, res: Response) => {
  const provider = config.provider.toLowerCase();
  const models = modelsByProvider[provider] || modelsByProvider['claude'];

  res.json({
    object: 'list',
    data: models,
  });
});

export default router;
