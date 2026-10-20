# MP-4: Shared — Authentication & Landing Page

| Field | Value |
|-------|-------|
| **Jira** | MP-4, MP-5, MP-6 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Aubrien Fuentes |
| **Sprint** | MP Sprint 1 |
| **Merged** | 2026-09-04 |
| **Route** | `/` (landing), `/login` |

---

## Acceptance Criteria

### Landing Page & Login

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | User can land on the page and see the login form | PASS | Landing page renders with login |
| 2 | User can log in with valid credentials and be routed to role-specific dashboard | PASS | JWT + role-based redirect |
| 3 | Admin can log in and access admin dashboard | PASS | Seeded admin account works |
| 4 | Invalid credentials show clear error message | PASS | Error toast on failed login |

### Auth & Session

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 5 | JWT auth with Supabase token layer + NestJS verification | PASS | Stateless JWT + stateful sessions table |
| 6 | RBAC via NestJS Guards (JwtAuthGuard + RolesGuard) | PASS | Guards on all role-specific endpoints |
| 7 | Session management configured | PASS | Sessions table tracks active sessions |
| 8 | Non-authenticated users cannot access protected routes | PASS | Redirected to login |

---

## Test Cases

### TC-01: Successful admin login
- **AC:** #1, #2, #3
- **Priority:** Critical
- **Precondition:** Seeded admin account exists in database
- **Steps:**
  1. Navigate to the landing page (`/`)
  2. Enter valid admin email and password
  3. Click Login
- **Expected:** User redirected to `/admin/dashboard`; JWT token stored in browser

### TC-02: Invalid credentials rejected
- **AC:** #4
- **Priority:** Critical
- **Precondition:** None
- **Steps:**
  1. Navigate to the login form
  2. Enter an incorrect email or password
  3. Click Login
- **Expected:** Error toast displayed ("Invalid credentials"); user remains on login page

### TC-03: Role-based redirect per role
- **AC:** #2, #3
- **Priority:** Critical
- **Precondition:** One account per role exists (admin, registrar, trainer, trainee, encoder)
- **Steps:**
  1. Log in as each role separately
  2. Observe the redirect destination after login
- **Expected:** Admin → `/admin/dashboard`, Registrar → `/registrar/dashboard`, Trainer → `/trainer/dashboard`, Trainee → `/trainee/dashboard`, Encoder → `/encoder/dashboard`

### TC-04: JWT + Supabase token verification
- **AC:** #5
- **Priority:** High
- **Precondition:** Valid user account
- **Steps:**
  1. Log in with valid credentials
  2. Inspect network response and browser storage
- **Expected:** JWT token issued via Supabase; NestJS verifies token on subsequent API calls

### TC-05: RBAC guard blocks wrong role
- **AC:** #6
- **Priority:** Critical
- **Precondition:** Logged in as registrar
- **Steps:**
  1. Navigate to `/admin/programs` directly via URL bar
- **Expected:** Redirected to `/403` forbidden page

### TC-06: Session recorded in database
- **AC:** #7
- **Priority:** Medium
- **Precondition:** Valid user account
- **Steps:**
  1. Log in successfully
  2. Query the `sessions` table in the database
- **Expected:** Active session row exists for the logged-in user

### TC-07: Unauthenticated user blocked from protected routes
- **AC:** #8
- **Priority:** Critical
- **Precondition:** Not logged in (clear cookies/storage)
- **Steps:**
  1. Navigate directly to `/admin/dashboard`
- **Expected:** Redirected to login page

### TC-08: Expired token rejected
- **AC:** #5, #8
- **Priority:** High
- **Precondition:** Previously logged in, token expired
- **Steps:**
  1. Wait for JWT to expire (or manually invalidate)
  2. Attempt to access a protected route
- **Expected:** Redirected to login page; API returns 401

---

## Summary: 8/8 PASS
