# Phase 1 – Memory & Persistence

## 📅 Status: ✅ Completed

---

## 🧠 What I Learned

### 1. PostgreSQL Connection Pooling

- **Why:** Opening a new DB connection for every request is slow and resource-heavy. A connection pool reuses existing connections.
- **How:** `new Pool({ host, port, user, password, database })` creates a pool. `pool.query()` automatically borrows and releases a connection.

### 2. Schema Design for Chat

- **Why:** Conversations are a one‑to‑many relationship (one thread → many messages).
- **How:**
  - `threads` table holds thread metadata (id, title, created_at).
  - `messages` table holds each turn with a `thread_id` foreign key.
  - `ON DELETE CASCADE` ensures that deleting a thread also deletes all its messages.

### 3. Token Counting with `tiktoken`

- **Why:** OpenAI charges per token. To control costs and avoid context overflow, we must know the exact token count of every message.
- **How:** `encoding_for_model('gpt-4o-mini').encode(text).length`.
- **Critical:** Always call `.free()` after encoding to prevent memory leaks (tiktoken uses Rust under the hood).

### 4. Sliding Window Truncation

- **Why:** The LLM's context window is finite (e.g., 128k tokens). If we send too many tokens, the API throws an error.
- **How:** Walk backwards from the newest message, adding tokens until we hit the limit. Always keep the system prompt (if present) – it sets the AI's behavior and must not be dropped.

### 5. Saving Assistant Responses Asynchronously

- **Why:** We don't know the full response until streaming finishes.
- **How:** Accumulate `fullResponse += content` during the streaming loop. After the stream ends, save it to the `messages` table via `pool.query()`.

### 6. Docker Compose for Local Development

- **Why:** Ensures everyone on the team has the exact same database environment.
- **How:** Define the `postgres` service with image version, environment variables, and persistent volumes. Start with `docker-compose up -d`.

---

## 🔥 Key Code Concepts

### Connection Pool

```typescript
export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'chater',
  password: 'chater123',
  database: 'chater',
});
```

### Token Counting

```typescript
export function countTokens(text: string) {
  const enc = encoding_for_model('gpt-4o-mini');
  const tokens = enc.encode(text);
  enc.free(); // CRITICAL: prevents memory leak
  return tokens.length;
}
```

### Sliding Window Truncation

```typescript
for (let i = remaining.length - 1; i >= 0; i--) {
  const msg = remaining[i];
  const msgTokens = countTokens(msg.content);
  if (currentTokens + msgTokens > maxTokens) break;
  result.unshift(msg); // Insert at front to maintain order
  currentTokens += msgTokens;
}
```

Why reverse? By iterating from newest to oldest, we prioritize recent messages, which are usually most relevant.

### Saving Assistant Message

```typescript
if (threadId && fullResponse) {
  await pool.query('INSERT INTO messages (thread_id, role, content) VALUES ($1, $2, $3)', [
    threadId,
    'assistant',
    fullResponse,
  ]);
}
```

## Terminologies & Explanations

**Connection Pool** - A cache of database connections that are reused to reduce latency and resource usage.
**Context Window** - The maximum number of tokens an LLM can process in a single request (e.g., 128k tokens for GPT‑4).
**Tokenizer** - An algorithm (like BPE) that splits text into tokens. tiktoken is OpenAI's tokenizer.
**Sliding Window** - A technique where we keep the most recent N tokens and discard older ones to fit the context limit.
**Foreign Key (FK)** - A column that references the primary key of another table. Ensures referential integrity.
**Cascade Delete** - When a parent row is deleted, all child rows (e.g., messages) are automatically deleted. We use ON DELETE CASCADE.
**System Prompt** - A special message that sets the AI's behavior (e.g., "You are a helpful assistant.").
**BPE (Byte‑Pair Encoding)** - A tokenization algorithm used by GPT models. It merges frequent byte pairs into tokens.
**Docker Container** - A lightweight, standalone package that includes everything needed to run software (code, runtime, system tools).
**Volume** - A persistent data store for Docker containers. Used to keep PostgreSQL data even after the container stops.

## Challenges & Solutions

- tiktoken memory leak - Always call enc.free() after encoding.
- Database connection refused - Ensure PostgreSQL is running (docker-compose ps).
- Context overflow errors - Implemented the sliding window truncation with a safe token limit (4000).
- Assistant messages not saving - Forgot to pass threadId to streamChatCompletion. Fixed by adding it as the 3rd parameter.
- Port 5432 already in use - Check if another PostgreSQL instance is running locally. Stop it with brew services stop postgresql or change the ports mapping in docker-compose.yml.

## Tests Written

- apps/api/src/utils/**tests**/tokenizer.test.ts
  Counts tokens correctly for various inputs (basic).
- apps/api/src/utils/**tests**/truncation.test.ts
  Ensures truncation keeps system prompt + newest messages.
  To be added: Integration tests that verify messages are actually saved to the database.
