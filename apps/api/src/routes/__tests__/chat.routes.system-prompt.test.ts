import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRoutes from '../chat.routes';
import { pool } from '../../config/db';
import { streamChatCompletion } from '../../services/llm.service';

// Mock database
vi.mock('../../config/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

// Mock the LLM service
vi.mock('../../services/llm.service', () => ({
  streamChatCompletion: vi.fn(),
}));

// Mock tokenizer to avoid actual token counting (we're not testing truncation here)
vi.mock('../../utils/tokenizer', () => ({
  truncateMessages: vi.fn((messages) => messages),
  countTokens: vi.fn(() => 0),
}));

const app = express();
app.use(express.json());
app.use('/api/chat', chatRoutes);

describe('Chat Routes - System Prompt Injection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should inject the thread's system prompt when sending a message", async () => {
    const mockThread = { system_prompt: 'You are a helpful assistant.' };
    const mockHistory = [{ role: 'user', content: 'Previous message' }];
    const mockMessages = [{ role: 'user', content: 'New message' }];

    // Mock DB queries in the order they are called:
    // 1. SELECT system_prompt (since threadId is provided, INSERT is skipped)
    // 2. SELECT history
    // 3. INSERT user message
    (pool.query as any)
      .mockResolvedValueOnce({ rows: [mockThread] }) // system_prompt
      .mockResolvedValueOnce({ rows: mockHistory }) // history
      .mockResolvedValueOnce({ rows: [] }); // user message insert

    // Mock streamChatCompletion to verify messages and avoid actual stream
    (streamChatCompletion as any).mockImplementation(async (messages, res) => {
      // Assert that the first message is the system prompt
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toBe('You are a helpful assistant.');
      // The rest should be history + user messages
      expect(messages.length).toBe(3); // system + history + new user
      res.end();
    });

    await request(app)
      .post('/api/chat/stream')
      .send({ messages: mockMessages, threadId: 'thread-123' })
      .expect(200);

    expect(streamChatCompletion).toHaveBeenCalled();
  });

  it('should use the default system prompt if thread has none', async () => {
    const mockThread = { system_prompt: null };
    const mockHistory = [];
    const mockMessages = [{ role: 'user', content: 'Hi' }];

    (pool.query as any)
      .mockResolvedValueOnce({ rows: [mockThread] })
      .mockResolvedValueOnce({ rows: mockHistory })
      .mockResolvedValueOnce({ rows: [] });

    (streamChatCompletion as any).mockImplementation(async (messages, res) => {
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toBe('You are a helpful assistant.'); // default
      res.end();
    });

    await request(app)
      .post('/api/chat/stream')
      .send({ messages: mockMessages, threadId: 'thread-123' })
      .expect(200);
  });
});
