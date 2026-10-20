# MP-21: Admin — Announcements Module

| Field | Value |
|-------|-------|
| **Jira** | MP-21 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Chelsea Cllj |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-28 (PR #11) |
| **Route** | `/admin/announcements` |

---

## Acceptance Criteria

### Backend

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | POST /announcements — create (role-gated by scope) | PASS | GLOBAL = admin only, PROGRAM/BATCH = trainer + admin |
| 2 | GET /announcements — admin only, fetch all | PASS | Full list for admin |
| 3 | GET /announcements/active — any auth'd role, filtered by caller | PASS | Filters by enrolled/assigned programs and batches |
| 4 | PATCH /announcements/:id — poster or admin only | PASS | Edit own or admin override |
| 5 | DELETE /announcements/:id — admin only (hard delete) | PASS | No status column, hard delete |
| 6 | DTO validation: scope-conditional field rules, 400 before DB fires | PASS | GLOBAL = no program/batch, PROGRAM = program_id required, BATCH = batch_id required |
| 7 | Role gate on POST: GLOBAL = admin, PROGRAM/BATCH = trainer + admin | PASS | 403 if role doesn't match scope |

### Frontend — Admin Management Page

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 8 | List view with table: scope badge, target, content, remarks, posted by, posted at, actions | PASS | All columns rendered |
| 9 | Scope badges: GLOBAL purple, PROGRAM blue, BATCH teal | PASS | Color-coded |
| 10 | Create/edit form: scope drives visible fields | PASS | Conditional program/batch dropdowns |
| 11 | Edit mode: scope is read-only | PASS | Cannot change scope |
| 12 | Validation before submit: content required, conditional program/batch | PASS | Inline errors |
| 13 | Success/error toast on every action | PASS | Toast notifications |

### Frontend — Dashboard Widget (All Roles)

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 14 | AnnouncementWidget fetches GET /announcements/active using current JWT | PASS | Backend filters by role |
| 15 | Card layout: scope badge, posted_at, content, remarks, dismiss button | PASS | Dismissible cards |
| 16 | Dismiss is session-only (no API call) | PASS | Removed from local state |
| 17 | Empty response = render nothing | PASS | No empty state box |
| 18 | Loading = skeleton cards | PASS | Skeleton loader |
| 19 | API error = silent fail, widget doesn't render | PASS | Graceful degradation |

---

## Summary: 19/19 PASS
