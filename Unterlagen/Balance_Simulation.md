# Balance-Simulation Domination

Erzeugt am 29.9.2026 mit dem Balance-Simulator (`npm run sim`, Tools/sim/). Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt 9).

## Kurzfassung

**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt 5), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. 1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.

| Fraktion | Stärke | Bereich (95 %) | Einschätzung | Beste Spielweise (Abschnitt 4) | Optimierte Strategie bei 30 SP: Schwerpunkte |
|---|---|---|---|---|---|
| Starwing | 1,00 | 0,95–1,05 | ausgeglichen | Festung | sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung |
| Lightforce | 1,08 | 1,03–1,13 | ausgeglichen | Festung | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten |
| Scaretech | 0,97 | 0,92–1,01 | ausgeglichen | Festung | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten |
| Biotec | 0,95 | 0,91–1,00 | ausgeglichen | Blitzangriff | greift oft an, hält Credits zurück, bremst den Führenden |


- **Stärkste Fraktion: Lightforce** (1,08), **schwächste: Biotec** (0,95).
- Am deutlichsten ist die Abweichung bei **4 Spielern**: Lightforce gewinnt 34 % der entschiedenen Partien (fair: 25 %).
- Auffälligste Karte: **Extend** (Biotec, 600 Credits, 3/3/2) mit dem höchsten Kampfwert je Credit im Spiel (1,09 je 1000 Credits, beste Einheit einer anderen Fraktion: Damokles mit 0,77), schon über den Startplaneten Hive zu haben (Abschnitt 8).
- Fairste getestete Sitzreihenfolge: **F: A + Platz 2/3/4 bekommen +200/300/400**. Vorteil des Startspielers zu zweit 6 Pkt. statt 14 Pkt., zu viert 0 Pkt. statt 7 Pkt. (Abschnitt 6).
- Wer anfängt, hat einen Vorteil: Bei 4 Spielern gewinnt Platz 1 28 %, Platz 4 nur 21 % (Abschnitt 2).
- **Überlastung mit der neuen Regel** (gerettete Energiequelle wird verdeckt neu ausgelegt): Selbst wenn eine Fraktion ihre Energiequelle anfangs in Reihe 2 legt, setzt sie höchstens 1,46 Züge je Partie aus, vorher waren es bis zu 3,9 (Abschnitt 7).

## 1. Balance mit optimierten Strategien

Jede Fraktion spielt die Einstellungen, die der Optimierer für sie gefunden hat (Abschnitt 5). Alle Sitzordnungen, 200 Partien je Sitzordnung und Einstellung. Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.

### 2 Spieler (fair: 50 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 31,3 % (29 %–34 %) ▼ | 38,8 % (36 %–42 %) ▼ | 37,0 % (34 %–40 %) ▼ |
| Lightforce | 44,1 % (41 %–47 %) ▼ | 45,6 % (43 %–48 %) | 28,8 % (26 %–31 %) ▼ |
| Scaretech | 44,5 % (42 %–47 %) ▼ | 59,4 % (57 %–62 %) ▲ | 88,8 % (87 %–91 %) ▲ |
| Biotec | 80,2 % (78 %–82 %) ▲ | 56,3 % (53 %–59 %) ▲ | 44,1 % (41 %–47 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 2.400 | 2.400 | 2.400 |
| Ø Runden | 17,1 | 24,1 | 41,8 |
| Sieg durch Zentralgestirn | 30,1 % | 13,3 % | 96,5 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 3,5 % |

### 3 Spieler (fair: 33 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 37,9 % (36 %–40 %) ▲ | 28,9 % (27 %–30 %) ▼ | 46,0 % (44 %–48 %) ▲ |
| Lightforce | 44,9 % (43 %–47 %) ▲ | 37,4 % (36 %–39 %) ▲ | 26,2 % (25 %–28 %) ▼ |
| Scaretech | 25,8 % (24 %–27 %) ▼ | 30,1 % (29 %–32 %) | 31,6 % (30 %–33 %) |
| Biotec | 24,6 % (23 %–26 %) ▼ | 36,9 % (35 %–38 %) | 29,6 % (28 %–31 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 4.800 | 4.800 | 4.800 |
| Ø Runden | 17,5 | 20,2 | 30,3 |
| Sieg durch Zentralgestirn | 32,8 % | 52,6 % | 98,6 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 1,4 % |

### 4 Spieler (fair: 25 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 28,8 % (28 %–30 %) ▲ | 22,4 % (21 %–24 %) | 35,9 % (35 %–37 %) ▲ |
| Lightforce | 40,2 % (39 %–42 %) ▲ | 27,8 % (27 %–29 %) | 34,4 % (33 %–36 %) ▲ |
| Scaretech | 20,2 % (19 %–21 %) ▼ | 19,8 % (19 %–21 %) ▼ | 15,1 % (14 %–16 %) ▼ |
| Biotec | 10,8 % (10 %–12 %) ▼ | 30,0 % (29 %–31 %) ▲ | 14,7 % (14 %–16 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 4.800 | 4.800 | 4.800 |
| Ø Runden | 17,0 | 19,4 | 21,4 |
| Sieg durch Zentralgestirn | 49,2 % | 67,7 % | 100,0 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,0 % |

## 2. Vorteil durch die Sitzreihenfolge

Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen.

| Spieler | Platz 1 | Platz 2 | Platz 3 | Platz 4 | fair |
|---|---|---|---|---|---|
| 2 | 56,8 % | 43,2 % |  |  | 50 % |
| 3 | 37,7 % | 33,3 % | 29,0 % |  | 33 % |
| 4 | 28,2 % | 26,4 % | 24,0 % | 21,4 % | 25 % |

## 3. Wenn alle dieselbe Spielweise wählen

Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. Stärke relativ zu fair, gemittelt über 2–4 Spieler (20 Partien je Sitzordnung).

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,24 | 0,44 | 1,08 | 1,23 |
| Händler | 1,09 | 1,03 | 1,20 | 0,67 |
| Blitzangriff | 0,80 | 0,31 | 0,59 | 2,29 |
| Festung | 1,55 | 0,63 | 1,19 | 0,64 |
| Superwaffe | 0,72 | 0,81 | 1,71 | 0,76 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,50 | 0,44 | 1,10 | 0,95 |
| Händler | 1,42 | 0,68 | 1,19 | 0,70 |
| Blitzangriff | 1,10 | 0,40 | 0,66 | 1,84 |
| Festung | 1,77 | 0,39 | 0,85 | 0,98 |
| Superwaffe | 0,96 | 0,82 | 1,85 | 0,37 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,21 | 0,69 | 1,27 | 0,83 |
| Händler | 0,77 | 0,33 | 0,41 | 2,03 |
| Blitzangriff | 1,10 | 0,54 | 0,90 | 1,45 |
| Festung | 1,29 | 0,91 | 1,12 | 0,79 |
| Superwaffe | 1,05 | 1,00 | 1,40 | 0,55 |

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
| Ausgewogen | 1,22 | 0,48 | 1,08 | 1,24 |
| Händler | 1,08 | 0,94 | 1,16 | 0,74 |
| Blitzangriff | 0,58 | 0,22 | 0,61 | **1,87** |
| Festung | **1,71** | **1,05** | **1,70** | 1,22 |
| Superwaffe | 0,53 | 0,52 | 1,01 | 0,66 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,42 | 0,47 | 1,24 | 0,92 |
| Händler | 1,52 | 0,70 | 1,20 | 0,71 |
| Blitzangriff | 0,71 | 0,17 | 0,48 | 0,99 |
| Festung | **2,05** | **0,84** | **1,82** | **1,03** |
| Superwaffe | 0,93 | 0,46 | 1,50 | 0,55 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,28 | 0,63 | 1,16 | 0,94 |
| Händler | 1,45 | 0,70 | 0,89 | **1,69** |
| Blitzangriff | 1,28 | 0,52 | 0,80 | 0,70 |
| Festung | 1,51 | 1,03 | 1,25 | 1,07 |
| Superwaffe | **1,83** | **1,42** | **1,85** | 1,31 |

## 5. Die optimierten Strategien

Der Optimierer (Evolutionsstrategie, 5 Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler), getrennt für jede Siegpunkt-Einstellung, denn in langen Partien lohnt sich eine andere Spielweise als in kurzen. Startpunkt war jeweils die beste Spielweise aus Abschnitt 4. Ab etwa der Hälfte der Generationen änderte sich die Stärke nur noch im Rahmen des Zufalls.

**Schwerpunkte je Siegpunkt-Einstellung** (die drei deutlichsten Abweichungen von „Ausgewogen“):

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung | kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), setzt auf Handelsplaneten | kauft Upgrades, greift den Schwächsten an, strebt die Superwaffe an |
| Lightforce | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten | sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten, spart auf teure Karten | strebt die Superwaffe an, setzt auf Handelsplaneten, spart auf teure Karten |
| Scaretech | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), strebt die Superwaffe an | hält Credits zurück, strebt die Superwaffe an, setzt auf Handelsplaneten |
| Biotec | greift oft an, hält Credits zurück, bremst den Führenden | hält Credits zurück, kauft Upgrades, zielt auf Planeten und das Zentralgestirn | strebt die Superwaffe an, kauft Upgrades, setzt auf Handelsplaneten |

**Alle Einstellungen bei 30 SP:**

| Einstellung | Ausgewogen | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|---|
| Wirtschaft (Handelsplaneten) | 1,00 | 1,61 | 1,15 | 1,57 | 0,36 |
| Einheiten | 1,00 | 1,29 | 2,02 | 2,60 | 0,55 |
| Hyperraumschiffe | 1,00 | 0,85 | 1,29 | 0,27 | 1,49 |
| Siegpunkte (Planeten, Upgrades) | 1,00 | 2,96 | 2,96 | 2,67 | 0,61 |
| Technologiebaum | 1,00 | 1,64 | 0,11 | 0,59 | 0,35 |
| Upgrade-Wirkungen | 1,00 | 2,70 | 1,19 | 1,68 | 1,01 |
| Superwaffe | 1,00 | 0,04 | 1,26 | 0,17 | 2,01 |
| Verteidigung | 1,00 | 2,65 | 2,15 | 2,35 | 1,74 |
| Mindestbesetzung Reihe 1 | 3,00 | 5,24 | 5,01 | 4,66 | 2,46 |
| Credit-Reserve | 400 | 566 | 421 | 1482 | 939 |
| Sparen auf teure Karten | 0,50 | 0,61 | 0,95 | 0,40 | 0,35 |
| Angriffslust | 200 | -334 | -400 | 58 | 1078 |
| Planeten-/Zentralgestirn-Angriffe | 1,00 | 0,81 | 1,50 | 1,56 | 1,00 |
| Führenden angreifen (1) / Schwächsten (0) | 0,60 | 0,76 | 0,36 | 0,66 | 0,90 |
| Reparieren | 1,00 | 2,30 | 2,46 | 0,03 | 1,06 |
| Zentralgestirn hinten (≥ 0,5) | 1,00 | 0,92 | 0,78 | 0,83 | 0,96 |

### Starwing

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, starke Verteidigung, repariert viel, greift nur bei klarem Vorteil an.
- **So gewinnt sie:** Ø 10,3 Planeten, 1,9 Upgrades, 14,5 Sterne, 1,0 Münzen; 67 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 9,4; 16,0 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssystem · R2: – · R3: Protonenmond (95 %, 33 %)
  - R1: Handelssystem · R2: – · R3: – (5 %, 27 %)
  - R1: Handelssystem · R2: Auge des Kolumbus · R3: Auge des Kolumbus (0 %, 20 %)
- **Karten, mit denen sie öfter gewinnt:** Schildgenerator (+15 Pkt.), Auge des Raumes (+11 Pkt.), Ionenpulsar (+10 Pkt.), Sternenparlament (+10 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Weißer Golem (−9 Pkt.), Aufklärungskomplex (−5 Pkt.), Phoenix (−4 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Lightforce

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), repariert viel, spart auf teure Karten, starke Verteidigung, greift nur bei klarem Vorteil an.
- **So gewinnt sie:** Ø 10,2 Planeten, 1,2 Upgrades, 14,5 Sterne, 1,2 Münzen; 52 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 7,6; 17,9 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssektor · R2: Strahlenjäger · R3: Elektronenmond (38 %, 43 %)
  - R1: Handelssektor · R2: – · R3: Elektronenmond (33 %, 30 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: Strahlenjäger, Strahlenjäger (22 %, 30 %)
- **Karten, mit denen sie öfter gewinnt:** Nachtsicht (+19 Pkt.), Schutzring (+7 Pkt.), Quantensammler (+6 Pkt.), Inferno (+5 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Supernova (−4 Pkt.), Drohnenkolonie (−3 Pkt.), Lichtpfeil (−2 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Scaretech

- **Schwerpunkte gegenüber „Ausgewogen“:** hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten, starke Verteidigung, repariert kaum.
- **So gewinnt sie:** Ø 8,0 Planeten, 1,4 Upgrades, 21,0 Sterne, 1,1 Münzen; 58 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,2; 19,6 Angriffe je Partie.
- **Wurmloch** (Aufklärer überspringen Reihe 1): in 14 % der Partien gebaut, Siegquote dann 56 % (sonst insgesamt 28 %).
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Telecluster, Antimaterieminen · R2: Shadow Arm, Shadow Arm · R3: – (33 %, 25 %)
  - R1: Antimaterieminen · R2: – · R3: – (32 %, 29 %)
  - R1: Telecluster, Antimaterieminen · R2: – · R3: – (31 %, 28 %)
- **Karten, mit denen sie öfter gewinnt:** Spionagezentrum (+55 Pkt.), Rauminvasion (+31 Pkt.), Photonenhagel (+30 Pkt.), Wurmloch (+28 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Telecluster (−1 Pkt.), Antimaterieminen (+0 Pkt.), Shadow Arm (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Biotec

- **Schwerpunkte gegenüber „Ausgewogen“:** greift oft an, hält Credits zurück, bremst den Führenden, strebt die Superwaffe an, starke Verteidigung.
- **So gewinnt sie:** Ø 4,8 Planeten, 1,2 Upgrades, 18,8 Sterne, 0,9 Münzen; 77 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 4,5; 29,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: – · R2: Mutant · R3: Abt. Kapital (39 %, 36 %)
  - R1: Tyrant, Extend, Extend · R2: – · R3: – (33 %, 25 %)
  - R1: – · R2: Mutant · R3: Mutant (23 %, 21 %)
- **Karten, mit denen sie öfter gewinnt:** Agressor Panzer (+26 Pkt.), Regenerat. Panzer (+20 Pkt.), Manufaktur (+13 Pkt.), Deflektor (+9 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Hive (−14 Pkt.), Einheit 5 (−3 Pkt.), Mutant (−2 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

## 6. Was wäre wenn: geänderte Werte und Regeln

Dieselben optimierten Bots spielen mit geänderten Kartenwerten oder Regeln (nur im Simulator, alle Sitzordnungen, 2–4 Spieler, alle Siegpunkt-Einstellungen). Ihre Käufe passen sie selbst an; neu optimiert wurden sie nicht. Stärke relativ zu fair wie in der Kurzfassung.

| Änderung | Starwing | Lightforce | Scaretech | Biotec | mittlere Abweichung | Vorteil Platz 1 (2 Sp.) | Vorteil Platz 1 (4 Sp.) | Biotec zu zweit |
|---|---|---|---|---|---|---|---|---|
| heutige Regeln und Werte | 1,00 | 1,08 | 0,97 | 0,95 | 0,05 | 14 Pkt. | 7 Pkt. | 60 % |
| A: Runde zu Ende spielen | 0,99 | 1,07 | 0,97 | 0,96 | 0,05 | 13 Pkt. | 4 Pkt. | 60 % |
| B: +100 Credits je späterem Platz | 0,98 | 1,10 | 0,91 | 1,00 | 0,07 | 8 Pkt. | 3 Pkt. | 63 % |
| C: A + B | 0,97 | 1,10 | 0,92 | 1,00 | 0,07 | 7 Pkt. | 1 Pkt. | 62 % |
| D: Angriffe erst ab Runde 3 | 0,99 | 1,08 | 0,97 | 0,95 | 0,05 | 14 Pkt. | 7 Pkt. | 60 % |
| E: Extend 3 Runden Bauzeit | 1,01 | 1,07 | 1,00 | 0,92 | 0,05 | 14 Pkt. | 8 Pkt. | 59 % |
| F: A + Platz 2/3/4 bekommen +200/300/400 | 0,97 | 1,13 | 0,96 | 0,94 | 0,08 | 6 Pkt. | 0 Pkt. | 59 % |
| G: A + Platz 2/3/4 bekommen +300/400/500 | 0,94 | 1,13 | 0,97 | 0,95 | 0,08 | 3 Pkt. | -4 Pkt. | 60 % |

*Mittlere Abweichung:* quadratisches Mittel der Abstände aller vier Fraktionen von 1,00; 0 wäre perfekt ausgeglichen. *Vorteil Platz 1:* Siegquote des Startspielers minus Siegquote des letzten Platzes (fair: 0). *Biotec zu zweit:* Anteil der Siege von Biotec mit 2 Spielern (fair: 50 %).


Genaue Änderungen:

- A: Runde zu Ende spielen: Regeln `{"finishRound":true}`
- B: +100 Credits je späterem Platz: Regeln `{"seatBonus":[0,100,200,300]}`
- C: A + B: Regeln `{"finishRound":true,"seatBonus":[0,100,200,300]}`
- D: Angriffe erst ab Runde 3: Regeln `{"firstAttackRound":3}`
- E: Extend 3 Runden Bauzeit: Kartenwerte `{"Extend":{"rounds":3}}`
- F: A + Platz 2/3/4 bekommen +200/300/400: Regeln `{"finishRound":true,"seatBonus":[0,200,300,400]}`
- G: A + Platz 2/3/4 bekommen +300/400/500: Regeln `{"finishRound":true,"seatBonus":[0,300,400,500]}`

## 7. Regel-Auffälligkeiten

**Überlastung (geänderte Regel).** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte im Spiel, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. Neu ist: Sie wird dabei **verdeckt neu ausgelegt**. Vorher blieb sie aufgedeckt liegen und konnte jede Runde erneut angegriffen werden; der Besitzer setzte dann immer wieder aus („Überlastungs-Sperre“, im alten Stand bis zu 3,9 ausgesetzte Züge je Partie).

Versuch mit der neuen Regel: Eine Fraktion legt ihre Energiequelle anfangs in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP). Nach einer Überlastung legt sie sie verdeckt nach hinten, wie es die neue Regel erlaubt.

| Fraktion | Spieler | Aussetzen je Partie (hinten) | Aussetzen je Partie (Reihe 2) | Siegquote (hinten) | Siegquote (Reihe 2) |
|---|---|---|---|---|---|
| Starwing | 2 | 0,25 | 1,22 | 31 % | 35 % |
| Starwing | 4 | 0,06 | 1,13 | 29 % | 28 % |
| Lightforce | 2 | 0,03 | 0,80 | 44 % | 50 % |
| Lightforce | 4 | 0,01 | 0,48 | 40 % | 39 % |
| Biotec | 2 | 0,09 | 0,21 | 80 % | 79 % |
| Biotec | 4 | 0,77 | 1,46 | 11 % | 9 % |

**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt 42 Runden; 4 % der Partien hatten nach 120 Runden noch keinen Sieger, am häufigsten mit Lightforce (7 % ihrer Partien) und Starwing (5 %).

## 8. Kampfwert der Einheiten

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

## 9. Modell und Grenzen

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

## 10. Nachrechnen

```bash
npm run sim -- all                  # Versuche A+B, Optimierung, Balance-Urteil, Bericht
npm run sim -- strategies --games 60
npm run sim -- tune --gens 16 --g2 60 --g4 12   # je Siegpunkt-Einstellung, oder --vp 30
npm run sim -- final --games 300
npm run sim -- exploits
npm run sim -- final --games 150 --patch werte.json --tag name --label "Text"
npm run sim -- report
```

Umfang dieses Berichts: rund 815.000 simulierte Partien.
