import { Response } from 'express';
import { logError } from './logger';

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
    provider?: string;
    details?: any;
  };
}

export class APIError extends Error {
  statusCode: number;
  type: string;
  code?: string;
  provider?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    type: string = 'api_error',
    code?: string,
    provider?: string,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.type = type;
    this.code = code;
    this.provider = provider;
    this.details = details;
  }
}

export const parseProviderError = (error: any, provider: string): APIError => {
  let statusCode = 500;
  let errorType = 'api_error';
  let message = error.message || 'Unknown error occurred';
  let code = error.code;
  let details = error.details;

  // Parse error message for status codes
  const statusMatch = message.match(/^(\d{3})\s/);
  if (statusMatch) {
    statusCode = parseInt(statusMatch[1]);
    message = message.replace(/^\d{3}\s/, '');
  }

  // Categorize errors by status code
  if (statusCode === 400) {
    errorType = 'invalid_request_error';
  } else if (statusCode === 401) {
    errorType = 'authentication_error';
    message = `Authentication failed for ${provider}. Please check your API key.`;
  } else if (statusCode === 403) {
    errorType = 'permission_error';
    message = `Permission denied for ${provider}. Check your API key permissions.`;
  } else if (statusCode === 404) {
    errorType = 'not_found_error';
    message = `Resource not found on ${provider}. Check the model name or endpoint.`;
  } else if (statusCode === 429) {
    errorType = 'rate_limit_error';
    message = `Rate limit exceeded for ${provider}. Please try again later.`;
  } else if (statusCode >= 500) {
    errorType = 'api_error';
    message = `${provider} API error: ${message}`;
  }

  return new APIError(message, statusCode, errorType, code, provider, details);
};

export const handleError = (error: any, res: Response, provider?: string): void => {
  let apiError: APIError;

  if (error instanceof APIError) {
    apiError = error;
  } else if (provider) {
    apiError = parseProviderError(error, provider);
  } else {
    const statusCode = error.status || error.statusCode || 500;
    const errorType = statusCode === 400 ? 'invalid_request_error' :
                      statusCode === 401 ? 'authentication_error' :
                      statusCode === 403 ? 'permission_error' :
                      statusCode === 404 ? 'not_found_error' :
                      statusCode === 429 ? 'rate_limit_error' :
                      'internal_error';

    apiError = new APIError(
      error.message || 'Internal server error',
      statusCode,
      errorType,
      error.code
    );
  }

  // Log the error
  logError(apiError, provider ? `Provider: ${provider}` : undefined);

  const errorResponse: ErrorResponse = {
    error: {
      message: apiError.message,
      type: apiError.type,
    },
  };

  if (apiError.code) {
    errorResponse.error.code = apiError.code;
  }

  if (apiError.provider) {
    errorResponse.error.provider = apiError.provider;
  }

  if (process.env.NODE_ENV === 'development' && apiError.details) {
    errorResponse.error.details = apiError.details;
  }

  res.status(apiError.statusCode).json(errorResponse);
};
