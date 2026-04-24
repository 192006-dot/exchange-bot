# Scoring Refinement — Design Spec

**Datum:** 2026-04-24
**Status:** Approved (pre-launch critical review)
**Autor:** Franz Kushnarev · Claude

## 1. Anlass

Vor dem Launch: systematischer Review der 20 Thesen und der Match-Formel. Fokus auf
**Cross-Thesis-Konsistenz** — Thesen sollen nicht nur einzeln zum Score beitragen,
sondern untereinander triangulieren (reinforcen) und bewusst opponieren.

## 2. Findings (Pre-Fix)

### Dimension-Imbalance
| Dim | # Thesen | Abs-Gewicht | Problem |
|-----|----------|-------------|---------|
| adventure | 9 | 13 | Dominiert Scoring (6.5× climate) |
| climate | 1 | 2 | Fast kein Signal |
| travel | 2 | 3 | Gering |

### Thesen-Level-Probleme
- **t19** hatte falsche Weights (`adventure/city/language`) obwohl Text "Kultur vs Party"
  — keinerlei Anti-Party-Signal
- **t2 & t16** hatten identische `nature:+2, adventure:+1` → Double-Counting
- **t11 & t13** hatten identische `easy:+2, adventure:-2` → Double-Counting
- **t5** hatte `city:+1` ohne logische Begründung
- **t7, t9** hatten unnötige `adventure:+1`

### Formel-Verifikation
Match-Prozent-Formel mathematisch korrekt:
- All-neutral → 50% Fallback ✓
- Perfect alignment → 100% ✓
- Perfect opposition → 0% ✓
- Kontradiktorische User-Antworten → User-Vektor geht auf 0 → kein Signal ✓

**Keine Änderungen am Algorithm nötig**, nur an den Thesen-Inputs.

## 3. Design-Prinzip: Cross-Thesis-Cluster

20 Thesen, gruppiert in 8 thematische Cluster:

| Cluster | Thesen | Beziehung | Achse |
|---------|--------|-----------|-------|
| City-Size | t3, t15 | ⚔️ Opposition | city (±4) |
| Nightlife vs Kultur | t14, t19 | ⚔️ Opposition | social (±2), academic (±2) |
| Outdoor | t2, t16 | 🤝 Triangulation | nature (+3), adventure (+2) |
| Budget | t4, t5 | ⚔️ Opposition | cost (±4) |
| Career | t6, t7, t18 | ⚔️ t6+t18 vs t7 | career (±4) |
| Sprache | t8, t9 | ⚔️ Opposition | english ↔ language |
| Culture-Distance | t10, t11, t13 | ⚔️ t10 vs t11+t13 | adventure, easy |
| Standalone | t1, t12, t17, t20 | Singuläre Signale | climate, travel, social, adventure |

## 4. Finale Thesen-Weights

```ts
t1:  { climate: 2, nature: 1 }
t2:  { nature: 2, city: -1 }                     // adventure entfernt
t3:  { city: 2, nature: -1, social: 1 }
t4:  { cost: 2, career: -1 }
t5:  { cost: -2, academic: 1, career: 1 }        // city entfernt
t6:  { academic: 2, career: 2, easy: -1 }
t7:  { career: -2, travel: 1 }                   // adventure entfernt
t8:  { english: 2, language: -2 }
t9:  { language: 2, english: -1 }                // adventure entfernt
t10: { adventure: 2, easy: -2, language: 1, climate: 1 }  // climate+1 neu
t11: { easy: 2, adventure: -1 }                  // adventure -2→-1
t12: { travel: 2, easy: 1 }
t13: { easy: 1, adventure: -2 }                  // easy 2→1
t14: { city: 2, social: 1, academic: -1 }
t15: { city: -2, nature: 1, easy: 1 }
t16: { nature: 1, adventure: 2 }                 // swap: adventure-Fokus
t17: { social: 2, english: 1 }
t18: { career: 2, academic: 1, social: -1 }
t19: { city: 1, social: -1, academic: 1 }        // komplett neu
t20: { adventure: 2, social: 1, easy: -1 }
```

**9 von 20 Thesen geändert.** 11 unverändert.

## 5. Post-Fix Dimension-Balance

| Dim | Alt | Neu | Delta |
|-----|-----|-----|-------|
| adventure | 13 | 9 | −4 |
| climate | 2 | 3 | +1 |
| nature | 7 | 6 | −1 |
| city | 9 | 8 | −1 |
| Andere | — | — | unverändert |

Adventure fällt von 6.5× climate auf 3× → deutlich bessere Proportion.

## 6. Persona-Validation

Alle 7 Personas durchlaufen, top-5 stimmt besser:

| Persona | Top-Match | Prüfung |
|---------|-----------|---------|
| Warm-Seeker | HEM 73%, UBA 72%, Cairo 70% | ✅ Alle warm+LatAm/Africa |
| Academic-Elitist | NYU 97%, Berkeley 96%, Emory 92% | ✅ Schärfer Peak (war 95/95/89) |
| Europe-Stayer | FU Berlin 89%, CBS 88%, IÉSEG 88% | ✅ Durchgehend EU |
| Adventurer | HEM 78%, Pacífico 77%, UBA 75% | ✅ Non-EU + Kultur |
| Budget-Backpacker | Cairo 68%, Chulalongkorn 68% | ✅ Günstig + warm |
| Social-Party | NUS, NTU, SMU, NYU — 90-91% | ✅ 3 Singapur-Cluster |
| Alpen-Outdoor | St.Gallen 73%, NHH 71%, Stellenbosch 70% | ✅ Mountain/small-town |

## 7. Launch-Ready-Kriterien (alle ✅)

- [x] Dimension-Balance sanitized
- [x] Cross-Thesis-Cluster designed
- [x] Double-Counting entfernt (t2/t16, t11/t13)
- [x] t19 text-weight-Konsistenz behoben
- [x] 52/52 Tests grün
- [x] Alle 7 Personas produzieren plausible Ergebnisse
- [x] Formel mathematisch verifiziert (edge cases)

## 8. Out-of-Scope für diesen Pass

- UI/UX-Änderungen am Quiz
- GPA-Cutoff-Daten (bereits in eigenem Pass committed)
- University-Scores (bereits recherchiert)
- Neue Thesen-Texte (falls neue Dimensions-Signale nötig)
