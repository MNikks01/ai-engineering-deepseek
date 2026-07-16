import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'chater',
  password: 'chater123',
  database: 'chater',
});

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS threads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT DEFAULT 'New Chat',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
      role TEXT CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('✅ Database tables ready');
}
