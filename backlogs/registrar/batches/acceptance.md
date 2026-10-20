# MP-15: Registrar — Batch Configuration Module

| Field | Value |
|-------|-------|
| **Jira** | MP-15 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Aubrien Fuentes |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-19 (PR #7) |
| **Route** | `/registrar/batches` |

---

## Acceptance Criteria

### CRUD & Display

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Registrar can view all batches in a table with program/status filters | PASS | BatchTable with filters |
| 2 | Batch code is auto-generated (from DB trigger) and displayed read-only | PASS | trg_set_batch_code trigger |
| 3 | Registrar can create a batch — program and trainer dropdowns pull live data | PASS | Live API data, no hardcoded values |
| 4 | Slot availability counter shows enrolled vs max slots | PASS | Remaining slots displayed |

### Business Rules

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 5 | Batch status can only advance forward (upcoming → ongoing → completed), not backward | PASS | Forward-only transitions enforced |
| 6 | Editing ongoing/completed batch restricted to non-critical fields only | PASS | Critical fields locked |

---

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/registrar/batches` | List batches (with filters) |
| GET | `/registrar/batches/:id` | Batch details + enrollment count |
| POST | `/registrar/batches` | Create batch (code auto-generated) |
| PATCH | `/registrar/batches/:id` | Update batch |
| PATCH | `/registrar/batches/:id/status` | Advance status |

---

## Summary: 6/6 PASS
