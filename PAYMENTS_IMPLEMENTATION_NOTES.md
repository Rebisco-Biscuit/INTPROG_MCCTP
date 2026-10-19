# Payments Module: Implementation and Acceptance Review

## Purpose and Scope

The Payments module records and views official receipts for the four external dues reasons: Processing Fee, Uniform/ID Fee, Assessment Deposit, and External Fees. Admin and Registrar share the same backend service and frontend list/form components; each role has a thin protected controller and page wrapper.

This note reflects the current source/worktree review. “Implemented” describes code present in the workspace; it does not imply that a migration has been applied, a live database has been tested, or the feature has been merged.

## Implemented

### Routes, roles, and reuse

- Admin page: `/admin/payments`; Registrar page: `/registrar/payments`.
- Both are protected by their role-specific frontend routes and backend `Roles` guards.
- Both backend controllers delegate to [PaymentsService](backend-nestjs/src/payments/payments.service.ts).
- Both pages pass their role to the shared [PaymentListPage](frontend/src/components/payments/PaymentListPage.tsx) and [PaymentFormModal](frontend/src/components/payments/PaymentFormModal.tsx).
- The Payments pages are lazy-loaded from [AppRouter.tsx](frontend/src/routes/AppRouter.tsx). Sidebar links are in [Sidebar.tsx](frontend/src/components/layout/Sidebar.tsx).
- Static trainee/filter option routes are registered before the dynamic receipt-detail route in both controllers.

### Recording receipts

- Trainee suggestions are fetched asynchronously after a 300 ms debounce, are not loaded as a full trainee list, and are limited to 10 enrolled matches.
- Search supports partial, case-insensitive, order-independent name terms and system ID. The portal uses `system_id` as the login name.
- Only `ENROLLED` enrollments are offered/accepted. No-enrollment trainees cannot submit a payment.
- The form records enrollment, one of the four external reasons, base fee, amount, payment method, date, and optional remarks. Amount input is validated as a positive decimal with at most two fractional digits and is sent as a string.
- The Save action is disabled during submission and when required values are invalid. The form creates one UUID idempotency key on mount and retains it across retries.
- The backend records the authenticated Admin/Registrar as `confirmed_by`; payment creation does not create or alter insurance coverage.
- Duplicate idempotency keys return the existing receipt. A concurrent duplicate-key conflict is checked after the transaction; OR-number unique conflicts without a matching key map to HTTP 409.

### OR numbers

- Payments and enrollment-created receipts call the shared [generateOrNumber helper](backend-nestjs/src/payments/or-number.ts).
- The helper atomically upserts/increments the existing `or_number_seq` model inside the same transaction that creates the receipt and returns `OR-{year}-{sequence padded to six digits}`. The year is derived in UTC from the payment date.
- Existing OR values are not rewritten by application code.

### List, search, filters, and details

- The list is server-paginated and requests only the selected page. It returns page metadata and computes filtered count and amount in the database using `count` and `aggregate`.
- The list query and response select only fields displayed in the table; detail is fetched separately and includes trainee, program, batch, reason, base fee, amount, method, date, remarks, and confirming staff display name. User queries select no password hash.
- Search covers OR number, partial trainee name in either order, and system ID. Search/filter/sort/page values are kept in the URL.
- The shared [useServerList hook](frontend/src/hooks/useServerList.ts) debounces requests, aborts stale list requests, and retains prior data while a request is pending. [ListToolbar](frontend/src/components/common/ListToolbar.tsx) and [Pagination](frontend/src/components/common/Pagination.tsx) are used by Payments.
- Reason and payment-method filters are multi-select. Program, batch, date-range, and confirming-staff filters combine with them and search. Batch choices are narrowed by selected program. Active values are removable and Clear all resets URL state.
- Sorting is whitelisted for payment date, amount, and OR number. All three sort fields have indexes in the task-scoped schema/migration. The default is newest payment date first; amount/date sorts include deterministic secondary ordering.
- After a successful save, the shared list is refreshed. Both role pages lazy-load separately.
- The shared module keeps the app's slate/blue administrative styling, square bordered controls/panels, responsive modal sizing, common site header/sidebar/footer, and a text-link OR action.

### Validation and money

- [PaymentListQueryDto](backend-nestjs/src/payments/dto/payment-query.dto.ts) validates query values, including multi-select enum values, UUID filters, date strings, pagination bounds, and sort fields. `limit > 100` is rejected rather than silently clamped; reversed date ranges return HTTP 400.
- [CreatePaymentDto](backend-nestjs/src/payments/dto/create-payment.dto.ts) validates required IDs, UUID idempotency key, allowed enum values, dates, and positive decimal strings.
- Prisma Decimal values are serialized as fixed two-decimal strings. The frontend formats display values with `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`; it does not add or otherwise calculate payment amounts.

### Filter options

- Programs, batches, and Admin/Registrar staff are selected from Prisma with display-only fields.
- Method/reason options reflect the four allowed methods and external reasons. Labels are human-readable (`GCash`, `Uniform/ID Fee`, etc.); `ENROLLMENT` is not offered.
- Filter-option failures are surfaced in the page rather than silently leaving empty dropdowns.

## Schema and Database State

The task explicitly requires a sequence table, idempotency field, and indexes. The current schema and one Payments migration contain those task-scoped additions:

- [schema.prisma](backend-nestjs/prisma/schema.prisma) includes `official_receipts.idempotency_key`, `or_number_seq`, and receipt indexes for payment date, created date, amount, OR number search, reason, method, and confirmer.
- The schema declares `pg_trgm` and GIN trigram indexes for `users.first_name`, `users.last_name`, `users.system_id`, and `official_receipts.or_number`, supporting the case-insensitive substring searches used by the API. The `system_id` index covers the portal's username/login field; the OR-number index covers partial OR searches.
- [20261019_payments_or_sequence/migration.sql](backend-nestjs/prisma/migrations/20261019_payments_or_sequence/migration.sql) is present in the worktree.
- The unrelated enrollment/trainee uniqueness map and formatting changes seen during the earlier review were restored; the current Prisma diff is limited to Payments-required extension/index/sequence/idempotency declarations.
- `npx prisma validate` and `npx prisma generate` passed against this schema. No migration was applied to a local or shared database, and no data/table state was queried. The target database must receive the reviewed migration before the feature can use the new sequence/idempotency structures.
- The migration uses `CREATE EXTENSION IF NOT EXISTS pg_trgm` and `CREATE ... INDEX IF NOT EXISTS` statements. Confirm the deployment role may install `pg_trgm` and review the migration against the target database before applying it. No `prisma migrate dev` command was used.

## Acceptance Checklist

| Requirement | Current status | Notes |
|---|---|---|
| Admin and Registrar routes, role guards, shared UI/service | Implemented | Build-checked; not browser-tested for both roles in this pass. |
| Async trainee picker, 300 ms debounce, max 10, enrolled only | Implemented | API-backed; live database behavior not exercised. |
| Four external reasons and four payment methods | Implemented | `ENROLLMENT` excluded from payment UI/service allowlist. |
| Required fields, validation, confirmed staff, no insurance side effect | Implemented in code | Requires database-backed workflow verification. |
| Atomic yearly OR sequence shared with enrollment flow | Implemented in code; DB-dependent | Depends on `or_number_seq` existing in the target database. Parallel saves were not tested. |
| Same idempotency key returns existing receipt | Implemented in code | Concurrency/retry behavior was not integration-tested against PostgreSQL. |
| Server list, totals, detail endpoint, no sensitive fields | Implemented in code | Three fixed Prisma operations (page query, count, aggregate); no query-in-map pattern. Query logging was not run to verify runtime counts. |
| Search, URL state, stale-list cancellation, multi-select filters/chips | Implemented | UI build/lint passed; full browser workflow not run. |
| Pagination 10/20/50 and limit cap 100 | Implemented | DTO returns 400 above 100; page navigation preserves requested page. |
| Sort only indexed columns | Implemented in schema/migration | The whitelist is payment date, amount, and OR number; each has a corresponding index. |
| pg_trgm indexes for partial search | Implemented in schema/migration | GIN trigram indexes cover first name, last name, system ID, and OR number. Migration still needs review/application. |
| Under-500 ms with 50,000 receipts and Prisma query logging | **Not tested** | Requires representative database seed, logging, and timing. |
| Parallel receipt writes and double-click test | **Not tested against DB/browser** | Code uses atomic upsert and persistent idempotency key, but the acceptance test remains outstanding. |
| Migration reviewed/applied exactly once | **Not completed** | One Payments migration file is present; it was not applied or reviewed against the live DB in this pass. |
| Full Admin/Registrar end-to-end acceptance | **Not completed** | No authenticated browser session was shared for this pass. |

## Verification Performed

- `npx prisma validate` passed after adding `pg_trgm` and GIN opclass declarations; `npx prisma generate` completed successfully. No migration was applied.
- Final backend `npm run build` passed. The separate non-emitting TypeScript check also passed.
- Backend Jest suite: 2 suites passed, 2 tests passed. These are the repository’s existing tests, not Payments integration/concurrency tests.
- Targeted backend ESLint passed with no output.
- Frontend `npm run build` passed after the final UI changes. Vite still reports the existing `__dirname` config warning and a bundle-size warning.
- Targeted frontend ESLint passed with no output.
- No `prisma migrate dev`, migration application, seed, live database query, performance benchmark, or browser-level workflow was run.

## Files Changed by the Payments Work

- Backend shared service, sequence helper, DTOs, module, and role controllers under [backend-nestjs/src/payments](backend-nestjs/src/payments) and each role’s `payments` controller folder.
- Enrollment OR-number call site in [enrollments.service.ts](backend-nestjs/src/enrollments/enrollments.service.ts).
- Shared API, list/form, list hook/toolbar/pagination, role wrappers, router, and sidebar under [frontend/src](frontend/src).
- This note: [PAYMENTS_IMPLEMENTATION_NOTES.md](PAYMENTS_IMPLEMENTATION_NOTES.md).

The worktree also contains pre-existing unrelated changes (including `backend-nestjs/package.json` and `frontend/src/pages/users/registrar/batches/BatchManagement.tsx`). They were not modified or reverted as part of this review.
