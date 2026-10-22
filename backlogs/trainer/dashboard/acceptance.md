# Trainer — Dashboard (Placeholder)

| Field | Value |
|-------|-------|
| **Status** | Done (placeholder) |
| **Route** | `/trainer/dashboard` |

---

## Acceptance Criteria

### Core

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Login as trainer redirects to trainer dashboard | PASS | Role-based redirect |
| 2 | Dashboard page renders without errors | PASS | TrainerDashboard component |
| 3 | Non-trainer roles cannot access | PASS | ProtectedRoute with `allowedRoles={['TRAINER']}` |
| 4 | Sidebar shows trainer navigation links | PASS | Training, Records sections |

> Placeholder only — no real dashboard features yet.

---

## Planned Pages (Not Yet Built)

| Page | Route | Status |
|------|-------|--------|
| My Batches | `/trainer/batches` | NOT STARTED |
| Class Records | `/trainer/classes` | NOT STARTED |
| Attendance | `/trainer/attendance` | NOT STARTED |
| Progress | `/trainer/progress` | NOT STARTED |
| Grades & Competencies | `/trainer/grades` | NOT STARTED |
| Trainee Records | `/trainer/records` | NOT STARTED |
| Graduating List | `/trainer/graduating` | NOT STARTED |

---

## Test Cases

### TC-01: Trainer login redirects to dashboard
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Trainer account exists
- **Steps:**
  1. Log in with trainer credentials
- **Expected:** Redirected to `/trainer/dashboard`

### TC-02: Dashboard renders without errors
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as trainer
- **Steps:**
  1. Navigate to `/trainer/dashboard`
  2. Check browser console
- **Expected:** Page loads with no errors

### TC-03: Non-trainer blocked
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/trainer/dashboard` via URL bar
- **Expected:** Redirected to `/403`

### TC-04: Sidebar links visible
- **AC:** #4
- **Priority:** High
- **Precondition:** Logged in as trainer, on dashboard
- **Steps:**
  1. Inspect sidebar navigation
- **Expected:** Training and Records sections visible

---

## Summary: 4/4 PASS — 7 pages NOT STARTED
