import { Provider } from '../types/provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { config } from '../config';

export const getProvider = (): Provider => {
  const providerType = config.provider.toLowerCase();

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
    default:
      return new ClaudeProvider();
  }
};
