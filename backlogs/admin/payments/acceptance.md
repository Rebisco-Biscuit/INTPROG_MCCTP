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

## Summary: 0/30 — All NOT STARTED
