import { Router, Request, Response } from 'express';
import { streamChatCompletion } from '../services/llm.service';
import { pool } from '../config/db';
import { truncateMessages } from '../utils/tokenizer';

const router = Router();

router.post('/stream', async (req: Request, res: Response) => {
  const { messages, threadId: providedThreadId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    // 1. Get or create a thread
    let threadId = providedThreadId;
    if (!threadId) {
      const result = await pool.query('INSERT INTO threads (title) VALUES ($1) RETURNING id', [
        'New Chat',
      ]);
      threadId = result.rows[0].id;
    }

    // 2. Fetch the thread's system prompt
    const threadResult = await pool.query('SELECT system_prompt FROM threads WHERE id = $1', [
      threadId,
    ]);
    const systemPrompt = threadResult.rows[0]?.system_prompt || 'You are a helpful assistant.';

    // 3. Fetch existing messages for this thread
    const historyResult = await pool.query(
      'SELECT role, content FROM messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );
    const history = historyResult.rows;

    // 4. Remove any system message sent from the frontend (to avoid conflicts/duplication)
    const userMessages = messages.filter((m) => m.role !== 'system');

    // 5. Build the full conversation: system prompt (always first), then history, then new user messages
    const systemMessage = { role: 'system', content: systemPrompt };
    const fullHistory = [systemMessage, ...history, ...userMessages];

    // 6. Truncate to fit the token limit (4000 tokens for safety)
    const truncated = truncateMessages(fullHistory, 4000);

    // 7. Save the user's new message to DB
    const userMsg = userMessages[userMessages.length - 1];
    if (userMsg?.role === 'user') {
      await pool.query('INSERT INTO messages (thread_id, role, content) VALUES ($1, $2, $3)', [
        threadId,
        'user',
        userMsg.content,
      ]);
    }

    // 8. Stream the response – pass threadId so assistant message can be saved
    await streamChatCompletion(truncated, res, threadId);
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
