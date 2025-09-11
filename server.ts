import express from 'express';
import cors from 'cors';
import { config } from './config/index.ts';
import routes from './routes/index.ts';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Backend running on http://localhost:${config.port}`);
});
