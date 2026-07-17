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
      system_prompt TEXT DEFAULT 'You are a helpful assistant.',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add column if missing (for existing databases)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='threads' AND column_name='system_prompt'
      ) THEN
        ALTER TABLE threads ADD COLUMN system_prompt TEXT DEFAULT 'You are a helpful assistant.';
      END IF;
    END $$;
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
