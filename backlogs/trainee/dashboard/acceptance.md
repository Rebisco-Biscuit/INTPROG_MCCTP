# Trainee — Dashboard (Placeholder)

| Field | Value |
|-------|-------|
| **Status** | Done (placeholder) |
| **Route** | `/trainee/dashboard` |

---

## Acceptance Criteria

### Core

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Login as trainee redirects to trainee dashboard | PASS | Role-based redirect |
| 2 | Dashboard page renders without errors | PASS | TraineeDashboard component |
| 3 | Non-trainee roles cannot access | PASS | ProtectedRoute with `allowedRoles={['TRAINEE']}` |
| 4 | Sidebar shows trainee navigation links | PASS | My Training, Certification sections |

> Placeholder only — no real dashboard features yet.

---

## Planned Pages (Not Yet Built)

| Page | Route | Status |
|------|-------|--------|
| My Enrollment | `/trainee/enrollment` | NOT STARTED |
| My Training | `/trainee/training` | NOT STARTED |
| Attendance | `/trainee/attendance` | NOT STARTED |
| Grades & Progress | `/trainee/grades` | NOT STARTED |
| Clearance | `/trainee/clearance` | NOT STARTED |
| Certificates | `/trainee/certificates` | NOT STARTED |
| Guidebook | `/trainee/guidebook` | NOT STARTED |

---

## Test Cases

### TC-01: Trainee login redirects to dashboard
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Trainee account exists
- **Steps:**
  1. Log in with trainee credentials
- **Expected:** Redirected to `/trainee/dashboard`

### TC-02: Dashboard renders without errors
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as trainee
- **Steps:**
  1. Navigate to `/trainee/dashboard`
  2. Check browser console
- **Expected:** Page loads with no errors

### TC-03: Non-trainee blocked
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/trainee/dashboard` via URL bar
- **Expected:** Redirected to `/403`

### TC-04: Sidebar links visible
- **AC:** #4
- **Priority:** High
- **Precondition:** Logged in as trainee, on dashboard
- **Steps:**
  1. Inspect sidebar navigation
- **Expected:** My Training and Certification sections visible

---

## Summary: 4/4 PASS — 7 pages NOT STARTED
