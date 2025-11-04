# x-posts-scheduler

A small scheduler service to compose and schedule posts for X (formerly Twitter). This repository contains governance docs, specs, a tiny Node-based backend prototype and TDD-first artifacts for the MVP feature "x-post-creator".

Status
------
- Branching model and feature work follow the repository constitution (see `.specify/memory/constitution.md`).
- Local unit tests and a coverage-enforcer exist under `backend/` for quick TDD feedback.

Quick start (developer)
-----------------------
Prerequisites:
- Node.js 18+ (or a compatible 16+ runtime)

Run the lightweight test harness and coverage check:

```bash
# run unit tests
node backend/run-tests.js

# run the simple coverage-enforcer (ensures exported symbols are referenced in tests)
node backend/check-coverage.js
```

Where to look
-------------
- Core implementation (minimal, TDD-first): `backend/src/`
- Tests: `backend/tests/`
- Specs & plan for the feature: `specs/001-x-post-creator/`
- Project constitution: `.specify/memory/constitution.md`

Branching and PRs
-----------------
- Feature branches use `001-<feature-name>` prefixes. When a feature branch is merged and no longer needed, delete it (local and remote).
- Use the `gh` CLI to create PRs if you like, or open PRs through GitHub web UI.

Contributing
------------
- Follow TDD: tests before implementation.
- Keep changes small and well-documented. Update ADRs in `docs/adrs/` for design changes.

License
-------
Specify your license here (e.g., MIT) or add a `LICENSE` file.
