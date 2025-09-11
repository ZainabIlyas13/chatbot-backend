import express from 'express';
import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config/index.ts';

const router = express.Router();
const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

// Chat endpoint
router.post('/', async (req: Request<{}, ChatResponse, ChatRequest>, res: Response<ChatResponse | { error: string }>) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: messages,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature
    });

    res.json({
      choices: response.choices as Array<{ message: { role: string; content: string } }>
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
