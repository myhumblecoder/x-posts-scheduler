# Implementation Plan: X Post Creator & Scheduler

**Branch**: `001-x-post-creator` | **Date**: 2025-11-04 | **Spec**: [specs/001-x-post-creator/spec.md](specs/001-x-post-creator/spec.md)

## Summary

This feature implements the X Post Creator & Scheduler MVP: a **local-first web app** where a single X user can:

- Generate LLM-powered posts
- Preview/edit in tiles
- Drag-to-reorder
- Schedule exact release times
- Auto-post via background worker
- Retry on failure (server-side, 3 attempts)

**Focus**: <10s LLM gen, <60s to schedule, 100% on-time posting, X API compliance.

---

## Technical Context

**Language/Version**:

- **Frontend**: TypeScript (v5.5+)
- **Backend**: Node.js (v20 LTS)

**Primary Dependencies**:  
| Layer | Package | Purpose |
|------|--------|--------|
| Frontend | `vite`, `typescript`, `sortablejs` | SPA + drag-drop |
| Backend | `express`, `better-sqlite3`, `node-cron` | API + DB + scheduler |
| LLM | `ollama` (local), `@groq/sdk` (fallback) | Text/image gen |
| Auth | `oauth2` (PKCE) | X OAuth 2.0 |

**Storage**:

- **SQLite** (`data/app.db`) — single file, local-first
- **File system** for media (temp upload → X API)

**Testing**:

- **Vitest** (unit)
- **Playwright** (E2E)
- **Coverage**: 100% core logic (`scheduler`, `retry`, `oauth`)
- **CI**: GitHub Actions (existing)

**Target Platform**:

- **Dev**: `http://localhost:5173` (Vite)
- **Prod**: Vercel (frontend), Fly.io or local (backend)

**Project Type**: Web application (SPA + API + worker)

**Performance Goals**:

- LLM gen: ≤10s (95th percentile)
- Schedule UX: <60s
- Posting: ±1 min
- Load: <2s

**Constraints**:

- X API v2: OAuth PKCE, rate limits, idempotency
- Local-first: No cloud DB required
- Offline drafting

**Scale/Scope**:

- MVP: 1 user, 200 queued posts
- Future: Horizontal workers

---

## Constitution Check

| Gate                   | Evidence                                              |
| ---------------------- | ----------------------------------------------------- |
| **TDD**                | `tasks.md` will enforce `[TEST]` before `[IMPLEMENT]` |
| **100% Core Coverage** | CI fails if `scheduler`, `retry`, `oauth` <100%       |
| **Lint & Format**      | `npm run lint` → ESLint + Prettier                    |
| **Accessibility**      | `axe-core` in Playwright E2E                          |
| **Performance**        | Benchmarks in `tests/perf/`                           |
| **X API Compliance**   | ADR-004: OAuth + rate limit handling                  |

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/    # Tile, Editor, Scheduler
│   ├── services/      # LLM, OAuth, API
│   └── main.ts
├── tests/
│   ├── unit/
│   └── e2e/
└── vite.config.ts

backend/
├── src/
│   ├── routes/        # REST API
│   ├── services/      # LLM, X API, Scheduler
│   ├── workers/       # node-cron job
│   └── db/            # SQLite schema
├── tests/
│   ├── unit/
│   └── integration/
└── server.ts

data/
└── app.db             # SQLite

docs/
├── adrs/
│   ├── 001-tech-stack.md
│   ├── 002-llm-choice.md
│   └── 003-retry-policy.md
└── diagrams/
    └── architecture.mmd
```
