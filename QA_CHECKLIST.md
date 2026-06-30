# QA Checklist — MVP Launch Gate Closure (iOS-first)

## Doel
Deze checklist is de operationele runbook voor het sluiten van de MVP launch gate op core loop scope.

## Scope
1. Onboarding -> Home -> Quiz -> Result -> Next Round
2. Returning user routing
3. 0-lives economy gate
4. Daily completion flow
5. Offline cold start

## Hard Gates
1. Completion rate >= 80%
2. Home→Quiz conversion >= 85%
3. Geen open P0/P1 in core loop

## Voorbereiding (per testbatch)
1. Build ID noteren in `MVP_LAUNCH_GATE_REPORT.md`
2. Flags bevestigen:
   - `mvp_core_loop=true`
   - `show_non_mvp_tabs=false`
   - `show_debug_metrics` naar behoefte
3. Testdata reset:
   - `./clear-storage.sh`
4. Device en OS noteren (iOS verplicht, Android indien beschikbaar)
5. Actieve run: `RUN-001` (vandaag)

## RUN-001 Baseline Lock (vandaag)
1. Build ID: `5659ad4`
2. Device: `iPhone 16 Pro iOS 18.4`
3. Flag profile:
   - `mvp_core_loop=true`
   - `show_non_mvp_tabs=false`
   - `show_debug_metrics=true`
4. Start timestamp (UTC): `2026-02-16 23:21:24 UTC`
5. Rapportdoel:
   - smoke matrix 5/5 invullen
   - KPI dual gate berekenen
   - `DEF-CORE-002` + `DEF-ECO-003` retest verdict invullen

## Smoke Matrix Scenarios (iOS verplicht)

### 1) New User Funnel
1. Verwacht:
   - Onboarding start
   - Home met PLAY CTA
   - Quiz start
   - Result
   - Next Round werkt
2. Event checks:
   - `home_play_tap`
   - `quiz_start`
   - `quiz_finish`

### 2) Returning User
1. Verwacht:
   - App restart -> direct home
   - Geen onboarding reset
   - Eerste vraag <= 5s na PLAY
2. Defect target:
   - `DEF-CORE-002` retest

### 3) 0-Lives Path
1. Verwacht:
   - Quiz start geblokkeerd bij `lives==0`
   - No-lives modal zichtbaar
   - Shop route consistent
2. Defect target:
   - `DEF-ECO-003` retest

### 4) Daily Complete
1. Verwacht:
   - Daily flow compleet
   - `daily_completed` event
   - Correcte result CTA flow

### 5) Offline Cold Start
1. Verwacht:
   - App start zonder netwerk
   - Home, quiz en result werken met local packs

## KPI Meetprotocol (zelfde cohortvenster)

### Funnel
1. Verzamel `home_play_tap` count
2. Verzamel `quiz_start` count
3. Bereken Home→Quiz conversion:
   - `quiz_start / home_play_tap * 100`

### Completion
1. Verzamel `quiz_finish` met `completed=true`
2. Bereken completion:
   - `quiz_finish.completed / quiz_start * 100`

### Event hygiene
1. Geen inflatie door duplicates
2. `quiz_finish` exact 1x per run
3. `quiz_abandon` alleen bij echte early-exit

## Resultaatregistratie (verplicht)
1. Vul per scenario in `MVP_LAUNCH_GATE_REPORT.md`:
   - Expected
   - Actual
   - Pass/Fail
   - Defect ID
   - Severity
   - Owner
2. Vul KPI block met absolute aantallen + percentages
3. Werk defect status bij (`READY_FOR_RETEST` -> `PASS/FAIL`)

## Android Status (public-release blocker)
1. Indien `adb` ontbreekt:
   - noteer als blocker
   - voeg unblock-acties toe in rapport
2. Public release alleen na Android smoke sanity

## Go/No-Go Beslisboom
1. GO:
   - Alle iOS scenarios pass
   - KPI dual gate gehaald
   - Geen open P0/P1
2. CONDITIONAL GO:
   - Geen P0
   - beperkte P1 met workaround
   - KPI net onder threshold met aantoonbare stijgende trend
3. NO-GO:
   - Open P0
   - duidelijke KPI miss zonder mitigatie

## Afsluitdeliverables
1. `MVP_LAUNCH_GATE_REPORT.md` volledig ingevuld
2. Executive summary met expliciete recommendation
3. Android blocker-status + tijdslijn
