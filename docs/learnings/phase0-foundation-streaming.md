# Phase 0 – Foundation & Streaming

## 📅 Status: ✅ Completed

---

## 🧠 What I Learned

### 1. Monorepo with PNPM Workspaces

- **Why:** To share code (types, utilities) between frontend and backend without publishing packages.
- **How:** `pnpm-workspace.yaml` defines workspace roots (`apps/*`, `shared`). Dependencies are installed centrally, saving disk space.

### 2. Raw Server‑Sent Events (SSE)

- **Why:** SSE is perfect for one‑way, real‑time streaming (AI → browser). It's built on HTTP, so no WebSocket complexity.
- **How:** Set `Content-Type: text/event-stream`, keep the connection alive, and send `data: {json}\n\n` chunks.

### 3. OpenAI's Async Generator

- **Why:** The OpenAI SDK returns an async iterable (`for await...of`) for streaming.
- **How:** Each `chunk` contains a `delta` with partial content. We extract and forward it as SSE.

### 4. Client Disconnection Handling

- **Why:** To avoid paying for tokens when the user closes the browser.
- **How:** Listen to `res.on('close')`, set a flag, and abort the OpenAI stream via `stream.controller.abort()`.

### 5. Frontend Stream Parsing with `ReadableStream`

- **Why:** No third‑party SSE libraries – we own the parsing logic.
- **How:** Use `response.body.getReader()` and `TextDecoder` to read bytes. Split by `\n\n` to extract events. Handle fragmented packets with a `buffer`.

### 6. Tooling: ESLint, Prettier, Husky, Vitest

- **Why:** Enforce code quality and consistency automatically.
- **How:**
  - Prettier formats code.
  - ESLint catches bugs.
  - Husky runs `lint-staged` on pre‑commit.
  - Vitest runs unit tests.

### 7. GitHub Actions CI

- **Why:** Catch errors early and automate checks.
- **How:** On every push/PR, the pipeline runs `format:check`, `lint`, `test:ci`, and `build`.

---

## 🔥 Key Code Concepts

### SSE Sender (Backend)

```typescript
function sendSSE(res: Response, data: any) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
```

Why: This is the raw HTTP write that creates the streaming protocol.

### Parsing SSE (Frontend)

```typescript
const events = buffer.split('\n\n');
buffer = events.pop() || '';
for (const event of events) {
  const lines = event.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));
      // handle token
    }
  }
}
```

Why: We manually split by double newline to handle fragmented network packets (TCP/IP may split chunks).

### Disconnection Handling

```typescript
let isAborted = false;
res.on('close', () => {
  isAborted = true;
});
// inside the stream loop:
if (isAborted) {
  await stream.controller.abort();
  break;
}
```

Why: Aborting the OpenAI stream stops token generation, saving costs.

## Terminologies & Explanations

**Monorepo** - A single repository containing multiple projects (apps) that share dependencies and tooling.

**Workspace** - In PNPM, a folder that is part of the monorepo. Dependencies are hoisted to the root.

**SSE (Server‑Sent Events)** - A standard for real‑time communication over HTTP. The server pushes data to the client via a persistent connection.

**Async Generator** - A function (async function*) that yields multiple values over time. Used by OpenAI to stream chunks.

**ReadableStream** - A Web API for reading streaming data. We use response.body to read the SSE stream.

**Buffer** - A temporary storage for partial data. We use it to concatenate fragmented network packets.

**Lint‑Staged** - A tool that runs linters only on files that are staged in Git, making pre‑commit hooks fast.

**Husky** - A tool for managing Git hooks (e.g., pre‑commit, pre‑push) in a Node.js project.

**CI/CD** - Continuous Integration (automated testing) and Continuous Deployment (automated releases). We use GitHub Actions.

### Challenges & Solutions

- Port 5000 taken by ControlCe (macOS) Changed to port 5001 via .env and updated Vite proxy.
- ESLint blocking any and console Relaxed rules for development: any: warn, console: off.
- Husky pre‑commit failing Converted .lintstagedrc.js to .cjs (CommonJS).
- OpenAI key not loading Explicitly loaded .env with path.resolve from index.ts.
- ESLint no-constant-condition on while (true) Replaced with while (!done) using the reader's done flag.

### Tests Written

Test File Purpose

- apps/api/src/services/**tests**/llm.service.test.ts
  Basic sanity – ensures the module loads.
  Next: Expand tests for SSE event formatting and error handling.
