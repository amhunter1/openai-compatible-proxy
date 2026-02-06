import { OpenAIRequest } from '../types/provider';

export const validateChatRequest = (body: any): string | null => {
  if (!body.model) {
    return 'Missing required parameter: model';
  }

  if (!body.messages) {
    return 'Missing required parameter: messages';
  }

  if (!Array.isArray(body.messages)) {
    return 'messages must be an array';
  }

  if (body.messages.length === 0) {
    return 'messages array cannot be empty';
  }

  for (let i = 0; i < body.messages.length; i++) {
    const msg = body.messages[i];
    if (!msg.role) {
      return `messages[${i}]: Missing required field 'role'`;
    }
    if (!msg.content) {
      return `messages[${i}]: Missing required field 'content'`;
    }
  }

  return null;
};
