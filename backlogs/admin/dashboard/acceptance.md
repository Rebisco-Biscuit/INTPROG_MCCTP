# MP-8: Admin — Dashboard (Placeholder)

| Field | Value |
|-------|-------|
| **Jira** | MP-8 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Vince Jon Gonzalez |
| **Sprint** | MP Sprint 1 |
| **Merged** | 2026-09-04 |
| **Route** | `/admin/dashboard` |

---

## Acceptance Criteria

### Core

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Login as admin redirects to admin dashboard | PASS | Role-based redirect after JWT login |
| 2 | Dashboard page renders without errors | PASS | Placeholder page loads |
| 3 | Non-admin roles cannot access `/admin/dashboard` | PASS | ProtectedRoute with `allowedRoles={['ADMIN']}` |
| 4 | Sidebar shows all admin navigation links | PASS | Full admin sidebar config in Sidebar.tsx |

> Placeholder only — no real dashboard features. Real dashboard widgets (stats, charts) are a future ticket.

---

## Test Cases

### TC-01: Admin login redirects to dashboard
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Admin account exists
- **Steps:**
  1. Log in with admin credentials
- **Expected:** Redirected to `/admin/dashboard`

### TC-02: Dashboard renders without errors
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/admin/dashboard`
  2. Check browser console for errors
- **Expected:** Page loads with no console errors or blank screens

### TC-03: Non-admin blocked from admin dashboard
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as registrar (or trainer/trainee/encoder)
- **Steps:**
  1. Navigate to `/admin/dashboard` via URL bar
- **Expected:** Redirected to `/403`

### TC-04: Sidebar navigation links visible
- **AC:** #4
- **Priority:** High
- **Precondition:** Logged in as admin, on dashboard
- **Steps:**
  1. Inspect the sidebar
- **Expected:** All admin navigation links visible (Programs, Staff Accounts, Batches, Enrollments, Payments, Announcements, Trainee Information)

---

## Summary: 4/4 PASS
