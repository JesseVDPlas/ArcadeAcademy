# Arcade Academy App — Instructies voor Claude Code

## Wat is dit?

De React Native app van Arcade Academy: een gamified leerapp (retro arcade/pixel-art, mascotte BitByte) voor Nederlandse middelbare scholieren. Quiz-platform met XP, lives, streaks, tokens, leaderboards, circles en challenges.

**Dit is de app-repo.** De vraaggeneratie-pipeline leeft in een aparte map (`~/Documents/BJTM/BJTM | Arcade Academy/`, beheerd via Cowork). Het contract tussen beide staat in `docs/CONTENT_PIPELINE.md`.

## ⚠️ Lees dit eerst — bekende valkuilen

1. **Stack is React Native / Expo Router / TypeScript.** NIET Swift/SwiftUI. De skills in `.cursor/skills/` (o.a. `arcade-swiftui-frontend`) zijn verouderd en spreken over SwiftUI — negeer alle tech-stack-aannames daarin. De procesafspraken in `AGENTS.md` gelden wél.
2. **Geneste repo.** De map boven deze root (`~/ArcadeAcademy/`) is een kale Expo-starter met een eigen `.git`. DEZE map (`~/ArcadeAcademy/ArcadeAcademy/`) is de echte repo. Werk nooit in de buitenste map.
3. **`gamification-engine/` is dode ballast** — een gevendorde Python/Pyramid open-source repo (ActiDoo, ~2015). Wordt nergens door de app gebruikt. Niet naar verwijzen, niet uit importeren. Staat op de nominatie voor verwijdering.
4. **Root-MD-verslagen zijn historisch.** `SPRINT_*_SUMMARY.md`, `*_FIX*.md`, `QUIZ_COVERAGE_COMPLETE.md` e.d. zijn momentopnames, geen actuele waarheid. Actuele waarheid: `BACKLOG.md` (taken), `AGENTS.md` (werkafspraken), `docs/` (specs).

## Commando's

```bash
npm test -- --runInBand        # Jest, 22+ suites — moet groen vóór elke commit
npm run content:validate       # valideert alle packs in assets/data/content/packs/
npm run lint                   # 0 errors vereist (warnings gedoogd)
npx expo start                 # dev server (iOS simulator is primair platform)
```

## Architectuur in 30 seconden

- `app/` — Expo Router routes. `(tabs)/` bevat home, quiz, quests, challenges, leaderboard, circles, profile, shop, rewards, settings. Onboarding: `name → level → grade → goal`.
- `contexts/` — state via React Context + reducers: `UserContext` (XP, lives, streak), `TokenContext` (token-economie, source of truth voor saldo), `QuizContext`, `ChallengesContext`, `CirclesContext`, `LeaderboardContext`.
- `lib/` — pure logica: `content/` (repository, selector, versioning, profile), `analytics.ts` (canonical events: `quiz_started`, `question_answered`, `quiz_completed`), `flags.ts` (feature flags, o.a. `mvp_core_loop`, `show_non_mvp_tabs`), `resultSettlement.ts`, `kpis.ts`.
- `components/` — `ui/` (retro design system: RetroButton, LivesHearts, StreakPill, BitByte, XPBar), `home/` (LevelMap), `shared/`.
- `types/content.ts` — het pack-contract. Wijzigingen hier raken de pipeline-repo: eerst `docs/CONTENT_PIPELINE.md` bijwerken.
- `assets/data/content/packs/` + `content_manifest.json` — geladen quiz-content. Persistentie: AsyncStorage (offline-first, geen backend/sync in MVP).

## Non-negotiables (uit AGENTS.md, blijven gelden)

- MVP-first; geen pay-to-win; leerwaarde boven monetisatie; privacy by default; geen business-logica in views; elke feature testbaar; geen secrets in de repo; BitByte is functioneel, niet decoratief.

## Werkwijze

1. Pak taken uit `BACKLOG.md` (AA-### formaat) of uit `docs/CLAUDE_CODE_WERKPLAN.md`. Nieuwe taken krijgen een AA-nummer en acceptatiecriteria vóór je code schrijft.
2. Tests eerst draaien, dan wijzigen, dan tests opnieuw. Een taak is pas done met groene suite + lint + (bij content) `content:validate`.
3. Update `BACKLOG.md` status + Change Log bij afronding.
4. Schrijf nooit naar `assets/data/content/packs/` zonder de bron in de pipeline-repo: packs worden gegenereerd, niet met de hand bewerkt.

## Richtinggevende documenten

| Document | Inhoud |
|---|---|
| `docs/PRODUCT_VISION.md` | North Star, doelgroepkeuze, wat "Duolingo-gevoel" hier betekent |
| `docs/LEARNING_MODEL.md` | Spec vraagselectie, mastery, herhaling (v1 = Leitner) — bouw hiertegen, niet ad-hoc |
| `docs/CONTENT_PIPELINE.md` | Contract met de vraaggeneratie-repo: formats, transform, versioning |
| `docs/CLAUDE_CODE_WERKPLAN.md` | Gefaseerd werkplan met sessie-prompts (opschoning → brug → leermodel → retentie) |
| `docs/engagement/bitbyte_living_coach_mvp_context.md` | BitByte living coach spec (4 states) |
| `MVP_LAUNCH_GATE_REPORT.md` | Gate-criteria iOS launch (smoke matrix staat nog open) |
