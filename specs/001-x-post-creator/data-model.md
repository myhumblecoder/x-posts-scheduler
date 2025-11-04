# Data Model: X Post Creator & Scheduler

**Feature**: X Post Creator & Scheduler (MVP)
**Created**: 2025-11-04

## Entities

### User

- id (string) - internal user id
- x_account_id (string) - platform account identifier
- created_at (datetime)
- updated_at (datetime)

### Post

- id (string)
- user_id (string) - FK to User
- content_text (text) - final post text
- preview_html (text) - rendered preview if required
- status (enum) - DRAFT, SCHEDULED, SENT, FAILED
- scheduled_at (datetime, UTC, nullable)
- sent_at (datetime, UTC, nullable)
- remote_post_id (string, nullable)
- error_code (string, nullable)
- error_message (text, nullable)
- idempotency_key (string, nullable) - used by posting worker
- created_at (datetime)
- updated_at (datetime)

Validation rules:

- content_text: non-empty for scheduled/sent posts; optional for draft.
- scheduled_at: must be in the future for Scheduled state; stored in UTC.

### Media

- id (string)
- post_id (string) - FK to Post
- type (enum) - image, video, other
- storage_ref (string) - URL or storage pointer
- alt_text (string, optional)
- width (int), height (int) (optional)
- created_at (datetime)

Validation rules:

- Allowed image types and size limits enforced on upload.

### Schedule (optional separate table)

- id (string)
- post_id (string) - FK to Post
- scheduled_at (datetime, UTC)
- timezone (string)
- created_by (string)
- created_at (datetime)

Note: In the MVP schedule fields are kept on `Post` for simplicity. Separate `Schedule` table
available if later needed for complex recurrence or batch scheduling.

## State transitions

- DRAFT -> SCHEDULED: when user sets a scheduled_at and confirms
- SCHEDULED -> SENT: when posting worker reports success and remote_post_id stored
- SCHEDULED -> FAILED: on posting failure (worker records error)
- FAILED -> (manual) SCHEDULED/Retry -> SENT: via manual retry or reschedule and success

## Indexing & queries

- Index: posts by user_id + status + scheduled_at (for worker pickup)
- Index: posts by user_id + created_at (for history queries)
