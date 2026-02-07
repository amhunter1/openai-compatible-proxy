import { Response } from 'express';

// Content part for Vision support
export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
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

export interface Provider {
  call(request: OpenAIRequest): Promise<OpenAIResponse>;
  stream(request: OpenAIRequest, res: Response): Promise<void>;
}
