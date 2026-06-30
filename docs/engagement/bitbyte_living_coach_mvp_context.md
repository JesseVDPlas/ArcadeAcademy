# Arcade Academy - BitByte Living Coach Context (MVP)

## Doel van dit document
Deze context borgt waarom en hoe BitByte van statisch plaatje naar "levende coach" moet gaan voor MVP engagement.

Bronnen voor deze richting:
1. Visuele kwaliteit en karakterpotentie van de huidige BitByte.
2. Analyse van Trivia Crack Retro: karakterreacties verhogen spanning, empathie en retentie.

## Strategische kern
BitByte moet in de MVP niet alleen zichtbaar zijn, maar voelbaar reageren op acties van de speler.

Zonder karakterfeedback voelt de app functioneel maar niet game-achtig. Voor scholieren is directe emotionele feedback een kernonderdeel van engagement.

## Living Coach Upgrade (MVP minimum)
BitByte moet minimaal 4 states hebben:

1. `idle` (wachten)
- Altijd subtiele beweging (bobbing up/down).
- Regelmatige blink.
- Lichte antenne-twitch.

2. `thinking` (tijdens vraag/nadenken)
- Focused/skeptische blik.
- Kleine side-to-side eye shift.
- Subtiele "processing" body micro motion.

3. `victory` (goed antwoord)
- Duidelijke positieve reactie (jump/pulse).
- Ogen veranderen naar succesvorm (ster/check-vibe).
- Korte confetti/sparkle pixels.

4. `damage` of `error` (fout antwoord)
- Korte glitch of impact-reactie.
- Tint naar magenta/rood accent.
- Ogen naar "X" of teleurstellende variant.

## Productimpact (OBIT-koppeling)
1. Onthouden/Begrijpen:
- BitByte houdt aandacht vast tijdens vraagfase (`thinking`).

2. Toepassen:
- Directe correct/fout karakterreactie maakt actie-consequentie tastbaar.

3. Verankeren:
- Emotionele feedback versterkt herinnering aan resultaat en voortgang.

## Performance- en UX-eisen
1. Trigger latency:
- Animatie start binnen 200ms na antwoordtap.

2. Sessietempo:
- Correct/fout animaties zijn kort en blokkeren flow niet.

3. Overload-preventie:
- Geen lange cinematics of strobing.
- 1 duidelijke reactie per event.

## Asset Specificatie - Sprite Sheet (MVP Kit)

### Asset Name
`BitByte_SpriteSheet_MVP.png`

### Formaat
1. Transparante achtergrond.
2. Uniforme grid voor slicing.
3. Aanbevolen frame size:
- 64x64 of 128x128 per frame.
4. Layout:
- 4 rijen x 4 frames (horizontale animatiereeksen).

### Rij-indeling
1. Row 1: `idle` (4 frames)
2. Row 2: `success` (4 frames)
3. Row 3: `thinking` (4 frames)
4. Row 4: `damage` (4 frames)

### Kleuranker
- Primair groen: `#39FF14` (moet behouden blijven).

## Generator Prompt (image AI)
Gebruik deze prompt met bestaande BitByte als referentie (image-to-image aanbevolen):

Generate a pixel art sprite sheet for a floating green robot character named BitByte. Reference the attached character style: neon green square head, single antenna, pink pixel eyes, floating particles at the bottom.

The sprite sheet must contain 4 horizontal rows, each representing an animation sequence:

Row 1 (Idle): The robot gently bobbing up and down, antenna twitching, eyes blinking. (4 frames).

Row 2 (Happy/Success): The robot jumps up, eyes turn into green checkmarks or stars, pixel confetti appears around him. (4 frames).

Row 3 (Thinking): The robot looks skeptical, looking side-to-side, antenna spinning slowly. (4 frames).

Row 4 (Damage/Error): The robot glitches, body turns slightly magenta/red, eyes turn into 'X' shape, sparks fly off. (4 frames).

Style: 16-bit pixel art, transparent background, uniform grid layout for easy slicing. Keep the exact same green hex color #39FF14 from the reference.

## Runtime State Machine (app-side)
Default:
1. `idle` loop wanneer geen event actief is.

Question flow:
1. Bij vraag actief: `thinking` optioneel (met name bij loading of keuzevenster).
2. Bij correct antwoord: `success` eenmalig, daarna terug naar `idle`.
3. Bij fout antwoord: `damage` eenmalig, daarna terug naar `idle`.

Haptics:
1. Bij `damage`: korte impact haptic.
2. Bij `success`: lichte positieve haptic.

## Extra MVP Asset - Speech Bubble
Aanbevolen extra voor expressie:
1. Pixel-art 9-slice speech bubble.
2. Dynamisch schaalbaar op tekstlengte.
3. Kleur:
- licht (wit/lichtgrijs) met donkere rand voor contrast op paarse background.
4. Pixel pointer die naar BitByte wijst.

## Acceptatiecriteria (MVP)
1. BitByte heeft werkende 4-state visuele set (`idle/thinking/success/damage`).
2. State switch start <= 200ms na user answer.
3. Geen visuele regressie op kleine schermen.
4. Geen visuele overload (korte reacties, geen lange blokkerende animaties).
5. Emotionele mapping is consistent:
- correct = positieve reactie
- wrong = impact/glitch reactie

## Out-of-scope in deze fase
1. Uitgebreide cutscenes.
2. Meerdere karaktertypes met unieke rigs.
3. Complexe narrative dialog trees.
