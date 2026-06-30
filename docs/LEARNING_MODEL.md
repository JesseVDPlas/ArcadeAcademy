# Learning Model — Spec

*Status: v1 nog niet gebouwd. Huidige selector (`lib/content/selector.ts`) is deterministisch — elke sessie dezelfde vragen in dezelfde volgorde. Dat is de grootste product-zwakte van de app. Bouw tegen deze spec, niet ad-hoc.*

## Principes

1. **Metadata is er al — gebruik haar.** Elke vraag heeft `difficulty`, `learning_goal`/eindterm, `tags`. Het model werkt op die assen, geen nieuwe content-velden nodig voor v1.
2. **Begin simpel, meet, verzwaar dan pas.** v1 = Leitner-boxes. Geen ML, geen ELO, geen Bayesian knowledge tracing totdat er gebruikersdata is die aantoont dat Leitner tekortschiet.
3. **Alles client-side in MVP** (AsyncStorage), maar datamodel zo ontwerpen dat het later server-side kan syncen.

## v1 — Leitner + gewogen selectie

### Datamodel (AsyncStorage, per gebruiker)

```ts
type QuestionHistory = {
  questionId: string;
  box: 1 | 2 | 3 | 4 | 5;        // Leitner-box; 1 = net fout / nieuw-fout, 5 = beheerst
  lastSeenAt: string;             // ISO
  timesSeen: number;
  timesCorrect: number;
  lastResult: 'correct' | 'wrong';
};

type MasteryByGoal = {
  learningGoal: string;           // eindterm
  seen: number;
  correctRate: number;            // rolling
  masteryScore: number;           // 0–1, afgeleid van box-verdeling van vragen onder deze eindterm
};
```

### Regels

1. **Nieuwe vraag** start zonder history. Goed beantwoord → box 3. Fout → box 1.
2. **Herhaling:** goed → box +1 (max 5). Fout → terug naar box 1.
3. **Due-momenten per box:** box 1 = volgende sessie, box 2 = +1 dag, box 3 = +3 dagen, box 4 = +7 dagen, box 5 = +21 dagen.
4. **Sessie-samenstelling (bijv. 10 vragen):** ~40% due herhalingen (laagste box eerst), ~40% nieuwe vragen uit de eindterm met laagste masteryScore, ~20% random uit de rest (verrassing/variatie). Shuffle binnen de sessie; nooit twee keer dezelfde vraag in één sessie.
5. **Moeilijkheidsopbouw:** binnen nieuwe vragen eerst `easy`→`medium`→`hard` per eindterm; een leerling ziet pas `hard` als correctRate op `medium` ≥ 60% binnen die eindterm.
6. **Cold start (geen history):** gedraag je als huidige daily-set maar mét seeded shuffle per gebruiker (seed = userId + datum), niet de statische eerste-N.

### Acceptatiecriteria v1

- Twee opeenvolgende sessies van dezelfde gebruiker bevatten niet dezelfde vragenset (tenzij de bank kleiner is dan 2× sessiegrootte).
- Een fout beantwoorde vraag komt binnen 2 sessies terug.
- Unit tests voor: box-transities, due-berekening, sessie-mix, cold start, bank-uitputting.
- Geen regressie op bestaande quiz-flow tests.

## v2 (post-MVP, pas na echte gebruikersdata)

- Mastery-weergave per eindterm in de UI ("Migratie: 73%") — sluit aan op syllabus-structuur, uniek t.o.v. generieke quiz-apps.
- Adaptieve moeilijkheid over eindtermen heen (zwakste-schakel-eerst richting examendatum).
- Server-side sync van history (AA-201) en daarna pas geavanceerdere modellen.

## Expliciet uit scope

- ML-voorspellingen per gebruiker (Birdbrain-achtig) — pas relevant bij duizenden gebruikers.
- Vraagtype-variatie (open vragen, slepen, etc.) — content-contract is nu 4-optie MC; uitbreiding loopt via `CONTENT_PIPELINE.md`, niet via dit model.
