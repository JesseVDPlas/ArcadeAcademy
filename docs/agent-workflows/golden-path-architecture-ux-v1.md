# Golden Path Architecture + UX Contract V1

## State boundaries
- `UserContext`: onboarding profile, XP, lives, run session, completed quizzes.
- `TokenContext`: token balance/history (source of truth for UI token display).
- `ChallengesContext`: weekly challenge counters.

## Commit points
- Quiz run starts on first loaded question (`runStart`).
- Answer events update XP/lives/runSession during play.
- Result screen performs one-time completion commit:
  - reward grant,
  - challenge updates,
  - best score update,
  - completed quiz registration for passed non-daily runs,
  - `runEnd`.

## UX behavior contract
- Quiz states: loading, empty, active question, answer feedback, game-over/result.
- Result states: score + feedback + reward summary + clear next actions.
- Home return must reflect latest progression immediately through existing HUD.

## Guardrails
- No business logic moves into view components outside existing context/service boundaries.
- Completion persistence must not depend on tapping `Home` only.
- Token UI must read from `TokenContext`, never from `UserContext.tokens`.
