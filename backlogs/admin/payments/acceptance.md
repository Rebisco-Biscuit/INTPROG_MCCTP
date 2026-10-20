# MP-25: Admin — Payments Module

| Field | Value |
|-------|-------|
| **Jira** | MP-25 |
| **Type** | Feature |
| **Status** | Not Started |
| **Assignee** | Vince Jon Gonzalez |
| **Sprint** | MP Sprint 3 |
| **Route** | `/admin/payments` |
| **Shared with** | Registrar (`registrar/payments/acceptance.md` — not yet created) |

---

## Acceptance Criteria

### Pages and Reuse

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin → Payments and Registrar → Payments both open the Payments module | NOT STARTED | Sidebar link exists, no page |
| 2 | Same shared backend service and frontend components | NOT STARTED | |
| 3 | List reuses the shared list toolkit | NOT STARTED | |

### Recording

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 4 | Admin and Registrar can record a payment for an enrolled trainee | NOT STARTED | |
| 5 | Only 4 external reasons: Processing Fee, Uniform/ID Fee, Assessment Deposit, External Fees | NOT STARTED | |
| 6 | Trainee picker searches API as you type, never loads all trainees | NOT STARTED | |
| 7 | Receipt records who confirmed it and when | NOT STARTED | |
| 8 | Recording external payment doesn't create/change insurance | NOT STARTED | |
| 9 | Invalid input shows clear error, not server error | NOT STARTED | |

### OR Numbers and Duplicates

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 10 | Unique OR number `OR-{year}-{000000}`, same enrollment can have multiple receipts | NOT STARTED | New `or_number_seq` table needed |
| 11 | Two payments saved at same moment both succeed with different OR numbers | NOT STARTED | Atomic sequence increment |
| 12 | Double-clicking Save creates only one receipt | NOT STARTED | Idempotency key |
| 13 | Existing receipts still show correctly | NOT STARTED | |

### List

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 14 | Receipts list searchable by OR number, trainee name, username | NOT STARTED | |
| 15 | Every filter works alone and combined; chips and Clear all | NOT STARTED | |
| 16 | Sort by payment date, amount, OR number; default newest first | NOT STARTED | |
| 17 | Server-side pagination with page sizes 10/20/50; limit > 100 = 400 | NOT STARTED | |
| 18 | URL state survives refresh and back button | NOT STARTED | |
| 19 | Total count and total amount match filters, calculated in DB | NOT STARTED | |
| 20 | Receipt detail shows all fields including program, batch, confirming staff | NOT STARTED | |

### Money

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 21 | Amounts as strings, shown as PHP currency; no rounding errors | NOT STARTED | |

### Performance

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 22 | 50,000 receipts + search + filters under 500 ms locally | NOT STARTED | |
| 23 | Fixed number of queries, no N+1 | NOT STARTED | |

### Access Control

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 24 | Only Admin and Registrar can use endpoints | NOT STARTED | |
| 25 | Each role uses own endpoints | NOT STARTED | |
| 26 | Other roles get 403 | NOT STARTED | |
| 27 | No `password_hash` in responses | NOT STARTED | |

### Data and Quality

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 28 | One migration (OR sequence table, idempotency key, indexes) | NOT STARTED | |
| 29 | UI matches existing style | NOT STARTED | |
| 30 | tsc + build + lint = 0 problems | NOT STARTED | |

---

## Dependencies

- Shares `pg_trgm` name indexes with MP-24 (already merged)
- Existing OR/payment logic in `src/enrollments/enrollments.service.ts` should be extracted or reused

---

## Test Cases

### Pages and Reuse

#### TC-01: Admin and Registrar both access Payments
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as admin; then as registrar
- **Steps:**
  1. Navigate to `/admin/payments` as admin
  2. Navigate to `/registrar/payments` as registrar
- **Expected:** Both pages load the Payments module

#### TC-02: Shared backend and frontend components
- **AC:** #2
- **Priority:** High
- **Precondition:** Both roles have access
- **Steps:**
  1. Compare admin and registrar payment pages
- **Expected:** Same shared service and FE components used

### Recording

#### TC-03: Record a payment for enrolled trainee
- **AC:** #4, #7
- **Priority:** Critical
- **Precondition:** Trainee enrolled in a batch
- **Steps:**
  1. Click "Record Payment"
  2. Search and select the trainee
  3. Select a payment reason
  4. Enter amount, click Save
- **Expected:** Payment recorded; receipt shows `confirmed_by` staff and `confirmed_at` timestamp

#### TC-04: Only 4 valid payment reasons
- **AC:** #5
- **Priority:** High
- **Precondition:** On payment form
- **Steps:**
  1. Open the reason dropdown
- **Expected:** Only 4 options: Processing Fee, Uniform/ID Fee, Assessment Deposit, External Fees

#### TC-05: Trainee picker searches API
- **AC:** #6
- **Priority:** High
- **Precondition:** 100+ trainees exist
- **Steps:**
  1. Start typing a trainee name in the picker
  2. Observe network requests
- **Expected:** API called as you type; never loads all trainees at once

#### TC-06: External payment doesn't affect insurance
- **AC:** #8
- **Priority:** Medium
- **Precondition:** Trainee with insurance record
- **Steps:**
  1. Record an external payment for the trainee
  2. Check insurance record
- **Expected:** Insurance unchanged

#### TC-07: Invalid input shows clean error
- **AC:** #9
- **Priority:** High
- **Precondition:** On payment form
- **Steps:**
  1. Leave amount blank, click Save
  2. Enter negative amount, click Save
- **Expected:** Clear validation errors shown (not server 500)

### OR Numbers and Duplicates

#### TC-08: Unique OR number generated
- **AC:** #10
- **Priority:** Critical
- **Precondition:** None
- **Steps:**
  1. Record a payment
  2. Record another payment for the same enrollment
- **Expected:** Both receipts have unique OR numbers in format `OR-{year}-{000000}`

#### TC-09: Concurrent payments get different OR numbers
- **AC:** #11
- **Priority:** High
- **Precondition:** Two sessions open
- **Steps:**
  1. Submit two payments at the exact same moment
- **Expected:** Both succeed with different OR numbers (atomic sequence increment)

#### TC-10: Double-click prevention
- **AC:** #12
- **Priority:** High
- **Precondition:** On payment form, filled out
- **Steps:**
  1. Double-click the Save button rapidly
- **Expected:** Only one receipt created (idempotency key prevents duplicate)

### List

#### TC-11: Search receipts by OR number, name, username
- **AC:** #14
- **Priority:** High
- **Precondition:** Receipts exist
- **Steps:**
  1. Search by OR number
  2. Search by trainee name
  3. Search by username
- **Expected:** Matching receipts returned in each case

#### TC-12: Filters, chips, and Clear all
- **AC:** #15
- **Priority:** High
- **Precondition:** Receipts exist
- **Steps:**
  1. Apply program filter
  2. Apply date range filter
  3. Remove one chip
  4. Click "Clear all"
- **Expected:** Filters combine; chips removable individually; Clear all resets all

#### TC-13: Sort and pagination
- **AC:** #16, #17
- **Priority:** High
- **Precondition:** 25+ receipts exist
- **Steps:**
  1. Sort by payment date (default newest first)
  2. Sort by amount
  3. Sort by OR number
  4. Navigate to page 2
  5. Change page size to 20, 50
  6. Call API with limit = 101
- **Expected:** Sorting works; pagination correct; limit > 100 = 400

#### TC-14: URL state survives refresh
- **AC:** #18
- **Priority:** Medium
- **Precondition:** Filters and sort applied
- **Steps:**
  1. Refresh the page
  2. Press Back
- **Expected:** Same state restored from URL

#### TC-15: Total count and total amount
- **AC:** #19
- **Priority:** High
- **Precondition:** Receipts with filters applied
- **Steps:**
  1. Apply filters and check totals
- **Expected:** Total count and total amount match filtered results; calculated in DB

#### TC-16: Receipt detail view
- **AC:** #20
- **Priority:** High
- **Precondition:** Receipt exists
- **Steps:**
  1. Click on a receipt row
- **Expected:** Detail shows all fields: amount, reason, program, batch, trainee, confirming staff

### Money

#### TC-17: Amounts displayed as PHP currency
- **AC:** #21
- **Priority:** Medium
- **Precondition:** Receipts exist
- **Steps:**
  1. View receipt amounts in list and detail
- **Expected:** Displayed as PHP currency format; no rounding errors; stored as strings

### Performance

#### TC-18: Performance under load
- **AC:** #22, #23
- **Priority:** Medium
- **Precondition:** 50,000 receipts in database
- **Steps:**
  1. Load list with search + filters, measure response time
- **Expected:** < 500ms; fixed query count (no N+1)

### Access Control

#### TC-19: Only Admin and Registrar can access
- **AC:** #24, #25, #26, #27
- **Priority:** Critical
- **Precondition:** Accounts for all roles
- **Steps:**
  1. Call payment endpoints with admin JWT → allowed
  2. Call payment endpoints with registrar JWT → allowed
  3. Call payment endpoints with trainer JWT → blocked
  4. Inspect response for `password_hash`
- **Expected:** Admin and Registrar: 200; others: 403; no `password_hash` in responses

---

## Summary: 0/30 — All NOT STARTED
