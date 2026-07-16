# Key Learnings – AI Engineering Deepseek

## 🧠 Phase 0: Streaming & Foundation

### 1. SSE (Server‑Sent Events) vs WebSockets

- **SSE** is perfect for one‑way streaming (AI → user). Simpler, HTTP‑based.
- **WebSockets** are better for bidirectional communication (chat apps, games).
- **Key insight:** SSE uses standard HTTP, no special protocol negotiation.

### 2. Raw Streaming Implementation

- OpenAI's SDK returns an **async generator** – we used `for await...of`.
- Manually parsing SSE events requires handling `\n\n` delimiters and buffering partial chunks.
- **Cost saving:** Always check `res.on('close')` to abort the OpenAI stream when the client refreshes.

### 3. Monorepo with PNPM Workspaces

- **PNPM** is faster and more disk‑efficient than npm/yarn.
- Workspaces allow sharing types (`shared` folder) across frontend and backend.
- **Watch out:** `dotenv` path resolution when running from different workspace roots.

### 4. Tooling Integration (ESLint + Prettier + Husky)

- **Husky v9** has deprecated the old wrapper (`/usr/bin/env sh`). Use `pnpm lint-staged` directly.
- **Lint‑staged** runs only on staged files – making pre‑commit hooks fast.
- **ESLint rules** can be relaxed for development (`no-console: off`, `any: warn`).

### 5. Git Branching Strategy

- `phase/*` branches for isolated feature development.
- `development` as the integration branch.
- `main` for production‑ready code.
- Pull Requests enforce CI checks before merging.

---

## 💡 General AI Engineering Insights

### 6. Token Counting Matters

- **Context windows** are finite (128k tokens for GPT‑4).
- Always count tokens using `tiktoken` before sending messages.
- **Sliding window** – keep the system prompt + newest messages, drop the oldest.

### 7. Prompt Engineering is a First‑Class Concern

- Store prompts as code (version‑controlled) – not as strings in the UI.
- Treat prompt templates like you would database schemas.
- A/B test different prompts to measure response quality.

### 8. LLM Latency vs Cost Tradeoffs

- `gpt-4o-mini` → cheaper, faster, 80% of the quality.
- `gpt-4o` → expensive, slower, but higher reasoning.
- **Tiered approach:** Use mini for routine tasks, full model for complex reasoning.

### 9. Streaming Improves Perceived Performance

- Even if total generation takes 5 seconds, showing tokens as they arrive makes the app feel 2x faster.
- The **Time to First Token (TTFT)** is the most critical UX metric.

### 10. Error Handling in Streaming

- Streaming errors must be sent as SSE events (not just HTTP status codes).
- The frontend must gracefully handle partial tokens and reconnect logic.

---

## 🛠️ Engineering Best Practices Applied

### 11. Database Connection Pooling

- Use a shared `Pool` instance – don't create a new connection per request.
- Set reasonable `max` connections (e.g., 20) to avoid overload.

### 12. Environment Variables

- Always load `.env` at the **earliest** possible point in the entrypoint.
- Use `path.resolve` to handle monorepo nesting.

### 13. Type Safety

- Share types between frontend and backend via the `shared` workspace.
- Use `unknown` instead of `any` for better type safety.

### 14. CI/CD Pipeline

- Run tests, linting, and build on every PR.
- Fail fast – catch issues before they reach `development` or `main`.

### 15. Containerization

- Docker ensures **environment parity** between dev and production.
- Use `docker-compose` for multi‑service orchestration (API + DB + worker).

---

## 🚧 Challenges Faced & Solutions

| Challenge                                  | Solution                                                                 |
| :----------------------------------------- | :----------------------------------------------------------------------- |
| **Port 5000 taken by `ControlCe` (macOS)** | Switched to port 5001 via `.env` + Vite proxy update.                    |
| **Husky pre‑commit failing**               | Converted `.lintstagedrc.js` to `.cjs` (CommonJS). Relaxed ESLint rules. |
| **OpenAI API key not loading**             | Explicitly loaded `.env` with `path.resolve` from `index.ts`.            |
| **ESLint blocking `any` and `console`**    | Set `any` to `warn` and `console` to `off` for development.              |

---

## 🧭 What to Learn Next

- **RAG (Retrieval Augmented Generation)** – How to ground LLMs in external documents.
- **Fine‑tuning** – Customizing models for specific domains.
- **Evaluation** – Using LLMs to judge response quality (RAGAS, etc.).
- **Prompt Caching** – Reducing API costs by reusing prompt prefixes.

---

## 📚 Recommended Readings

- [OpenAI API Streaming](https://platform.openai.com/docs/api-reference/streaming)
- [Understanding Tokenization](https://platform.openai.com/tokenizer)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [SSE vs WebSockets](https://www.baeldung.com/cs/sse-vs-websocket)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Patterns for Building LLM Apps](https://www.anthropic.com/news/building-ai-applications)

---

## ✨ Final Thought

> "The best way to learn AI engineering is to build without frameworks. Every abstraction you skip today is a skill you gain for tomorrow."
