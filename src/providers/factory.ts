import { Provider } from '../types/provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { XAIProvider } from './xai-provider';
import { MistralProvider } from './mistral-provider';
import { CohereProvider } from './cohere-provider';
import { PerplexityProvider } from './perplexity-provider';
import { config } from '../config';

export const getProvider = (): Provider => {
  const providerType = config.provider.toLowerCase();

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
    case 'google':
      return new GeminiProvider();
    case 'xai':
    case 'grok':
      return new XAIProvider();
    case 'mistral':
      return new MistralProvider();
    case 'cohere':
      return new CohereProvider();
    case 'perplexity':
      return new PerplexityProvider();
    case 'claude':
    case 'anthropic':
    default:
      return new ClaudeProvider();
  }
};
