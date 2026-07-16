# Technical Requirements Document (TRD)

## 🏗️ Architecture Overview

──────────────────────────────────────────────────────────────┐
│ Browser (React) │
│ ┌─────────┐ ┌─────────────┐ ┌────────────────────────┐ │
│ │ Chat UI │ │ useChatStream│ │ Markdown Renderer │ │
│ └────┬────┘ └──────┬──────┘ └────────────────────────┘ │
│ │ │ │
│ └──────┬───────┘ │
│ │ HTTP (SSE) │
│ ▼ │
├──────────────────────────────────────────────────────────────┤
│ Express Backend │
│ ┌────────────┐ ┌──────────────┐ ┌────────────────────┐ │
│ │ Chat Route │─▶│ LLM Service │─▶│ OpenAI API │ │
│ └────┬───────┘ └──────┬───────┘ └────────────────────┘ │
│ │ │ │
│ ▼ ▼ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ PostgreSQL + pgvector │ │
│ │ ┌─────────┐ ┌─────────────────────────────────┐ │ │
│ │ │ Threads │ │ Messages (role, content, thread)│ │ │
│ │ └─────────┘ └─────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ DevOps Layer │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│ │ Docker │ │ GitHub CI │ │ Prometheus/Grafana │ │
│ └────────────┘ └────────────┘ └──────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

---

## 🧩 Technology Stack

### Frontend

| Technology     | Version    | Purpose            |
| :------------- | :--------- | :----------------- |
| React          | 18.x       | UI library         |
| Vite           | 5.x        | Build tool         |
| TypeScript     | 5.x        | Type safety        |
| React Markdown | 9.x        | Markdown rendering |
| Tailwind CSS   | (optional) | Styling            |

### Backend

| Technology | Version | Purpose                    |
| :--------- | :------ | :------------------------- |
| Node.js    | 20.x    | Runtime                    |
| Express    | 4.x     | Web framework              |
| TypeScript | 5.x     | Type safety                |
| OpenAI     | 4.x     | LLM client (raw streaming) |
| pg         | 8.x     | PostgreSQL driver          |
| tiktoken   | 1.x     | Token counting             |

### Database

| Technology | Version     | Purpose                     |
| :--------- | :---------- | :-------------------------- |
| PostgreSQL | 16.x        | Primary database            |
| pgvector   | (extension) | Vector storage (future RAG) |

### DevOps & Tooling

| Technology     | Version | Purpose                    |
| :------------- | :------ | :------------------------- |
| PNPM           | 8.x     | Package manager (monorepo) |
| Docker         | 24.x    | Containerization           |
| GitHub Actions | –       | CI/CD                      |
| Husky          | 9.x     | Git hooks                  |
| ESLint         | 8.x     | Code linting               |
| Prettier       | 3.x     | Code formatting            |
| Vitest         | 1.x     | Unit testing               |

---

## 📐 Data Models

### Threads Table

```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT NOW()
);
```

Messages Table
sql
CREATE TABLE messages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
role TEXT CHECK (role IN ('user', 'assistant', 'system')),
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

Application State (Frontend)
typescript
interface Thread {
id: string;
title: string;
created_at: string;
}

interface Message {
id: string;
thread_id: string;
role: 'user' | 'assistant' | 'system';
content: string;
created_at: string;
}

🔌 API Specifications

1. POST /api/chat/stream
   Description: Stream an AI response for a conversation.

Request:

json
{
"messages": [
{ "role": "user", "content": "Hello!" }
],
"threadId": "uuid" // optional; creates new if omitted
}
Response: Server‑Sent Events (SSE)

Event Type Payload Description
token { type: "token", content: "partial" } Streaming token
done { type: "done" } Stream finished
error { type: "error", message: "..." } Error occurred 2. GET /api/threads
Description: Get all threads for the current user.

Response:

json
{
"threads": [
{ "id": "uuid", "title": "New Chat", "created_at": "2024-01-01T00:00:00Z" }
]
} 3. GET /api/threads/:id/messages
Description: Get all messages for a specific thread.

Response:

json
{
"messages": [
{ "id": "uuid", "role": "user", "content": "Hello!", "created_at": "..." }
]
}
🔐 Security
Requirement Implementation
API Key Management Stored in .env, never exposed to frontend
CORS Configured to allow only frontend origin
Input Validation Check message arrays before processing
Rate Limiting (Future) Restrict requests per IP
Authentication (Future) JWT for multi‑user support
🚦 Performance & Monitoring
Metric Tool Target
Request Latency Express middleware < 200ms (excluding AI)
Token Cost OpenAI dashboard Track per request
Error Rate Logging + Prometheus < 1%
Memory Usage Node.js memory profiling < 500MB
Database Connections Pool management Max 20 connections
🧪 Testing Strategy
Test Type Tool Coverage Target
Unit Tests Vitest > 70%
Integration Tests Vitest + Supertest Critical paths
E2E Tests (Future) Playwright User flows
Performance Tests k6 Load testing

Deployment Architecture
┌─────────────────────────────────────────────────────────┐
│ AWS / VPS │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Docker Swarm / ECS │ │
│ │ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │ │
│ │ │ Nginx │─▶│ API │ │ PostgreSQL │ │ │
│ │ │ (Proxy) │ │ Container│ │ Container │ │ │
│ │ └──────────┘ └──────────┘ └─────────────┘ │ │
│ │ │ │
│ │ ┌──────────┐ ┌──────────┐ │ │
│ │ │ Frontend │ │ Worker │ │ │
│ │ │ Container│ │ Container│ │ │
│ │ └──────────┘ └──────────┘ │ │
│ └──────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ GitHub Actions (CI/CD) │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
