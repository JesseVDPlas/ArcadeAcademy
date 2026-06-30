# Online Readiness Notes (Post-MVP)

De app draait nu offline-first via `QuizRepository` + `LocalQuizRepository`.

## Contract dat online moet volgen

- `getPackList(): Promise<QuizPackMeta[]>`
- `getPack(packId: string): Promise<QuizPack>`
- `getDailySet(dateKey: string, profile: ContentProfile): Promise<QuestionV2[]>`

## Mapping local -> remote payload

- `pack_id` -> `packId`
- `grade_band` -> `gradeBand`
- `difficulty_band` -> `difficultyBand`
- `questions[].explanation_short` -> `questions[].explanationShort`

## Integratiestrategie

1. Voeg `RemoteQuizRepository` toe naast `LocalQuizRepository`.
2. Kies repository via feature flag (`offline_only` / `remote_enabled`).
3. Houd UI-schermen uitsluitend afhankelijk van `QuizRepository`.
4. Behoud lokale fallback wanneer remote faalt:
   - log event: `content_fallback_used`
   - val terug op manifest fallback pack.
