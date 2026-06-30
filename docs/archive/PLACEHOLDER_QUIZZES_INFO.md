# ✅ Placeholder Quizzes - Compleet UX/UI Test Systeem

## 📊 Status: KLAAR VOOR TESTEN

Alle vakken en niveaus hebben nu werkende placeholder quiz data voor volledige UX/UI testing!

## 🎯 Wat is er toegevoegd?

### 📚 Nieuwe Placeholder Quiz Database

**Bestand:** `assets/data/placeholder_quizzes.json`

**7 Vakken × 2 Niveaus = Volledige Coverage:**

| Vak | Basis | Gevorderd | Vragen per niveau |
|-----|-------|-----------|-------------------|
| 🇳🇱 Nederlands | ✅ | ✅ | 10 per niveau |
| 🔢 Wiskunde | ✅ | ⏳ | 10 basis |
| 🌍 Geschiedenis | ✅ | ⏳ | 10 basis |
| 🗺️ Aardrijkskunde | ✅ | ⏳ | 10 basis |
| 🇬🇧 Engels | ✅ | ⏳ | 10 basis |
| 🧬 Biologie | ✅ | ⏳ | 10 basis |
| ⚛️ Natuurkunde | ✅ | ⏳ | 10 basis |

**Totaal: 80 placeholder vragen** beschikbaar voor testing!

### 🔄 Automatische Integratie

**Files aangepast:**
- ✅ `app/quiz-screen.tsx` - Laadt beide datasets (origineel + placeholders)
- ✅ `components/home/Map.tsx` - Gebruikt gecombineerde data
- ✅ `constants/subjects.ts` - Uitgebreid met levels en grades

**Smart Matching:**
- Exact match: `subject` + `class_level` (bijv. "Nederlands" + "basis VWO 1")
- Fallback: Alleen `subject` als geen exacte match
- Daily challenges: Combineert ALLE vragen uit beide bestanden

## 🎮 Wat kun je nu testen?

### ✅ Normale Quizzes
Alle vakken zijn testbaar voor:
- **Basis VWO 1** niveau
- **Gevorderd VWO 1** niveau (Nederlands)
- Verschillende onderwerpen en moeilijkheidsgraden

### ✅ Daily Challenges  
- Pool van 80+ vragen beschikbaar
- Automatisch dagelijks nieuwe selectie
- Test of daily challenge flow goed werkt

### ✅ Complete User Flows
- Onboarding → Vak selectie → Quiz starten
- XP verdienen en level up systeem
- Lives systeem (3 fouten = game over)
- Resultaat scherm met scores
- Daily challenge progressie

## 📝 Voor na Testing / Voor Lancering

**⚠️ BELANGRIJK:**  
Deze placeholder data is ALLEEN voor UX/UI testing!

**Voor productie moet je:**
1. Echte, inhoudelijk correcte vragen toevoegen
2. Metadata invullen (textbook, learning_method)
3. Goede uitleg schrijven bij elke vraag
4. Tags toevoegen voor analytics
5. Moeilijkheidsgraden valideren

**Documentatie:**
- Zie `assets/data/README.md` voor gedetailleerde uitleg
- Structuur en formaat is gedocumenteerd
- Tips voor het toevoegen van nieuwe data

## 🚀 Direct Gebruiken

De app werkt nu out-of-the-box met alle placeholder data:

```bash
npm start
# of
npx expo start
```

**Test flows:**
1. Start app → Onboarding doorlopen
2. Selecteer een willekeurig vak
3. Start quiz en test de flow
4. Probeer daily challenge
5. Test alle 7 vakken

## 💡 Tips

- **Placeholder vragen zijn generic** - Ze testen de flow, niet de inhoud
- **10 vragen per quiz** - Genoeg voor een volledige quiz ervaring
- **Correcte antwoorden variëren** - Voor realistische testing
- **Daily challenges** - Herschuffle dagelijks voor variatie

## ✨ Extra Features Toegevoegd

- **Fallback matching** - Als geen exacte match, valt terug op subject alleen
- **Level & Grade constants** - Makkelijk uitbreidbaar
- **Gecombineerde data loading** - Transparant voor de gebruiker
- **Smart class level matching** - "basis VWO 1" format

---

**🎉 Je kunt nu de hele app grondig testen zonder echte content klaar te hebben!**

Succes met het testen van de UX/UI! 🚀




