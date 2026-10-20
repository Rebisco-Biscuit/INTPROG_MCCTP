# MP-14: Admin — Staff User Accounts Module

| Field | Value |
|-------|-------|
| **Jira** | MP-14 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Aubrien Fuentes |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-19 (PR #7) |
| **Route** | `/admin/staff-accounts` |

---

## Acceptance Criteria

### CRUD & Display

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin can view staff list filtered by role and status | PASS | StaffTable with role/status filters |
| 2 | Admin can create a new staff account — triggers Supabase Auth user creation + DB row insert | PASS | Atomic: supabase.auth.admin.createUser() + users table insert |
| 3 | Admin can edit non-auth details (name, employee ID) | PASS | StaffFormModal edit mode |
| 4 | Admin can deactivate a staff account — deactivated users cannot log in | PASS | Status toggle with login enforcement |
| 5 | Admin can trigger a password reset email for any staff member | PASS | ResetPasswordModal via Supabase |

### Validation

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 6 | Duplicate email is rejected with a clear error message | PASS | 409 Conflict on duplicate |

---

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/staff-accounts` | List all staff (filterable by role, status) |
| POST | `/admin/staff-accounts` | Create new staff account |
| PATCH | `/admin/staff-accounts/:id` | Update staff profile details |
| PATCH | `/admin/staff-accounts/:id/status` | Deactivate/reactivate |
| POST | `/admin/staff-accounts/:id/reset-password` | Trigger password reset email |

---

## Summary: 6/6 PASS
