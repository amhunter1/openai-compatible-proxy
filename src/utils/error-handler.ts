import { Response } from 'express';

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export const handleError = (error: any, res: Response): void => {
  console.error('Error:', error);

  let statusCode = 500;
  let errorType = 'internal_error';
  let message = error.message || 'Internal server error';

  if (error.status === 400 || error.statusCode === 400) {
    statusCode = 400;
    errorType = 'invalid_request_error';
  } else if (error.status === 401 || error.statusCode === 401) {
    statusCode = 401;
    errorType = 'authentication_error';
  } else if (error.status === 403 || error.statusCode === 403) {
    statusCode = 403;
    errorType = 'permission_error';
  } else if (error.status === 404 || error.statusCode === 404) {
    statusCode = 404;
    errorType = 'not_found_error';
  } else if (error.status === 429 || error.statusCode === 429) {
    statusCode = 429;
    errorType = 'rate_limit_error';
  } else if (error.status >= 500 || error.statusCode >= 500) {
    statusCode = 500;
    errorType = 'api_error';
  }

  const errorResponse: ErrorResponse = {
    error: {
      message,
      type: errorType,
    },
  };

  if (error.code) {
    errorResponse.error.code = error.code;
  }

  res.status(statusCode).json(errorResponse);
};
