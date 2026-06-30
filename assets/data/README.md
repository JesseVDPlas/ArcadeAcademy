# Quiz Data Structuur

## Bestanden

### `test_quiz_data_vwo1.json`
Bevat de **echte quiz data** met inhoudelijk correcte vragen. Dit bestand wordt gebruikt voor productie.

### `placeholder_quizzes.json`
Bevat **placeholder quiz data** voor UX/UI testing. Dit bestand zorgt ervoor dat alle vakken en niveaus testbaar zijn voordat de echte content klaar is.

## Beschikbare Vakken & Niveaus

### Vakken (Subjects)
- Nederlands
- Wiskunde  
- Engels
- Geschiedenis
- Aardrijkskunde
- Biologie
- Natuurkunde

### Niveaus
- `basis VWO 1` - Basisniveau voor VWO klas 1
- `gevorderd VWO 1` - Gevorderd niveau voor VWO klas 1

*Meer klassen (VWO 2, VWO 3, etc.) kunnen eenvoudig toegevoegd worden.*

## Quiz Structuur

Elke quiz heeft de volgende structuur:

```json
{
  "quiz_id": "unieke_identifier",
  "title": "Weergave titel",
  "subject": "Vaknaam (moet matchen met SUBJECTS)",
  "textbook": "Naam van het studieboek",
  "class_level": "basis VWO 1",
  "learning_method": "Naam van de leermethode",
  "questions": [...]
}
```

### Vraag Structuur

Elke vraag heeft:

```json
{
  "id": "unieke_vraag_id",
  "question_text": "De vraag die gesteld wordt",
  "options": [
    "Optie 1",
    "Optie 2", 
    "Optie 3",
    "Optie 4"
  ],
  "correct_option_index": 1,
  "explanation": "Uitleg waarom dit het goede antwoord is",
  "difficulty": "easy|medium|hard",
  "learning_goal": "Wat de leerling moet kunnen na deze vraag",
  "tags": ["tag1", "tag2"]
}
```

## Gebruik in de App

### Normale Quizzes
Quizzes worden geselecteerd op basis van:
- **Subject**: Moet exact matchen (hoofdlettergevoelig)
- **Class Level**: Combinatie van `level` + `grade` (bijv. "basis VWO 1")

### Daily Challenges
- Alle vragen uit **alle quizzes** (beide bestanden) worden samengevoegd
- 10 willekeurige vragen worden geselecteerd
- De selectie is dagelijks hetzelfde voor alle gebruikers (seed gebaseerd op datum)

## Nieuwe Quiz Data Toevoegen

### Voor Testen (Placeholder)
Voeg toe aan `placeholder_quizzes.json`:

1. Kopieer een bestaande quiz
2. Pas `quiz_id`, `title`, `subject` en `class_level` aan
3. Voeg minimaal 10 vragen toe (voor daily challenges)
4. Zorg dat `subject` matcht met `constants/subjects.ts`

### Voor Productie (Echte Data)
Voeg toe aan `test_quiz_data_vwo1.json`:

1. Gebruik dezelfde structuur als placeholder data
2. Zorg voor inhoudelijk correcte vragen
3. Voeg goede uitleg toe bij `explanation`
4. Tag vragen met relevante `tags` voor analyse

## Tips

- **Minimaal 10 vragen per quiz** - Dit zorgt voor voldoende variatie in daily challenges
- **Unieke IDs** - Gebruik beschrijvende IDs zoals `nl_basis_1` voor traceerbaarheid
- **Consistent naming** - Houd `subject` namen consistent (let op hoofdletters!)
- **Class level format** - Gebruik altijd `"[level] [grade]"` formaat (bijv. "basis VWO 1")

## Troubleshooting

**Quiz wordt niet gevonden?**
- Check of `subject` exact matcht (hoofdlettergevoelig)
- Check of `class_level` format correct is
- Als geen exacte match: app gebruikt fallback naar eerste quiz van dat vak

**Daily challenge heeft te weinig vragen?**
- Voeg meer quizzes toe
- Elke quiz moet minimaal 5-10 vragen hebben

**Voor lancering:**
- Vervang alle placeholder data in productie
- Test alle vakken en niveaus grondig
- Voeg echte metadata toe (textbook, learning_method, etc.)




