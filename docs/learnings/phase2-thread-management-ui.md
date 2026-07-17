# Phase 2 – Thread Management UI

## 📅 Status: ✅ Completed

---

## 🧠 What I Learned

### 1. Building a React Sidebar Component

- **Why:** A sidebar provides a clean, organized way to manage multiple conversations.
- **How:** Created a reusable `Sidebar` component that receives `threads`, `activeThreadId`, and callback functions as props. Used inline styles for simplicity.

### 2. Fetching Threads from the Backend

- **Why:** The sidebar needs to display all existing conversations.
- **How:** Created `GET /api/threads` endpoint that returns all threads ordered by `created_at DESC`. The frontend calls this on mount and after any thread mutation.

### 3. Switching Between Threads

- **Why:** Users need to navigate between conversations.
- **How:** Clicking a thread calls `onSelectThread(thread.id)`, which updates `activeThreadId` state, triggering a `useEffect` that fetches and displays the thread's messages.

### 4. Deleting Threads with Cascade

- **Why:** Deleting a thread should also remove all its messages to keep the database clean.
- **How:** Used `ON DELETE CASCADE` in the database schema. The `DELETE /api/threads/:id` endpoint deletes the thread and PostgreSQL automatically removes its messages.

### 5. Optimistic UI Updates

- **Why:** Makes the app feel faster and more responsive.
- **How:** When deleting a thread, we immediately remove it from the UI (`setThreads(prev => prev.filter(...))`) before waiting for the server response. If the request fails, we'd revert (though we didn't implement rollback for simplicity).

### 6. Managing Active Thread State

- **Why:** The app needs to know which thread is currently selected to display the right messages.
- **How:** Used React `useState` for `activeThreadId`. When it changes, a `useEffect` loads the corresponding messages.

---

## 🔥 Key Code Concepts

### Backend Thread Routes

```typescript
// GET /api/threads - List all threads
router.get('/', async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT id, title, created_at FROM threads ORDER BY created_at DESC'
  );
  res.json({ threads: result.rows });
});

// DELETE /api/threads/:id - Delete a thread
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM threads WHERE id = $1 RETURNING id', [id]);
  // Cascade delete automatically removes messages
});
```

### Frontend Sidebar Component

```tsx
export function Sidebar({ threads, activeThreadId, onSelectThread, onDeleteThread, onNewChat }) {
  return (
    <div style={styles.sidebar}>
      <button onClick={onNewChat}>✨ New Chat</button>
      {threads.map((thread) => (
        <div
          key={thread.id}
          style={{
            ...styles.threadItem,
            ...(thread.id === activeThreadId ? styles.threadItemActive : {}),
          }}
          onClick={() => onSelectThread(thread.id)}
        >
          <span>{thread.title}</span>
          <button onClick={() => onDeleteThread(thread.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
```

### Loading Messages on Thread Switch

```typescript
useEffect(() => {
  if (activeThreadId) {
    loadMessages(activeThreadId);
  } else {
    setMessages([]);
  }
}, [activeThreadId]);
```

## 📖 Terminologies & Explanations

Term Explanation
Sidebar A secondary panel (usually on the left) that houses navigation elements like the thread list.
Optimistic UI Updating the UI before the server confirms the action, making the app feel faster.
Thread A single conversation containing a sequence of user and assistant messages.
Active Thread The thread currently selected by the user, whose messages are displayed in the chat area.
Cascade Delete When a parent row is deleted, all dependent child rows are automatically deleted. We used ON DELETE CASCADE on messages.thread_id.
Props Drilling Passing data through multiple component layers. We used props to pass threads, activeThreadId, and callbacks from App to Sidebar.
State Management Managing application state (like the active thread) using React's useState and useEffect hooks.

## 🐛 Challenges & Solutions

Challenge Solution
Sidebar not updating after new chat After sending a new message, we call loadThreads() to refresh the thread list.
Deleting active thread leaves blank state After deletion, we check if the deleted thread was the active one. If so, we set activeThreadId to the first remaining thread or null.
Thread titles all "New Chat" We keep the default title; auto‑generation of titles based on the first message is a future enhancement.
UI styles breaking We ensured all styles were defined in the styles object and correctly applied. Added flexShrink: 0 to the sidebar to prevent it from shrinking.

## 🧪 Tests Written

Test File Purpose
(No dedicated tests for Phase 2 yet) Phase 2 was primarily UI/UX. The backend routes are covered by existing integration tests.
apps/api/src/routes/**tests**/thread.routes.test.ts (To be added) Tests for GET, DELETE, and PUT thread endpoints.

## Manual Testing Performed:

✅ Create a new chat – sidebar updates.

✅ Click a thread – messages load.

✅ Delete a thread – it disappears and active thread switches.

✅ Switch between threads – messages update correctly.

## Phase 2 Deliverables

Sidebar component with thread list.

Click to switch threads.

Delete threads with cascade.

New Chat button to start fresh.

Active thread highlighting.

Threads ordered by most recent.

Messages load on thread switch.

Optimistic UI for deletion.
