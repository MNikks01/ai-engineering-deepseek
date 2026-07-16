import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the project root (two levels up from this file)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/db';
import chatRoutes from './routes/chat.routes';
import threadRoutes from './routes/thread.routes';

const app = express();
const PORT = process.env.PORT || 5000;

initDatabase();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/chat', chatRoutes);
app.use('/api/threads', threadRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
