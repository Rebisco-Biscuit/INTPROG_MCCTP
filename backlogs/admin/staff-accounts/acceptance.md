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

## Test Cases

### TC-01: View staff list with filters
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as admin; staff accounts exist for multiple roles
- **Steps:**
  1. Navigate to `/admin/staff-accounts`
  2. Filter by role = "Registrar"
  3. Filter by status = "Active"
  4. Combine both filters
- **Expected:** Table shows only matching staff; filters combine correctly

### TC-02: Create a new staff account
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Click "Create Staff" button
  2. Fill in name, email, employee ID, and role
  3. Click Save
  4. Verify in database: Supabase Auth user + `users` table row created
- **Expected:** Staff account created atomically; appears in table

### TC-03: Edit staff non-auth details
- **AC:** #3
- **Priority:** High
- **Precondition:** At least 1 staff account exists
- **Steps:**
  1. Click Edit on a staff row
  2. Change the name and employee ID
  3. Click Save
- **Expected:** Details updated; email and role remain unchanged

### TC-04: Deactivate and reactivate staff
- **AC:** #4
- **Priority:** Critical
- **Precondition:** Active staff account exists
- **Steps:**
  1. Click Deactivate on an active staff member
  2. Log out; attempt to log in as the deactivated user
  3. Log back in as admin; reactivate the staff member
  4. Attempt login as the reactivated user
- **Expected:** Step 2: login fails; step 4: login succeeds

### TC-05: Trigger password reset email
- **AC:** #5
- **Priority:** High
- **Precondition:** Staff account with valid email exists
- **Steps:**
  1. Click "Reset Password" on a staff row
  2. Confirm in the modal
- **Expected:** Password reset email sent via Supabase; success toast shown

### TC-06: Duplicate email rejected
- **AC:** #6
- **Priority:** High
- **Precondition:** Staff with email `test@example.com` exists
- **Steps:**
  1. Click Create Staff
  2. Enter the same email `test@example.com`
  3. Click Save
- **Expected:** 409 error with clear message "Email already exists"

---

## Summary: 6/6 PASS
