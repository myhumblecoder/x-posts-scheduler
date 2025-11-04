# Research: X Post Creator & Scheduler (Phase 0)

**Feature**: X Post Creator & Scheduler (MVP)
**Created**: 2025-11-04

## Overview

This research file resolves critical clarifications required for the implementation plan. It
captures decisions, rationale, and alternatives considered.

---

### Decision: Retry policy configuration (RESOLVED)

- Decision: For the MVP the retry policy will be a server-side operational configuration only.
  Users will be able to perform a manual retry from the UI for specific failed posts, but they will
  NOT be able to change the automatic retry attempt count or backoff schedule.

- Rationale:

  - Operational control prevents users from inadvertently creating behavior that could trigger
    X API rate-limit penalties or policy violations.
  - Centralized configuration simplifies observability and lets operators tune retry behavior
    based on live platform signals (rate limits, error patterns).
  - Providing a single manual retry action in the UI satisfies user needs for recovery without
    exposing operational complexity in the MVP.

- Alternatives considered:
  - Expose retry attempts/backoff in the UI per-post: rejected for MVP due to risk of misuse and
    added product complexity.
  - No manual retry in the UI: rejected in favor of better user control for obvious failure cases.

---

### Other considerations (research tasks)

- Scheduling reliability: research shows using at-least-once delivery with idempotency keys and
  locking in the background worker reduces duplicate posts; design will include idempotency fields
  on post attempts.
- LLM timeouts: recommend a client and server-side timeout (10s target) and graceful fallback to
  manual editing when generation is unavailable.
- Image generation time: recommend a longer timeout (30s) and a clear fallback path to upload.

## Outcome

All NEEDS_CLARIFICATION markers in the spec are resolved with the decisions above. Proceed to design
(Phase 1): data-model, contracts, quickstart.
