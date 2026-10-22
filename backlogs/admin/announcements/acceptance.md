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

## Test Cases

### TC-01: Admin creates GLOBAL announcement
- **AC:** #1, #6
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/admin/announcements`
  2. Click "Create Announcement"
  3. Select scope = GLOBAL
  4. Verify program/batch dropdowns are hidden
  5. Enter content and remarks
  6. Click Save
- **Expected:** Announcement created; success toast shown; list refreshes

### TC-02: Admin creates PROGRAM-scoped announcement
- **AC:** #1, #6, #10
- **Priority:** High
- **Precondition:** At least 1 active program exists
- **Steps:**
  1. Click "Create Announcement"
  2. Select scope = PROGRAM
  3. Verify program dropdown appears (batch hidden)
  4. Select a program, enter content
  5. Click Save
- **Expected:** Announcement created with program association

### TC-03: Admin creates BATCH-scoped announcement
- **AC:** #1, #6, #10
- **Priority:** High
- **Precondition:** At least 1 active batch exists
- **Steps:**
  1. Click "Create Announcement"
  2. Select scope = BATCH
  3. Verify both program and batch dropdowns appear
  4. Select program and batch, enter content
  5. Click Save
- **Expected:** Announcement created with batch association

### TC-04: Validation — content required, scope rules enforced
- **AC:** #6, #12
- **Priority:** High
- **Precondition:** On create form
- **Steps:**
  1. Leave content blank, click Save
  2. Select PROGRAM scope but leave program dropdown empty, click Save
- **Expected:** Step 1: "Content required" error; step 2: "Program required" error

### TC-05: Admin can edit own or others' announcements
- **AC:** #4, #11
- **Priority:** High
- **Precondition:** Announcements from different users exist
- **Steps:**
  1. Click Edit on another user's announcement
  2. Verify scope field is read-only
  3. Modify content, click Save
- **Expected:** Content updated; scope unchanged; success toast

### TC-06: Admin can delete any announcement
- **AC:** #5
- **Priority:** High
- **Precondition:** At least 1 announcement exists
- **Steps:**
  1. Click Delete on an announcement
  2. Confirm deletion
- **Expected:** Announcement removed from list (hard delete); success toast

### TC-07: Non-admin POST blocked by role gate
- **AC:** #7
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Call `POST /announcements` with scope = GLOBAL via API
- **Expected:** 403 Forbidden

### TC-08: List page displays all columns correctly
- **AC:** #8, #9
- **Priority:** High
- **Precondition:** Announcements of all 3 scopes exist
- **Steps:**
  1. Navigate to `/admin/announcements`
  2. Inspect table columns and scope badges
- **Expected:** Scope badges color-coded (GLOBAL purple, PROGRAM blue, BATCH teal); all columns visible

### TC-09: GET /announcements/active filters by caller role
- **AC:** #3
- **Priority:** High
- **Precondition:** GLOBAL, PROGRAM, and BATCH announcements exist
- **Steps:**
  1. Call `GET /announcements/active` as a trainee enrolled in Program A / Batch 1
- **Expected:** Returns GLOBAL + PROGRAM(A) + BATCH(1) only; not other programs/batches

### TC-10: Dashboard widget renders announcements
- **AC:** #14, #15
- **Priority:** High
- **Precondition:** Active announcements exist; logged in as any role
- **Steps:**
  1. Navigate to the dashboard
  2. Observe the AnnouncementWidget
- **Expected:** Cards show scope badge, posted_at, content, remarks, dismiss button

### TC-11: Dismiss announcement is session-only
- **AC:** #16
- **Priority:** Medium
- **Precondition:** Widget shows announcements
- **Steps:**
  1. Click Dismiss on an announcement
  2. Refresh the page
- **Expected:** Dismissed announcement reappears after refresh (session-only)

### TC-12: Widget handles empty, loading, and error states
- **AC:** #17, #18, #19
- **Priority:** Medium
- **Precondition:** Various states
- **Steps:**
  1. Test with no active announcements → widget doesn't render
  2. Test on slow network → skeleton cards shown
  3. Test with API error → widget silently not rendered
- **Expected:** Each state handled gracefully

---

## Summary: 19/19 PASS
