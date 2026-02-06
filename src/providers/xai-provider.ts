import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse } from '../types/provider';
import { parseProviderError } from '../utils/error-handler';

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'grok-beta',
    'gpt-4-turbo': 'grok-beta',
    'gpt-3.5-turbo': 'grok-beta',
  };
  return modelMap[openaiModel] || 'grok-beta';
};

export class XAIProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const xaiModel = mapModelName(request.model);

      const baseUrl = config.xaiBaseUrl || 'https://api.x.ai';
      const url = `${baseUrl}/v1/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.xaiApiKey}`,
      };

      const body: any = {
        model: xaiModel,
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
        id: data.id || `xai-${Date.now()}`,
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
      throw parseProviderError(error, 'xAI Grok');
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      const xaiModel = mapModelName(request.model);

      const baseUrl = config.xaiBaseUrl || 'https://api.x.ai';
      const url = `${baseUrl}/v1/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.xaiApiKey}`,
      };

      const body: any = {
        model: xaiModel,
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
      throw parseProviderError(error, 'xAI Grok');
    }
  }
}
