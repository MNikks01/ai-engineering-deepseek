import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRoutes from '../chat.routes';
import { pool } from '../../config/db';
import { streamChatCompletion } from '../../services/llm.service';

vi.mock('../../config/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../services/llm.service', () => ({
  streamChatCompletion: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/chat', chatRoutes);

describe('Chat Routes - /api/chat/stream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if messages array is missing', async () => {
    const response = await request(app).post('/api/chat/stream').send({});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Messages array is required' });
  });

  it('should create a new thread if threadId is not provided', async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 'new-thread-id' }] }); // INSERT thread
    (pool.query as any).mockResolvedValueOnce({ rows: [] }); // SELECT history
    (pool.query as any).mockResolvedValueOnce({ rows: [] }); // INSERT user message
    // Mock streamChatCompletion to simulate streaming completion
    (streamChatCompletion as any).mockImplementation(
      async (messages: any, res: any, threadId: string) => {
        res.write(`data: ${JSON.stringify({ type: 'token', content: 'Hello' })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    );

    const response = await request(app)
      .post('/api/chat/stream')
      .send({
        messages: [{ role: 'user', content: 'Hello' }],
      });

    expect(response.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO threads'),
      expect.arrayContaining(['New Chat'])
    );
    expect(streamChatCompletion).toHaveBeenCalled();
  });

  it('should use the provided threadId and fetch history', async () => {
    const mockHistory = [{ role: 'user', content: 'Previous' }];
    (pool.query as any).mockResolvedValueOnce({ rows: mockHistory }); // SELECT history
    (pool.query as any).mockResolvedValueOnce({ rows: [] }); // INSERT user message
    (streamChatCompletion as any).mockImplementation(
      async (messages: any, res: any, threadId: string) => {
        res.write(`data: ${JSON.stringify({ type: 'token', content: 'Hi' })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    );

    const response = await request(app)
      .post('/api/chat/stream')
      .send({
        messages: [{ role: 'user', content: 'Hello again' }],
        threadId: 'existing-thread-id',
      });

    expect(response.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT role, content FROM messages WHERE thread_id = $1'),
      expect.arrayContaining(['existing-thread-id'])
    );
    expect(streamChatCompletion).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    (pool.query as any).mockRejectedValue(new Error('DB connection failed'));

    const response = await request(app)
      .post('/api/chat/stream')
      .send({
        messages: [{ role: 'user', content: 'Hello' }],
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
