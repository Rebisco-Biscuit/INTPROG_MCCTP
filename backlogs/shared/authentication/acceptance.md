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

## Summary: 8/8 PASS
