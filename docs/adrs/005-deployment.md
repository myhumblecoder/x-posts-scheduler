# ADR 005 — Deployment

Status: Proposed

Context
-------

We need a minimal, low-friction deployment path for the MVP so product stakeholders can review a live demo. The frontend is a static/spa-style UI; the backend is a small Node prototype plus a scheduler/worker.

Decision
--------

- Frontend: deploy to Vercel — it provides fast previews for PRs and is free for small projects. Use `deploy/frontend/vercel.json` as a starting point.
- Backend: containerize using the provided `deploy/backend/Dockerfile` and run in a small container host (e.g., DigitalOcean App Platform, Render, or a self-hosted VM). For production, prefer a managed container registry and image-based deployments.
- Secrets: store OAuth client credentials and any tokens in environment variables or a secret manager. Provide `deploy/.env.example` as a template; never commit real secrets.
- Database & storage: for MVP use a lightweight deployment (SQLite + local filesystem). For production, migrate to Postgres and S3-compatible storage; this is documented in ADR 005/006 (deployment & observability) and ADR 005 (media storage) earlier.

Consequences
------------

- Vercel provides immediate previews for the frontend and integrates with GitHub for branch previews. The team can quickly iterate on UI while using PR previews for reviews.
- A Dockerized backend simplifies hosting portability, but you must ensure that any persistent storage or scheduled worker runs on an environment where state is preserved or moved to managed services.
