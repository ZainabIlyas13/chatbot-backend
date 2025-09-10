import express from 'express';
import OpenAI from 'openai';
import { config } from '../config/index.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: config.openai.apiKey });

// Chat endpoint
router.post('/', async (req, res) => {
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
      choices: response.choices
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
