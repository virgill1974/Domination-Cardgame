# Balance-Simulation Domination

Erzeugt am 27.9.2026 mit dem Balance-Simulator (`npm run sim`, Tools/sim/). Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt 8).

## Kurzfassung

**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt 5), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. 1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.

| Fraktion | Stärke | Bereich (95 %) | Einschätzung | Beste Spielweise (Abschnitt 4) | Optimierte Strategie bei 30 SP: Schwerpunkte |
|---|---|---|---|---|---|
| Starwing | 1,06 | 1,01–1,11 | ausgeglichen | Festung | sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung |
| Lightforce | 1,07 | 1,01–1,12 | ausgeglichen | Händler | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten |
| Scaretech | 0,77 | 0,72–0,81 | **zu schwach** | Festung | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung |
| Biotec | 1,10 | 1,06–1,15 | etwas zu stark | Blitzangriff | greift oft an, kaum Technologiebaum, starke Verteidigung |


- **Stärkste Fraktion: Biotec** (1,10), **schwächste: Scaretech** (0,77).
- Am deutlichsten ist die Abweichung bei **2 Spielern**: Biotec gewinnt 75 % der entschiedenen Partien (fair: 50 %).
- Auffälligste Karte: **Extend** (Biotec, 600 Credits, 3/3/2) mit dem höchsten Kampfwert je Credit im Spiel (1,09 je 1000 Credits, beste Einheit einer anderen Fraktion: Damokles mit 0,77), schon über den Startplaneten Hive zu haben (Abschnitt 7).
- Wer anfängt, hat einen Vorteil: Bei 4 Spielern gewinnt Platz 1 27 %, Platz 4 nur 23 % (Abschnitt 2).
- **Überlastung mit der neuen Regel** (gerettete Energiequelle wird verdeckt neu ausgelegt): Selbst wenn eine Fraktion ihre Energiequelle anfangs in Reihe 2 legt, setzt sie höchstens 1,31 Züge je Partie aus, vorher waren es bis zu 3,9 (Abschnitt 6).

## 1. Balance mit optimierten Strategien

Jede Fraktion spielt die Einstellungen, die der Optimierer für sie gefunden hat (Abschnitt 5). Alle Sitzordnungen, 200 Partien je Sitzordnung und Einstellung. Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.

### 2 Spieler (fair: 50 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 38,9 % (36 %–42 %) ▼ | 37,4 % (35 %–40 %) ▼ | 43,4 % (40 %–46 %) ▼ |
| Lightforce | 39,2 % (36 %–42 %) ▼ | 48,1 % (45 %–51 %) | 19,7 % (17 %–22 %) ▼ |
| Scaretech | 36,5 % (34 %–39 %) ▼ | 43,3 % (40 %–46 %) ▼ | 66,6 % (64 %–69 %) ▲ |
| Biotec | 85,4 % (83 %–87 %) ▲ | 71,3 % (69 %–74 %) ▲ | 67,2 % (65 %–70 %) ▲ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 2.400 | 2.400 | 2.400 |
| Ø Runden | 17,6 | 23,3 | 44,3 |
| Sieg durch Zentralgestirn | 26,5 % | 19,7 % | 94,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 5,1 % |

### 3 Spieler (fair: 33 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 34,9 % (33 %–37 %) | 30,6 % (29 %–32 %) | 50,8 % (49 %–52 %) ▲ |
| Lightforce | 49,3 % (48 %–51 %) ▲ | 37,4 % (36 %–39 %) ▲ | 29,1 % (28 %–31 %) ▼ |
| Scaretech | 21,6 % (20 %–23 %) ▼ | 25,7 % (24 %–27 %) ▼ | 27,7 % (26 %–29 %) ▼ |
| Biotec | 27,5 % (26 %–29 %) ▼ | 39,6 % (38 %–41 %) ▲ | 25,8 % (24 %–27 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 4.800 | 4.800 | 4.800 |
| Ø Runden | 17,1 | 21,2 | 27,2 |
| Sieg durch Zentralgestirn | 35,9 % | 41,5 % | 98,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 1,1 % |

### 4 Spieler (fair: 25 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 27,3 % (26 %–29 %) | 22,8 % (22 %–24 %) | 41,4 % (40 %–43 %) ▲ |
| Lightforce | 39,5 % (38 %–41 %) ▲ | 28,9 % (28 %–30 %) ▲ | 30,9 % (30 %–32 %) ▲ |
| Scaretech | 18,1 % (17 %–19 %) ▼ | 17,0 % (16 %–18 %) ▼ | 8,0 % (7 %–9 %) ▼ |
| Biotec | 15,1 % (14 %–16 %) ▼ | 31,3 % (30 %–33 %) ▲ | 19,8 % (19 %–21 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 4.800 | 4.800 | 4.800 |
| Ø Runden | 15,9 | 20,9 | 19,0 |
| Sieg durch Zentralgestirn | 61,1 % | 44,9 % | 100,0 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,0 % |

## 2. Vorteil durch die Sitzreihenfolge

Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen.

| Spieler | Platz 1 | Platz 2 | Platz 3 | Platz 4 | fair |
|---|---|---|---|---|---|
| 2 | 57,0 % | 43,0 % |  |  | 50 % |
| 3 | 36,1 % | 32,6 % | 31,3 % |  | 33 % |
| 4 | 27,1 % | 26,1 % | 24,0 % | 22,7 % | 25 % |

## 3. Wenn alle dieselbe Spielweise wählen

Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. Stärke relativ zu fair, gemittelt über 2–4 Spieler (20 Partien je Sitzordnung).

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,16 | 0,44 | 0,79 | 1,60 |
| Händler | 0,96 | 0,82 | 1,11 | 1,11 |
| Blitzangriff | 0,83 | 0,34 | 0,58 | 2,24 |
| Festung | 1,67 | 0,71 | 0,88 | 0,74 |
| Superwaffe | 0,69 | 0,71 | 1,16 | 1,44 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,40 | 0,37 | 0,98 | 1,25 |
| Händler | 1,28 | 0,52 | 1,21 | 1,00 |
| Blitzangriff | 1,01 | 0,45 | 0,65 | 1,89 |
| Festung | 1,87 | 0,41 | 0,67 | 1,04 |
| Superwaffe | 0,90 | 0,72 | 1,57 | 0,81 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,24 | 0,70 | 1,14 | 0,92 |
| Händler | 0,80 | 0,33 | 0,37 | 2,09 |
| Blitzangriff | 1,16 | 0,53 | 0,82 | 1,49 |
| Festung | 1,35 | 0,87 | 1,07 | 0,78 |
| Superwaffe | 0,98 | 0,85 | 1,36 | 0,80 |

## 4. Welche Spielweise passt zu welcher Fraktion

Eine Fraktion probiert jede Spielweise, alle Gegner spielen „Ausgewogen“. Stärke relativ zu fair, gemittelt über 2–4 Spieler. Fett: beste Spielweise der Fraktion.

- **Ausgewogen:** alles in Maßen (Referenz).
- **Händler:** zuerst Handelsplaneten und Einkommen, die Armee später.
- **Blitzangriff:** früh günstige Einheiten, greift jede Runde an, zielt auf Planeten und das Zentralgestirn.
- **Festung:** Planeten, Upgrades, Planetenabwehr, Reparaturen; sammelt Siegpunkte und greift nur bei klarem Vorteil an.
- **Superwaffe:** spart früh auf den Technologiebaum bis zur Superwaffe.

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,16 | 0,41 | 0,78 | 1,57 |
| Händler | 1,01 | **0,88** | 1,09 | 1,27 |
| Blitzangriff | 0,57 | 0,26 | 0,46 | **1,97** |
| Festung | **1,59** | 0,84 | **1,32** | 1,46 |
| Superwaffe | 0,53 | 0,43 | 0,75 | 1,11 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,32 | 0,45 | 0,89 | **1,32** |
| Händler | 1,43 | 0,69 | 1,08 | 1,10 |
| Blitzangriff | 0,69 | 0,14 | 0,50 | 1,08 |
| Festung | **1,93** | **0,74** | **1,64** | 1,16 |
| Superwaffe | 0,85 | 0,49 | 1,13 | 0,95 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,29 | 0,64 | 1,04 | 1,04 |
| Händler | 1,58 | 0,65 | 0,85 | **1,87** |
| Blitzangriff | 1,22 | 0,43 | 0,83 | 0,77 |
| Festung | 1,57 | 0,99 | 1,19 | 1,06 |
| Superwaffe | **1,79** | **1,31** | **1,81** | 1,43 |

## 5. Die optimierten Strategien

Der Optimierer (Evolutionsstrategie, 5 Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler), getrennt für jede Siegpunkt-Einstellung, denn in langen Partien lohnt sich eine andere Spielweise als in kurzen. Startpunkt war jeweils die beste Spielweise aus Abschnitt 4. Ab etwa der Hälfte der Generationen änderte sich die Stärke nur noch im Rahmen des Zufalls.

**Schwerpunkte je Siegpunkt-Einstellung** (die drei deutlichsten Abweichungen von „Ausgewogen“):

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung | kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung | kauft Upgrades, starke Verteidigung, greift den Schwächsten an |
| Lightforce | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten | viele Einheiten, sammelt Siegpunkte (Planeten, Upgrades), spart auf teure Karten | strebt die Superwaffe an, baut den Technologiebaum aus, setzt auf Handelsplaneten |
| Scaretech | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), strebt die Superwaffe an | hält Credits zurück, strebt die Superwaffe an, setzt auf Handelsplaneten |
| Biotec | greift oft an, kaum Technologiebaum, starke Verteidigung | kauft Upgrades, hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades) | strebt die Superwaffe an, starke Verteidigung, spart auf teure Karten |

**Alle Einstellungen bei 30 SP:**

| Einstellung | Ausgewogen | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|---|
| Wirtschaft (Handelsplaneten) | 1,00 | 1,79 | 1,15 | 1,54 | 0,39 |
| Einheiten | 1,00 | 1,20 | 2,13 | 2,15 | 0,77 |
| Hyperraumschiffe | 1,00 | 0,71 | 1,28 | 0,54 | 1,05 |
| Siegpunkte (Planeten, Upgrades) | 1,00 | 2,67 | 2,98 | 2,31 | 0,59 |
| Technologiebaum | 1,00 | 1,66 | 0,21 | 0,89 | 0,00 |
| Upgrade-Wirkungen | 1,00 | 2,54 | 1,23 | 0,96 | 1,45 |
| Superwaffe | 1,00 | 0,27 | 1,17 | 0,19 | 1,28 |
| Verteidigung | 1,00 | 1,91 | 1,88 | 2,20 | 1,72 |
| Mindestbesetzung Reihe 1 | 3,00 | 4,35 | 3,48 | 5,00 | 2,52 |
| Credit-Reserve | 400 | 730 | 379 | 1500 | 677 |
| Sparen auf teure Karten | 0,50 | 0,47 | 0,88 | 0,55 | 0,32 |
| Angriffslust | 200 | -83 | -390 | 15 | 1111 |
| Planeten-/Zentralgestirn-Angriffe | 1,00 | 0,96 | 1,53 | 1,76 | 0,66 |
| Führenden angreifen (1) / Schwächsten (0) | 0,60 | 0,89 | 0,45 | 0,71 | 0,76 |
| Reparieren | 1,00 | 1,36 | 2,52 | 0,52 | 0,81 |
| Zentralgestirn hinten (≥ 0,5) | 1,00 | 1,00 | 0,85 | 0,87 | 0,95 |

### Starwing

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung, bremst den Führenden, setzt auf Handelsplaneten.
- **So gewinnt sie:** Ø 9,6 Planeten, 1,6 Upgrades, 13,4 Sterne, 1,0 Münzen; 69 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 9,3; 15,9 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssystem · R2: – · R3: Protonenmond (94 %, 35 %)
  - R1: Handelssystem · R2: – · R3: – (4 %, 21 %)
  - R1: Handelssystem · R2: – · R3: Auge des Kolumbus, Auge des Kolumbus (1 %, 42 %)
- **Karten, mit denen sie öfter gewinnt:** Schildgenerator (+16 Pkt.), Ionenpulsar (+13 Pkt.), Auge des Raumes (+11 Pkt.), Sternenparlament (+10 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Weißer Golem (−8 Pkt.), Aufklärungskomplex (−5 Pkt.), Phoenix (−4 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Lightforce

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten, viele Einheiten, greift nur bei klarem Vorteil an.
- **So gewinnt sie:** Ø 10,3 Planeten, 1,4 Upgrades, 14,0 Sterne, 1,2 Münzen; 51 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,2; 15,7 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssektor · R2: Strahlenjäger · R3: Elektronenmond (53 %, 39 %)
  - R1: Handelssektor · R2: – · R3: Elektronenmond (32 %, 28 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: Strahlenjäger, Strahlenjäger (10 %, 39 %)
- **Karten, mit denen sie öfter gewinnt:** Nachtsicht (+18 Pkt.), Schutzring (+7 Pkt.), Lichtgeschwindigkeit (+7 Pkt.), Lichtkoloss (+5 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Drohnenkolonie (−2 Pkt.), Supernova (−2 Pkt.), Handelssektor (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Scaretech

- **Schwerpunkte gegenüber „Ausgewogen“:** hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung, viele Einheiten, volle 1. Reihe.
- **So gewinnt sie:** Ø 8,2 Planeten, 1,5 Upgrades, 21,0 Sterne, 1,0 Münzen; 61 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,0; 17,3 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Telecluster, Antimaterieminen · R2: – · R3: – (34 %, 24 %)
  - R1: Antimaterieminen, Shadow Arm, Shadow Arm · R2: Shadow Arm · R3: – (30 %, 19 %)
  - R1: Telecluster, Antimaterieminen · R2: Shadow Arm, Shadow Arm · R3: Shadow Arm (26 %, 23 %)
- **Karten, mit denen sie öfter gewinnt:** Spionagezentrum (+51 Pkt.), Rage (+40 Pkt.), Rauminvasion (+33 Pkt.), Assimilation (+29 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Telecluster (−1 Pkt.), Antimaterieminen (+0 Pkt.), Shadow Arm (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Biotec

- **Schwerpunkte gegenüber „Ausgewogen“:** greift oft an, kaum Technologiebaum, starke Verteidigung, wenig Wirtschaft, hält Credits zurück.
- **So gewinnt sie:** Ø 4,7 Planeten, 1,2 Upgrades, 20,4 Sterne, 1,1 Münzen; 62 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 4,3; 34,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: – · R2: Abt. Kapital · R3: Einheit 5 (34 %, 28 %)
  - R1: Tyrant, Extend, Extend · R2: – · R3: – (33 %, 29 %)
  - R1: – · R2: Abt. Kapital · R3: – (32 %, 40 %)
- **Karten, mit denen sie öfter gewinnt:** Agressor Panzer (+23 Pkt.), Regenerat. Panzer (+17 Pkt.), Deflektor (+14 Pkt.), Manufaktur (+11 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Hive (−16 Pkt.), Mutant (−2 Pkt.), Einheit 5 (−1 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

## 6. Regel-Auffälligkeiten

**Überlastung (geänderte Regel).** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte im Spiel, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. Neu ist: Sie wird dabei **verdeckt neu ausgelegt**. Vorher blieb sie aufgedeckt liegen und konnte jede Runde erneut angegriffen werden; der Besitzer setzte dann immer wieder aus („Überlastungs-Sperre“, im alten Stand bis zu 3,9 ausgesetzte Züge je Partie).

Versuch mit der neuen Regel: Eine Fraktion legt ihre Energiequelle anfangs in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP). Nach einer Überlastung legt sie sie verdeckt nach hinten, wie es die neue Regel erlaubt.

| Fraktion | Spieler | Aussetzen je Partie (hinten) | Aussetzen je Partie (Reihe 2) | Siegquote (hinten) | Siegquote (Reihe 2) |
|---|---|---|---|---|---|
| Starwing | 2 | 0,23 | 1,07 | 39 % | 41 % |
| Starwing | 4 | 0,05 | 1,13 | 27 % | 28 % |
| Lightforce | 2 | 0,04 | 0,80 | 39 % | 52 % |
| Lightforce | 4 | 0,01 | 0,36 | 39 % | 38 % |
| Biotec | 2 | 0,06 | 0,10 | 85 % | 86 % |
| Biotec | 4 | 0,53 | 1,31 | 15 % | 15 % |

**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt 44 Runden; 5 % der Partien hatten nach 120 Runden noch keinen Sieger, am häufigsten mit Lightforce (10 % ihrer Partien) und Starwing (7 %).

## 7. Kampfwert der Einheiten

Mittlere Siegchance im Einzelgefecht gegen alle Einheiten der anderen Fraktionen (je zur Hälfte als Angreifer und als Verteidiger, Grundwerte ohne Upgrades), exakt berechnet. „je 1000 Credits“ setzt das ins Verhältnis zum Preis; fett = besonders günstig. Einheiten mit Defensive 0 zerstören sich bei jedem Angriff selbst. Startplaneten sind mit * markiert: Ihre Einheiten sind ab Runde 1 kaufbar.

| Fraktion | Einheit | Preis | Def/Off/Schaden | freigeschaltet durch | Kampfwert | je 1000 Credits |
|---|---|---|---|---|---|---|
| Starwing | Fährtensucher | 225 | 1/1/1 | Aufklärungskomplex * | 13 % | 0,59 |
| Starwing | Auge des Kolumbus | 300 | 1/2/1 | Aufklärungskomplex * | 19 % | 0,63 |
| Starwing | Phoenix | 700 | 2/2/1 | Orbitaldock | 27 % | 0,39 |
| Starwing | Pegasus | 900 | 3/3/1 | Orbitaldock | 48 % | 0,54 |
| Starwing | Weißer Golem | 1100 | 2/4/2 | Orbitaldock | 47 % | 0,43 |
| Starwing | Poseidons Fluch | 1200 | 4/4/3 | Orbitaldock | 80 % | **0,66** |
| Starwing | Zeus | 1200 | 3/3/1 | Hyperraumnebel | 48 % | 0,40 |
| Starwing | Nostradamus | 1400 | 3/3/2 | Hyperraumnebel | 62 % | 0,44 |
| Lightforce | Lichtfunke | 200 | 1/1/1 | Drohnenkolonie * | 13 % | **0,67** |
| Lightforce | Strahlenjäger | 300 | 1/2/1 | Drohnenkolonie * | 19 % | 0,65 |
| Lightforce | Glutdrache | 800 | 2/3/1 | Weltraumwerft | 34 % | 0,42 |
| Lightforce | Sonnenfaust | 900 | 3/3/1 | Weltraumwerft | 51 % | 0,56 |
| Lightforce | Inferno | 1000 | 2/4/2 | Weltraumwerft | 49 % | 0,49 |
| Lightforce | Lichtpfeil | 1200 | 3/3/2 | Warpgate | 64 % | 0,53 |
| Lightforce | Novakanone | 1600 | 2/4/3 | Weltraumwerft | 55 % | 0,34 |
| Lightforce | Lichtkoloss | 2200 | 5/5/3 | Weltraumwerft | 89 % | 0,41 |
| Scaretech | Shadow Arm | 150 | 1/1/1 | Telecluster * | 11 % | **0,72** |
| Scaretech | Photonenhagel | 250 | 0/3/2 | Telecluster * | 0 % | 0,00 |
| Scaretech | Schattenschleuder | 500 | 2/2/1 | Flottenbasis | 26 % | 0,52 |
| Scaretech | Sternenaxt | 600 | 3/2/1 | Flottenbasis | 37 % | 0,62 |
| Scaretech | Rage | 800 | 1/3/2 | Flottenbasis | 29 % | 0,36 |
| Scaretech | Damokles | 900 | 4/3/2 | Flottenbasis | 69 % | **0,77** |
| Scaretech | Erazor | 1000 | 0/5/5 | Flottenbasis | 0 % | 0,00 |
| Scaretech | Doomhammer | 1200 | 2/4/3 | Flottenbasis | 56 % | 0,47 |
| Biotec | Einheit 5 | 150 | 1/1/1 | Hive * | 12 % | **0,80** |
| Biotec | Mutant | 250 | 1/1/2 | Hive * | 16 % | 0,64 |
| Biotec | Tyrant | 500 | 2/3/2 | Hive * | 47 % | **0,93** |
| Biotec | Extend | 600 | 3/3/2 | Hive * | 66 % | **1,09** |
| Biotec | Artillerie Panzer | 800 | 1/3/2 | Manufaktur | 30 % | 0,38 |
| Biotec | Agressor Panzer | 900 | 4/3/2 | Manufaktur | 73 % | **0,82** |
| Biotec | Regenerat. Panzer | 1000 | 3/5/5 | Manufaktur | 83 % | **0,83** |
| Biotec | Helicopter | 1200 | 2/4/3 | Helipad | 59 % | 0,50 |

## 8. Modell und Grenzen

- **Regeln:** Einkommen, Bauzeiten, Energie, Kaufen, alle Kampfarten, Reparatur, Upgrades, Münzen, Siegpunkte und Sonderaktion kommen unverändert aus der App-Engine (`src/engine/`).
- **Tischregeln** (nicht in der App, im Simulator nachgebaut, `Tools/sim/board.ts`):
  - 3 Reihen × 7 Felder, Stapelregeln in Reihe 1; Planeten liegen verdeckt und werden durch einen Angriff aufgedeckt.
  - Reihe 2 ist erst angreifbar, wenn Reihe 1 leer ist, Reihe 3 erst, wenn Reihe 1 und 2 leer sind.
  - Hyperraumschiffe (und Scaretech-Aufklärer mit Wurmloch) überspringen nur die 1. Reihe: Reihe 3 erst, wenn Reihe 2 leer ist. Die Superwaffe erreicht alles.
  - Wer einen verdeckten Planeten angreift, erwischt zufällig einen der verdeckten Planeten der gewählten Reihe.
  - Überlastung: Eine gerettete Energiequelle wird verdeckt neu ausgelegt.
  - Auge des Raumes deckt zu Zugbeginn einen gegnerischen Planeten auf. Schwarzer Schleier legt Scaretech-Einheiten verdeckt. Neuronetz tauscht verdeckte Planeten; das Umsetzen von Einheiten bringt im Modell nichts.
- **Bots:** bewerten jede mögliche Aktion in Credits, mit exakt berechneten Kampfwahrscheinlichkeiten. Sie sehen nur, was am Tisch sichtbar ist. Energiequellen und das Zentralgestirn legen sie nach hinten und halten mindestens zwei Planeten als Schutz in Reihe 2.
- **Grenzen:** Bots bluffen nicht, sprechen sich nicht ab und planen nur einen Zug voraus (plus Sparziel). Menschen spielen anders, besonders mit Absprachen zu dritt oder zu viert. Die Ergebnisse zeigen Tendenzen im Kartenmaterial, keine exakten Siegchancen am Tisch.
- **Remis:** Partien ohne Sieger nach 120 Runden zählen nicht in die Siegquoten.

## 9. Nachrechnen

```bash
npm run sim -- all                  # Versuche A+B, Optimierung, Balance-Urteil, Bericht
npm run sim -- strategies --games 60
npm run sim -- tune --gens 16 --g2 60 --g4 12   # je Siegpunkt-Einstellung, oder --vp 30
npm run sim -- final --games 300
npm run sim -- exploits
npm run sim -- final --games 150 --patch werte.json --tag name --label "Text"
npm run sim -- report
```

Umfang dieses Berichts: rund 626.000 simulierte Partien.
