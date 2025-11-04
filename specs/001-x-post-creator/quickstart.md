# Quickstart: X Post Creator & Scheduler (MVP)

**Purpose**: Quick user-oriented steps to create and schedule your first post (tech-free).

1. Sign in with your X account (OAuth) and allow posting permissions.
2. Click "New Post" and either enter a prompt or choose a template.
3. Request generation — the system will produce a draft within ~10s.
4. Edit the draft in the tile, optionally attach or generate an image.
5. Drag tiles to reorder if you have multiple drafts.
6. Click the scheduled time input, pick a date & time, and confirm.
7. Confirm the scheduled post. It will show in the Scheduled list and post automatically at the
   selected time.
8. Visit the History view to inspect statuses and retry failed posts if needed.

Operational notes for testing:

- To validate timing, schedule posts a few minutes ahead and verify Sent status and remote IDs.
- Monitor logs for generation latency and posting worker timing to confirm success criteria.
