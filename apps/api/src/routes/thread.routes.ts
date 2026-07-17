import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET /api/threads - List all threads
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, title, system_prompt, created_at FROM threads ORDER BY created_at DESC'
    );
    res.json({ threads: result.rows });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// DELETE /api/threads/:id - Delete a thread and all its messages
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM threads WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// GET /api/threads/:id/messages - Get messages for a specific thread
router.get('/:id/messages', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, role, content, created_at FROM messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PUT /api/threads/:id - Update thread (e.g., title, system_prompt)
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, system_prompt } = req.body;
  try {
    const result = await pool.query(
      `UPDATE threads SET 
        title = COALESCE($1, title),
        system_prompt = COALESCE($2, system_prompt)
      WHERE id = $3
      RETURNING *`,
      [title, system_prompt, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json({ thread: result.rows[0] });
  } catch (error) {
    console.error('Error updating thread:', error);
    res.status(500).json({ error: 'Failed to update thread' });
  }
});

export default router;
