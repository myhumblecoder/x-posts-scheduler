# ADR 001: Technology stack for MVP

Status: Accepted

Context
-------
We need a minimal, maintainable stack that supports rapid TDD-driven development, local-first operation, and easy developer onboarding.

Decision
--------
- Frontend: TypeScript + Vite (single-page app)
- Backend: Node.js (current LTS, e.g., 20.x) with small service modules
- Database: SQLite for local-first single-user MVP, with migrations planned for future Postgres when scaling
- Background worker: lightweight Node worker (cron or node-cron) for posting/scheduling
- Storage: local filesystem for media in MVP; S3-compatible object storage for future
- Testing: Vitest for unit tests, Playwright for E2E, simple Node-based test harness for fast TDD loops

Consequences
------------
- Fast developer iteration with Vite + Node.
- Simple local deployments and reproducible development environments.
- Future migration work required for multi-user scaling (migrate SQLite to Postgres and replace local media storage).
