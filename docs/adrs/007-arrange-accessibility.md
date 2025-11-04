# ADR 007: Arrange feature — drag-drop accessibility

Status: Accepted

Context
-------
Users must be able to rearrange tiles (draft posts) by drag-and-drop and by keyboard to meet accessibility goals (WCAG 2.1 AA). The frontend is a SPA and must work for keyboard-only users and assistive technologies.

Decision
--------
- Implement drag-and-drop using a lightweight library that supports accessible hooks (e.g., `sortablejs` with aria attributes), with a keyboard-based reordering API exposed by the frontend.
- Provide a clearly focusable handle on each tile and keyboard controls (ArrowLeft/ArrowRight or ArrowUp/ArrowDown) to move a focused tile.
- Emit reorder events to the backend via the `tile_service` API which will update positions atomically.

Accessibility specifics
----------------------
- Each tile will have `role="listitem"` and an accessible handle with `aria-grabbed` and `aria-describedby` where appropriate.
- Keyboard commands:
  - `Space` or `Enter` to lift/place a tile in an interaction mode.
  - `ArrowLeft`/`ArrowUp` and `ArrowRight`/`ArrowDown` to move the tile while in interaction mode.
- Provide live region announcements (`aria-live`) to describe moves for screen reader users.

Consequences
------------
- Improves accessibility and meets WCAG 2.1 AA for interactive drag-and-drop.
- Adds implementation and testing overhead (keyboard E2E tests via Playwright + axe-core).
