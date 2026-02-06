import { Router, Request, Response } from 'express';
import { getProvider } from '../providers/factory';
import { handleError } from '../utils/error-handler';
import { validateChatRequest } from '../utils/validation';

const router = Router();

router.post('/v1/chat/completions', async (req: Request, res: Response) => {
  try {
    const validationError = validateChatRequest(req.body);
    if (validationError) {
      return res.status(400).json({
        error: {
          message: validationError,
          type: 'invalid_request_error',
        },
      });
    }

    const provider = getProvider();

    if (req.body.stream) {
      await provider.stream(req.body, res);
    } else {
      const response = await provider.call(req.body);
      res.json(response);
    }
  } catch (error: any) {
    handleError(error, res);
  }
});

export default router;
