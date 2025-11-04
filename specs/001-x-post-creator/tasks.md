# Tasks: X Post Creator & Scheduler (MVP)

**Branch**: `001-x-post-creator`  
**Spec**: `specs/001-x-post-creator/spec.md`  
**Plan**: `specs/001-x-post-creator/plan.md`  
**Status**: **READY FOR IMPLEMENTATION**

---

## MVP SLICE (Deliverable 1) — **US1 + US2 + US5 + US6**

| Task | Priority | Type |
|------|----------|------|
| T014–T020 | P1 | **Generate post** (LLM → draft tile) |
| T021–T025 | P1 | **Edit tile** (save, undo) |
| T034–T037 | P1 | **Schedule time** |
| T038–T042 | P1 | **Auto-post worker** |

**Goal**:  
> **User can generate → edit → schedule → auto-post**  
> **End-to-end flow working in <60s**

**Success Gate**:  
- All `[TEST]` tasks pass  
- CI: 100% core coverage (`scheduler`, `post_service`)  
- LLM gen ≤10s (mocked)  
- Post attempted ±1min

---

## FULL TASK LIST — **53 TASKS, PHASED, TDD-FIRST**

| Phase | Tasks | Notes |
|------|-------|-------|
| **1. Setup** | T001–T005 | Repo, CI, lint, docs |
| **2. Foundational** | T006–T013 | DB, auth, worker, logging |
| **3. US1 (Generate)** | T014–T020 | LLM wrapper, draft, frontend |
| **4. US2 (Edit)** | T021–T025 | Save, undo |
| **5. US3 (Media)** | T026–T030 | Upload, generate |
| **6. US4 (Arrange)** | T031–T033 | Drag-drop |
| **7. US5 (Schedule)** | T034–T037 | Time picker, validation |
| **8. US6 (Auto-post)** | T038–T042 | Worker, X API, retry |
| **9. US7 (Retry)** | T043–T045 | Manual + backoff |
| **10. US8 (History)** | T046–T048 | Filters, status |
| **Polish** | T049–T053 | ADRs, a11y, perf, security |

---

## COMMIT THIS NOW

```bash
git add specs/001-x-post-creator/tasks.md
git commit -m "tasks: generate TDD-first backlog for X post scheduler MVP - 53 tasks, MVP slice defined"
git push