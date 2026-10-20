# MP-13: Admin — Programs Module

| Field | Value |
|-------|-------|
| **Jira** | MP-13 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Rhoddz Gerunda |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-20 (PR #8) |
| **Route** | `/admin/programs` |

---

## Acceptance Criteria

### CRUD & Display

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin can view list of programs in a table with search/filter | PASS | Paginated table with status/sector filters |
| 2 | Admin can create a new program via modal — form validates required fields | PASS | ProgramFormModal with validation |
| 3 | Admin can edit a program inline via the same modal | PASS | Edit mode pre-fills fields |
| 4 | Admin can archive/restore a program — status reflects immediately in the table | PASS | Toggle active/archived status |
| 5 | Empty state shown when no programs exist yet | PASS | Empty state component rendered |

### Access Control

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 6 | Non-admin roles cannot access these endpoints (401/403) | PASS | JwtAuthGuard + RolesGuard with admin role |

---

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/programs` | List all (with optional filters: status, sector) |
| POST | `/admin/programs` | Create new program |
| PATCH | `/admin/programs/:id` | Update program details |
| PATCH | `/admin/programs/:id/status` | Toggle active/archived |

---

## Test Cases

### TC-01: View programs list with filters
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as admin; at least 2 programs exist (1 active, 1 archived)
- **Steps:**
  1. Navigate to `/admin/programs`
  2. Verify the table loads with all programs
  3. Filter by status = "Active"
  4. Filter by sector
  5. Type a search query
- **Expected:** Table shows matching programs; filters combine correctly; pagination works

### TC-02: Create a new program
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as admin, on programs page
- **Steps:**
  1. Click "Create Program" button
  2. Leave required fields blank and attempt to submit
  3. Fill in all required fields (name, sector, description)
  4. Click Save
- **Expected:** Step 2 shows validation errors; step 4 creates program and shows it in the table

### TC-03: Edit an existing program
- **AC:** #3
- **Priority:** High
- **Precondition:** At least 1 program exists
- **Steps:**
  1. Click the Edit action on a program row
  2. Verify modal pre-fills existing values
  3. Modify the program name
  4. Click Save
- **Expected:** Modal shows current data; changes saved and reflected in the table

### TC-04: Archive and restore a program
- **AC:** #4
- **Priority:** High
- **Precondition:** At least 1 active program exists
- **Steps:**
  1. Click Archive on an active program
  2. Verify status changes to "Archived" immediately
  3. Click Restore on the archived program
  4. Verify status changes back to "Active"
- **Expected:** Status toggles correctly without page reload

### TC-05: Empty state when no programs
- **AC:** #5
- **Priority:** Medium
- **Precondition:** No programs in database (or all filtered out)
- **Steps:**
  1. Navigate to `/admin/programs` with no data
- **Expected:** Empty state component displayed (not a blank page)

### TC-06: Non-admin access denied
- **AC:** #6
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Call `GET /admin/programs` via API
  2. Navigate to `/admin/programs` via URL bar
- **Expected:** API returns 403; frontend redirects to `/403`

---

## Summary: 6/6 PASS
