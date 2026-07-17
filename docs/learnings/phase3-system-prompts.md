---

## 📄 3. `docs/learnings/phase3-system-prompts.md`

````markdown
# Phase 3 – System Prompts & Custom Instructions

## 📅 Status: ✅ Completed

---

## 🧠 What I Learned

### 1. System Prompts Define AI Personality

- **Why:** The system prompt is the most important instruction that steers the AI's behavior, tone, and constraints. It's the "personality" of the assistant.
- **How:** Stored a `system_prompt` per thread so each conversation can have a unique instruction (e.g., "You are a pirate", "Act as a Shakespearean playwright").

### 2. Database Migration for Existing Tables

- **Why:** Adding a column to an existing table requires a migration – `CREATE TABLE IF NOT EXISTS` won't add new columns to an existing table.
- **How:** Used a conditional `DO $$ ... END $$` block in PostgreSQL to check if the column exists and add it if missing.

### 3. Server‑Side Injection of System Prompts

- **Why:** The frontend should **not** send the system prompt – it's stored on the server to prevent tampering and ensure consistency across sessions.
- **How:** In `chat.routes.ts`, we fetch the thread's `system_prompt` and prepend it as the first message in the conversation **before** sending the message list to the LLM.

### 4. Frontend UI for Editing System Prompts

- **Why:** Users need a way to change the prompt per thread.
- **How:** Added an edit button (gear icon ⚙️) next to the active thread in the sidebar. Clicking it reveals an inline input field; saving sends a `PUT /api/threads/:id` request.

### 5. Token Counting Still Applies

- **Why:** System prompts consume tokens, so they must be included in the truncation logic.
- **How:** The system prompt is always the first message, and `truncateMessages` keeps it even when dropping older user/assistant messages to fit the context window.

### 6. Testing with Mocks

- **Why:** Unit tests for system prompt injection should focus on the logic, not on token counting.
- **How:** We mocked `truncateMessages` to return the messages unchanged, and mocked `pool.query` to return controlled data, allowing us to verify that the system prompt is correctly inserted.

---

## 🔥 Key Code Concepts

### Database Migration (Conditional Column Addition)

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='threads' AND column_name='system_prompt'
  ) THEN
    ALTER TABLE threads ADD COLUMN system_prompt TEXT DEFAULT 'You are a helpful assistant.';
  END IF;
END $$;
```
````

### System Prompt Injection (Backend)

```typescript
// Fetch thread's system prompt
const threadResult = await pool.query('SELECT system_prompt FROM threads WHERE id = $1', [
  threadId,
]);
const systemPrompt = threadResult.rows[0]?.system_prompt || 'You are a helpful assistant.';

// Remove any system message from frontend payload
const userMessages = messages.filter((m) => m.role !== 'system');

// Build full history with system prompt at the front
const systemMessage = { role: 'system', content: systemPrompt };
const fullHistory = [systemMessage, ...history, ...userMessages];
```

### Frontend Edit UI (Sidebar)

```tsx
{
  editingThreadId === thread.id ? (
    <div style={{ display: 'flex', gap: 4 }}>
      <input
        type="text"
        value={editPrompt}
        onChange={(e) => setEditPrompt(e.target.value)}
        autoFocus
      />
      <button onClick={() => handleSavePrompt(thread.id)}>💾</button>
      <button onClick={() => setEditingThreadId(null)}>✕</button>
    </div>
  ) : (
    <span onClick={() => onSelectThread(thread.id)}>{thread.title}</span>
  );
}
```

### API Endpoint for Updating System Prompt

```typescript
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, system_prompt } = req.body;
  const result = await pool.query(
    `UPDATE threads SET 
      title = COALESCE($1, title),
      system_prompt = COALESCE($2, system_prompt)
    WHERE id = $3
    RETURNING *`,
    [title, system_prompt, id]
  );
  // ...
});
```

## 📖 Terminologies & Explanations

Term Explanation
System Prompt A special initial instruction that sets the AI's behavior, role, and constraints for the entire conversation.
Migration A script that changes the database schema (e.g., adding a column) without losing existing data.
Context Window The maximum number of tokens the AI can process in one request. System prompts consume tokens, so they affect the available space for conversation history.
COALESCE A SQL function that returns the first non‑NULL value. Used in UPDATE to keep the existing value if the new one is NULL.
Mocking Replacing a real implementation with a controlled substitute in tests, to isolate the logic being tested.
DO $$ ... END $$ A PostgreSQL anonymous code block used for conditional logic in migrations.
Prompt Injection A security risk where a user overwrites the system prompt via their input. Mitigated by placing system prompt first and treating it as immutable on the server.
Prompt Engineering The practice of designing and refining prompts to achieve desired AI outputs.

## 🐛 Challenges & Solutions

Challenge Solution
system_prompt column missing in existing database Added a conditional migration in initDatabase to add the column if it doesn't exist.
Token count errors in tests Mocked truncateMessages to bypass actual token counting in unit tests.
Frontend sends its own system message Filtered out any role === 'system' messages from the frontend payload to avoid duplicates.
Edit UI disappearing after save Ensured handleUpdateSystemPrompt refreshes the thread list (loadThreads()) so the prompt changes appear immediately.
TypeScript build errors in tests Added explicit type annotations and mocked truncateMessages to avoid real token counting.

## 🧪 Tests Written

Test File Purpose
apps/api/src/routes/**tests**/chat.routes.system-prompt.test.ts Verifies that the backend injects the correct system prompt (custom or default) when processing a chat request.
Test Results: ✅ 2 tests passing.

## ✅ Phase 3 Deliverables

Database column system_prompt added to threads table.

GET /api/threads includes system_prompt in the response.

PUT /api/threads/:id updates system_prompt.

POST /api/chat/stream injects the thread's system prompt.

Frontend sidebar shows edit button (gear) for active thread.

Inline editing interface for system prompts.

System prompts persist across reloads and thread switches.

Integration tests for prompt injection.

Manual testing: AI follows custom prompts (e.g., "Speak like a pirate").
