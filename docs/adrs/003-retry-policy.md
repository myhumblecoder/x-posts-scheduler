# ADR 003: Retry policy (automatic vs manual)

Status: Accepted

Context
-------
Posting to X can fail for transient reasons (network, 429 rate limits). The system must define an acceptable retry policy for automated attempts and manual retry options for users.

Decision
--------
- Automatic retries will be implemented server-side with a conservative default: 3 attempts using exponential backoff (e.g., 1m, 5m, 15m).
- Manual retry will be available to users via the History UI to requeue failed posts immediately.
- Operators will control retry parameters via configuration; the UI will not expose automatic retry tuning in MVP.

Consequences
------------
- Reliable behavior for transient failures while preventing aggressive retrying that could trigger rate limits.
- Requires idempotency keys and attempt metadata storage to ensure at-most-once delivery semantics where possible.
