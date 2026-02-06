import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse, OpenAIMessage } from '../types/provider';
import { parseProviderError } from '../utils/error-handler';

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'command-r-plus',
    'gpt-4-turbo': 'command-r-plus',
    'gpt-3.5-turbo': 'command-r',
  };
  return modelMap[openaiModel] || 'command-r-plus';
};

const convertMessages = (messages: OpenAIMessage[]): { message: string; chatHistory?: any[] } => {
  if (messages.length === 0) {
    return { message: '' };
  }

  const lastMessage = messages[messages.length - 1];
  const chatHistory = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
    message: msg.content,
  }));

  return {
    message: lastMessage.content,
    chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
  };
};

export class CohereProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const cohereModel = mapModelName(request.model);
      const { message, chatHistory } = convertMessages(request.messages);

      const baseUrl = config.cohereBaseUrl || 'https://api.cohere.ai';
      const url = `${baseUrl}/v1/chat`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.cohereApiKey}`,
      };

      const body: any = {
        model: cohereModel,
        message,
        max_tokens: request.max_tokens || 4096,
      };

      if (chatHistory) {
        body.chat_history = chatHistory;
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
        id: data.generation_id || `cohere-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: data.text || '',
            },
            finish_reason: data.finish_reason === 'COMPLETE' ? 'stop' : 'length',
          },
        ],
        usage: {
          prompt_tokens: data.meta?.tokens?.input_tokens || 0,
          completion_tokens: data.meta?.tokens?.output_tokens || 0,
          total_tokens: (data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0),
        },
      };

      return openaiResponse;
    } catch (error: any) {
      throw parseProviderError(error, 'Cohere');
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      const cohereModel = mapModelName(request.model);
      const { message, chatHistory } = convertMessages(request.messages);

      const baseUrl = config.cohereBaseUrl || 'https://api.cohere.ai';
      const url = `${baseUrl}/v1/chat`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.cohereApiKey}`,
      };

      const body: any = {
        model: cohereModel,
        message,
        max_tokens: request.max_tokens || 4096,
        stream: true,
      };

      if (chatHistory) {
        body.chat_history = chatHistory;
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
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);

            if (parsed.event_type === 'text-generation') {
              const chunk = {
                id: `cohere-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: request.model,
                choices: [
                  {
                    index: 0,
                    delta: {
                      content: parsed.text || '',
                    },
                    finish_reason: null,
                  },
                ],
              };
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            } else if (parsed.event_type === 'stream-end') {
              const chunk = {
                id: `cohere-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: request.model,
                choices: [
                  {
                    index: 0,
                    delta: {},
                    finish_reason: parsed.finish_reason === 'COMPLETE' ? 'stop' : 'length',
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

      res.end();
    } catch (error: any) {
      throw parseProviderError(error, 'Cohere');
    }
  }
}
