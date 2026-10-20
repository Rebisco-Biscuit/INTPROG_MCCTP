# MP-33: Admin — Enrollments Module

| Field | Value |
|-------|-------|
| **Jira** | MP-33 |
| **Type** | Feature |
| **Status** | In Progress |
| **Assignee** | Chelsea Cllj |
| **Sprint** | MP Sprint 3 |
| **Branch** | `adminEnrollment` (stashed) |
| **Route** | `/admin/enrollments` |

---

## Acceptance Criteria

### Access Control

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Only ADMIN can open `/admin/enrollments`; other roles redirected to `/403` | PASS | Route guard + backend guards |
| 2 | Every `/admin/enrollments` endpoint returns 401 without token, 403 for non-admin | PASS | JwtAuthGuard + RolesGuard + @Roles(Role.ADMIN) |
| 3 | Registrar endpoints still work as before | PASS | Separate controller, unchanged |

### List Page

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 4 | Table loads enrollments from every program and batch, newest first | PASS | `enrolled_at desc` default sort |
| 5 | Program, batch, status and date-range filters work together with search | PASS | Combined filters functional |
| 6 | Search matches trainee name, contact, ID card, batch, program, OR number | PASS | Multi-field search implemented |
| 7 | Pagination works and shows total count | PASS | Server-side pagination with total |
| 8 | Status badges render for all 5 statuses | PASS | PENDING, ENROLLED, WITHDRAWN, COMPLETED, DROPPED |
| 9 | Empty state, loading state, error state all shown | PASS | All three states rendered |

### Enrollment Detail

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 10 | Shows trainee profile, beneficiary and portal username | FAIL | Beneficiary not included in query; `system_id` not selected |
| 11 | Lists every program the trainee is enrolled in with all fields | PASS | Enrollment cards with batch, dates, ID card, uniform, OR, status |
| 12 | Shows requirement checklist with who checked and when | PARTIAL | Checklist shown but `checked_by` staff name not displayed |
| 13 | Shows distribution checklist | FAIL | Queried from backend but never rendered in UI |
| 14 | Shows official receipts | FAIL | Queried from backend but never rendered in UI |
| 15 | Shows insurance coverage | FAIL | Not in the detail query at all |
| 16 | Shows pending withdrawal requests | FAIL | Not in the detail query at all |

### Admin Actions

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 17 | Admin can enroll a trainee through the same wizard | PASS | Shared EnrollmentFormWizard, same validation |
| 18 | Admin can change status with confirmation dialog | FAIL | Status dropdown fires immediately, no confirmation dialog |
| 19 | WITHDRAWN/DROPPED requires exit reason; 400 if missing | FAIL | Frontend never prompts; backend DTO has `exitReason` as optional |
| 20 | Status remarks appended, never replaced | PASS | Append logic in service |
| 21 | Admin can edit requirement checklist (Edit/Save/Cancel) | PASS | Edit flow works |
| 22 | `checked_by` and `checked_at` updated on checklist edit | PASS | Backend records admin's user ID |
| 23 | `id_card_number`, OR number, `enrolled_by` are read-only | PASS | Not editable in UI |
| 24 | Success/error toast after every action; list refreshes | PASS | Toast implemented in EnrollmentDetail; list refreshes via onUpdated → refreshKey |

### Backend

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 25 | Unknown enrollment ID returns 404 | PASS | Handled in service |
| 26 | Invalid UUID or filter returns 400 | PASS | DTO validation |
| 27 | Rule violations return 409 with clear message | PASS | e.g. "Trainee already enrolled in this batch" |
| 28 | Raw Prisma errors never reach client | PASS | Error mapping in service |
| 29 | Backend + frontend tsc and ESLint pass with 0 problems | PASS | Verified |

### Table Columns

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 30 | Table shows: Trainee name, ID card, Program, Batch, Status, Uniform, OR, Enrolled by, Date, Actions | PARTIAL | Missing: Batch name, Uniform size, OR number, Enrolled by, Change status action |

---

## Gaps Summary

### Critical (must fix before merge)

1. No confirmation dialog before status change (#18)
2. No exit reason prompt for WITHDRAWN/DROPPED (#19)
3. Beneficiary not shown in detail (#10)
4. Distribution checklist not rendered (#13)
5. Official receipts not rendered (#14)
6. Insurance coverage not queried or shown (#15)
7. Withdrawal requests not queried or shown (#16)

### Medium

8. Portal username not shown (#10)
9. `checked_by` staff name not displayed (#12)
10. `enrolled_by` staff name not rendered (#30)
11. Table missing columns: Batch, Uniform, OR, Enrolled by, Change status (#30)

---

## Test Cases

### Access Control

#### TC-01: Only admin can access enrollments page
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Navigate to `/admin/enrollments` via URL bar
- **Expected:** Redirected to `/403`

#### TC-02: API auth enforcement
- **AC:** #2
- **Priority:** Critical
- **Precondition:** None
- **Steps:**
  1. Call `GET /admin/enrollments` without token
  2. Call `GET /admin/enrollments` with registrar JWT
- **Expected:** Step 1: 401; step 2: 403

#### TC-03: Registrar endpoints unaffected
- **AC:** #3
- **Priority:** High
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Call `GET /registrar/enrollments`
- **Expected:** 200 OK — registrar endpoints still work

### List Page

#### TC-04: Enrollment table loads with default sort
- **AC:** #4
- **Priority:** Critical
- **Precondition:** Logged in as admin; enrollments exist across multiple programs/batches
- **Steps:**
  1. Navigate to `/admin/enrollments`
- **Expected:** Table loads with all enrollments; sorted by `enrolled_at` descending (newest first)

#### TC-05: Combined filters
- **AC:** #5
- **Priority:** High
- **Precondition:** Enrollments in different programs, batches, statuses, dates
- **Steps:**
  1. Filter by program
  2. Add batch filter
  3. Add status filter
  4. Add date range
  5. Add search query
- **Expected:** All 5 filters combine correctly; results match all criteria

#### TC-06: Multi-field search
- **AC:** #6
- **Priority:** High
- **Precondition:** Enrollments exist
- **Steps:**
  1. Search by trainee name
  2. Search by contact number
  3. Search by ID card number
  4. Search by batch name
  5. Search by program name
  6. Search by OR number
- **Expected:** Each search returns matching enrollments

#### TC-07: Pagination with total count
- **AC:** #7
- **Priority:** High
- **Precondition:** 25+ enrollments exist
- **Steps:**
  1. Load page 1
  2. Navigate to page 2
  3. Check total count display
- **Expected:** Correct data per page; total count accurate

#### TC-08: Status badges for all 5 statuses
- **AC:** #8
- **Priority:** Medium
- **Precondition:** Enrollments in each status
- **Steps:**
  1. View the enrollment table
- **Expected:** PENDING, ENROLLED, WITHDRAWN, COMPLETED, DROPPED — each with distinct badge color

#### TC-09: Loading, empty, and error states
- **AC:** #9
- **Priority:** Medium
- **Precondition:** Various states
- **Steps:**
  1. Load with slow network → loading state
  2. Apply filters with no results → empty state
  3. Disconnect network → error state
- **Expected:** All three states rendered correctly

### Enrollment Detail

#### TC-10: Detail shows trainee profile + beneficiary + username
- **AC:** #10
- **Priority:** Critical
- **Precondition:** Enrollment exists for trainee with beneficiary data
- **Steps:**
  1. Click on an enrollment to open detail view
  2. Check for beneficiary section and portal username
- **Expected:** Trainee profile, beneficiary info, and `system_id` (portal username) all displayed

#### TC-11: All enrollment programs listed
- **AC:** #11
- **Priority:** High
- **Precondition:** Trainee enrolled in 3 programs
- **Steps:**
  1. Open the trainee's enrollment detail
- **Expected:** 3 enrollment cards with batch, dates, ID card, uniform, OR, status

#### TC-12: Requirement checklist with checked_by
- **AC:** #12
- **Priority:** High
- **Precondition:** Requirements checked by a staff member
- **Steps:**
  1. Open enrollment detail
  2. View requirement checklist
- **Expected:** Checklist items shown with `checked_by` staff name and `checked_at` timestamp

#### TC-13: Distribution checklist rendered
- **AC:** #13
- **Priority:** Critical
- **Precondition:** Distribution records exist in backend
- **Steps:**
  1. Open enrollment detail
- **Expected:** Distribution checklist displayed in UI (not just queried)

#### TC-14: Official receipts rendered
- **AC:** #14
- **Priority:** Critical
- **Precondition:** Payment receipts exist for enrollment
- **Steps:**
  1. Open enrollment detail
- **Expected:** Official receipts section displayed with receipt data

#### TC-15: Insurance coverage shown
- **AC:** #15
- **Priority:** Critical
- **Precondition:** Insurance record exists for trainee
- **Steps:**
  1. Open enrollment detail
- **Expected:** Insurance coverage section displayed

#### TC-16: Pending withdrawal requests shown
- **AC:** #16
- **Priority:** Critical
- **Precondition:** Trainee has pending withdrawal request
- **Steps:**
  1. Open enrollment detail
- **Expected:** Pending withdrawal request displayed with details

### Admin Actions

#### TC-17: Admin enrolls trainee via wizard
- **AC:** #17
- **Priority:** Critical
- **Precondition:** Logged in as admin; programs and batches exist
- **Steps:**
  1. Click "Enroll Trainee" on the enrollments page
  2. Complete all wizard steps
  3. Submit
- **Expected:** Enrollment created using shared EnrollmentFormWizard; same validation as registrar

#### TC-18: Status change with confirmation dialog
- **AC:** #18
- **Priority:** Critical
- **Precondition:** Enrollment in PENDING status
- **Steps:**
  1. Change status dropdown to ENROLLED
  2. Observe confirmation dialog
  3. Confirm the change
- **Expected:** Confirmation dialog shown BEFORE status change; status updated after confirm

#### TC-19: Exit reason required for WITHDRAWN/DROPPED
- **AC:** #19
- **Priority:** Critical
- **Precondition:** Enrollment in ENROLLED status
- **Steps:**
  1. Change status to WITHDRAWN without entering exit reason
  2. Change status to WITHDRAWN with exit reason
- **Expected:** Step 1: frontend prompts for reason; backend returns 400 if missing; step 2: status updated

#### TC-20: Status remarks appended
- **AC:** #20
- **Priority:** High
- **Precondition:** Enrollment with existing remarks
- **Steps:**
  1. Change status and add new remarks
  2. Check the enrollment's remarks history
- **Expected:** New remarks appended to existing; previous remarks preserved

#### TC-21: Edit requirement checklist
- **AC:** #21, #22
- **Priority:** High
- **Precondition:** Enrollment with requirement checklist
- **Steps:**
  1. Click Edit on the checklist
  2. Toggle requirement items
  3. Click Save
  4. Check database for `checked_by` and `checked_at`
- **Expected:** Edit/Save/Cancel flow works; `checked_by` = admin's user ID; `checked_at` = current timestamp

#### TC-22: Read-only fields enforced
- **AC:** #23
- **Priority:** High
- **Precondition:** Enrollment detail open
- **Steps:**
  1. Check `id_card_number`, OR number, and `enrolled_by` fields
- **Expected:** All three fields displayed as read-only (not editable)

#### TC-23: Toast and list refresh after actions
- **AC:** #24
- **Priority:** High
- **Precondition:** None
- **Steps:**
  1. Change enrollment status
  2. Edit a checklist
  3. Observe toast notifications and list data
- **Expected:** Success toast after each action; enrollment list refreshes automatically

### Backend

#### TC-24: Unknown enrollment ID returns 404
- **AC:** #25
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Call `GET /admin/enrollments/{nonexistent-uuid}`
- **Expected:** 404 Not Found

#### TC-25: Invalid UUID returns 400
- **AC:** #26
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Call `GET /admin/enrollments/not-a-uuid`
- **Expected:** 400 Bad Request

#### TC-26: Rule violations return 409
- **AC:** #27
- **Priority:** High
- **Precondition:** Trainee already enrolled in Batch A
- **Steps:**
  1. Attempt to enroll the same trainee in Batch A again
- **Expected:** 409 Conflict: "Trainee already enrolled in this batch"

#### TC-27: No raw Prisma errors exposed
- **AC:** #28
- **Priority:** High
- **Precondition:** None
- **Steps:**
  1. Trigger a database error (e.g. constraint violation)
- **Expected:** Clean error message returned; no raw Prisma error or stack trace

### Table Columns

#### TC-28: All required columns visible
- **AC:** #30
- **Priority:** High
- **Precondition:** Enrollments exist
- **Steps:**
  1. Inspect the enrollment table columns
- **Expected:** Trainee name, ID card, Program, Batch, Status, Uniform, OR, Enrolled by, Date, Actions — all present

---

## Summary: 18 PASS, 2 PARTIAL, 7 FAIL
