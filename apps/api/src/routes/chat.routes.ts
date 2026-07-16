import { Router, Request, Response } from 'express';
import { streamChatCompletion } from '../services/llm.service';

const router = Router();

router.post('/stream', async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Delegate to our raw streaming service
  await streamChatCompletion(messages, res);
});

export default router;
