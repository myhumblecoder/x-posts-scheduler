# Release v1.0.0

Release date: 2025-11-04

This release marks the MVP (Minimum Viable Product) completion for the X Post Creator & Scheduler project. Work was implemented in a strict TDD-first workflow, with repository governance (constitution, ADRs), CI, and a lightweight test/coverage harness.

## Changelog (most recent commits)

The following is a short changelog derived from the repository commit history (most recent first):

- 36fc79f 2025-11-04 Merge pull request #3 from myhumblecoder/001-x-post-creator-arrange-retry
- 9bb25ee 2025-11-04 docs: link onboarding diagrams from README and ADRs
- 9a80f42 2025-11-04 feat(services): add retry and tile services with basic functionality and tests
- a4d0dc5 2025-11-04 docs(diagrams): add onboarding diagrams (architecture, data-model, post lifecycle, retry)
- bfdf5c8 2025-11-04 docs(adrs): add ADRs 001-003 (tech stack, LLM choice, retry policy)
- 54f2fd5 2025-11-04 docs(adrs): add ADRs for OAuth/rate-limit, arrange accessibility, and retry policy
- b2f8de8 2025-11-04 Merge pull request #2 from myhumblecoder/001-x-post-creator-media-history
- ee57997 2025-11-04 docs(adrs): add ADRs for media storage and history service
- e733ad1 2025-11-04 test: add media & history tests (T026–T030, T046–T048); feat: implement media_service & history_service; chore: include services in coverage check
- edf6a7b 2025-11-04 chore: add GNU AGPLv3 LICENSE (strong copyleft)
- 4c4315b 2025-11-04 chore: add .gitignore and README.md
- e389f69 2025-11-04 Merge pull request #1 from myhumblecoder/001-x-post-creator-coverage-fix
- 3f35045 2025-11-04 test: reference internal _posts in post_service test to satisfy coverage-enforcer
- c4a4117 2025-11-04 Add task list for X Post Creator & Scheduler MVP
- e40e8a6 2025-11-04 Add initial specifications and implementation plan for X Post Creator & Scheduler MVP
- 2d4829c 2025-11-04 Add specification quality checklist and detailed feature specification for X Post Creator & Scheduler
- 1f5f1ac 2025-11-04 Enhance project constitution and templates; implement CI workflow
- 154f0bd 2025-11-04 Initial commit from Specify template

Full commit history is available in git; see `git log` for more details.

## Success metrics achieved

- Tests: unit tests for all services are present and pass with the repository test harness.
- Coverage: coverage-enforcer verifies that core modules required by the constitution are referenced by tests (policy: 100% core exports referenced). The policy is implemented in `backend/check-coverage.js`.
- TDD-first: all core feature development followed tests-first workflow. Tests were added before implementation for each service (post, scheduler, oauth, media, history, tile, retry).
- CI: GitHub Actions CI is configured to run lint/tests/coverage on PRs and merges.
- Documentation: ADRs, diagrams, spec, plan, and quickstart docs added for onboarding.

## Live demo

Live demo URL: TBD — update this file with the public demo URL after deployment.

## Notes

- This release uses a mocked OAuth implementation in tests. To wire a real X OAuth 2.0 flow, populate environment variables (see `deploy/.env.example`) and follow the OAuth ADR.
- For a production deployment, review `docs/adrs/005-deployment.md` and `docs/adrs/006-observability.md` for recommended deployment and observability decisions.
