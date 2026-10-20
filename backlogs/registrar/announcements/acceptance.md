# MP-31: Registrar — Announcements Module

| Field | Value |
|-------|-------|
| **Jira** | MP-31 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Chelsea Cllj |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-28 (PR #12) |
| **Route** | `/registrar/announcements` |

---

## Acceptance Criteria

### Access and Authorization

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Authenticated Registrar can access announcement page | PASS | Route + guards |
| 2 | Unauthenticated user receives 401 | PASS | JwtAuthGuard |
| 3 | User without required role receives 403 | PASS | RolesGuard |
| 4 | Registrar permissions enforced by backend, not only frontend | PASS | Server-side guards |
| 5 | Registrar cannot create PROGRAM or BATCH announcements | PASS | Scope limited to GLOBAL |
| 6 | Registrar cannot edit another user's announcement | PASS | Ownership check |
| 7 | Registrar cannot delete announcements | PASS | Delete restricted to admin |
| 8 | Administrator retains existing ability to manage announcements | PASS | No regression |

### Create Announcement

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 9 | Registrar can create a valid GLOBAL announcement | PASS | POST /api/announcements |
| 10 | Blank content rejected | PASS | Validation |
| 11 | Content > 5,000 chars rejected | PASS | Max length enforced |
| 12 | Remarks > 1,000 chars rejected | PASS | Max length enforced |
| 13 | program_id and batch_id rejected for GLOBAL | PASS | Scope validation |
| 14 | Created with authenticated Registrar as posted_by | PASS | JWT user attached |
| 15 | Returns 201 Created | PASS | Correct status code |
| 16 | Frontend shows success message and refreshes list | PASS | Toast + list refresh |

### View Announcements

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 17 | Registrar can retrieve announcements via GET /api/announcements | PASS | Authorized |
| 18 | Pagination returns correct data and meta | PASS | Standard pagination |
| 19 | Search, scope, date filters follow validation rules | PASS | DTO validated |
| 20 | Invalid page/limit/scope/date returns 400 | PASS | Clean error messages |
| 21 | Empty state when no announcements | PASS | Rendered |
| 22 | Loading and error states correct | PASS | Skeleton + error handling |

### Update Announcement

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 23 | Registrar can update own announcement via PATCH /api/announcements/:id | PASS | Ownership verified |
| 24 | Invalid UUID returns 400 | PASS | ParseUUIDPipe |
| 25 | Non-existent announcement returns 404 | PASS | Not found |
| 26 | Updating another user's announcement returns 403 | PASS | Forbidden |
| 27 | Scope/program/batch cannot be reassigned on update | PASS | Locked fields |
| 28 | Frontend refreshes list after update | PASS | Auto-refresh |

---

## Test Cases

### TC-01: Registrar can access announcement page
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Navigate to `/registrar/announcements`
- **Expected:** Announcement page loads successfully

### TC-02: Unauthenticated user receives 401
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Not logged in
- **Steps:**
  1. Call `GET /api/announcements` without JWT token
- **Expected:** 401 Unauthorized returned

### TC-03: Wrong role receives 403
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as trainee
- **Steps:**
  1. Call `GET /api/announcements` with trainee JWT
- **Expected:** 403 Forbidden returned

### TC-04: Registrar cannot create PROGRAM/BATCH announcements
- **AC:** #5
- **Priority:** High
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Call `POST /api/announcements` with scope = PROGRAM
  2. Call `POST /api/announcements` with scope = BATCH
- **Expected:** Both return 403 Forbidden

### TC-05: Registrar cannot edit another user's announcement
- **AC:** #6
- **Priority:** High
- **Precondition:** Announcement posted by admin exists
- **Steps:**
  1. Call `PATCH /api/announcements/:id` as registrar
- **Expected:** 403 Forbidden — ownership check fails

### TC-06: Registrar cannot delete announcements
- **AC:** #7
- **Priority:** High
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Call `DELETE /api/announcements/:id`
- **Expected:** 403 Forbidden — delete restricted to admin

### TC-07: Create valid GLOBAL announcement
- **AC:** #9, #14, #15, #16
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Click "Create Announcement"
  2. Enter content and remarks
  3. Click Save
- **Expected:** 201 Created; success toast; list refreshes; `posted_by` = current registrar

### TC-08: Validation — blank content rejected
- **AC:** #10
- **Priority:** High
- **Precondition:** On create form
- **Steps:**
  1. Leave content blank, click Save
- **Expected:** Validation error shown; no API call made

### TC-09: Validation — content and remarks length limits
- **AC:** #11, #12
- **Priority:** Medium
- **Precondition:** On create form
- **Steps:**
  1. Enter content > 5,000 characters, click Save
  2. Enter remarks > 1,000 characters, click Save
- **Expected:** Both rejected with length validation error

### TC-10: program_id/batch_id rejected for GLOBAL scope
- **AC:** #13
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Call `POST /api/announcements` with scope = GLOBAL and a `program_id`
- **Expected:** 400 Bad Request — GLOBAL scope cannot have program/batch

### TC-11: View announcements with pagination and filters
- **AC:** #17, #18, #19, #20
- **Priority:** High
- **Precondition:** Multiple announcements exist
- **Steps:**
  1. Load the announcements list
  2. Filter by scope, search by keyword, filter by date range
  3. Navigate to page 2
  4. Enter invalid page number
- **Expected:** Correct data returned; pagination meta accurate; invalid input returns 400

### TC-12: Empty and loading states
- **AC:** #21, #22
- **Priority:** Medium
- **Precondition:** No announcements / slow network
- **Steps:**
  1. View page with no announcements
  2. View page during loading
- **Expected:** Empty state rendered; skeleton loader during load

### TC-13: Update own announcement
- **AC:** #23, #27, #28
- **Priority:** High
- **Precondition:** Registrar's own announcement exists
- **Steps:**
  1. Click Edit on own announcement
  2. Modify content
  3. Attempt to change scope
  4. Click Save
- **Expected:** Content updated; scope locked; list refreshes after save

### TC-14: Update — invalid UUID returns 400
- **AC:** #24
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Call `PATCH /api/announcements/not-a-uuid`
- **Expected:** 400 Bad Request

### TC-15: Update — non-existent announcement returns 404
- **AC:** #25
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Call `PATCH /api/announcements/{valid-but-nonexistent-uuid}`
- **Expected:** 404 Not Found

---

## Summary: 28/28 PASS
