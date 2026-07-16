# Phase‑wise Learning & Testing Guide

## 📚 Purpose

This document captures what we learn in each phase, the code we write, and the tests we write to validate it.  
It serves as a reference and a way to ensure we don't move forward with broken features.

---

## ✅ Phase 0: Foundation & Streaming (Completed)

### 🎯 Learning Objectives

- Set up a **monorepo** with PNPM workspaces.
- Build a **raw streaming API** using Server‑Sent Events (SSE) – no high‑level frameworks.
- Parse OpenAI's async generator and forward tokens to the frontend.
- Handle **client disconnection** to abort API calls and save costs.
- Integrate **frontend streaming** using the `fetch` API + `ReadableStream`.
- Set up **tooling**: ESLint, Prettier, Husky, Vitest, GitHub Actions.

### 🔥 Key Code Snippets

#### Backend SSE Streaming (`llm.service.ts`)

```typescript
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) sendSSE(res, { type: 'token', content });
}
```

#### Frontend Stream Reader (useChatStream.ts)

```typescript
const reader = response.body?.getReader();
while (!done) {
  const { value, done: readerDone } = await reader.read();
  // parse SSE events...
}
```

### Tests for Phase 0

Test File What it tests
apps/api/src/services/**tests**/llm.service.test.ts Basic sanity – ensures the module loads.
(To be added) Integration test: call /stream and verify SSE events.

### Suggested Test Expansion

- Unit test for sendSSE formatting.
- Mock the OpenAI stream and assert that SSE events are written.
- Test disconnection – simulate res.on('close') and ensure the stream is aborted.
