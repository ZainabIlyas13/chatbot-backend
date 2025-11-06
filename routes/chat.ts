import express from 'express';
import type { Request, Response } from 'express';
import { openaiService } from '@/services/openAI/index.ts';
import type { ChatResponse, ChatRequest } from '@/types/index.ts';

const router = express.Router();

// Chat endpoint
router.post('/', async (req: Request<{}, ChatResponse, ChatRequest>, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Process chat with streaming
    await openaiService.processChat(messages, res);

  } catch (error) {
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to process chat request' })}\n\n`);
    res.end();
  }
});

export default router;
