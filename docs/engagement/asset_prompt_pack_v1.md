# Arcade Academy — Engagement Prompt Pack v1

## Scope
- Vertical slice: `Cyber-Arena`, `16-bit pixel detail`, `Geschiedenis`.
- Doel: hogere engagement via zichtbare strijd/meta-voortgang zonder scope-creep.
- Gebruik: direct inzetbaar voor image/video generators en art handoff.

## Required Context
- `docs/engagement/bitbyte_living_coach_mvp_context.md` is verplicht input voor alle BitByte-gerelateerde assets en animatiebeslissingen.
- Bij conflict tussen dit prompt pack en living coach context: living coach context gaat voor op state/emotie/timing.

## OBIT Interaction Intent (voor alle assets)
- `Onthouden/Begrijpen`: vraag + opties + korte uitleg blijven kern.
- `Toepassen`: correct antwoord triggert zichtbaar gevechtseffect.
- `Verankeren`: result feedback toont progressie in battle-state (fort/boss).

---

## Asset 1
### 1. Asset Name
`Chrono Citadel — Cyber Arena Background (History Demo)`

### 2. Intent (1 zin)
Maak een visueel strijdtoneel waarin geschiedenis-vragen aanvoelen als een high-stakes cyberduel.

### 3. Primary Prompt (generator-ready)
Create a 16-bit pixel art cyber arena background for a mobile quiz battle game called Arcade Academy. Theme: history as a "Chrono Citadel" with a neon timeline reactor in the center. Scene layering must be clear: foreground gameplay lane with subtle grid markers, midground battle props (pixel pylons, holographic timeline pillars, broken archive terminals), background skyline with distant retro-futuristic city towers and a giant clockwork moon. Keep composition centered for combat readability, with no text in the art. Use high contrast but controlled neon palette: primary neon green (#39FF14), secondary electric purple (#9D4EDD), tertiary hot pink (#FF38CE), deep background (#1B0044/#0B001C). Leave clean, low-detail zones for UI overlays: top 18% safe area for HUD, bottom 22% safe area for answers/buttons, center zone for character and VFX readability. Deliver variants in 9:16 (mobile hero), 16:9 (promo), and 1:1 (social thumb). Retro arcade mood, energetic but not noisy.

### 4. Negative Prompt (wat absoluut niet)
- No modern flat vector style.
- No photorealism or 3D renders.
- No embedded logos, no embedded text, no watermarks.
- No heavy texture noise behind center gameplay area.
- No full-screen bloom haze that reduces readability.
- No monochrome palette or pastel theme.

### 5. Style Tokens (colors/fonts/mood)
- Colors: `#39FF14`, `#9D4EDD`, `#FF38CE`, `#1B0044`, `#0B001C`.
- Visual language: 16-bit pixel, sharp edges, crisp dithering, arcade glow accents.
- Mood: competitive, tense, triumphant, cyber-educational.

### 6. Technical Constraints (ratio, safe-zones, readability)
- Ratios: `9:16`, `16:9`, `1:1`.
- Safe zones: top `18%`, bottom `22%`, center unobstructed.
- Maintain legibility on <=360px width preview.
- Keep average luminance lower in center-mid so white text cards stay readable.

### 7. Acceptance Checklist (5-8 checks)
- [ ] Top HUD zone is clean and uncluttered.
- [ ] Bottom answer zone has low visual noise.
- [ ] Center focus supports BitByte + attack FX readability.
- [ ] Colors match Arcade Academy neon hierarchy.
- [ ] Scene communicates battle tension without UI text.
- [ ] 3 aspect-ratio exports preserve composition.

---

## Asset 2
### 1. Asset Name
`Cyber Duel HUD Overlay — OBIT Combat UI`

### 2. Intent (1 zin)
Toon voortgang, risico en beloning in een compacte battle-HUD die scholieren direct begrijpen.

### 3. Primary Prompt (generator-ready)
Design a 16-bit pixel UI overlay for a mobile quiz battle in Arcade Academy. The HUD must include: XP bar, token chip, lives hearts, and one combat progress meter labeled as either "Boss HP" or "Fort Integrity" (no final text baked in; provide icon-first placeholders). Build for small screens and safe-area compatibility. Define state variants: idle, hit, correct streak, low lives warning, boss breakpoint. Add micro-motion guidance: quick pulse on correct, short red flash on wrong, one subtle screen shake max on impact events. Keep visual hierarchy strict: XP primary, lives risk signal, token economy secondary, boss/fort progress as session objective. Use neon green primary, purple secondary, pink accents, dark base surfaces. Typography style must support NL with EN game terms: PLAY, NEXT ROUND, LEVEL UP. Ensure controls remain readable at <=360px width with minimum touch-safe margins and no overlap with notch/home indicator areas.

### 4. Negative Prompt (wat absoluut niet)
- No cluttered MMO-style HUD.
- No tiny unreadable labels.
- No overloaded icon set or emoji-heavy labels.
- No dark-on-dark low contrast chips.
- No animations that block quiz interactions.

### 5. Style Tokens (colors/fonts/mood)
- Colors: neon green primary, electric purple secondary, pink event accents.
- Typography: pixel headline + readable body fallback.
- Mood: responsive, competitive, clean retro arcade.

### 6. Technical Constraints (ratio, safe-zones, readability)
- Mobile-first portrait baseline.
- Must fit iPhone/Android small screens.
- Top bar respects notch and dynamic island.
- Min tap-safe spacing: 8px internal rhythm, no overlapping pills.

### 7. Acceptance Checklist (5-8 checks)
- [ ] XP/tokens/lives/combat-progress all visible in one scan.
- [ ] Idle/hit/streak/low-lives/breakpoint states are visually distinct.
- [ ] UI remains readable at 360px width.
- [ ] No safe-area collisions on top/bottom.
- [ ] Motion hints are short and non-blocking.
- [ ] Copy style is NL-first with EN game terms only where intended.

---

## Asset 3
### 1. Asset Name
`BitByte Attack Kit — History Battle State Animation`

### 2. Intent (1 zin)
Laat correcte antwoorden voelen als directe impact en foutieve antwoorden als duidelijke maar lichte tegenslag.

### 3. Primary Prompt (generator-ready)
Create a 16-bit pixel animation kit for BitByte in Arcade Academy's Cyber-Arena history demo. Deliver a state-machine-ready set: idle, charge (on correct trigger), attack_laser, hit_confirm, recover, damage_react (on wrong trigger). Visual language: neon cyber with arcade punch, preserving BitByte silhouette and face readability. Correct flow should feel rewarding and fast (total 550-750ms): charge spark, laser burst, target hit flash, settle. Wrong flow should be shorter and clear (350-500ms): brief recoil, red glitch spark, quick recover. FX rules: no full-screen strobe, short glow burst only, max one shake event per trigger. Keep frame pacing clean for mobile and avoid excessive particle noise. Include sprite sheet export guidance with deterministic naming.

### 4. Negative Prompt (wat absoluut niet)
- No exaggerated cartoon squash that breaks pixel style.
- No long dramatic cinematic timing.
- No epileptic flashing or repeated high-frequency strobes.
- No blur-heavy effects that hide sprite detail.

### 5. Style Tokens (colors/fonts/mood)
- Core sprite colors aligned with current BitByte identity.
- FX accents: neon green for success, controlled red for damage.
- Mood: empowering, fast, arcade-precise.

### 6. Technical Constraints (ratio, safe-zones, readability)
- Export as sprite sheet + optional frame strips.
- Naming convention:
  - `bitbyte_idle_f001...`
  - `bitbyte_charge_f001...`
  - `bitbyte_attack_laser_f001...`
  - `bitbyte_hit_confirm_f001...`
  - `bitbyte_recover_f001...`
  - `bitbyte_damage_react_f001...`
- Keep animation readable at 1x and 2x mobile scale.

### 7. Acceptance Checklist (5-8 checks)
- [ ] Correct-state chain lands within 550-750ms total.
- [ ] Wrong-state chain lands within 350-500ms total.
- [ ] Attack readability preserved on dark and bright arena zones.
- [ ] No strobe/full-screen flash violations.
- [ ] State names map 1:1 to implementation state machine.
- [ ] Sprite frames are consistent and import-ready.
