# Balance-Simulation Domination

Erzeugt am 27.9.2026 mit dem Balance-Simulator (`npm run sim`, Tools/sim/). Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt 8).

## Kurzfassung

**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt 5), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. 1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.

| Fraktion | Stärke | Bereich (95 %) | Einschätzung | Beste Spielweise (Abschnitt 4) | Optimierte Strategie bei 30 SP: Schwerpunkte |
|---|---|---|---|---|---|
| Starwing | 0,98 | 0,94–1,02 | ausgeglichen | Festung | kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), volle 1. Reihe |
| Lightforce | 1,28 | 1,24–1,32 | **zu stark** | Festung | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, starke Verteidigung |
| Scaretech | 0,65 | 0,61–0,69 | **zu schwach** | Festung | hält Credits zurück, starke Verteidigung, viele Einheiten |
| Biotec | 1,10 | 1,06–1,13 | ausgeglichen | Blitzangriff | greift oft an, wenig Wirtschaft, kauft sofort, statt zu sparen |


- **Stärkste Fraktion: Lightforce** (1,28), **schwächste: Scaretech** (0,65).
- Am deutlichsten ist die Abweichung bei **4 Spielern**: Scaretech gewinnt 13 % der entschiedenen Partien (fair: 25 %).
- Auffälligste Karte: **Extend** (Biotec, 600 Credits, 3/3/2) mit dem höchsten Kampfwert je Credit im Spiel (1,09 je 1000 Credits, beste Einheit einer anderen Fraktion: Damokles mit 0,77), schon über den Startplaneten Hive zu haben (Abschnitt 7).
- Wer anfängt, hat einen Vorteil: Bei 4 Spielern gewinnt Platz 1 28 %, Platz 4 nur 22 % (Abschnitt 2).
- **Überlastung mit der neuen Regel** (gerettete Energiequelle wird verdeckt neu ausgelegt): Selbst wenn eine Fraktion ihre Energiequelle anfangs in Reihe 2 legt, setzt sie höchstens 1,16 Züge je Partie aus, vorher waren es bis zu 3,9 (Abschnitt 6).

## 1. Balance mit optimierten Strategien

Jede Fraktion spielt die Einstellungen, die der Optimierer für sie gefunden hat (Abschnitt 5). Alle Sitzordnungen, 300 Partien je Sitzordnung und Einstellung. Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.

### 2 Spieler (fair: 50 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 30,9 % (29 %–33 %) ▼ | 37,8 % (36 %–40 %) ▼ | 32,1 % (30 %–34 %) ▼ |
| Lightforce | 53,3 % (51 %–56 %) | 61,8 % (60 %–64 %) ▲ | 42,3 % (40 %–45 %) ▼ |
| Scaretech | 37,6 % (35 %–40 %) ▼ | 29,4 % (27 %–32 %) ▼ | 51,3 % (49 %–54 %) |
| Biotec | 78,2 % (76 %–80 %) ▲ | 71,1 % (69 %–73 %) ▲ | 73,9 % (72 %–76 %) ▲ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 3.600 | 3.600 | 3.600 |
| Ø Runden | 17,9 | 23,2 | 36,2 |
| Sieg durch Zentralgestirn | 21,5 % | 16,8 % | 98,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 1,1 % |

### 3 Spieler (fair: 33 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 30,8 % (30 %–32 %) | 27,6 % (26 %–29 %) ▼ | 41,8 % (41 %–43 %) ▲ |
| Lightforce | 50,5 % (49 %–52 %) ▲ | 49,6 % (48 %–51 %) ▲ | 42,0 % (41 %–43 %) ▲ |
| Scaretech | 20,4 % (19 %–21 %) ▼ | 21,7 % (21 %–23 %) ▼ | 23,7 % (23 %–25 %) ▼ |
| Biotec | 31,7 % (30 %–33 %) | 34,5 % (33 %–36 %) | 25,7 % (25 %–27 %) ▼ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 7.200 | 7.200 | 7.200 |
| Ø Runden | 16,7 | 22,0 | 23,8 |
| Sieg durch Zentralgestirn | 37,1 % | 26,6 % | 99,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,1 % |

### 4 Spieler (fair: 25 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 31,0 % (30 %–32 %) ▲ | 20,0 % (19 %–21 %) ▼ | 43,0 % (42 %–44 %) ▲ |
| Lightforce | 31,3 % (30 %–32 %) ▲ | 42,8 % (42 %–44 %) ▲ | 28,2 % (27 %–29 %) ▲ |
| Scaretech | 18,0 % (17 %–19 %) ▼ | 14,3 % (14 %–15 %) ▼ | 5,3 % (5 %–6 %) ▼ |
| Biotec | 19,7 % (19 %–21 %) ▼ | 23,0 % (22 %–24 %) | 23,5 % (22 %–24 %) |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 7.200 | 7.200 | 7.200 |
| Ø Runden | 15,2 | 21,6 | 17,5 |
| Sieg durch Zentralgestirn | 64,4 % | 29,2 % | 100,0 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,0 % |

## 2. Vorteil durch die Sitzreihenfolge

Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen.

| Spieler | Platz 1 | Platz 2 | Platz 3 | Platz 4 | fair |
|---|---|---|---|---|---|
| 2 | 57,3 % | 42,7 % |  |  | 50 % |
| 3 | 36,3 % | 32,8 % | 31,0 % |  | 33 % |
| 4 | 28,2 % | 25,3 % | 24,0 % | 22,4 % | 25 % |

## 3. Wenn alle dieselbe Spielweise wählen

Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. Stärke relativ zu fair, gemittelt über 2–4 Spieler (60 Partien je Sitzordnung).

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,14 | 0,55 | 0,67 | 1,65 |
| Händler | 0,92 | 0,89 | 0,88 | 1,31 |
| Blitzangriff | 0,79 | 0,52 | 0,40 | 2,30 |
| Festung | 1,64 | 1,02 | 0,72 | 0,62 |
| Superwaffe | 0,73 | 0,80 | 0,98 | 1,49 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,33 | 0,64 | 0,80 | 1,23 |
| Händler | 1,24 | 0,74 | 1,01 | 1,01 |
| Blitzangriff | 1,03 | 0,59 | 0,54 | 1,84 |
| Festung | 1,71 | 0,71 | 0,55 | 1,03 |
| Superwaffe | 0,97 | 0,77 | 1,39 | 0,87 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,22 | 0,98 | 0,94 | 0,87 |
| Händler | 0,73 | 0,64 | 0,37 | 1,99 |
| Blitzangriff | 1,17 | 0,69 | 0,69 | 1,45 |
| Festung | 1,26 | 1,36 | 0,98 | 0,55 |
| Superwaffe | 0,99 | 0,99 | 1,29 | 0,72 |

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
| Ausgewogen | 1,16 | 0,50 | 0,71 | 1,61 |
| Händler | 1,05 | 0,96 | 1,04 | 1,26 |
| Blitzangriff | 0,60 | 0,33 | 0,38 | **1,87** |
| Festung | **1,62** | **1,04** | **1,24** | 1,40 |
| Superwaffe | 0,56 | 0,49 | 0,57 | 1,18 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,32 | 0,54 | 0,82 | **1,26** |
| Händler | 1,42 | 0,81 | 1,01 | 1,04 |
| Blitzangriff | 0,63 | 0,27 | 0,40 | 1,05 |
| Festung | **1,91** | **1,13** | **1,33** | 1,15 |
| Superwaffe | 0,89 | 0,55 | 0,98 | 0,90 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,19 | 0,97 | 0,90 | 0,91 |
| Händler | 1,36 | 0,99 | 0,75 | **1,69** |
| Blitzangriff | 1,08 | 0,74 | 0,70 | 0,78 |
| Festung | 1,40 | 1,41 | 1,01 | 0,92 |
| Superwaffe | **1,60** | **1,46** | **1,57** | 1,29 |

## 5. Die optimierten Strategien

Der Optimierer (Evolutionsstrategie, 16 Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler), getrennt für jede Siegpunkt-Einstellung, denn in langen Partien lohnt sich eine andere Spielweise als in kurzen. Startpunkt war jeweils die beste Spielweise aus Abschnitt 4. Ab etwa der Hälfte der Generationen änderte sich die Stärke nur noch im Rahmen des Zufalls.

**Schwerpunkte je Siegpunkt-Einstellung** (die drei deutlichsten Abweichungen von „Ausgewogen“):

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), volle 1. Reihe | kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), setzt auf Handelsplaneten | kauft Upgrades, greift den Schwächsten an, starke Verteidigung |
| Lightforce | sammelt Siegpunkte (Planeten, Upgrades), repariert viel, starke Verteidigung | sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten, spart auf teure Karten | strebt die Superwaffe an, setzt auf Handelsplaneten, baut den Technologiebaum aus |
| Scaretech | hält Credits zurück, starke Verteidigung, viele Einheiten | hält Credits zurück, sammelt Siegpunkte (Planeten, Upgrades), repariert viel | strebt die Superwaffe an, setzt auf Handelsplaneten, hält Credits zurück |
| Biotec | greift oft an, wenig Wirtschaft, kauft sofort, statt zu sparen | sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, hält Credits zurück | strebt die Superwaffe an, kauft Upgrades, starke Verteidigung |

**Alle Einstellungen bei 30 SP:**

| Einstellung | Ausgewogen | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|---|
| Wirtschaft (Handelsplaneten) | 1,00 | 2,06 | 1,21 | 0,98 | 0,00 |
| Einheiten | 1,00 | 1,24 | 1,77 | 1,82 | 1,68 |
| Hyperraumschiffe | 1,00 | 0,04 | 1,36 | 1,00 | 1,22 |
| Siegpunkte (Planeten, Upgrades) | 1,00 | 2,84 | 2,52 | 1,39 | 0,71 |
| Technologiebaum | 1,00 | 1,46 | 0,22 | 0,99 | 0,11 |
| Upgrade-Wirkungen | 1,00 | 2,85 | 1,23 | 1,00 | 1,39 |
| Superwaffe | 1,00 | 0,61 | 0,89 | 0,09 | 1,23 |
| Verteidigung | 1,00 | 1,38 | 2,15 | 2,04 | 1,72 |
| Mindestbesetzung Reihe 1 | 3,00 | 5,51 | 3,20 | 4,28 | 3,11 |
| Credit-Reserve | 400 | 834 | 702 | 1426 | 619 |
| Sparen auf teure Karten | 0,50 | 0,40 | 0,84 | 0,59 | 0,20 |
| Angriffslust | 200 | -196 | -380 | -23 | 1159 |
| Planeten-/Zentralgestirn-Angriffe | 1,00 | 0,93 | 1,74 | 1,73 | 0,70 |
| Führenden angreifen (1) / Schwächsten (0) | 0,60 | 0,66 | 0,52 | 0,84 | 0,70 |
| Reparieren | 1,00 | 1,54 | 2,31 | 1,65 | 0,95 |
| Zentralgestirn hinten (≥ 0,5) | 1,00 | 0,89 | 0,97 | 0,90 | 0,88 |

### Starwing

- **Schwerpunkte gegenüber „Ausgewogen“:** kauft Upgrades, sammelt Siegpunkte (Planeten, Upgrades), volle 1. Reihe, setzt auf Handelsplaneten, kaum Hyperraumschiffe.
- **So gewinnt sie:** Ø 9,1 Planeten, 1,3 Upgrades, 12,5 Sterne, 0,9 Münzen; 68 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,7; 15,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssystem · R2: – · R3: Protonenmond (97 %, 33 %)
  - R1: Handelssystem · R2: – · R3: – (2 %, 12 %)
  - R1: Handelssystem · R2: – · R3: Auge des Kolumbus, Auge des Kolumbus (1 %, 53 %)
- **Karten, mit denen sie öfter gewinnt:** Schildgenerator (+18 Pkt.), Auge des Raumes (+10 Pkt.), Sternenparlament (+10 Pkt.), Teilchenbeschleuniger (+5 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Weißer Golem (−6 Pkt.), Phoenix (−6 Pkt.), Aufklärungskomplex (−6 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Lightforce

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), repariert viel, starke Verteidigung, greift nur bei klarem Vorteil an, spart auf teure Karten.
- **So gewinnt sie:** Ø 10,6 Planeten, 1,5 Upgrades, 14,9 Sterne, 1,4 Münzen; 50 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 7,5; 15,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssektor · R2: Strahlenjäger · R3: Elektronenmond (44 %, 50 %)
  - R1: Handelssektor · R2: – · R3: Elektronenmond (33 %, 35 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: Strahlenjäger, Strahlenjäger (18 %, 33 %)
- **Karten, mit denen sie öfter gewinnt:** Nachtsicht (+24 Pkt.), Quantensammler (+14 Pkt.), Inferno (+11 Pkt.), Glutdrache (+10 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Drohnenkolonie (−3 Pkt.), Handelssektor (+0 Pkt.), Elektronenmond (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Scaretech

- **Schwerpunkte gegenüber „Ausgewogen“:** hält Credits zurück, starke Verteidigung, viele Einheiten, zielt auf Planeten und das Zentralgestirn, bremst den Führenden.
- **So gewinnt sie:** Ø 7,7 Planeten, 1,3 Upgrades, 18,7 Sterne, 0,9 Münzen; 59 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,1; 15,5 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Antimaterieminen, Shadow Arm, Shadow Arm · R2: Shadow Arm · R3: – (40 %, 13 %)
  - R1: Telecluster, Antimaterieminen · R2: – · R3: – (33 %, 19 %)
  - R1: Telecluster, Antimaterieminen · R2: Shadow Arm, Shadow Arm · R3: Shadow Arm (20 %, 25 %)
- **Karten, mit denen sie öfter gewinnt:** Spionagezentrum (+47 Pkt.), Rauminvasion (+29 Pkt.), Assimilation (+24 Pkt.), Schwarzes Loch (+21 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Telecluster (−1 Pkt.), Antimaterieminen (+0 Pkt.), Shadow Arm (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Biotec

- **Schwerpunkte gegenüber „Ausgewogen“:** greift oft an, wenig Wirtschaft, kauft sofort, statt zu sparen, kaum Technologiebaum, starke Verteidigung.
- **So gewinnt sie:** Ø 4,5 Planeten, 1,2 Upgrades, 20,3 Sterne, 1,1 Münzen; 53 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 4,3; 32,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: – · R2: Abt. Kapital · R3: – (33 %, 33 %)
  - R1: – · R2: Abt. Kapital · R3: Einheit 5 (33 %, 31 %)
  - R1: Tyrant, Extend, Extend · R2: Einheit 5, Tyrant · R3: – (26 %, 28 %)
- **Karten, mit denen sie öfter gewinnt:** Deflektor (+21 Pkt.), Regenerat. Panzer (+13 Pkt.), Plasmareaktor (+7 Pkt.), Mutagen (+7 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Hive (−18 Pkt.), Einheit 5 (−1 Pkt.), Mutant (−0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

## 6. Regel-Auffälligkeiten

**Überlastung (geänderte Regel).** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte im Spiel, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. Neu ist: Sie wird dabei **verdeckt neu ausgelegt**. Vorher blieb sie aufgedeckt liegen und konnte jede Runde erneut angegriffen werden; der Besitzer setzte dann immer wieder aus („Überlastungs-Sperre“, im alten Stand bis zu 3,9 ausgesetzte Züge je Partie).

Versuch mit der neuen Regel: Eine Fraktion legt ihre Energiequelle anfangs in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP). Nach einer Überlastung legt sie sie verdeckt nach hinten, wie es die neue Regel erlaubt.

| Fraktion | Spieler | Aussetzen je Partie (hinten) | Aussetzen je Partie (Reihe 2) | Siegquote (hinten) | Siegquote (Reihe 2) |
|---|---|---|---|---|---|
| Starwing | 2 | 0,23 | 1,16 | 31 % | 33 % |
| Starwing | 4 | 0,00 | 0,61 | 31 % | 30 % |
| Lightforce | 2 | 0,04 | 0,73 | 53 % | 62 % |
| Lightforce | 4 | 0,00 | 0,24 | 31 % | 29 % |
| Biotec | 2 | 0,03 | 0,08 | 78 % | 77 % |
| Biotec | 4 | 0,39 | 1,04 | 20 % | 20 % |

**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt 36 Runden; 1 % der Partien hatten nach 120 Runden noch keinen Sieger, am häufigsten mit Lightforce (2 % ihrer Partien) und Starwing (1 %).

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
| Lightforce | Lichtkoloss | 1800 | 5/5/3 | Weltraumwerft | 89 % | 0,50 |
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

Umfang dieses Berichts: rund 1.912.000 simulierte Partien.
