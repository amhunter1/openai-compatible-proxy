import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse, OpenAIMessage } from '../types/provider';
import { parseProviderError } from '../utils/error-handler';

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'gemini-3-pro-preview',
    'gpt-4-turbo': 'gemini-3-flash-preview',
    'gpt-3.5-turbo': 'gemini-2.5-flash',
  };
  return modelMap[openaiModel] || 'gemini-3-pro-preview';
};

const convertMessages = (messages: OpenAIMessage[]): any[] => {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

export class GeminiProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const geminiModel = mapModelName(request.model);
      const contents = convertMessages(request.messages);

      const baseUrl = config.googleBaseUrl || 'https://generativelanguage.googleapis.com';
      const url = `${baseUrl}/v1beta/models/${geminiModel}:generateContent?key=${config.googleApiKey}`;

      const body: any = {
        contents,
        generationConfig: {
          maxOutputTokens: request.max_tokens || 8192,
        },
      };

      if (request.temperature !== undefined) {
        body.generationConfig.temperature = request.temperature;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${errorText}`);
      }

      const data: any = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const candidate = data.candidates[0];
      const content = candidate.content?.parts?.[0]?.text || '';

      const openaiResponse: OpenAIResponse = {
        id: `gemini-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content,
            },
            finish_reason: candidate.finishReason === 'STOP' ? 'stop' : 'length',
          },
        ],
        usage: {
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };

      return openaiResponse;
    } catch (error: any) {
      throw parseProviderError(error, 'Google Gemini');
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      const geminiModel = mapModelName(request.model);
      const contents = convertMessages(request.messages);

      const baseUrl = config.googleBaseUrl || 'https://generativelanguage.googleapis.com';
      const url = `${baseUrl}/v1beta/models/${geminiModel}:streamGenerateContent?key=${config.googleApiKey}&alt=sse`;

      const body: any = {
        contents,
        generationConfig: {
          maxOutputTokens: request.max_tokens || 8192,
        },
      };

      if (request.temperature !== undefined) {
        body.generationConfig.temperature = request.temperature;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

            try {
              const parsed = JSON.parse(data);

              if (parsed.candidates && parsed.candidates[0]?.content?.parts) {
                const text = parsed.candidates[0].content.parts[0]?.text || '';
                const finishReason = parsed.candidates[0].finishReason;

                if (text) {
                  const chunk = {
                    id: `gemini-${Date.now()}`,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: request.model,
                    choices: [
                      {
                        index: 0,
                        delta: {
                          content: text,
                        },
                        finish_reason: null,
                      },
                    ],
                  };
                  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                }

                if (finishReason) {
                  const chunk = {
                    id: `gemini-${Date.now()}`,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: request.model,
                    choices: [
                      {
                        index: 0,
                        delta: {},
                        finish_reason: finishReason === 'STOP' ? 'stop' : 'length',
                      },
                    ],
                  };
                  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                  res.write('data: [DONE]\n\n');
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      res.end();
    } catch (error: any) {
      throw parseProviderError(error, 'Google Gemini');
    }
  }
}
