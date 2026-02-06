import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse } from '../types/provider';
import { parseProviderError } from '../utils/error-handler';

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'llama-3.1-sonar-large-128k-online',
    'gpt-4-turbo': 'llama-3.1-sonar-large-128k-online',
    'gpt-3.5-turbo': 'llama-3.1-sonar-small-128k-online',
  };
  return modelMap[openaiModel] || 'llama-3.1-sonar-large-128k-online';
};

export class PerplexityProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const perplexityModel = mapModelName(request.model);

      const baseUrl = config.perplexityBaseUrl || 'https://api.perplexity.ai';
      const url = `${baseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.perplexityApiKey}`,
      };

      const body: any = {
        model: perplexityModel,
        messages: request.messages,
        max_tokens: request.max_tokens || 4096,
      };

      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${errorText}`);
      }

      const data: any = await response.json();

      const openaiResponse: OpenAIResponse = {
        id: data.id || `perplexity-${Date.now()}`,
        object: 'chat.completion',
        created: data.created || Math.floor(Date.now() / 1000),
        model: request.model,
        choices: data.choices.map((choice: any) => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content,
          },
          finish_reason: choice.finish_reason,
        })),
        usage: {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0,
        },
      };

      return openaiResponse;
    } catch (error: any) {
      throw parseProviderError(error, 'Perplexity');
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      const perplexityModel = mapModelName(request.model);

      const baseUrl = config.perplexityBaseUrl || 'https://api.perplexity.ai';
      const url = `${baseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.perplexityApiKey}`,
      };

      const body: any = {
        model: perplexityModel,
        messages: request.messages,
        max_tokens: request.max_tokens || 4096,
        stream: true,
      };

      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              res.write(`data: ${JSON.stringify(parsed)}\n\n`);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      res.end();
    } catch (error: any) {
      throw parseProviderError(error, 'Perplexity');
    }
  }
}
