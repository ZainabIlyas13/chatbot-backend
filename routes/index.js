import express from 'express';
import chatRoutes from './chat.js';
import healthRoutes from './health.js';

const router = express.Router();

// Routes
router.use('/chat', chatRoutes);
router.use('/health', healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
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
