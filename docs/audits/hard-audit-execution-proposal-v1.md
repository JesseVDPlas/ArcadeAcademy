# Hard Audit Execution Proposal V1

## Round 3 - Architecture ownership matrix

| Domain | Current reality | Target owner (safe-first) | Immediate action |
|---|---|---|---|
| Token balance | `UserContext.tokens` + `TokenContext.balance` | `TokenContext` | Deprecate/remove `UserContext` token writes and legacy action path |
| Quiz run session | Screen state + `UserContext.runSession` + legacy `QuizContext` | `UserContext.runSession` (MVP active loop) | Freeze legacy path; add explicit boundary note in code/docs |
| Result settlement | `result-screen` mixed display+business logic | settlement service/helper + `runSession` truth | Move reward/progress decision logic behind one function contract |
| Onboarding profile validity | grade-before-level mismatch | onboarding flow contract | Reorder or revalidate dependent fields |
| Route policy | repeated guards per screen + layout-level controls | centralized route policy helper | reduce duplicated per-screen route checks |

## Round 4 - Coverage and release confidence

### Must-have tests before merge-ready confidence
1. `tests/coreLoop.mvp.integration.test.tsx`
   - Assert home PLAY -> quiz -> result -> home with expected transitions.
2. `tests/result-screen.idempotency.test.tsx`
   - Assert reward/progress settlement executes once on rerender.
3. `tests/quiz-screen.flow.test.tsx`
   - Assert run start/end/abandon behavior and life-loss/game-over transitions.

### Should-have tests for next sprint
1. `tests/gate.protected-route.test.tsx`
2. `tests/token-context.security-limits.test.tsx`
3. `tests/user-provider.persistence.test.tsx`
4. `tests/user-provider.lives-regen.test.tsx`

### No-go criteria
- Any reproducible economy abuse path in MVP core loop.
- Any crash/blocker in onboarding -> home -> quiz -> result -> home.
- Any duplicate settlement (double reward/progress) in result flow.

## Round 5 - Decision synthesis

### Option A - Fast ship with guardrails
- Do now:
  - result settlement hardening (trust model)
  - onboarding dependency fix
  - quiz loading-state correctness
  - 3 must-have tests
- Timeline impact: low-medium
- Risk reduction: high on core-loop integrity
- Complexity: medium

### Option B - Short hardening sprint first
- Do now:
  - Option A items
  - token ownership cleanup
  - centralized route-policy cleanup
  - 2-4 should-have tests
- Timeline impact: medium
- Risk reduction: very high
- Complexity: medium-high

### Recommended path
Choose **Option B (short hardening first)** because it aligns with stated preference and prevents shipping with known state-ownership ambiguity.

## Two-track execution proposal

### Track 1 - Immediate merge-readiness actions
1. Harden result settlement trust.
2. Fix onboarding dependency order/validation.
3. Correct quiz loading state.
4. Add 3 must-have tests.

### Track 2 - Next-sprint refactor backlog candidates
1. Token single-source-of-truth cleanup.
2. Run-session boundary consolidation.
3. Route policy deduplication.
4. Additional persistence/security coverage tests.
