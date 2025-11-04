# ADR 004: OAuth 2.0 (PKCE) and rate-limit handling for X API v2

Status: Accepted

Context
-------
The application must integrate with X API v2 to post on behalf of users. The platform enforces rate limits and requires OAuth 2.0 user authorization flows.

Decision
--------
Adopt OAuth 2.0 PKCE for user authorization (frontend obtains a code via PKCE and backend exchanges for tokens). The backend will persist refresh tokens encrypted in the database and implement a token refresh flow. All requests to X API will include an idempotency key for posting operations.

Rate-limit handling
-------------------
- Implement centralized rate-limit detection in the posting worker and API client.
- On 429 responses, use the Retry-After header and backoff strategy.
- Track per-user and global rate usage counters to avoid bursts; apply short delays if limits approach thresholds.


Consequences
------------
- Secure and standard authorization for user actions.
- Operational complexity: token rotation, encrypted token storage, and retry coordination needed.
- Ensures compliance with X API policies and reduces chance of throttling.

Related diagrams
----------------
- `../diagrams/architecture.mmd` (where OAuth tokens are stored and used)
- `../diagrams/sequence-post-lifecycle.mmd` (posting step includes OAuth usage)
