# MP-26: Trainee — Account Generation After Enrollment

| Field | Value |
|-------|-------|
| **Jira** | MP-26 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Chelsea Cllj |
| **Sprint** | MP Sprint 3 |
| **Merged** | 2026-09-30 (PR #14) |

---

## Acceptance Criteria

### Account Creation

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Enrolling a new trainee creates a TRAINEE user account + trainee record in same transaction | PASS | Atomic with enrollment |
| 2 | If enrollment fails, no account is left behind | PASS | Transaction rollback |
| 3 | Re-enrolling existing trainee doesn't create a new account | PASS | Same username/password kept |
| 4 | One user account has exactly one trainee record (DB enforced) | PASS | UNIQUE(users_id) constraint |

### Username Generation

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 5 | Username format: first3.lastname_mcctest (lowercase, letters only, accents/n converted) | PASS | Verified: mar.maryl_mcctest, tes.delacruz_mcctest |
| 6 | Duplicate usernames get a number: _mcctest2, _mcctest3, etc. | PASS | Verified: tes.delacruz_mcctest2 |
| 7 | Simultaneous enrollments of same-name people don't fail | PASS | Retry picks next free number |
| 8 | Name with no letters is rejected with clear error | PASS | Validation error |

### Password & UI

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 9 | New accounts get default password `traineedefault`, stored hashed (bcrypt) | PASS | Defined in one backend location |
| 10 | Success screen shows Trainee Portal Login box | PASS | Username + password for new; "Unchanged" for existing |
| 11 | Dashboards show logged-in user's real username | PASS | Replaced hardcoded MCCTP-26-002 |

### Backward Compatibility

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 12 | Existing MCCTEST_ usernames unchanged | PASS | No migration of old usernames |

---

## Verified on Live Database

| Username | Result |
|----------|--------|
| `mar.maryl_mcctest` | Created correctly |
| `tes.delacruz_mcctest` | Created correctly |
| `tes.delacruz_mcctest2` | Duplicate handled correctly |
| MaryF re-enrollment | Kept same account |

---

## Follow-up (Not in Scope)

- Force trainee to change default password on first login

---

## Test Cases

### TC-01: New trainee account created on enrollment
- **AC:** #1
- **Priority:** Critical
- **Precondition:** Logged in as registrar; new trainee not in system
- **Steps:**
  1. Start enrollment wizard for a new trainee (e.g. "Mary Lozada")
  2. Complete all steps and submit
  3. Check `users` table and `trainees` table in database
- **Expected:** User row with role TRAINEE + trainee row created in same transaction

### TC-02: Failed enrollment leaves no orphaned account
- **AC:** #2
- **Priority:** Critical
- **Precondition:** New trainee enrollment
- **Steps:**
  1. Start enrollment for a new trainee
  2. Trigger a failure (e.g. duplicate batch enrollment)
  3. Check `users` and `trainees` tables
- **Expected:** No user or trainee record created; transaction rolled back

### TC-03: Re-enrollment keeps existing account
- **AC:** #3
- **Priority:** High
- **Precondition:** Trainee "Mary Lozada" already enrolled in Batch A
- **Steps:**
  1. Enroll "Mary Lozada" into a different Batch B
  2. Check the user account
- **Expected:** Same username and password retained; no new user created

### TC-04: One user = one trainee record (DB enforced)
- **AC:** #4
- **Priority:** High
- **Precondition:** Database access
- **Steps:**
  1. Attempt to insert a second trainee record with the same `users_id`
- **Expected:** UNIQUE constraint violation error

### TC-05: Username format correct
- **AC:** #5
- **Priority:** High
- **Precondition:** New trainee named "Maria Teresa Dela Cruz"
- **Steps:**
  1. Enroll the trainee
  2. Check the generated username
- **Expected:** Username = `mar.delacruz_mcctest` (first 3 of first name, lowercase, letters only)

### TC-06: Duplicate username gets incremented suffix
- **AC:** #6
- **Priority:** High
- **Precondition:** `tes.delacruz_mcctest` already exists
- **Steps:**
  1. Enroll another trainee named "Tessa Dela Cruz"
  2. Check the generated username
- **Expected:** Username = `tes.delacruz_mcctest2`

### TC-07: Concurrent same-name enrollments succeed
- **AC:** #7
- **Priority:** Medium
- **Precondition:** Two registrars enrolling trainees with the same name simultaneously
- **Steps:**
  1. Submit both enrollments at the same time
- **Expected:** Both succeed with different username suffixes (no collision)

### TC-08: Name with no letters rejected
- **AC:** #8
- **Priority:** Medium
- **Precondition:** None
- **Steps:**
  1. Enter a trainee name with only numbers/symbols (e.g. "123 456")
  2. Submit enrollment
- **Expected:** Validation error: name must contain letters

### TC-09: Default password set correctly
- **AC:** #9
- **Priority:** Critical
- **Precondition:** New trainee enrolled
- **Steps:**
  1. Attempt to log in as the new trainee with password `traineedefault`
- **Expected:** Login succeeds; password stored as bcrypt hash in database

### TC-10: Success screen shows login credentials
- **AC:** #10
- **Priority:** High
- **Precondition:** Enrollment just completed
- **Steps:**
  1. Observe the success screen after enrollment
- **Expected:** Shows Trainee Portal Login box with username and default password (new) or "Unchanged" (re-enrollment)

### TC-11: Dashboard shows real username
- **AC:** #11
- **Priority:** Medium
- **Precondition:** Logged in as trainee
- **Steps:**
  1. Check the dashboard header/profile area
- **Expected:** Shows the actual generated username (not hardcoded placeholder)

### TC-12: Existing MCCTEST_ usernames untouched
- **AC:** #12
- **Priority:** Medium
- **Precondition:** Legacy accounts with MCCTEST_ prefix exist
- **Steps:**
  1. Check legacy accounts in the database after new enrollments
- **Expected:** Old MCCTEST_ usernames unchanged; no migration applied

---

## Summary: 12/12 PASS
