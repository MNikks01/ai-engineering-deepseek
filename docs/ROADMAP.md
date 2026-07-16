# Phasewise Development Roadmap

## 📅 Overall Timeline: ~14 Days

---

## ✅ Phase 0: Foundation & Streaming (Completed)

**Duration:** 2 Days  
**Goal:** Build the core streaming chat engine without any AI frameworks.

### Tasks Completed

- [x] Monorepo setup (PNPM workspaces)
- [x] Express backend with TypeScript
- [x] React frontend with Vite
- [x] Raw SSE streaming (no third‑party libs)
- [x] OpenAI API integration (gpt‑4o‑mini)
- [x] Frontend streaming hook (fetch + ReadableStream)
- [x] Tooling: ESLint, Prettier, Husky, Vitest
- [x] Git branching: `main` ← `development` ← `phase/*`
- [x] GitHub Actions CI pipeline

### Key Learnings

- SSE vs WebSockets vs polling
- Parsing OpenAI's async generator
- Handling client disconnection (cost savings)
- Monorepo management with PNPM

---

## 🔄 Phase 1: Memory & Persistence (In Progress)

**Duration:** 3 Days  
**Goal:** Store conversations and manage context windows.

### Tasks

- [ ] PostgreSQL setup (Docker or local)
- [ ] Threads & messages schema
- [ ] CRUD for threads and messages
- [ ] `tiktoken` token counting
- [ ] Context truncation (sliding window)
- [ ] Save user & assistant messages to DB
- [ ] Thread creation on first message

### Deliverables

- Conversations persist after page refresh
- Automatic token management (no context overflow errors)
- Thread ID support in API

### Key Learning Objectives

- Token counting mechanics
- Context window limitations
- Database integration with raw SQL

---

## 🖥️ Phase 2: Thread Management UI

**Duration:** 2 Days  
**Goal:** Sidebar with thread list, switching, and deletion.

### Tasks

- [ ] Sidebar component
- [ ] Fetch and display thread list
- [ ] Click to switch threads
- [ ] Delete thread (with confirmation)
- [ ] Auto‑generate thread titles (optional)

### Deliverables

- ChatGPT‑style sidebar
- Multiple conversations supported
- Seamless switching between threads

### Key Learning Objectives

- State management across components
- Optimistic UI updates
- React Query / SWR for data fetching (optional)

---

## 🎛️ Phase 3: System Prompts & Customization

**Duration:** 2 Days  
**Goal:** Allow users to set custom system instructions per thread.

### Tasks

- [ ] Add system prompt field to thread model
- [ ] UI for editing system prompts
- [ ] Inject system prompt into context
- [ ] Temperature / Top‑P controls (optional)

### Deliverables

- Each thread can have a custom "personality"
- "Act as a pirate" – style experimentation

### Key Learning Objectives

- Prompt engineering principles
- System message weighting
- Parameter tuning for diverse outputs

---

## 🛠️ Phase 4: Function / Tool Calling

**Duration:** 3 Days  
**Goal:** Connect the LLM to external APIs (weather, calculator).

### Tasks

- [ ] Define tool schemas (OpenAI function calling format)
- [ ] Implement tool execution (weather API, math, etc.)
- [ ] Handle tool calls in the streaming loop
- [ ] Round‑trip: LLM → tool → LLM → final answer
- [ ] Frontend support for tool‑in‑progress states

### Deliverables

- User: "What's the weather in London?"
- AI: Calls weather API → returns real data

### Key Learning Objectives

- Function calling mechanism
- Stateful tool execution
- Multi‑turn tool loops

---

## 🚀 Phase 5: Deployment & Monitoring

**Duration:** 2 Days  
**Goal:** Ship the app to production with monitoring.

### Tasks

- [ ] Dockerize API, frontend, and worker
- [ ] Docker‑Compose for production
- [ ] GitHub Actions deploy to AWS EC2 / ECS
- [ ] Prometheus + Grafana setup
- [ ] Health checks and logging
- [ ] SSL/HTTPS with Let's Encrypt

### Deliverables

- Publicly accessible AI chat
- Monitoring dashboard
- Automated rollback on failure

### Key Learning Objectives

- Container orchestration
- Cloud infrastructure
- Observability & alerting

---

## 🌟 Phase 6: Advanced Features (Optional)

**Duration:** Variable  
**Goal:** Extend the app with cutting‑edge AI capabilities.

### Potential Features

- [ ] **RAG (Retrieval Augmented Generation)** – Upload PDFs and ask questions.
- [ ] **Fine‑tuning** – Custom‑train a model on user data.
- [ ] **Multi‑modal** – Image input/output (vision models).
- [ ] **Voice interface** – Speech‑to‑text + text‑to‑speech.
- [ ] **User authentication** – Login/signup with JWT.
- [ ] **Rate limiting & usage tracking** – API key management.

---

## 📊 Progress Tracking

| Phase   | Status         | Completed |
| :------ | :------------- | :-------- |
| Phase 0 | ✅ Done        | 100%      |
| Phase 1 | 🔄 In Progress | 0%        |
| Phase 2 | ⏳ Planned     | 0%        |
| Phase 3 | ⏳ Planned     | 0%        |
| Phase 4 | ⏳ Planned     | 0%        |
| Phase 5 | ⏳ Planned     | 0%        |
| Phase 6 | 💡 Ideation    | 0%        |

---

## 🧭 Current Focus

**We are here:** Phase 1 – adding PostgreSQL and context management.

**Next step:** Set up the database and implement token truncation.
