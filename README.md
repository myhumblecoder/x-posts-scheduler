# x-posts-scheduler

A small scheduler service to compose and schedule posts for X (formerly Twitter). This repository contains governance docs, specs, a tiny Node-based backend prototype and TDD-first artifacts for the MVP feature "x-post-creator".

## Status

- Branching model and feature work follow the repository constitution (see `.specify/memory/constitution.md`).
- Local unit tests and a coverage-enforcer exist under `backend/` for quick TDD feedback.

## Quick start (developer)

Prerequisites:

- Node.js 18+ (or a compatible 16+ runtime)

Run the lightweight test harness and coverage check:

```bash
# run unit tests
node backend/run-tests.js

# run the simple coverage-enforcer (ensures exported symbols are referenced in tests)
node backend/check-coverage.js
```

## Where to look


Diagrams
--------
For onboarding and design context the repository includes Mermaid diagrams (renderable on GitHub):

- `docs/diagrams/architecture.mmd` — high-level architecture (Frontend, API, Worker, DB, Storage, LLM, X API)
- `docs/diagrams/data-model.mmd` — ERD for User, Post, Media and relations
- `docs/diagrams/sequence-post-lifecycle.mmd` — sequence diagram for post lifecycle (draft → schedule → worker → post)
- `docs/diagrams/sequence-retry.mmd` — retry flow, backoff and idempotency handling

View these files in the `docs/diagrams/` folder for quick onboarding visuals.

## Branching and PRs

- Feature branches use `001-<feature-name>` prefixes. When a feature branch is merged and no longer needed, delete it (local and remote).
- Use the `gh` CLI to create PRs if you like, or open PRs through GitHub web UI.

## Contributing

- Follow TDD: tests before implementation.
- Keep changes small and well-documented. Update ADRs in `docs/adrs/` for design changes.

## License

Specify your license here (e.g., MIT) or add a `LICENSE` file.

## One-click deploy & live demo

Badges
-------

- Vercel: [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)
- GitHub Actions: ![CI](https://github.com/myhumblecoder/x-posts-scheduler/workflows/CI/badge.svg)

Live demo
---------

The live demo URL: **TBD** — update `RELEASE.md` and this README with the public demo URL after deployment.

Screenshots
-----------

Add screenshots of the primary flows (compose, schedule, arrange) under `docs/screenshots/` and reference them here. Example placeholders:

![Compose screen](docs/screenshots/compose.png)
![Arrange tiles keyboard reorder](docs/screenshots/arrange-keyboard.png)

Deploy notes
------------

- Frontend: deploy to Vercel for quick static hosting and previews (see `deploy/frontend/vercel.json`).
- Backend: containerize with the provided `deploy/backend/Dockerfile` and supply secrets via `deploy/.env.example`.

