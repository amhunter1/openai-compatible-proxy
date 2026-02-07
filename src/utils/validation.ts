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
    // content can be empty string, but must exist (string or array for vision)
    if (msg.content === undefined && msg.content === null) {
      return `messages[${i}]: Missing required field 'content'`;
    }
    // Validate content type (string or array for vision support)
    if (typeof msg.content !== 'string' && !Array.isArray(msg.content)) {
      return `messages[${i}]: content must be string or array`;
    }
  }

  return null;
};
