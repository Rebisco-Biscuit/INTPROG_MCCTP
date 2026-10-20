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

## Summary: 12/12 PASS
