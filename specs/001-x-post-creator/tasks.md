---
description: "Task list for X Post Creator & Scheduler (MVP)"
---

# Tasks: X Post Creator & Scheduler (MVP)

**Input**: Design documents from `/specs/001-x-post-creator/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

## Phase 1: Setup (Project initialization)

- [ ] T001 Create repository directories for feature `specs/001-x-post-creator/` and initial scaffolding in `frontend/`, `backend/`, `workers/` (paths: create directories and placeholder README files)
- [ ] T002 [P] Initialize project manifests: add `package.json` (frontend) and `package.json`/`package-lock.json` or `pyproject.toml` for backend as chosen in ADRs (file: repository root and `frontend/` and `backend/`)
- [ ] T003 [P] Add CI workflow for lint/test/coverage/accessibility at `.github/workflows/ci.yml` (already scaffolded; verify and adjust for chosen stack)
- [ ] T004 [P] Create coding standards and pre-commit hooks: `.eslintrc`/`.prettierrc` (or project equivalents) and `/.githooks/` (paths: repo root)
- [ ] T005 Configure environment and secrets docs: add `docs/quickstart.md` and `docs/dev-setup.md` with OAuth and LLM provider notes (path: `docs/`)

## Phase 2: Foundational (Blocking prerequisites)

- [ ] T006 Setup database schema and migrations framework (files: `backend/migrations/` and initial migration SQL)
- [ ] T007 [P] Create Post, Media DB models/migrations according to `data-model.md` (files: `backend/src/models/post.*`, `backend/src/models/media.*`)
- [ ] T008 [P] Implement basic auth/OAuth skeleton and token storage for X API integration (files: `backend/src/auth/`)
- [ ] T009 Setup background job queue and worker scaffold (files: `backend/src/workers/worker.js` or equivalent)
- [ ] T010 [P] Implement idempotency key support in DB and worker (add field and helper in `backend/src/services/post_service.*`)
- [ ] T011 Configure object storage access and media upload endpoints (files: `backend/src/services/storage.*`)
- [ ] T012 Create logging/observability scaffold for generation requests, scheduling actions, and posting attempts (files: `backend/src/logging/*`)
- [ ] T013 Add staging test harness for timing/performance tests (scripts under `tests/perf/`) to measure LLM latency and scheduling timing

## Phase 3: User Story 1 - Generate post with LLM (Priority: P1) 🎯 MVP

**Goal**: Let a logged-in user request generated post text and get a draft tile within the latency target.
**Independent Test**: Automated perf test `tests/perf/generation_latency.test` measures 95th percentile <= 10s.

- [ ] T014 [US1] [P] Create endpoint `/v1/posts/generate` (file: `backend/src/routes/posts.js`) that accepts `prompt` or `template_id`
- [ ] T015 [US1] [P] Create service `backend/src/services/llm_service.*` that wraps LLM generation and enforces a 10s timeout
- [ ] T016 [US1] [P] Create unit tests for LLM wrapper (file: `backend/tests/unit/test_llm_service.*`)
- [ ] T017 [US1] Implement draft creation flow: persist a temp draft record and return draft payload (file: `backend/src/services/post_service.*`)
- [ ] T018 [US1] [P] Frontend: Add "New Post" UI and call to generate endpoint; show draft tile on success (file: `frontend/src/components/NewPost/*`)
- [ ] T019 [US1] [P] Add client-side local persistence for drafts (IndexedDB/localStorage helper in `frontend/src/lib/storage.*`)
- [ ] T020 [US1] [P] Add integration tests: contract test for `/v1/posts/generate` (file: `tests/contract/test_generate_post.*`)

## Phase 4: User Story 2 - Preview and edit tile (Priority: P1)

**Goal**: Allow editing a draft tile and persisting changes to the draft state.
**Independent Test**: Manual or E2E test where editing a tile updates server draft and UI shows saved text.

- [ ] T021 [US2] Implement tile editor UI component and inline editing UX (file: `frontend/src/components/TileEditor/*`)
- [ ] T022 [US2] [P] Create backend endpoint to save draft edits `PATCH /v1/posts/{id}` (file: `backend/src/routes/posts.js`)
- [ ] T023 [US2] [P] Create backend update logic in `post_service` to persist edits and updated_at
- [ ] T024 [US2] [P] Add unit tests for draft save path (backend: `backend/tests/unit/test_post_update.*`)
- [ ] T025 [US2] Add single-level undo support in UI (file: `frontend/src/lib/undo.*`) and tests

## Phase 5: User Story 3 - Generate or attach media (Priority: P2)

**Goal**: Allow attaching uploaded or generated images to draft tiles and show previews.
**Independent Test**: Upload test and an image-generation mock test that attaches media and verifies thumbnail rendering.

- [ ] T026 [US3] Implement media upload endpoint and validation `POST /v1/posts/{id}/media` (file: `backend/src/routes/media.js`)
- [ ] T027 [US3] [P] Integrate object storage calls in `backend/src/services/storage.*` and store media refs
- [ ] T028 [US3] Add image-generation wrapper `backend/src/services/image_service.*` with timeout and fallback
- [ ] T029 [US3] [P] Frontend: media attach UI and thumbnail preview (file: `frontend/src/components/MediaPicker/*`)
- [ ] T030 [US3] [P] Add contract tests for media endpoints (file: `tests/contract/test_media.*`)

## Phase 6: User Story 4 - Arrange tiles (Priority: P2)

**Goal**: Support drag-and-drop reordering of tiles and persist order.
**Independent Test**: Manual UX test to reorder tiles and confirm server persisted order via API.

- [ ] T031 [US4] Add drag-and-drop UI with accessible keyboard fallback documentation (file: `frontend/src/components/TileCanvas/*`)
- [ ] T032 [US4] [P] Implement backend ordering persistence (`POST /v1/posts/order` or include order in `PATCH /v1/posts/{id}`)
- [ ] T033 [US4] Add unit tests for order persistence (backend tests)

## Phase 7: User Story 5 - Schedule exact release time (Priority: P1)

**Goal**: Allow the user to set a timezone-aware scheduled time for a post.
**Independent Test**: API-level test that schedules a post and shows it as `SCHEDULED` with UTC timestamp.

- [ ] T034 [US5] Add frontend date/time picker component and timezone handling (file: `frontend/src/components/Scheduler/*`)
- [ ] T035 [US5] [P] Backend: implement `/v1/posts/{id}/schedule` endpoint to persist `scheduled_at` (file: `backend/src/routes/posts.js`)
- [ ] T036 [US5] [P] Add validation to prevent scheduling in the past and suggest next available slot (backend validation logic)
- [ ] T037 [US5] Add unit and contract tests for scheduling endpoint

## Phase 8: User Story 6 - Auto-post at scheduled time (Priority: P1)

**Goal**: Background worker attempts to post to X API at scheduled time and updates status.
**Independent Test**: Integration test that fast-forwards job queue and verifies status transitions to `SENT` or `FAILED`.

- [ ] T038 [US6] Implement worker scheduler pickup: query posts with `status=SCHEDULED` and `scheduled_at<=now()` (file: `backend/src/workers/scheduler.*`)
- [ ] T039 [US6] Implement posting worker logic to call X API, use idempotency key and record remote_post_id on success (file: `backend/src/workers/post_worker.*`)
- [ ] T040 [US6] [P] Add retry/backoff orchestration in worker (respect default retries 1m/5m/15m) and queuing
- [ ] T041 [US6] Add integration tests mocking X API responses and verifying transitions
- [ ] T042 [US6] Add observability: emit events/logs for attempt, success, failure (file: `backend/src/logging/*`)

## Phase 9: User Story 7 - Retry on failure (Priority: P1)

**Goal**: Retry failed posts using server-side policy and allow manual retry from UI.
**Independent Test**: Simulate transient errors and verify retries are scheduled and manual retry enqueues an attempt.

- [ ] T043 [US7] Implement retry policy orchestration (backend worker scheduler tracks attempts and backoff)
- [ ] T044 [US7] [P] Frontend: add manual Retry button in History view that calls `/v1/posts/{id}/retry` (file: `frontend/src/components/History/*`)
- [ ] T045 [US7] Add tests for retry endpoints and worker behavior (integration tests)

## Phase 10: User Story 8 - View history and statuses (Priority: P1)

**Goal**: Provide history view with filters, sorting and ability to inspect errors and remote post IDs.
**Independent Test**: Manual/E2E test verifying history, filters, and retry links work as expected.

- [ ] T046 [US8] Implement `/v1/posts/history` backend endpoint with filters and pagination (file: `backend/src/routes/posts.js`)
- [ ] T047 [US8] Frontend: History view showing status, scheduled time, sent time and remote_post_id (file: `frontend/src/pages/History/*`)
- [ ] T048 [US8] [P] Add unit/integration tests for history listing and filtering

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T049 [P] Documentation updates: add ADRs under `/docs/adrs/` for retry policy, idempotency, and scheduling design
- [ ] T050 [P] Accessibility fixes and WCAG checks (run axe/pa11y/lighthouse) and document results (`tests/accessibility/*`)
- [ ] T051 [P] Performance tuning: run generation latency and scheduling timing experiments and document (`tests/perf/*`)
- [ ] T052 [P] Security review: ensure OAuth scopes, token storage, and rate-limit handling are audited and documented
- [ ] T053 [P] Add e2e test scripts for core flows (create → edit → schedule → auto-post) under `tests/e2e/`

## Dependencies & Execution Order

- **Phase 1** (Setup) must complete before Phase 2 (Foundational).
- **Phase 2** must complete before any User Story phases that require DB/models or auth.
- **US1 (Generate)** is the recommended MVP slice. After US1 is green, deliver US2 (Edit) and US5/US6 for scheduling and posting.

## Parallel Opportunities

- Frontend UI components (NewPost, TileEditor, MediaPicker, Scheduler, History) can be implemented in parallel by separate developers.
- Backend services for LLM wrapper, storage, and posting worker can be implemented in parallel where interfaces are mocked.
- Tests for different stories can run in parallel once foundational infra is present.

## Task counts & Summary

- Total tasks: 53
- Tasks by story:
  - US1: 7
  - US2: 5
  - US3: 5
  - US4: 3
  - US5: 4
  - US6: 5
  - US7: 3
  - US8: 3
  - Setup/Foundation/Polish: 18

## Implementation Strategy

### MVP First

1. Complete Phase 1 + Phase 2 foundational tasks.
2. Implement US1 (Generate) with tests and CI gating. Validate generation latency and coverage.
3. Implement US2 (Edit) so drafts are fully editable and persisted.
4. Implement scheduling (US5) and worker (US6) to enable end-to-end scheduled posting.
5. Add retry (US7), media (US3) and arrange/history (US4/US8) and then polish.

### Incremental Delivery

- Deliverable 1 (MVP): Setup + Foundational + US1 + US2 + basic scheduling test (manual)
- Deliverable 2: Auto-post worker + retry + history
- Deliverable 3: Media generation/attachment + UI polish + accessibility
