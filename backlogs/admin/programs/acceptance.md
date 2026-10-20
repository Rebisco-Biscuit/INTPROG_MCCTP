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

## Summary: 6/6 PASS
