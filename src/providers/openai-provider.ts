import OpenAI from 'openai';
import { Response } from 'express';
import { config } from '../config';
import { Provider, OpenAIRequest, OpenAIResponse } from '../types/provider';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export class OpenAIProvider implements Provider {
  async call(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: request.model,
        messages: request.messages as any,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
      });

      return response as OpenAIResponse;
    } catch (error: any) {
      throw this.normalizeError(error);
    }
  }

  async stream(request: OpenAIRequest, res: Response): Promise<void> {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await openai.chat.completions.create({
        model: request.model,
        messages: request.messages as any,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        stream: true,
      });

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: any): Error {
    const normalized: any = new Error(error.message || 'Unknown error');

    if (error.status) {
      normalized.status = error.status;
    } else if (error.statusCode) {
      normalized.status = error.statusCode;
    }

    return normalized;
  }
}
