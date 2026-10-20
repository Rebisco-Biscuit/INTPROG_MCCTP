# Encoder — Dashboard (Placeholder)

| Field | Value |
|-------|-------|
| **Status** | Done (placeholder) |
| **Route** | `/encoder/dashboard` |

---

## Acceptance Criteria

### Core

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Login as encoder redirects to encoder dashboard | PASS | Role-based redirect |
| 2 | Dashboard page renders without errors | PASS | EncoderDashboard component |
| 3 | Non-encoder roles cannot access | PASS | ProtectedRoute with `allowedRoles={['ENCODER']}` |
| 4 | Sidebar shows encoder navigation links | PASS | Certification, Records sections |

> Placeholder only — no real dashboard features yet.

---

## Planned Pages (Not Yet Built)

| Page | Route | Status |
|------|-------|--------|
| Clearance Verification | `/encoder/clearance` | NOT STARTED |
| Certificate Issuance | `/encoder/certificates` | NOT STARTED |
| Distribution Logs | `/encoder/distribution` | NOT STARTED |
| Trainee Records | `/encoder/records` | NOT STARTED |

---

## Test Cases

### TC-01: Encoder login redirects to dashboard
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Encoder account exists
- **Steps:**
  1. Log in with encoder credentials
- **Expected:** Redirected to `/encoder/dashboard`

### TC-02: Dashboard renders without errors
- **AC:** #2
- **Priority:** Critical
- **Precondition:** Logged in as encoder
- **Steps:**
  1. Navigate to `/encoder/dashboard`
  2. Check browser console
- **Expected:** Page loads with no errors

### TC-03: Non-encoder blocked
- **AC:** #3
- **Priority:** Critical
- **Precondition:** Logged in as admin
- **Steps:**
  1. Navigate to `/encoder/dashboard` via URL bar
- **Expected:** Redirected to `/403`

### TC-04: Sidebar links visible
- **AC:** #4
- **Priority:** High
- **Precondition:** Logged in as encoder, on dashboard
- **Steps:**
  1. Inspect sidebar navigation
- **Expected:** Certification and Records sections visible

---

## Summary: 4/4 PASS — 4 pages NOT STARTED
