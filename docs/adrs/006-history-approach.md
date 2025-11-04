# ADR 006: History view and data model

Status: Proposed

Context
-------
The product requires a History view listing past posts with status (SENT, FAILED) and filters by date and status.

Decision
--------
Expose a read-only `history_service` in the backend which provides queries:
- `getHistoryForUser(userId, opts)` (pagination/limit)
- `getPostById(postId)`
- `listSentBetween(start, end)`

For MVP the service will be an in-memory view backed by the `posts` table. Future work will implement efficient indexes and paged queries in SQLite.


Consequences
------------
- Fast to implement for MVP, keeps UI responsive in single-user mode.
- Must be migrated to database-backed queries before multi-user scaling.

Related diagrams
----------------
- `../diagrams/data-model.mmd` (Post & indexing for history queries)
- `../diagrams/sequence-post-lifecycle.mmd` (post lifecycle and history updates)
