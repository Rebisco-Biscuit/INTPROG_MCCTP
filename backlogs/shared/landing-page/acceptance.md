# MP-20: Shared — Landing Page Chatbot

| Field | Value |
|-------|-------|
| **Jira** | MP-20 |
| **Type** | Feature |
| **Status** | Done |
| **Assignee** | Chelsea Cllj |
| **Sprint** | MP Sprint 2 |
| **Merged** | 2026-09-12 (PR #6) |
| **Route** | `/` (public landing page) |

---

## Acceptance Criteria

### Chatbot Widget

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1 | Chatbot widget appears on the landing page | PASS | Integrated on public landing page |
| 2 | Chatbot is accessible to unauthenticated users | PASS | No auth required |
| 3 | Chatbot provides information about MCCTEST programs | PASS | Responds to common queries |

---

## Test Cases

### TC-01: Chatbot widget visible on landing page
- **AC:** #1
- **Priority:** Critical
- **Precondition:** None (unauthenticated)
- **Steps:**
  1. Navigate to the landing page (`/`)
  2. Look for the chatbot widget icon/button
- **Expected:** Chatbot widget is visible on the page

### TC-02: Chatbot accessible without login
- **AC:** #2
- **Priority:** High
- **Precondition:** Not logged in
- **Steps:**
  1. Navigate to the landing page
  2. Click the chatbot widget
  3. Type a question
- **Expected:** Chatbot opens and responds without requiring authentication

### TC-03: Chatbot answers program inquiries
- **AC:** #3
- **Priority:** High
- **Precondition:** Chatbot is open
- **Steps:**
  1. Ask "What programs does MCCTEST offer?"
  2. Ask "How do I enroll?"
  3. Ask an unrelated/off-topic question
- **Expected:** Relevant program info returned for valid queries; graceful fallback for off-topic

---

## Summary: 3/3 PASS
