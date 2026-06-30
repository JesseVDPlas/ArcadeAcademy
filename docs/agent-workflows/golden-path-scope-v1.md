# Golden Path Scope Freeze V1

## In scope (MVP proof slice)
- Flow: `onboarding -> /(tabs)/home -> /quiz-screen -> /result-screen -> /(tabs)/home`.
- One complete run for a new user with exactly 5 quiz questions.
- Local-first persistence only (AsyncStorage-backed contexts).
- Visible post-run progression on home/HUD (XP, tokens, progress status).

## Out of scope (explicit)
- Remote sync, conflict resolution, and backend write retries.
- Multi-device state consistency.
- Economy hardening beyond current local-first guardrails.

## Acceptance criteria
- User completes onboarding and lands on home.
- Home PLAY starts quiz directly.
- Quiz completes after 5 questions and opens result screen.
- Result screen commits rewards/progress before navigation choice.
- Returning home shows updated progression without requiring extra actions.

## Known constraints
- Token balance source of truth for UI is `TokenContext`.
- `UserContext.tokens` remains legacy state and is not used for HUD display.
