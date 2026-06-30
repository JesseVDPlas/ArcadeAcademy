# Claude Code Werkplan — audit-punten verwerken

*Gefaseerd plan om de audit van 2026-06-09 te verwerken. Elke fase = één of enkele Claude Code-sessies met een concrete prompt. Volgorde is bewust: eerst schoon en verbonden, dan pas slim. Werk per fase in een aparte git branch en sluit af met groene tests.*

## Strategie in één alinea

Claude Code werkt het best met: (1) een schone repo zonder misleidende context, (2) specs om tegen te bouwen in plaats van open opdrachten, (3) kleine, verifieerbare taken met een testbare definition of done. Daarom is fase 1 opschoning — elke sessie daarna wordt er beter van. Geef Claude Code per sessie de relevante doc mee ("lees eerst docs/X.md") en eis dat het eindigt met draaiende tests + een BACKLOG-update. Plan-mode gebruiken bij fase 3 en 4 (eerst plan laten zien, dan pas bouwen).

---

## Fase 1 — Repo-opschoning (1 sessie, laag risico, hoge winst)

**Prompt:**
> Lees CLAUDE.md. Voer de repo-opschoning uit: (1) verwijder de map `gamification-engine/` volledig — controleer eerst met grep dat niets in app/, lib/, components/, contexts/ ernaar verwijst; (2) maak `docs/archive/` en verplaats alle eenmalige verslagen uit de root erheen (SPRINT_*_SUMMARY.md, FINAL_FIX_SUMMARY.md, INFINITE_LOOP_FIX.md, BUGFIXES.md, UI_REFACTOR_SUMMARY.md, PHASE_1_IMPLEMENTATION.md, QUIZ_COVERAGE_COMPLETE.md, PLACEHOLDER_QUIZZES_INFO.md) — AGENTS.md, BACKLOG.md, README.md, QA_CHECKLIST.md, MVP_LAUNCH_GATE_REPORT.md en CLAUDE.md blijven; (3) verwijder of corrigeer de SwiftUI-verwijzingen in .cursor/skills/ (hernoem arcade-swiftui-frontend naar arcade-rn-frontend en herschrijf voor React Native/Expo); (4) draai npm test en npm run lint, beide moeten slagen. Voeg een AA-taak + Change Log-entry toe aan BACKLOG.md.

**Apart, handmatig door Jesse:** de geneste-repo-situatie (buitenste `~/ArcadeAcademy/` Expo-starter + zip). Eén keer goed oplossen: inner repo naar een eigen pad verplaatsen of de buitenste resten verwijderen. Niet aan een agent overlaten — git-history-risico.

## Fase 2 — De brug: transform-script (1 sessie)

**Prompt:**
> Lees docs/CONTENT_PIPELINE.md. Bouw `tools/content/transform-pipeline-pack.js` volgens de transformatietabel daarin. Input: pad naar questionbank-JSON (pipeline-formaat) + pack-config (pack_id, subject, grade_band, version). Output: valide QuizPack-JSON conform types/content.ts. Eisen: hard falen bij ontbrekende velden, duplicate id's, of onbekende moeilijkheid; unit tests in tests/; integreer een check in npm run content:validate. Schrijf een korte usage-sectie onderaan docs/CONTENT_PIPELINE.md.

## Fase 3 — Leermodel v1: Leitner + gewogen selectie (2–3 sessies, plan-mode)

**Prompt (sessie 1, plan):**
> Lees docs/LEARNING_MODEL.md volledig. Maak een implementatieplan voor v1: welke bestanden, welke wijzigingen aan lib/content/selector.ts, waar QuestionHistory wordt gepersisteerd (AsyncStorage, eigen module naast bestaande contexts), hoe de sessie-mix (40/40/20) wordt opgebouwd, en welke tests erbij horen. Toon het plan, bouw nog niets.

**Prompt (sessie 2+, bouw):**
> Voer het goedgekeurde plan uit. Acceptatiecriteria staan in docs/LEARNING_MODEL.md §Acceptatiecriteria. Bestaande quiz-flow tests mogen niet breken. Sluit af met BACKLOG-update.

## Fase 4 — Retentie: notificaties + streak-reminder (1–2 sessies, plan-mode)

**Prompt:**
> Lees docs/PRODUCT_VISION.md §retentie-loop. Voeg expo-notifications toe. Implementeer: permission-vraag op een logisch moment (na eerste afgeronde quiz, niet bij eerste open), één dagelijkse lokale notificatie gekoppeld aan streak-status (alleen als vandaag nog niet gespeeld, rond 19:00 lokaal), uit te zetten in settings. Privacy by default: lokale notificaties, geen remote push in MVP. Feature flag `streak_reminder`.

## Fase 5 — BitByte Living Coach (1–2 sessies)

**Prompt:**
> Lees docs/engagement/bitbyte_living_coach_mvp_context.md. Implementeer de 4 states (idle/thinking/victory/damage) in components/ui/BitByte.tsx volgens de spec: trigger-latency <200ms na antwoord, korte niet-blokkerende animaties, geen strobing. Koppel aan de quiz-flow events. Gebruik bestaande sprite-assets; als die ontbreken, lever een lijst van benodigde sprites op basis van de asset-specificatie in het doc.

## Fase 6 — Launch gate sluiten (handmatig + 1 sessie support)

De iOS smoke matrix (MVP_LAUNCH_GATE_REPORT.md) staat sinds 16 februari op PENDING. Dit is grotendeels handwerk in de simulator (RUN-001 scenario's), maar Claude Code kan: de DEF-CORE-002 en DEF-ECO-003 retest-paden voorbereiden, het rapport bijwerken, en AA-105 (regression pack expansion) bouwen.

---

## Werkverdeling Cowork ↔ Claude Code

| Cowork (pipeline-repo) | Claude Code (deze repo) |
|---|---|
| Vraaggeneratie (scheduled task draait) | Fase 1–6 hierboven |
| Staging-review van gegenereerde vragen | Transform-script draaien bij elke aanlevering |
| Eindtermen/syllabi nieuwe vakken & niveaus | Pack-plaatsing + manifest + validatie |
| Audits, strategie, documenten | Code, tests, refactors |

## Definition of Done per fase

Groene testsuite, lint 0 errors, BACKLOG.md bijgewerkt (AA-nummer + Change Log), en bij content-gerelateerd werk `npm run content:validate` groen. Fase pas afsluiten als Jesse het resultaat in de simulator heeft gezien — niet alleen op tests vertrouwen.
