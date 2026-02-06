import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { config } from '../config';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const mapModelName = (openaiModel: string): string => {
  const modelMap: Record<string, string> = {
    'gpt-4': 'claude-3-5-sonnet-20241022',
    'gpt-4-turbo': 'claude-3-5-sonnet-20241022',
    'gpt-3.5-turbo': 'claude-3-5-haiku-20241022',
  };
  return modelMap[openaiModel] || 'claude-3-5-sonnet-20241022';
};

const convertMessages = (messages: OpenAIMessage[]): { system?: string; messages: Anthropic.MessageParam[] } => {
  const systemMessages = messages.filter(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  const system = systemMessages.length > 0
    ? systemMessages.map(m => m.content).join('\n')
    : undefined;

  const claudeMessages: Anthropic.MessageParam[] = nonSystemMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  return { system, messages: claudeMessages };
};

export const callClaude = async (request: OpenAIRequest): Promise<OpenAIResponse> => {
  const claudeModel = mapModelName(request.model);
  const { system, messages } = convertMessages(request.messages);

  const response = await anthropic.messages.create({
    model: claudeModel,
    max_tokens: request.max_tokens || 4096,
    temperature: request.temperature,
    system,
    messages,
  });

  const openaiResponse: OpenAIResponse = {
    id: response.id,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: request.model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: response.content[0].type === 'text' ? response.content[0].text : '',
        },
        finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };

  return openaiResponse;
};

export const streamClaude = async (request: OpenAIRequest, res: Response): Promise<void> => {
  const claudeModel = mapModelName(request.model);
  const { system, messages } = convertMessages(request.messages);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await anthropic.messages.stream({
    model: claudeModel,
    max_tokens: request.max_tokens || 4096,
    temperature: request.temperature,
    system,
    messages,
  });

  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const chunk = {
        id,
        object: 'chat.completion.chunk',
        created,
        model: request.model,
        choices: [
          {
            index: 0,
            delta: {
              content: event.delta.text,
            },
            finish_reason: null,
          },
        ],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (event.type === 'message_stop') {
      const finalChunk = {
        id,
        object: 'chat.completion.chunk',
        created,
        model: request.model,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop',
          },
        ],
      };
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
      res.write('data: [DONE]\n\n');
    }
  }

  res.end();
};
