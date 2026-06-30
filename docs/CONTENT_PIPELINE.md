# Content Pipeline — Contract tussen pipeline-repo en app-repo

*Dit document is de enige waarheid over hoe content van de vraaggeneratie-pipeline in de app komt. Wijzigt het pack-formaat (`types/content.ts`)? Dan eerst dit document bijwerken en de pipeline-repo informeren.*

## De twee repo's

| Repo | Locatie | Rol | Tooling |
|---|---|---|---|
| Pipeline | `~/Documents/BJTM/BJTM \| Arcade Academy/` | Vragen genereren, valideren, questionbank beheren | Cowork / Claude |
| App | `~/ArcadeAcademy/ArcadeAcademy/` (deze repo) | Packs inladen en serveren | Claude Code / Cursor |

## Flow van vraag tot app

```
1. Generatie (Haiku, vak-skill)          → pipeline-repo
2. AI-validatie (Sonnet, 7 criteria)     → pipeline-repo
3. Staging                                → pipeline: output/staging/[vak]-[niveau]_[datum]_[run].json
4. Menselijke review (Jesse/vakdocent)    → goedgekeurd → append questionbank; afgekeurd → validation-log
5. Transform questionbank → QuizPack      → script (zie hieronder), output: pack-JSON
6. Plaatsing in app                       → assets/data/content/packs/[pack_id].json
7. Manifest bijwerken                     → assets/data/content/content_manifest.json
8. Valideren                              → npm run content:validate  (verplicht, blokkerend)
```

**Regels:** packs in de app worden nooit met de hand bewerkt — altijd gegenereerd uit de questionbank. De questionbank is append-only. Stap 4 (mens) is niet optioneel zolang generator-kwaliteit op schaal onbewezen is.

## Formaat-transformatie (pipeline → QuizPack)

| Pipeline-veld | QuizPack-veld | Transformatie |
|---|---|---|
| `uuid` | `id` | 1-op-1 |
| `context` + `vraag` | `question_text` | samenvoegen: `"[context] [vraag]"` |
| `opties {A,B,C,D}` | `options` (array) | volgorde A,B,C,D |
| `correct` (letter) | `correct_option_index` | A→0, B→1, C→2, D→3 |
| `uitleg.correct` | `explanation_short` | 1-op-1 (inkorten tot 1–2 zinnen indien nodig) |
| `metadata.eindterm_id` | `learning_goal` | omschrijving opzoeken in eindtermen.md van het vak |
| `metadata.concepten` | `tags` | 1-op-1 |
| `metadata.moeilijkheid` | `difficulty` | L1→`easy`, L2→`medium`, L3→`hard` |

Pack-velden: `pack_id` (bv. `geo_vwo_ce_wrld`), `version` (semver, bump bij elke aanlevering), `subject`, `grade_band` (bv. `vwo_4`), `difficulty_band` (`mixed`).

## Transform-script (te bouwen — zie werkplan fase 2)

Doelplek: `tools/content/transform-pipeline-pack.js`. Eisen: leest questionbank-JSON, filtert op eindterm/cluster/domein, produceert valide QuizPack, faalt hard bij ontbrekende velden of duplicate id's, draait mee in `npm run content:validate`.

## Versioning & aanlevering

1. Elke aanlevering bumpt `version` van het pack (patch: vragen toegevoegd; minor: vragen vervangen/verwijderd; major: schemawijziging).
2. `content_manifest.json` bepaalt welke packs actief zijn — een pack toevoegen zonder manifest-update doet niets.
3. Vervanging van placeholder-packs: `geo_vwo1_core` is de eerste kandidaat zodra het WRLD-domein voldoende dekking heeft (~150 vragen).

## Bekende kwaliteitsregels (uit de pipeline, hier herhaald omdat de app erop leunt)

Elke vraag: mini-context met concreet gegeven, ≥2 concepten gecombineerd, exact één verdedigbaar beste antwoord, denkstap vereist (geen reproductie), UUID-conventie met alfabetisch gesorteerde clusters.
