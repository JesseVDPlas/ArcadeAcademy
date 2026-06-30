# Arcade Academy — Engagement Asset Acceptance Checklist v1

## Sprint Target
- Sprint: `Engagement Asset Sprint 0`
- Theme: `Cyber-Arena`
- Pixel baseline: `16-bit`
- Subject demo: `Geschiedenis`

## Required Context Input
Voor review en acceptatie moet dit document altijd samen gelezen worden met:
- `docs/engagement/bitbyte_living_coach_mvp_context.md`

## Review Flow (operational)
1. Prompt output generation per asset (`v1`).
2. Brand + OBIT check (product + design).
3. Mock overlay test on existing home/quiz/result screenshots.
4. Safe-area/readability check on iPhone + Android portrait.
5. Freeze baseline or issue revision with defect IDs.

## Defect Severity Model
- `P0`: blokkeert inzet in demo (onleesbaar, style mismatch extreem, safety conflict).
- `P1`: duidelijke kwaliteitsbreuk, demo inzetbaar met risico.
- `P2`: polish issue, geen blokkade.

---

## A. Visual Validation Matrix

| Check | Verwachting | Pass/Fail | Defect ID | Severity | Owner |
|---|---|---|---|---|---|
| Arena readability | Vraagkaart/antwoorden blijven leesbaar op alle 3 ratios |  |  |  |  |
| HUD clarity | XP/tokens/lives/combat-progress direct scanbaar |  |  |  |  |
| Pixel consistency | 16-bit pixel look, geen flat-vector drift |  |  |  |  |
| Color hierarchy | Neon green primary, purple secondary, pink tertiary |  |  |  |  |
| Safe-area fit | Geen overlap met notch/home indicator |  |  |  |  |
| Motion control | Geen overload; korte feedbackanimaties |  |  |  |  |

---

## B. OBIT Alignment Checklist

| OBIT fase | Check | Pass/Fail | Notes |
|---|---|---|---|
| Onthouden/Begrijpen | UI laat vraag+opties centraal zonder visuele ruis |  |  |
| Toepassen | Correct antwoord triggert duidelijke attack feedback |  |  |
| Verankeren | Result/voortgang geeft tastbare battle-state update |  |  |

---

## C. Engagement Heuristics (target)

| Metric Proxy | Target | Evidence |
|---|---|---|
| Feedback start latency | `< 200ms` na correct/wrong |  |
| Correct event clarity | Direct “win-feel” met zichtbare state shift |  |
| Wrong event clarity | Duidelijk, kort, niet frustrerend |  |
| Session pacing fit | Past binnen 2–4 min sessies |  |

---

## D. Mock Integration Steps (quick)
1. Plaats arena background achter bestaande `quiz-screen` screenshot.
2. Overlay HUD prompt output op `home` en `result` screenshot.
3. Plaats BitByte attack keyframes in center gameplay zone.
4. Check contrast op kleine schermbreedte (`<= 360px`) met huidige typografie.
5. Leg issues vast in matrix met `P0/P1/P2`.

---

## E. Go/No-Go Criteria voor Baseline v1
1. Geen open `P0`.
2. Maximaal 2 open `P1` met workaround.
3. Alle OBIT checks minimaal “Pass” of expliciet geaccepteerd risico.
4. Visual matrix: minstens 5/6 checks op “Pass”.

## F. Next Iteration Gate (v1 -> v1.1)
1. Voeg subject-skin variant toe voor `math` of `nl` zonder core layout wijziging.
2. Herbruik 80% van HUD en BitByte state machine.
3. Alleen art-layer verschillen per vakthema.
