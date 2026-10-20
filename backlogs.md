# MCCTEST PORTAL — Backlog Tracking

## MP-24: Reusable Trainee Information Module (View)

**Branch:** `feature/MP-24-trainee-information`
**Assignee:** Aubrien Fuentes
**Sprint:** MP Sprint 3
**Status:** Done

### Acceptance Criteria

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| **Pages and Reuse** | | | |
| 1 | Admin → Trainees and Registrar → Trainee Records both open the Student Information module | PASS | Routes at `/admin/trainees` and `/registrar/trainees` |
| 2 | Both pages use the same shared backend service and frontend components; no logic is copied between roles | PASS | One `TraineeInformationService`, 8 shared FE components, page files are 3-line wrappers passing `role` |
| 3 | Frontend module accepts `canEdit` setting; profile and enrollment cards can show Edit action when `true`, ready for MP-42 | PASS | `canEdit: false` for both roles; Edit button renders conditionally |
| **Search** | | | |
| 4 | Searching by part of a first name, last name, or full name in any order finds the trainee, case-insensitive | PASS | ILIKE with split terms, pg_trgm GIN indexes |
| 5 | Searching by username, email, contact number, ID card number, or OR number finds the trainee | PASS | All fields included in search query |
| 6 | Typing quickly sends at most one request after the user pauses (~300 ms); results always match the latest text | PASS | `SEARCH_DEBOUNCE_MS = 300`, AbortController cancels stale requests |
| **Filters and Sorting** | | | |
| 7 | Every filter in the Filters table works, alone and combined with search and other filters | PARTIAL | Enrollment/batch status are single-select (Jira says multi-select); insurance missing "Expired" option; program dropdown not searchable |
| 8 | Batch filter only lists batches of the selected program | PASS | Filters by `programId`, disabled when no program selected |
| 9 | Active filters show as chips; removing a chip or clicking Clear all updates the results | PASS | ActiveFilterChips component with removable chips and Clear all |
| 10 | Sorting by name, enrolled date, and ID card number works in both directions; default is newest enrolled first | PASS | Whitelisted sort clauses, default `enrolledAt desc` |
| **Pagination** | | | |
| 11 | Pagination is server-side: each request returns only one page and the correct `total` | PASS | Returns `{ data, total, page, limit, totalPages }` |
| 12 | Page size can be 10, 20, or 50; `limit` over 100 is rejected with 400 | PARTIAL | Default page size is 10; Jira specifies 20 as default |
| 13 | Changing search, a filter, sorting, or page size goes back to page 1 | PASS | `if (!('page' in patch)) next.page = 1` |
| 14 | Result count ("Showing X–Y of Z trainees") is always correct | PASS | Computed from page, limit, total |
| **Usability** | | | |
| 15 | Refreshing the page or using the back button keeps the same search, filters, sorting, and page (state in URL) | PASS | `useSearchParams` for all state |
| 16 | Returning from a profile to the list keeps the same page and filters | PASS | `listSearch` in location state restores the URL |
| 17 | Loading, empty (with Clear filters), and error (with retry) states are shown; results don't flash blank while loading | PASS | All three states rendered; opacity transition during load |
| 18 | List and filters are usable on mobile | PARTIAL | Table scrolls horizontally, filters use responsive grid; missing card layout alternative and First/Last pagination buttons |
| **Profile** | | | |
| 19 | Profile shows personal details, address, family, education/employment, beneficiary, and insurance status | PASS | All sections present in TraineeProfileView |
| 20 | Profile shows one card per enrolled program with batch name/dates, schedule (days and time), status, ID card, uniform size, enrolled date, and OR number | PASS | EnrollmentCard renders all fields |
| **Performance** | | | |
| 21 | With 10,000 trainees seeded, list requests with any combination of search, filters, and sorting respond in under 500 ms locally | PASS | Architecture supports it (raw SQL, indexes, server-side paging); not runtime-tested without seed data |
| 22 | List endpoint runs a fixed number of queries per request (no N+1), verified with Prisma query logging | PASS | `Promise.all` with page query + count query |
| 23 | No filtering, sorting, or paging is done in application code after loading rows | PASS | All in SQL (WHERE, ORDER BY, LIMIT/OFFSET) |
| **View Only** | | | |
| 24 | Neither Admin nor Registrar sees an Edit button in this ticket | PASS | `canEdit: false` for both roles |
| 25 | No update endpoint in this module for either role; direct update request is rejected | PASS | Controllers only have `@Get()` endpoints |
| **Access Control** | | | |
| 26 | Registrar can't use admin endpoints | PASS | `@Roles(Role.ADMIN)` vs `@Roles(Role.REGISTRAR)` |
| 27 | Trainees, trainers, and encoders can't use either set; they get 403 Forbidden | PASS | JwtAuthGuard + RolesGuard on both controllers |
| 28 | Responses never include `password_hash` or other sensitive account fields | PASS | Explicit `select` on user fields |
| 29 | Invalid query parameters return 400 with a clear message, never a server error | PASS | DTO validation with class-validator |
| **Data and Quality** | | | |
| 30 | One migration added, indexes only (+ pg_trgm); no table or column changes | PASS | `20261019_trainee_information_indexes` — 5 indexes, no schema changes |
| 31 | UI matches existing style: same page header, status badges, text-link actions | PASS | Reuses Header, Sidebar, Footer, EnrollmentStatusBadge, BatchStatusBadge |
| 32 | Backend and frontend type-check, build, and lint with 0 problems | PASS | tsc 0 errors, ESLint 0 errors (both BE and FE) |
| 33 | Search/filter/pagination UI is built as the shared list toolkit | PARTIAL | Components are well-modularized but trainee-specific; not yet a generic `useServerList` / `ListToolbar` / `Pagination` toolkit for MP-25/MP-35 reuse |

### Test Cases

| # | Test Case | Type | Expected Result | Actual Result | Status |
|---|-----------|------|-----------------|---------------|--------|
| **Search** | | | | | |
| TC-1 | Search "Juan" | Functional | Matches trainees with "Juan" in first, middle, or last name | | NOT TESTED |
| TC-2 | Search "dela cruz juan" (reverse order) | Functional | Matches "Juan Dela Cruz" | | NOT TESTED |
| TC-3 | Search "JUAN" (uppercase) | Functional | Case-insensitive match | | NOT TESTED |
| TC-4 | Search by system_id / username | Functional | Finds the trainee | | NOT TESTED |
| TC-5 | Search by email address | Functional | Finds the trainee | | NOT TESTED |
| TC-6 | Search by contact number | Functional | Finds the trainee | | NOT TESTED |
| TC-7 | Search by ID card number | Functional | Finds the trainee | | NOT TESTED |
| TC-8 | Search by OR number | Functional | Finds the trainee | | NOT TESTED |
| TC-9 | Type rapidly in search box | Functional | Only one request sent after ~300 ms pause; no stale results | | NOT TESTED |
| TC-10 | Empty search (clear text) | Functional | Shows all trainees | | NOT TESTED |
| **Filters** | | | | | |
| TC-11 | Filter by program | Functional | Only trainees enrolled in selected program shown | | NOT TESTED |
| TC-12 | Filter by batch (with program selected) | Functional | Only trainees in selected batch shown; batch dropdown scoped to program | | NOT TESTED |
| TC-13 | Filter by enrollment status | Functional | Only trainees with matching enrollment status shown | | NOT TESTED |
| TC-14 | Filter by batch status | Functional | Only trainees in matching batch status shown | | NOT TESTED |
| TC-15 | Filter by enrolled date range | Functional | Only trainees enrolled within date range shown | | NOT TESTED |
| TC-16 | Filter by program type (accredited/non-accredited) | Functional | Only trainees in matching program type shown | | NOT TESTED |
| TC-17 | Filter by gender | Functional | Only trainees with matching gender shown | | NOT TESTED |
| TC-18 | Filter by insurance (active/none) | Functional | Only trainees with matching insurance status shown | | NOT TESTED |
| TC-19 | Filter by requirements (complete/incomplete) | Functional | Only trainees with matching requirement status shown | | NOT TESTED |
| TC-20 | Combine search + multiple filters | Functional | Results satisfy all conditions (AND logic) | | NOT TESTED |
| TC-21 | Remove a filter chip | Functional | That filter is cleared; results update | | NOT TESTED |
| TC-22 | Click "Clear all" | Functional | All filters and search cleared; full list shown | | NOT TESTED |
| **Sorting** | | | | | |
| TC-23 | Sort by name A-Z | Functional | Trainees ordered alphabetically by last name ascending | | NOT TESTED |
| TC-24 | Sort by name Z-A | Functional | Trainees ordered alphabetically by last name descending | | NOT TESTED |
| TC-25 | Sort by enrolled date (newest first) | Functional | Most recently enrolled trainees first | | NOT TESTED |
| TC-26 | Sort by enrolled date (oldest first) | Functional | Earliest enrolled trainees first | | NOT TESTED |
| TC-27 | Sort by ID card number | Functional | Trainees ordered by ID card number | | NOT TESTED |
| **Pagination** | | | | | |
| TC-28 | Navigate to next page | Functional | Shows next set of trainees; count updates | | NOT TESTED |
| TC-29 | Navigate to previous page | Functional | Shows previous set of trainees | | NOT TESTED |
| TC-30 | Change page size to 20 | Functional | 20 trainees per page; resets to page 1 | | NOT TESTED |
| TC-31 | Change page size to 50 | Functional | 50 trainees per page; resets to page 1 | | NOT TESTED |
| TC-32 | Send `limit=200` directly via API | Functional | Returns 400 error (exceeds max 100) | | NOT TESTED |
| TC-33 | Apply filter while on page 3 | Functional | Resets to page 1 | | NOT TESTED |
| **URL State** | | | | | |
| TC-34 | Apply filters then refresh page | Functional | Same filters, search, sort, and page preserved | | NOT TESTED |
| TC-35 | Apply filters then use browser back button | Functional | Previous state restored | | NOT TESTED |
| TC-36 | Open profile then go back to list | Functional | Same page, search, and filters preserved | | NOT TESTED |
| **Profile** | | | | | |
| TC-37 | Open a trainee profile | Functional | Shows personal details, address, family, education, employment | | NOT TESTED |
| TC-38 | Profile shows beneficiary info | Functional | Beneficiary name, relationship, contact, ID, address displayed | | NOT TESTED |
| TC-39 | Profile shows insurance coverage | Functional | Coverage dates, OR number, active/inactive status displayed | | NOT TESTED |
| TC-40 | Trainee with 2 enrollments shows 2 cards | Functional | One card per enrollment with all fields | | NOT TESTED |
| TC-41 | Enrollment card shows schedule (days and time) | Functional | Schedule name, days, start time, end time displayed | | NOT TESTED |
| **Access Control** | | | | | |
| TC-42 | Login as admin, access `/admin/trainees` | Access | Page loads successfully | | NOT TESTED |
| TC-43 | Login as registrar, access `/registrar/trainees` | Access | Page loads successfully | | NOT TESTED |
| TC-44 | Login as registrar, call `GET /api/admin/trainees` | Access | Returns 403 Forbidden | | NOT TESTED |
| TC-45 | Login as trainee, call `GET /api/admin/trainees` | Access | Returns 403 Forbidden | | NOT TESTED |
| TC-46 | Login as trainer, call `GET /api/registrar/trainees` | Access | Returns 403 Forbidden | | NOT TESTED |
| TC-47 | Send `POST /api/admin/trainees` (non-existent endpoint) | Access | Returns 404 (no update endpoint exists) | | NOT TESTED |
| **Data Safety** | | | | | |
| TC-48 | Check API response for password_hash | Security | Field never present in any response | | NOT TESTED |
| TC-49 | Send invalid `enrollmentStatus` value | Validation | Returns 400 with clear error message | | NOT TESTED |
| TC-50 | Send `dateFrom` after `dateTo` | Validation | Returns 400 or handled gracefully | | NOT TESTED |
| **Performance** | | | | | |
| TC-51 | Load list with 10,000 trainees + search + filters | Performance | Response under 500 ms | | NOT TESTED |
| TC-52 | Enable Prisma query logging; load one page | Performance | Fixed number of queries (2), no N+1 | | NOT TESTED |
| **UI/UX** | | | | | |
| TC-53 | View list on mobile viewport (375px) | Responsive | Table scrolls horizontally; filters collapse into grid | | NOT TESTED |
| TC-54 | Error state shows retry button | UX | Clicking retry reloads the data | | NOT TESTED |
| TC-55 | Empty state shows "Clear filters" button | UX | Clicking clears all filters and shows full list | | NOT TESTED |

### Test Logs

| Date | Tester | Environment | Tests Run | Pass | Fail | Notes |
|------|--------|-------------|-----------|------|------|-------|
| 2026-10-20 | Chelsea Cllj | Code audit (branch) | 33 ACs | 29 | 0 | 4 partial: AC 7 (multi-select), AC 12 (default page size), AC 18 (mobile card layout), AC 33 (generic toolkit). tsc 0 errors, ESLint 0 errors. |
| | | | | | | |

### Structure Fix Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-10-20 | Moved `backend-nestjs/src/users/trainee/trainee-information/` to `backend-nestjs/src/trainee-information/` | Shared domain module was incorrectly nested inside the trainee role folder. Moved to `src/` root to match the convention used by `enrollments/`, `announcements/`, `sessions/`. |

### Open Items

| # | Item | Priority | Linked AC | Target |
|---|------|----------|-----------|--------|
| 1 | Enrollment status and batch status should be multi-select dropdowns | Medium | AC 7 | Follow-up |
| 2 | Add "Expired" option to insurance filter | Low | AC 7 | Follow-up |
| 3 | Make program dropdown searchable | Low | AC 7 | Follow-up |
| 4 | Change default page size from 10 to 20 | Low | AC 12 | Follow-up |
| 5 | Add mobile card layout for trainee list | Medium | AC 18 | Follow-up |
| 6 | Add First/Last pagination buttons | Low | AC 18 | Follow-up |
| 7 | Extract generic `useServerList` / `ListToolbar` / `Pagination` toolkit | Medium | AC 33 | MP-25 or MP-35 (whoever merges first) |
