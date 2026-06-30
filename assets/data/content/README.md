# Offline Content Packs

Deze map bevat de offline-first contentlaag voor Arcade Academy.

## Structuur

- `content_manifest.json`:
  - lijst met actieve packs
  - pack-versies
  - fallback pack
- `packs/*.json`:
  - quizvragen per vak/niveau
- `templates/quiz_pack.template.json`:
  - authoring template voor nieuwe packs

## Commands

- Packs genereren uit huidige brondata:
  - `npm run content:build`
- Packs valideren:
  - `npm run content:validate`

## Kwaliteitsregels

- Minimaal 10 vragen per pack.
- Exact 4 opties per vraag.
- `correct_option_index` in bereik `0..3`.
- `explanation_short` verplicht, max 160 chars.
- Unieke vraag-ID's binnen een pack.
