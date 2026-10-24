# Staging → Main Release Notes

**Date:** 2026-10-20
**Branch:** `staging`
**Target:** `main`

---

## What's Included

### MP-33: Admin Enrollment Module (Sprint 3)
- **Admin enrollment controller** with full CRUD under `/api/admin/enrollments`, guarded by `@Roles(Role.ADMIN)`
- **Shared enrollment components** — `EnrollmentPage`, `EnrollmentTable`, `EnrollmentDetail`, and `EnrollmentFormWizard` now serve both registrar and admin via `EnrollmentApiContext`
- **Admin page shell** (`AdminPageShell.tsx`) for consistent admin page layout
- **New admin pages** (placeholder): Payments, Inventory, Reports, Import Data
- **Sidebar** updated with admin enrollment link
- **Routes** added: `/admin/enrollment`, `/admin/payments`, `/admin/inventory`, `/admin/reports`, `/admin/import-data`

### MP-16: Registrar Enrollment Hardening
- `ParseUUIDPipe` validation added to all registrar enrollment endpoints (`:id` params)

### Backlogs Restructure
- Structured test cases added to all 19 backlog acceptance files
- Acceptance criteria tables with PASS/FAIL/PARTIAL status tracking

---

## Build Status

| Check | Result |
|-------|--------|
| Backend `tsc --noEmit` | PASS |
| Frontend `tsc --noEmit` | PASS |
| Backend ESLint | PASS — 0 problems |
| Frontend ESLint | PASS — 0 problems |
| Backend build (`nest build`) | PASS |
| Frontend build (`vite build`) | PASS |
| Backend tests (Jest 2/2) | PASS |

---

## MP-33 Acceptance Summary: 18 PASS / 2 PARTIAL / 7 FAIL

### Passing (18)
- Access control (admin-only route + API guards)
- Enrollment table: load, sort, pagination, search, filters, status badges, empty/loading/error states
- Enrollment wizard (shared with registrar)
- Requirement checklist edit (Edit/Save/Cancel + `checked_by`/`checked_at`)
- Read-only fields enforced
- Toast notifications + list refresh after actions
- Backend: 404/400/409 error handling, no raw Prisma errors, remarks append logic

### Known Gaps (7 FAIL, 2 PARTIAL — documented in backlog)

**Critical:**
1. No confirmation dialog before status change (AC #18)
2. No exit reason prompt for WITHDRAWN/DROPPED; backend `exitReason` is optional (AC #19)
3. Beneficiary + portal username missing from detail query (AC #10)
4. Distribution checklist queried but not rendered (AC #13)
5. Official receipts queried but not rendered (AC #14)
6. Insurance coverage not in detail query (AC #15)
7. Withdrawal requests not in detail query (AC #16)

**Medium:**
1. `checked_by` staff name not displayed in checklist (AC #12)
2. Table missing columns: Batch, Uniform, OR, Enrolled by, Change status (AC #30)

---

## Files Changed (vs main)

**New (10):**
- `backend-nestjs/src/users/admin/enrollments/enrollments.controller.ts`
- `backend-nestjs/src/users/admin/enrollments/enrollments.module.ts`
- `frontend/src/components/admin/AdminPageShell.tsx`
- `frontend/src/components/enrollment/EnrollmentPage.tsx`
- `frontend/src/context/EnrollmentApiContext.tsx`
- `frontend/src/pages/users/admin/enrollment/AdminEnrollmentPage.tsx`
- `frontend/src/pages/users/admin/import-data/AdminImportDataPage.tsx`
- `frontend/src/pages/users/admin/inventory/AdminInventoryPage.tsx`
- `frontend/src/pages/users/admin/payments/AdminPaymentsPage.tsx`
- `frontend/src/pages/users/admin/reports/AdminReportsPage.tsx`

**Modified (29):**
- Backend: `app.module.ts`, `auth.controller.ts`, `update-enrollment.dto.ts`, `enrollments.service.ts`, registrar enrollments controller
- Frontend: enrollment API, EnrollmentDetail, EnrollmentFormWizard, EnrollmentTable, Sidebar, AdminRecords, RegistrarEnrollment, AppRouter
- Backlogs: 16 acceptance files updated with structured test cases
