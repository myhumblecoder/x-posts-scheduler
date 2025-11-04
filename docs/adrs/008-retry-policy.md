# ADR 008: Retry policy for posting worker

Status: Accepted

Context
-------
Posting to X can fail due to transient network errors, rate limiting, or platform errors. The system must retry failed posts with a safe backoff policy while avoiding duplicate posts.

Decision
--------
- Implement server-side retry policy managed by the `retry_service` and posting worker.
- Default policy: 3 automatic attempts using exponential backoff (e.g., 1m, 5m, 15m). Manual retry is available in the UI to requeue a failed post immediately.
- Use idempotency keys on each attempt to prevent duplicate posts. The worker will store attempt metadata (attempt count, last_error, next_scheduled_at) in the `posts` or `retries` table.


Consequences
------------
- Balances reliability and safety against X API rate limits.
- Operators can tune backoff and attempt count in configuration; UI exposes manual retry but not automatic retry configuration (operational control).

Related diagrams
----------------
- `../diagrams/sequence-retry.mmd` (retry sequence & backoff)
- `../diagrams/sequence-post-lifecycle.mmd` (where retry is triggered in lifecycle)
