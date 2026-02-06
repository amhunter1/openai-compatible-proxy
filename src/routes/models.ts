import { Router, Request, Response } from 'express';

const router = Router();

router.get('/v1/models', (req: Request, res: Response) => {
  const models = {
    object: 'list',
    data: [
      {
        id: 'gpt-4o',
        object: 'model',
        created: 1687882411,
        owned_by: 'openai',
      },
      {
        id: 'claude-3-opus',
        object: 'model',
        created: 1687882411,
        owned_by: 'anthropic',
      },
      {
        id: 'claude-3-sonnet',
        object: 'model',
        created: 1687882411,
        owned_by: 'anthropic',
      },
    ],
  };
  res.json(models);
});

export default router;
