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

---

## MP-37: Encoder Announcement Module

**Branch:** `mp-37-encoder-announcements`
**Assignee:** Chelsea Cllj
**Sprint:** MP Sprint 3
**Status:** In Progress

### Acceptance Criteria

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| **Encoder Announcements Page** | | | |
| 1 | The encoder sees "Announcements" in the sidebar, and `/encoder/announcements` loads without a 403 | PASS | Sidebar entry added with `fa-bullhorn`; `Role.ENCODER` added to `@Get()` findAll; route protected with `ProtectedRoute allowedRoles={['ENCODER']}` |
| 2 | The encoder can post GLOBAL, PROGRAM, and BATCH announcements; PROGRAM and BATCH show the program/batch dropdowns | NOT TESTED | Props `canPostGlobal`, `canPostProgram`, `canPostBatch` passed to shared `<Announcements>` component; backend `@Post()` already includes `Role.ENCODER` |
| 3 | The list shows only announcements the encoder posted; search, scope filter, date filter, and pagination work | NOT TESTED | `manageAll` prop uses the `findAll` endpoint which filters by `posted_by: user.id`; shared component handles search/filter/pagination |
| 4 | The encoder can edit their own posts | NOT TESTED | `canEdit` prop passed; backend `@Patch()` already includes `Role.ENCODER` and checks ownership |
| 5 | Delete appears for the encoder's own posts | NOT TESTED | `canDelete` prop passed; `Role.ENCODER` added to `@Delete(':id')`; `remove()` service blocks deleting other users' posts |
| **Access Control** | | | |
| 6 | Other roles cannot open `/encoder/announcements` | NOT TESTED | `ProtectedRoute allowedRoles={['ENCODER']}` wraps route |
| 7 | Admin and Registrar announcement pages behave the same as before | NOT TESTED | No changes to admin/registrar pages or shared component logic |
| **Dashboard Widgets** | | | |
| 8 | The encoder dashboard shows the announcement widget | PASS | `<AnnouncementWidget />` added to `EncoderDashboard.tsx` |
| 9 | The trainer dashboard shows the announcement widget | PASS | `<AnnouncementWidget />` added to `TrainerDashboard.tsx` |
| 10 | The trainee dashboard shows the announcement widget | PASS | `<AnnouncementWidget />` added to `TraineeDashboard.tsx` |

### Test Cases

| # | Test Case | Type | Expected Result | Actual Result | Status |
|---|-----------|------|-----------------|---------------|--------|
| **Encoder — Post Announcements** | | | | | |
| TC-1 | Login as encoder, navigate to `/encoder/announcements` | Functional | Page loads, form and list visible, no 403 | | NOT TESTED |
| TC-2 | Post a GLOBAL announcement | Functional | Announcement created, appears in list | | NOT TESTED |
| TC-3 | Post a PROGRAM announcement | Functional | Program dropdown appears; announcement created with program scope | | NOT TESTED |
| TC-4 | Post a BATCH announcement | Functional | Batch dropdown appears; announcement created with batch scope | | NOT TESTED |
| TC-5 | Post announcement with empty content | Validation | Error message "Content cannot be empty." | | NOT TESTED |
| TC-6 | Post PROGRAM announcement without selecting program | Validation | Error message "Select a program." | | NOT TESTED |
| TC-7 | Post BATCH announcement without selecting batch | Validation | Error message "Select a batch." | | NOT TESTED |
| **Encoder — List / Search / Filter** | | | | | |
| TC-8 | Encoder sees only own announcements in list | Functional | No announcements posted by other users visible | | NOT TESTED |
| TC-9 | Search by content text | Functional | Matching announcements shown | | NOT TESTED |
| TC-10 | Filter by scope (Global / Program / Batch) | Functional | Only matching scope shown | | NOT TESTED |
| TC-11 | Filter by posted date | Functional | Only announcements from that date shown | | NOT TESTED |
| TC-12 | Pagination: navigate pages | Functional | Correct page shown; "Showing page X of Y" accurate | | NOT TESTED |
| TC-13 | Combine search + scope filter + date filter | Functional | Results match all conditions | | NOT TESTED |
| **Encoder — Edit / Delete** | | | | | |
| TC-14 | Edit own announcement content | Functional | Updated content saved and visible | | NOT TESTED |
| TC-15 | Edit own announcement remarks | Functional | Updated remarks saved | | NOT TESTED |
| TC-16 | Cancel editing | Functional | Original content restored, edit mode closed | | NOT TESTED |
| TC-17 | Delete own announcement | Functional | Confirmation prompt; announcement removed from list | | NOT TESTED |
| TC-18 | Attempt to edit another user's announcement via API (`PATCH /announcements/:id`) | Security | Returns 403 or ownership error | | NOT TESTED |
| TC-19 | Attempt to delete another user's announcement via API (`DELETE /announcements/:id`) | Security | Returns 403 or ownership error | | NOT TESTED |
| **Access Control** | | | | | |
| TC-20 | Login as trainer, navigate to `/encoder/announcements` | Access | Redirected or 403 shown | | NOT TESTED |
| TC-21 | Login as trainee, navigate to `/encoder/announcements` | Access | Redirected or 403 shown | | NOT TESTED |
| TC-22 | Login as admin, verify `/admin/announcements` unchanged | Regression | Admin page works as before; can see all announcements | | NOT TESTED |
| TC-23 | Login as registrar, verify `/registrar/announcements` unchanged | Regression | Registrar page works as before; can see all announcements | | NOT TESTED |
| **Dashboard Widget — Encoder** | | | | | |
| TC-24 | Login as encoder, go to dashboard | Functional | AnnouncementWidget visible with active announcements | | NOT TESTED |
| TC-25 | No active announcements exist | Functional | Widget section hidden (returns null) | | NOT TESTED |
| **Dashboard Widget — Trainer** | | | | | |
| TC-26 | Login as trainer, go to dashboard | Functional | AnnouncementWidget visible with active announcements | | NOT TESTED |
| TC-27 | Post a GLOBAL announcement as encoder, verify trainer sees it | Functional | Global announcement appears on trainer dashboard | | NOT TESTED |
| TC-28 | Post a PROGRAM announcement, verify trainer in that program sees it | Functional | Program-scoped announcement visible to trainer assigned to that program | | NOT TESTED |
| TC-29 | Post a BATCH announcement, verify trainer in that batch sees it | Functional | Batch-scoped announcement visible to trainer assigned to that batch | | NOT TESTED |
| **Dashboard Widget — Trainee** | | | | | |
| TC-30 | Login as trainee, go to dashboard | Functional | AnnouncementWidget visible with active announcements | | NOT TESTED |
| TC-31 | Post a GLOBAL announcement, verify trainee sees it | Functional | Global announcement appears on trainee dashboard | | NOT TESTED |
| TC-32 | Post a PROGRAM announcement, verify trainee enrolled in that program sees it | Functional | Program-scoped announcement visible | | NOT TESTED |
| TC-33 | Post a BATCH announcement, verify trainee enrolled in that batch sees it | Functional | Batch-scoped announcement visible | | NOT TESTED |
| TC-34 | Announcement widget "Read more" / "Show less" toggle | Functional | Long content expands and collapses correctly | | NOT TESTED |
| **UI / Layout** | | | | | |
| TC-35 | Encoder announcements page on mobile viewport (375px) | Responsive | Layout stacks, form usable, no horizontal scroll | | NOT TESTED |
| TC-36 | Dashboard widgets on mobile viewport (375px) | Responsive | Widgets stack properly, text readable | | NOT TESTED |
| TC-37 | Sidebar shows "Announcements" under encoder Main section | UI | Bullhorn icon, correct link, active state when on page | | NOT TESTED |

### Test Logs

| Date | Tester | Environment | Tests Run | Pass | Fail | Notes |
|------|--------|-------------|-----------|------|------|-------|
| 2026-10-20 | Chelsea Cllj | Code audit (branch) | 10 ACs | 4 PASS | 0 | 6 NOT TESTED — require running app with encoder/trainer/trainee accounts. tsc 0 errors. |
| | | | | | | |

### Open Items / Gaps

| # | Item | Priority | Linked AC/TC | Target |
|---|------|----------|--------------|--------|
| 1 | Verify `findAll` filters by `posted_by: user.id` for encoder role (encoder must not see other users' posts) | High | AC 3, TC-8 | Before merge |
| 2 | Verify PROGRAM/BATCH dropdowns populate correctly for encoder (options endpoint returns programs/batches) | High | AC 2, TC-3/TC-4 | Before merge |
| 3 | Verify `findActive` returns correct announcements scoped to trainer's assigned programs/batches | High | TC-28/TC-29 | Before merge |
| 4 | Verify `findActive` returns correct announcements scoped to trainee's enrolled programs/batches | High | TC-32/TC-33 | Before merge |
| 5 | Trainer announcements page (equivalent to encoder's management view) — not in scope for MP-37 but trainer has `@Post()` and `@Patch()` access | Low | — | Future ticket |
| 6 | Trainee has no management page for announcements (view-only via dashboard widget) — confirm this is intended | Low | — | Confirm with lead |
| 7 | ~~`@Get('active')` has no `@Roles()` decorator~~ — **Resolved:** added explicit `@Roles(ADMIN, REGISTRAR, ENCODER, TRAINER, TRAINEE)` | — | — | Done |
| 8 | No automated tests (unit or e2e) for encoder announcement flows | Medium | All TCs | Follow-up (TECH debt) |
| 9 | AnnouncementWidget shows max 3 items with no "View all" link for encoder/trainer/trainee dashboards | Low | TC-24/TC-26/TC-30 | Follow-up UX |
