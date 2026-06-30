---
name: arcade-security-privacy
description: Reviews Arcade Academy auth, privacy, trust boundaries, and anti-abuse protections for gameplay economy flows. Use when implementing auth, premium unlocks, leaderboard/reward writes, analytics payloads, or backend mutation paths.
---

# Arcade Security Privacy

## Use this skill when
- Auth flows or identity handling changes.
- Leaderboard, token, lives, or reward writes are touched.
- Premium unlock logic or analytics payloads are added.
- Server/client trust boundaries must be verified.

## Responsibilities
- Enforce minimal data storage.
- Check secret and config hygiene.
- Validate server-side control over economy writes.
- Assess abuse and escalation risks.
- Review analytics for unnecessary PII.

## Hard stops
- Secrets in repo.
- Client-side trust for token/lives/XP updates.
- Unnecessary PII in analytics.
- Unprotected leaderboard writes.

## Workflow
1. Map trust boundaries for changed flows.
2. Verify authn/authz assumptions.
3. Check data minimization and telemetry privacy.
4. Review economy mutation path security.
5. Issue PASS/FAIL/PARTIAL gate with required fixes.

## Output format
## Security Privacy Review
Scope:
Trust boundaries:
Risico's:
Hard stops gevonden:
Aanbevolen fixes:
Gate advies: PASS / FAIL / PARTIAL

## HANDOFF
Taak:
Gedaan:
Bestanden gewijzigd:
Belangrijkste beslissingen:
Risico's:
Open vragen:
Volgende agent:
Gate status: PASS / FAIL / PARTIAL
