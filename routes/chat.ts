import express from 'express';
import type { Request, Response } from 'express';
import { openaiService } from '@/services/openAI/index.ts';
import { chatService } from '@/services/chat/index.ts';
import { ChatRole } from '@/types/index.ts';

const router = express.Router();

// Create a new chat
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { title, userId } = req.body;
    const chat = await chatService.createChat({ title, userId });
    res.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get all chats
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const chats = await chatService.getChats(userId as string);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get a specific chat
router.get('/:chatId', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await chatService.getChat(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Update chat title
router.put('/:chatId/title', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const chat = await chatService.updateChatTitle(chatId, title);
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
});

// Delete a chat
router.delete('/:chatId', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    await chatService.deleteChat(chatId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Chat endpoint
router.post('/:chatId/message', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Save user message to database
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      await chatService.addMessage({
        chatId,
        role: lastMessage.role,
        content: lastMessage.content
      });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Process chat with streaming and save assistant response
    let assistantResponse = '';
    
    // Override the response write to capture content
    const originalWrite = res.write.bind(res);
    res.write = function(chunk: any, encoding?: any, callback?: any) {
      if (typeof chunk === 'string' && chunk.startsWith('data: ')) {
        try {
          const data = JSON.parse(chunk.slice(6));
          if (data.content) {
            assistantResponse += data.content;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return originalWrite(chunk, encoding, callback);
    };

    await openaiService.processChat(messages, res);

    // Save assistant response to database
    if (assistantResponse) {
      await chatService.addMessage({
        chatId,
        role: ChatRole.ASSISTANT,
        content: assistantResponse
      });
    }

  } catch (error) {
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to process chat request' })}\n\n`);
    res.end();
  }
});

export default router;