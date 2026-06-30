# Hard Audit Findings V1

## Scope
- MVP core loop quality
- Architecture/code quality
- Findings are ordered by severity and include fast/balanced/structural options.

## Severity-ranked findings

### Critical 1 - Result economy depends on route params
- Evidence:
  - `app/result-screen.tsx` reads `scoreParam`/`totalParam` from route params and then derives reward metrics.
  - `lib/resultLogic.ts` accepts params and run session; mismatch is logged, but flow still proceeds.
- Risk:
  - Reward/progression logic is more tamperable than needed and can drift from canonical run state.
- Options:
  - **Minimal patch (fast):** hard-reject reward commit when params and `runSession` mismatch.
  - **Balanced fix (recommended):** compute rewards from `runSession` only, use params for display fallback only.
  - **Structural fix (longer-term):** move result settlement to dedicated domain service with trusted input contract.

### High 2 - Onboarding order conflicts with data dependency
- Evidence:
  - `app/onboarding/name.tsx` routes to `'/onboarding/grade'`.
  - `app/onboarding/grade.tsx` grade options depend on `level`, but level is chosen later.
- Risk:
  - User can choose grade without the prerequisite context; inconsistent profile quality.
- Options:
  - **Minimal patch:** keep order but validate/reconfirm grade after level selection.
  - **Balanced fix (recommended):** reorder flow to `name -> level -> grade -> goal`.
  - **Structural fix:** define onboarding step schema with explicit dependency graph and centralized validation.

### High 3 - Quiz empty state can appear during async fetch
- Evidence:
  - `app/quiz-screen.tsx` renders empty state when `questions.length === 0` before explicit loading completion flag.
- Risk:
  - False negative UX (“geen vragen gevonden”) during normal loading path.
- Options:
  - **Minimal patch:** add `isLoading` boolean and gate empty state behind `!isLoading`.
  - **Balanced fix (recommended):** use finite state enum (`loading|ready|empty|error`) for quiz content phase.
  - **Structural fix:** extract content-loading state machine into a dedicated hook/service.

### High 4 - Daily credit and daily content coupling is weak
- Evidence:
  - `app/quiz-screen.tsx` daily uses mixed set; `app/result-screen.tsx` credits `dailyDone(sessionSubjectId)`.
- Risk:
  - Subject credit semantics can diverge from presented daily questions.
- Options:
  - **Minimal patch:** restrict daily content set to `dailySubjectId`.
  - **Balanced fix (recommended):** include credited subject in run metadata and validate before settlement.
  - **Structural fix:** explicit daily run contract (`subject`, `contentSet`, `creditRule`) shared by quiz/result.

### Medium 5 - Token ownership remains partially duplicated
- Evidence:
  - `contexts/UserContext.tsx` still contains `tokens` and `ADD_TOKENS`.
  - `contexts/TokenContext.tsx` owns `balance` and is UI source-of-truth.
- Risk:
  - Drift risk and contributor confusion about write authority.
- Options:
  - **Minimal patch:** deprecate and prevent new reads/writes to `UserContext.tokens`.
  - **Balanced fix (recommended):** remove `ADD_TOKENS` path and legacy field from `UserState` with migration guard.
  - **Structural fix:** central economy module mediating all token writes/reads/events.

### Medium 6 - Run-state ownership is fragmented
- Evidence:
  - active flow state split across screen-local state, `UserContext.runSession`, and legacy `QuizContext`.
- Risk:
  - hard-to-reason lifecycle edges (`start/end/abandon`) and regression risk.
- Options:
  - **Minimal patch:** freeze legacy `QuizContext` usage in active paths.
  - **Balanced fix (recommended):** single run-session owner for active loop; screens only read/dispatch.
  - **Structural fix:** dedicated run-session store + domain service boundaries.

## Quick win order (risk-reduction first)
1. Result settlement trust hardening
2. Onboarding order fix
3. Quiz loading-state correctness
4. Daily credit/content contract
5. Token/run-state ownership cleanup
