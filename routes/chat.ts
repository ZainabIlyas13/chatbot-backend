import express from 'express';
import type { Request, Response } from 'express';
import { openaiService } from '@/services/openAI/service.ts';
import type { ChatResponse, ChatRequest } from '@/types/index.ts';

const router = express.Router();

// Chat endpoint
router.post('/', async (req: Request<{}, ChatResponse, ChatRequest>, res: Response<ChatResponse | { error: string }>) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    const response = await openaiService.processChat(messages);
    res.json(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
