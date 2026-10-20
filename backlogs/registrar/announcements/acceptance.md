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

## Summary: 28/28 PASS
