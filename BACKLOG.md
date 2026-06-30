# Arcade Academy Backlog

## Purpose
Single source of truth for:
- current sprint execution
- next sprint planning
- future candidates
- shipped change log entries

## Workflow Rules
- Every new task gets a unique ID (`AA-###`).
- Keep tasks small, testable, and MVP-scoped.
- Move tasks through: `todo -> in_progress -> qa -> done`.
- Every completed task gets a short log line in `Change Log`.
- Non-blocking ideas go to `Future / Icebox`, not current sprint.

## Definition of Ready
- Problem and user value are clear in 1-2 lines.
- Scope is bounded to one sprint-sized deliverable.
- Acceptance criteria are testable and unambiguous.
- Dependencies and owning agent are identified.
- Out-of-scope is explicitly listed.

## Definition of Done
- Acceptance criteria are met and verified.
- QA result is recorded (`PASS` / `PARTIAL` / `FAIL`) with evidence.
- No blocker warnings/errors introduced in touched scope.
- Backlog status is updated and `Change Log` entry is added.
- Follow-up items (if any) are captured as new backlog tasks.

## Sprint Now (Active)

### AA-101 - Golden Path Vertical Slice Proof
- Status: done
- Owner: product/core team
- Scope: onboarding -> home PLAY -> quiz(5) -> result -> home with visible progression
- Acceptance:
  - end-to-end flow validated
  - persistence behavior verified
  - QA gate documented
- Notes:
  - Implemented and QA PASS confirmed via simulator + logs

### AA-102 - Expo Router Warning Cleanup (`iconPath`)
- Status: done
- Owner: architecture/frontend
- Scope: remove route registration warning for `app/lib/iconPath.ts`
- Acceptance:
  - warning removed by moving utility outside route tree
  - imports updated
  - no regression in icon manifest test
- Notes:
  - `app/lib/iconPath.ts` removed
  - `lib/iconPath.ts` added

### AA-301a - Result reject UX feedback
- Status: done
- Gate: PASS
- Notes:
  - Reject-case toont expliciete toast + inline feedback.
  - Alleen veilige CTA “Terug naar Home”.
  - Geen reward writes in reject-path.

### AA-302 - Onboarding dependency correction (level -> grade)
- Status: done
- Gate: PASS
- Owner: architecture/frontend
- Scope:
  - Onboarding routevolgorde corrigeren naar `name -> level -> grade -> goal`.
  - Grade-step guard toevoegen als `level` ontbreekt.
- Acceptance:
  - Grade-opties altijd level-afhankelijk.
  - Geen dead-end of loop in onboarding flow.
  - Onboarding gate gedrag blijft correct.
- Notes:
  - Route order fixed: `name -> level -> grade -> goal`.
  - Grade guard added: missing level redirects to level step.
  - Regression tests pass + manual smoke pass.

## Sprint Next

### Sprint Goal
Ship telemetry and governance hardening for the proven golden path without expanding into remote sync implementation.

### Execution Order
1. AA-103 - Analytics taxonomy alignment
2. AA-104 - Backend sync rule parity
3. AA-105 - Golden path regression pack expansion

### AA-103 - Analytics Taxonomy Alignment
- Status: done
- Gate: PASS
- Owner: analytics/frontend
- Scope: align event names with canonical taxonomy
- Why now: removes ambiguity in KPI reporting and release decisions
- Target changes:
  - `quiz_start` -> `quiz_started`
  - `quiz_answer` -> `question_answered`
  - `quiz_finish` -> `quiz_completed`
- Dependencies:
  - current analytics emitters in `app/quiz-screen.tsx`, `app/result-screen.tsx`, `app/(tabs)/home/index.tsx`
  - QA replay of one full golden-path run
- Acceptance:
  - no duplicate logging
  - dashboard mapping updated
  - QA verifies event stream in one full run
- Notes:
  - Core loop emits migrated to canonical names (`quiz_started`, `question_answered`, `quiz_completed`).
  - KPI dashboard supports legacy + canonical names during transition.
  - Live simulator check passed: canonical event stream confirmed.

### AA-104 - Backend Sync Rule Parity (`06-backend-sync.mdc`)
- Status: todo
- Owner: product/architecture/security
- Scope: add missing Cursor rule for sync/offline/conflict trust boundaries
- Why now: closes governance gap found during QA handoff
- Dependencies:
  - existing `.cursor/rules/04-security-privacy.mdc`
  - AGENTS non-negotiables in `AGENTS.md`
- Acceptance:
  - rule exists in `.cursor/rules/06-backend-sync.mdc`
  - no contradiction with security/privacy rule

### AA-105 - Golden Path Regression Pack Expansion
- Status: todo
- Owner: QA
- Scope: add/expand tests for result-commit semantics and progression visibility assumptions
- Why now: locks in behavior proven in simulator smoke run
- Dependencies:
  - result commit behavior in `app/result-screen.tsx`
  - quiz run/session behavior in `app/quiz-screen.tsx` and `contexts/UserContext.tsx`
- Acceptance:
  - explicit tests for completion commit path independent of Home tap
  - stable pass in CI/local

## Future / Icebox

### AA-201 - Remote Sync (Post-MVP)
- Status: todo
- Scope: server-backed progress durability + conflict strategy

### AA-202 - Economy Hardening (Post-MVP)
- Status: todo
- Scope: move economy-critical writes behind server authority

### AA-203 - Telemetry Governance Dashboard
- Status: todo
- Scope: event quality gates and release blockers for missing core events

## Change Log
- 2026-03-17 - AA-101 done - Golden path implemented and validated (`PASS`).
- 2026-03-17 - AA-102 done - Expo Router warning fixed by moving `iconPath` utility out of `app/`.
- 2026-03-17 - AA-301a done - Reject-path UX hardening added (`PASS`).
- 2026-03-17 - AA-302 done - Onboarding dependency flow corrected (`name -> level -> grade -> goal`) and smoke-validated (`PASS`).
- 2026-03-17 - AA-103 done - Analytics taxonomy migrated to canonical quiz events and live-validated (`PASS`).
- 2026-06-30 - MVP launch gate gesloten - iOS smoke matrix volledig doorlopen (PASS). GO voor internal beta. Android public release blijft geblokkeerd.
