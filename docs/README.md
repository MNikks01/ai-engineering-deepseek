# Chater – AI Chat Assistant

A production‑grade ChatGPT clone built from scratch as an AI engineering learning project.

---

## 🎯 Project Vision

Build a fully functional, extensible AI chat application that demonstrates core AI engineering concepts:

- Real‑time streaming (Server‑Sent Events)
- Context window management (token counting & truncation)
- Conversation persistence (threads & messages)
- Tool / function calling
- Production‑ready DevOps (CI/CD, Docker, monitoring)

---

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5001

## Documentation

Document Description
PRD.md Product requirements, user stories, features
TRD.md Technical architecture, APIs, data models
ROADMAP.md Phasewise development roadmap
LEARNINGS.md Technical insights & lessons learned

## Tech Stack

Layer Technology
Frontend React, Vite, TypeScript
Backend Node.js, Express, TypeScript
AI OpenAI API (raw, no SDKs)
Database PostgreSQL + pgvector
Streaming Server‑Sent Events (raw)
DevOps Docker, GitHub Actions
Tooling PNPM, ESLint, Prettier, Husky, Vitest

## Project Status

Phase Status
Phase 0 – Foundation & Streaming ✅ Complete
Phase 1 – Memory & Persistence 🔄 In Progress
Phase 2 – Thread Management UI ⏳ Planned
Phase 3 – System Prompts ⏳ Planned
Phase 4 – Function / Tool Calling ⏳ Planned
Phase 5 – Deployment ⏳ Planned

## Contributing

This is a learning project. Fork it, experiment, and build your own AI stack!
