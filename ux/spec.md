# UX Specification: X Post Creator & Scheduler (v1.0)

**Branch**: `ux/polish`  
**Status**: Draft → Approved  
**Goal**: From JSON demo → **intuitive, fast, beautiful, accessible UI**

---

## 1. Core Principles

| Principle            | Implementation                       |
| -------------------- | ------------------------------------ |
| **<60s to schedule** | One-click generate → edit → schedule |
| **Mobile-first**     | Stack tiles, large tap targets       |
| **Accessible**       | WCAG 2.1 AA, keyboard, screen reader |
| **Beautiful**        | TailwindCSS, soft shadows, dark mode |
| **Consistent**       | Status badges, icons, spacing        |

---

## 2. Wireframes (Text-Based)

### **Compose Flow**

+--------------------------------------------------+
| [X Logo] X Post Creator |
| |
| [ + New Post ] |
| |
| ┌──────────────────────────────────────────────┐ |
| │ This is your LLM-generated post... │ │
| │ │ │
| │ [Attach Image] [Schedule: Tomorrow 9AM] │ │
| └──────────────────────────────────────────────┘ |
| |
| [Run Now (Demo)] |
+--------------------------------------------------+

### **History View**

+--------------------------------------------------+
| ← Back History |
| |
| ┌──────────────────────────────────────────────┐ |
| │ This is a test │ │
| │ Status: SENT │ │
| │ Posted: Nov 4, 3:14 PM │ │
| │ Post ID: x-123456789 │ │
| └──────────────────────────────────────────────┘ |
| |
| ┌──────────────────────────────────────────────┐ |
| │ Failed post... │ │
| │ Status: FAILED │ │
| │ Error: Rate limited │ │
| │ [Retry] │ │
| └──────────────────────────────────────────────┘ |
+--------------------------------------------------+

---

## 3. Component Specs

| Component        | Requirements                                                       |
| ---------------- | ------------------------------------------------------------------ |
| **Tile**         | `contenteditable`, undo (Ctrl+Z), status badge, drag handle        |
| **Scheduler**    | Flatpickr, timezone-aware, "in 5 min", "tomorrow 9AM"              |
| **Status Badge** | `DRAFT` → gray, `SCHEDULED` → blue, `SENT` → green, `FAILED` → red |
| **Dark Mode**    | Auto-detect + toggle                                               |
| **Loading**      | Spinner + "Generating..."                                          |
| **Error**        | Banner with retry                                                  |

---

## 4. Acceptance Criteria

- [ ] User can **generate → edit → schedule** in **<60s**
- [ ] **Keyboard**: Tab → Edit → Schedule → Enter
- [ ] **Screen reader**: "Editable post: Hello, status: Draft"
- [ ] **Mobile**: Tiles stack, buttons full-width
- [ ] **Dark mode**: Works on refresh
- [ ] **axe-core**: 0 critical issues
- [ ] **Lighthouse**: ≥90 performance, ≥95 accessibility

---

## 5. Tech Stack

- **UI**: React + Vite
- **Styling**: TailwindCSS v3
- **Drag-Drop**: `@dnd-kit/core` + `sortable`
- **Date Picker**: `flatpickr`
- **Accessibility**: `axe-core`, `react-aria`
- **Icons**: Heroicons

---

## 6. Tasks

- [ ] T001 Setup TailwindCSS
- [ ] T002 Implement `Tile.tsx`
- [ ] T003 Add drag-drop canvas
- [ ] T004 Add scheduler modal
- [ ] T005 Add history page
- [ ] T006 Add dark mode + toggle
- [ ] T007 Run axe-core + fix
- [ ] T008 Lighthouse audit

---

**Approved by**: Thomas Gooch
**Date**: 2025-11-08
