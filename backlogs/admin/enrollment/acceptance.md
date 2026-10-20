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
| 24 | Success/error toast after every action; list refreshes | FAIL | No success toast; list doesn't refresh after status change |

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
12. No success/error toast notifications (#24)

---

## Summary: 17 PASS, 2 PARTIAL, 8 FAIL (3 not yet tested)
