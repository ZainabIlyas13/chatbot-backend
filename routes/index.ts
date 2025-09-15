import express from 'express';
import type { Request, Response } from 'express';
import chatRoutes from '@/routes/chat.ts';
import healthRoutes from '@/routes/health.ts';

const router = express.Router();

// Routes
router.use('/chat', chatRoutes);
router.use('/health', healthRoutes);

// Root endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Chatbot Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chat: '/chat'
    }
  });
});

export default router;
