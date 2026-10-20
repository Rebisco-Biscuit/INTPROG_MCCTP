# Registrar — Dashboard (Placeholder)

| Field | Value |
|-------|-------|
| **Status** | Done (placeholder) |
| **Route** | `/registrar/dashboard` |

---

## Acceptance Criteria

### Core

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Login as registrar redirects to registrar dashboard | PASS | Role-based redirect |
| 2 | Dashboard page renders without errors | PASS | RegistrarDashboard component |
| 3 | Non-registrar roles cannot access | PASS | ProtectedRoute with `allowedRoles={['REGISTRAR']}` |
| 4 | Sidebar shows registrar navigation links | PASS | Registration, Records sections |

> Placeholder only — no real dashboard features yet.

---

## Test Cases

### TC-01: Registrar login redirects to dashboard
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Registrar account exists
- **Steps:**
  1. Log in with registrar credentials
- **Expected:** Redirected to `/registrar/dashboard`

### TC-02: Dashboard renders without errors
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Navigate to `/registrar/dashboard`
  2. Check browser console
- **Expected:** Page loads with no errors

### TC-03: Non-registrar blocked
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/registrar/dashboard` via URL bar
- **Expected:** Redirected to `/403`

### TC-04: Sidebar links visible
- **AC:** #4
- **Priority:** High
- **Precondition:** Logged in as registrar, on dashboard
- **Steps:**
  1. Inspect sidebar navigation
- **Expected:** Registration and Records sections visible

---

## Summary: 4/4 PASS
