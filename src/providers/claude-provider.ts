import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse, OpenAIMessage } from '../types/provider';

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'claude-opus-4-6',
    'gpt-4-turbo': 'claude-sonnet-4-5-20250929',
    'gpt-3.5-turbo': 'claude-haiku-4-5-20251001',
  };
  return modelMap[openaiModel] || 'claude-opus-4-6';
};

const convertMessages = (messages: OpenAIMessage[]): { system?: string; messages: any[] } => {
  const systemMessages = messages.filter(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  const system = systemMessages.length > 0
    ? systemMessages.map(m => m.content).join('\n')
    : undefined;

  const claudeMessages = nonSystemMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  return { system, messages: claudeMessages };
};

export class ClaudeProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const claudeModel = mapModelName(request.model);
      const { system, messages } = convertMessages(request.messages);

      const baseUrl = config.anthropicBaseUrl || 'https://api.anthropic.com';
      const url = `${baseUrl}/v1/messages`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': config.anthropicApiKey,
      };

      const body: any = {
        model: claudeModel,
        max_tokens: request.max_tokens || 4096,
        messages,
      };

      if (system) {
        body.system = system;
      }

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
        id: data.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: data.content[0].type === 'text' ? data.content[0].text : '',
            },
            finish_reason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
          },
        ],
        usage: {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        },
      };

      return openaiResponse;
    } catch (error: any) {
      throw this.normalizeError(error);
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      const claudeModel = mapModelName(request.model);
      const { system, messages } = convertMessages(request.messages);

      const baseUrl = config.anthropicBaseUrl || 'https://api.anthropic.com';
      const url = `${baseUrl}/v1/messages`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': config.anthropicApiKey,
      };

      const body: any = {
        model: claudeModel,
        max_tokens: request.max_tokens || 4096,
        messages,
        stream: true,
      };

      if (system) {
        body.system = system;
      }

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

              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                const chunk = {
                  id: parsed.id || 'chatcmpl-' + Date.now(),
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: request.model,
                  choices: [
                    {
                      index: 0,
                      delta: {
                        content: parsed.delta.text,
                      },
                      finish_reason: null,
                    },
                  ],
                };
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              } else if (parsed.type === 'message_stop') {
                const chunk = {
                  id: 'chatcmpl-' + Date.now(),
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: request.model,
                  choices: [
                    {
                      index: 0,
                      delta: {},
                      finish_reason: 'stop',
                    },
                  ],
                };
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                res.write('data: [DONE]\n\n');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      res.end();
    } catch (error: any) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Unknown error occurred');
  }
}
