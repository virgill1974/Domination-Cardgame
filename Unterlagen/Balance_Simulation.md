# Balance-Simulation Domination

Erzeugt am 29.9.2026 mit dem Balance-Simulator (`npm run sim`, Tools/sim/). Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt 9).

## Kurzfassung

**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt 5, je Spielerzahl und Siegpunkt-Einstellung die beste von acht), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. 1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.

| Fraktion | Stärke | Bereich (95 %) | Einschätzung | Beste Spielweise (Abschnitt 4) | Gewählte Strategien (Anzahl Einstellungen) |
|---|---|---|---|---|---|
| Starwing | 1,03 | 0,96–1,10 | ausgeglichen | Festung | optimiert für 30 SP (4), optimiert für ∞ (3), optimiert für 40 SP (1) |
| Lightforce | 1,04 | 0,97–1,11 | ausgeglichen | Festung | optimiert für 30 SP (4), optimiert für 40 SP (2), optimiert für ∞ (2) |
| Scaretech | 1,00 | 0,94–1,07 | ausgeglichen | Festung | optimiert für ∞ (7), optimiert für 40 SP (1) |
| Biotec | 0,93 | 0,87–1,00 | ausgeglichen | Blitzangriff | Blitzangriff (3), optimiert für 40 SP (3), optimiert für ∞ (2) |


- **Stärkste Fraktion: Lightforce** (1,04), **schwächste: Biotec** (0,93).
- Am deutlichsten ist die Abweichung bei **2 Spielern**: Scaretech gewinnt 67 % der entschiedenen Partien (fair: 50 %).
- Auffälligste Karte: **Extend** (Biotec, 600 Credits, 3/3/2) mit dem höchsten Kampfwert je Credit im Spiel (1,09 je 1000 Credits, beste Einheit einer anderen Fraktion: Damokles mit 0,77), schon über den Startplaneten Hive zu haben (Abschnitt 8).
- **Sitzreihenfolge** (mit letzter Runde und Startkapital-Ausgleich): Zu viert gewinnt Platz 1 23 % und Platz 4 23 % (fair: 25 %), zu zweit Platz 1 53 % und Platz 2 47 %. Der Startspieler hat noch einen kleinen Vorteil. (Abschnitt 2)
- **Letzte Runde:** In 4 % der Punktsiege gewann nicht, wer das Siegpunkt-Ziel zuerst erreicht hatte, sondern ein Spieler, der in der letzten Runde noch vorbeizog (Upgrades, Sterne, zerstörte Planeten).
- **Upgrades** je Partie: Starwing 2,2, Lightforce 1,9, Scaretech 1,7, Biotec 1,8. Selten kaufbar, weil die Voraussetzung selten gebaut wird: Rekonfiguration, Gravitationsboost, Flüstern, Chitinpanzer, Neuronetz, Zellregeneration. Kaufbar, aber selten gekauft (Wirkung für den Preis zu schwach): Präzisionssprung, Feuerschwinge, Effektivierung, Donnerschlag, Schwarzer Schleier. (Abschnitt 6)
- **Überlastung mit der neuen Regel** (gerettete Energiequelle wird verdeckt neu ausgelegt): Selbst wenn eine Fraktion ihre Energiequelle anfangs in Reihe 2 legt, setzt sie höchstens 1,70 Züge je Partie aus, vorher waren es bis zu 3,9 (Abschnitt 7).

## 1. Balance mit optimierten Strategien

Jede Fraktion spielt je Spielerzahl und Siegpunkt-Einstellung die beste von acht Strategien (Strategiewahl, Abschnitt 5). Alle Sitzordnungen, 100 Partien je Sitzordnung und Einstellung. Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.

### 2 Spieler (fair: 50 %)

| Fraktion | 40 SP | ∞ |
|---|---|---|
| Starwing | 36,5 % (33 %–40 %) ▼ | 46,7 % (43 %–51 %) |
| Lightforce | 40,3 % (36 %–44 %) ▼ | 34,3 % (31 %–38 %) ▼ |
| Scaretech | 59,3 % (55 %–63 %) ▲ | 73,8 % (70 %–77 %) ▲ |
| Biotec | 63,8 % (60 %–68 %) ▲ | 45,2 % (41 %–49 %) |

|  | 40 SP | ∞ |
|---|---|---|
| Partien | 1.200 | 1.200 |
| Ø Runden | 24,0 | 31,1 |
| Sieg durch Zentralgestirn | 36,3 % | 99,8 % |
| Remis (nach 120 Runden) | 0,0 % | 0,3 % |

### 3 Spieler (fair: 33 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 48,7 % (46 %–51 %) ▲ | 31,8 % (30 %–34 %) | 23,0 % (21 %–25 %) ▼ |
| Lightforce | 42,4 % (40 %–45 %) ▲ | 34,7 % (33 %–37 %) | 18,8 % (17 %–21 %) ▼ |
| Scaretech | 26,3 % (24 %–28 %) ▼ | 38,3 % (36 %–41 %) ▲ | 40,6 % (38 %–43 %) ▲ |
| Biotec | 15,9 % (14 %–18 %) ▼ | 28,6 % (27 %–31 %) ▼ | 50,9 % (49 %–53 %) ▲ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 2.400 | 2.400 | 2.400 |
| Ø Runden | 17,0 | 21,0 | 29,9 |
| Sieg durch Zentralgestirn | 13,3 % | 40,5 % | 99,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,1 % |

### 4 Spieler (fair: 25 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 35,7 % (34 %–38 %) ▲ | 34,2 % (32 %–36 %) ▲ | 16,5 % (15 %–18 %) ▼ |
| Lightforce | 34,3 % (32 %–36 %) ▲ | 42,3 % (40 %–44 %) ▲ | 22,0 % (20 %–24 %) |
| Scaretech | 18,7 % (17 %–20 %) ▼ | 15,9 % (14 %–17 %) ▼ | 20,1 % (19 %–22 %) ▼ |
| Biotec | 11,3 % (10 %–13 %) ▼ | 7,6 % (7 %–9 %) ▼ | 41,3 % (39 %–43 %) ▲ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 2.400 | 2.400 | 2.400 |
| Ø Runden | 16,7 | 18,1 | 26,9 |
| Sieg durch Zentralgestirn | 18,4 % | 77,8 % | 100,0 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,0 % |

## 2. Vorteil durch die Sitzreihenfolge

Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen. Es gelten die Regeln gegen den Vorteil des Startspielers: Wer das Siegpunkt-Ziel erreicht, löst die letzte Runde aus, und Spieler 2, 3 und 4 bekommen 200, 300 bzw. 400 Credits mehr Startkapital.

| Spieler | Platz 1 | Platz 2 | Platz 3 | Platz 4 | fair |
|---|---|---|---|---|---|
| 2 | 52,9 % | 47,1 % |  |  | 50 % |
| 3 | 30,1 % | 35,8 % | 34,1 % |  | 33 % |
| 4 | 22,6 % | 26,6 % | 27,8 % | 23,1 % | 25 % |

## 3. Wenn alle dieselbe Spielweise wählen

Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. Stärke relativ zu fair, gemittelt über 2–4 Spieler, bei 30 SP über 3–4 (100 Partien je Sitzordnung).

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,05 | 0,54 | 1,38 | 1,03 |
| Händler | 0,87 | 1,10 | 1,44 | 0,60 |
| Blitzangriff | 0,69 | 0,39 | 0,45 | 2,47 |
| Festung | 1,13 | 0,45 | 1,02 | 1,41 |
| Superwaffe | 0,65 | 0,84 | 1,45 | 1,06 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,26 | 0,42 | 1,34 | 0,99 |
| Händler | 1,31 | 0,69 | 1,29 | 0,71 |
| Blitzangriff | 0,95 | 0,47 | 0,74 | 1,84 |
| Festung | 1,07 | 0,27 | 0,93 | 1,74 |
| Superwaffe | 0,84 | 0,85 | 1,87 | 0,44 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,19 | 0,62 | 1,31 | 0,89 |
| Händler | 0,75 | 0,32 | 0,22 | 2,16 |
| Blitzangriff | 1,24 | 0,53 | 0,88 | 1,34 |
| Festung | 0,95 | 0,64 | 0,56 | 1,51 |
| Superwaffe | 1,04 | 0,91 | 1,50 | 0,55 |

## 4. Welche Spielweise passt zu welcher Fraktion

Eine Fraktion probiert jede Spielweise, alle Gegner spielen „Ausgewogen“. Stärke relativ zu fair, gemittelt über 2–4 Spieler (bei 30 SP über 3–4). Fett: beste Spielweise der Fraktion.

- **Ausgewogen:** alles in Maßen (Referenz).
- **Händler:** zuerst Handelsplaneten und Einkommen, die Armee später.
- **Blitzangriff:** früh günstige Einheiten, greift jede Runde an, zielt auf Planeten und das Zentralgestirn.
- **Festung:** Planeten, Upgrades, Planetenabwehr, Reparaturen; sammelt Siegpunkte und greift nur bei klarem Vorteil an.
- **Superwaffe:** spart früh auf den Technologiebaum bis zur Superwaffe.

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,10 | 0,54 | 1,37 | 0,96 |
| Händler | 1,17 | 1,04 | 1,54 | 0,61 |
| Blitzangriff | 0,55 | 0,27 | 0,51 | **1,76** |
| Festung | **1,51** | **1,06** | **1,96** | 1,36 |
| Superwaffe | 0,48 | 0,49 | 1,02 | 0,65 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,21 | 0,41 | 1,32 | 1,04 |
| Händler | 1,30 | 0,59 | 1,22 | 0,76 |
| Blitzangriff | 0,61 | 0,14 | 0,56 | 0,95 |
| Festung | **1,54** | **0,75** | **1,75** | **1,59** |
| Superwaffe | 0,75 | 0,59 | 1,54 | 0,56 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,16 | 0,62 | 1,28 | 0,89 |
| Händler | 1,35 | 0,62 | 0,69 | 1,62 |
| Blitzangriff | 1,16 | 0,50 | 0,87 | 0,70 |
| Festung | 1,40 | 0,86 | 1,21 | **1,89** |
| Superwaffe | **1,67** | **1,36** | **1,97** | 1,23 |

## 5. Die optimierten Strategien

Der Optimierer (Evolutionsstrategie, 12 Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler), getrennt für jede Siegpunkt-Einstellung, denn in langen Partien lohnt sich eine andere Spielweise als in kurzen. Startpunkt war die beste Spielweise aus Abschnitt 4, bei späteren Läufen die zuletzt optimierten Einstellungen (weiter optimiert mit den aktuellen Regeln). Weil alle vier Fraktionen gleichzeitig optimiert werden, schwankt die Stärke von Generation zu Generation.

**Schwerpunkte je Siegpunkt-Einstellung** (die drei deutlichsten Abweichungen von „Ausgewogen“):

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | starke Verteidigung, volle 1. Reihe, sammelt Siegpunkte (Planeten, Upgrades) | setzt auf Handelsplaneten, starke Verteidigung, kauft Upgrades | strebt die Superwaffe an, greift den Schwächsten an, hält Credits zurück |
| Lightforce | sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten, hält Credits zurück | sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung, viele Einheiten | strebt die Superwaffe an, baut den Technologiebaum aus, setzt auf Handelsplaneten |
| Scaretech | hält Credits zurück, starke Verteidigung, viele Einheiten | setzt auf Handelsplaneten, hält Credits zurück, strebt die Superwaffe an | hält Credits zurück, strebt die Superwaffe an, setzt auf Handelsplaneten |
| Biotec | hält Credits zurück, greift oft an, strebt die Superwaffe an | hält Credits zurück, zielt auf Planeten und das Zentralgestirn, sammelt Siegpunkte (Planeten, Upgrades) | starke Verteidigung, hält Credits zurück, kauft Upgrades |

**Strategiewahl.** Der Optimierer bewertet 2 und 4 Spieler gemeinsam. Dabei kann er eine Strategie finden, die bei einer Spielerzahl versagt (im ersten Lauf etwa ein Biotec, das bei ∞ zu zweit nie angriff und deshalb nie gewann). Darum probiert jede Fraktion je Spielerzahl und Siegpunkt-Einstellung 8 Strategien gegen die optimierten Gegner (80 Partien je Sitzordnung): ihre drei optimierten und die fünf Spielweisen. Im Balance-Urteil spielt sie die beste davon, so wie ein Mensch seine Spielweise der Runde anpasst. Das lief in 2 Durchgängen: Ab dem zweiten spielen die Gegner je zur Hälfte ihre optimierte und ihre zuletzt gewählte Strategie. Das dämpft Kreisläufe, in denen jede Wahl die vorige aushebelt.

| Fraktion | 2 Sp. 40 SP | 2 Sp. ∞ | 3 Sp. 30 SP | 3 Sp. 40 SP | 3 Sp. ∞ | 4 Sp. 30 SP | 4 Sp. 40 SP | 4 Sp. ∞ |
|---|---|---|---|---|---|---|---|---|
| Starwing | optimiert für 30 SP | optimiert für ∞ | optimiert für 30 SP | optimiert für 30 SP | optimiert für ∞ | optimiert für 30 SP | optimiert für 40 SP | optimiert für ∞ |
| Lightforce | optimiert für 40 SP | optimiert für 40 SP | optimiert für 30 SP | optimiert für 30 SP | optimiert für ∞ | optimiert für 30 SP | optimiert für 30 SP | optimiert für ∞ |
| Scaretech | optimiert für ∞ | optimiert für ∞ | optimiert für ∞ | optimiert für ∞ | optimiert für 40 SP | optimiert für ∞ | optimiert für ∞ | optimiert für ∞ |
| Biotec | Blitzangriff | Blitzangriff | optimiert für 40 SP | optimiert für 40 SP | optimiert für ∞ | optimiert für 40 SP | Blitzangriff | optimiert für ∞ |

**Alle Einstellungen der Optimierung für 30 SP:**

| Einstellung | Ausgewogen | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|---|
| Wirtschaft (Handelsplaneten) | 1,00 | 1,91 | 1,25 | 1,95 | 0,38 |
| Einheiten | 1,00 | 2,07 | 2,69 | 2,85 | 1,01 |
| Hyperraumschiffe | 1,00 | 1,30 | 1,05 | 0,00 | 1,60 |
| Siegpunkte (Planeten, Upgrades) | 1,00 | 2,37 | 3,00 | 2,48 | 0,30 |
| Technologiebaum | 1,00 | 2,07 | 0,20 | 1,70 | 0,15 |
| Upgrade-Wirkungen | 1,00 | 1,78 | 1,02 | 1,45 | 0,70 |
| Superwaffe | 1,00 | 0,09 | 0,00 | 0,92 | 2,62 |
| Verteidigung | 1,00 | 2,78 | 1,75 | 3,00 | 2,02 |
| Mindestbesetzung Reihe 1 | 3,00 | 6,53 | 3,99 | 4,53 | 5,26 |
| Credit-Reserve | 400 | 722 | 1159 | 1487 | 1477 |
| Sparen auf teure Karten | 0,50 | 0,69 | 0,80 | 0,95 | 0,55 |
| Angriffslust | 200 | -389 | -400 | -50 | 1006 |
| Planeten-/Zentralgestirn-Angriffe | 1,00 | 0,03 | 0,99 | 1,56 | 0,59 |
| Führenden angreifen (1) / Schwächsten (0) | 0,60 | 0,80 | 0,60 | 0,75 | 0,52 |
| Reparieren | 1,00 | 2,17 | 1,50 | 0,37 | 1,18 |
| Zentralgestirn hinten (≥ 0,5) | 1,00 | 0,69 | 1,00 | 1,00 | 0,97 |

### Starwing

- **Schwerpunkte gegenüber „Ausgewogen“:** starke Verteidigung, volle 1. Reihe, sammelt Siegpunkte (Planeten, Upgrades), repariert viel, greift nur bei klarem Vorteil an.
- **So gewinnt sie:** Ø 8,9 Planeten, 2,9 Upgrades, 14,4 Sterne, 1,2 Münzen; 46 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 6,7; 15,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssystem · R2: Protonenmond · R3: – (30 %, 33 %)
  - R1: Protonenmond, Handelssystem · R2: Auge des Kolumbus · R3: – (24 %, 30 %)
  - R1: Handelssystem, Auge des Kolumbus · R2: Protonenmond · R3: – (18 %, 36 %)
- **Karten, mit denen sie öfter gewinnt:** Feuerschwinge (+35 Pkt.), Präzisionssprung (+27 Pkt.), Planetenschild (+26 Pkt.), Schildgenerator (+23 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Aufklärungskomplex (−13 Pkt.), Ionenpulsar (−7 Pkt.), Fährtensucher (−6 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Lightforce

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), viele Einheiten, hält Credits zurück, greift nur bei klarem Vorteil an, spart auf teure Karten.
- **So gewinnt sie:** Ø 9,5 Planeten, 2,3 Upgrades, 15,5 Sterne, 1,3 Münzen; 45 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 7,0; 17,7 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssektor · R2: Elektronenmond · R3: – (38 %, 31 %)
  - R1: Handelssektor, Lichtfunke · R2: Elektronenmond · R3: – (16 %, 44 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: Elektronenmond (9 %, 38 %)
- **Karten, mit denen sie öfter gewinnt:** Sonnenkern (+16 Pkt.), Schutzring (+11 Pkt.), Nachtsicht (+9 Pkt.), Lichtkoloss (+6 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Supernova (−10 Pkt.), Drohnenkolonie (−9 Pkt.), Lichtpfeil (−5 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Scaretech

- **Schwerpunkte gegenüber „Ausgewogen“:** hält Credits zurück, starke Verteidigung, viele Einheiten, sammelt Siegpunkte (Planeten, Upgrades), spart auf teure Karten.
- **So gewinnt sie:** Ø 7,3 Planeten, 2,5 Upgrades, 27,6 Sterne, 1,2 Münzen; 68 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 7,2; 28,5 Angriffe je Partie.
- **Wurmloch** (Aufklärer überspringen Reihe 1): in 10 % der Partien gebaut, Siegquote dann 48 % (sonst insgesamt 29 %).
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Antimaterieminen · R2: – · R3: Antimaterieminen (56 %, 32 %)
  - R1: Antimaterieminen, Shadow Arm, Shadow Arm · R2: Shadow Arm · R3: – (22 %, 31 %)
  - R1: Antimaterieminen · R2: Shadow Arm · R3: Shadow Arm (7 %, 14 %)
- **Karten, mit denen sie öfter gewinnt:** Schwarzer Schleier (+22 Pkt.), Doomhammer (+21 Pkt.), Assimilation (+20 Pkt.), Rage (+19 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Telecluster (−10 Pkt.), Antimaterieminen (+0 Pkt.), Flottenbasis (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Biotec

- **Schwerpunkte gegenüber „Ausgewogen“:** hält Credits zurück, greift oft an, strebt die Superwaffe an, starke Verteidigung, volle 1. Reihe.
- **So gewinnt sie:** Ø 5,8 Planeten, 2,1 Upgrades, 18,4 Sterne, 0,6 Münzen; 84 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 5,5; 23,6 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: – · R2: Mutant · R3: Abt. Kapital (15 %, 36 %)
  - R1: – · R2: Abt. Kapital · R3: Tyrant (14 %, 36 %)
  - R1: Tyrant, Extend, Extend · R2: Mutant, Mutant, Tyrant · R3: – (9 %, 9 %)
- **Karten, mit denen sie öfter gewinnt:** Artillerie Panzer (+29 Pkt.), Chitinpanzer (+29 Pkt.), Abt. Forschung (+27 Pkt.), Agressor Panzer (+20 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Hive (−12 Pkt.), Mutant (−0 Pkt.), Extend (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

## 6. Upgrades

Ein Upgrade zählt sofort und dauerhaft als Siegpunkt und wirkt ab dem Kauf. Die Bots bewerten Einheiten-Upgrades über den Kampfwert der betroffenen Einheiten vorher und nachher, für die eigenen und die voraussichtlich noch gekauften. Energie-Upgrades zählen als gesparte Energiequellen. In der **letzten Runde** kaufen sie nur noch Upgrades, die billigsten zuerst: Andere Karten werden bis zum Spielende nicht mehr fertig.

| Fraktion | Ø Upgrades je Partie | 30 SP | 40 SP | ∞ |
|---|---|---|---|---|
| Starwing | 2,2 | 2,4 | 2,7 | 1,7 |
| Lightforce | 1,9 | 1,9 | 1,9 | 1,9 |
| Scaretech | 1,7 | 1,6 | 1,4 | 2,1 |
| Biotec | 1,8 | 2,0 | 1,2 | 2,2 |

*Kaufbar:* Anteil der Partien, in denen die Voraussetzung mindestens einmal aktiv war. *Gekauft:* Anteil dieser Partien, in denen die Fraktion das Upgrade kaufte. *Siegquote mit/ohne:* Siegquote der Fraktion in Partien mit bzw. ohne das Upgrade, über alle Spielerzahlen. Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, hat mehr Credits für Upgrades, und Käufe in der letzten Runde zählen mit.

| Fraktion | Upgrade | Preis | Voraussetzung | Wirkung | kaufbar | gekauft | Siegquote mit | ohne |
|---|---|---|---|---|---|---|---|---|
| Starwing | Schildgenerator | 1000 | Sternenparlament | Pegasus & Poseidons Fluch: Defensive +1 | 66 % | 35 % | 55 % | 25 % |
| Starwing | Teilchenbeschleuniger | 800 | Protonenmond | Jeder Protonenmond versorgt 2 Planeten mehr | 100 % | 97 % | 33 % | 8 % |
| Starwing | Präzisionssprung | 1500 | Hyperraumnebel | Zeus & Nostradamus: Offensive +1 | 99 % | 9 % | 59 % | 30 % |
| Starwing | Interstellare Macht | 1500 | Hyperraumnebel | Zeus & Nostradamus: Schaden +1 | 99 % | 30 % | 42 % | 28 % |
| Starwing | Auge des Raumes | 500 | Sternenparlament | Pro Runde eine verdeckte Gegnerkarte aufdecken | 66 % | 75 % | 40 % | 24 % |
| Starwing | Feuerschwinge | 1200 | Orbitaldock | Phoenix: Offensive +1 | 99 % | 16 % | 67 % | 26 % |
| Lightforce | Sonnenkern | 1500 | Tribunal des Lichts | Sonnenfaust: Schaden +1 | 62 % | 32 % | 49 % | 29 % |
| Lightforce | Effektivierung | 2000 | Drohnenkolonie | Glutdrache: Schaden +1 | 100 % | 4 % | 53 % | 32 % |
| Lightforce | Quantensammler | 1000 | Elektronenmond | Jeder Elektronenmond versorgt 2 Planeten mehr | 100 % | 85 % | 35 % | 21 % |
| Lightforce | Donnerschlag | 2000 | Tribunal des Lichts | Inferno & Novakanone: Schaden +1 | 62 % | 1 % | 49 % | 33 % |
| Lightforce | Nachtsicht | 1000 | Tribunal des Lichts | Lichtfunke & Strahlenjäger: Offensive +1 | 62 % | 60 % | 42 % | 27 % |
| Lightforce | Lichtgeschwindigkeit | 500 | Warpgate | Lichtpfeil: Defensive +1 | 64 % | 70 % | 39 % | 28 % |
| Scaretech | Künstliche Intelligenz | 1000 | Dunkler Rat | Sternenaxt & Damokles: Schaden +1 | 92 % | 85 % | 37 % | 2 % |
| Scaretech | Assimilation | 1000 | Flottenbasis | Shadow Arm & Schattenschleuder: Schaden +1 | 100 % | 44 % | 49 % | 13 % |
| Scaretech | Rekonfiguration | 2000 | Spionagezentrum | Jede Reparatur: Defensive +2 | 1 % | 67 % | 54 % | 29 % |
| Scaretech | Rauminvasion | 800 | Flottenbasis | Rage: Schaden +1 | 100 % | 31 % | 47 % | 21 % |
| Scaretech | Gravitationsboost | 1000 | Spionagezentrum | Sternenaxt: Offensive +1 | 1 % | 82 % | 58 % | 29 % |
| Scaretech | Schwarzer Schleier | 2000 | Dunkler Rat | Einheiten dürfen verdeckt ausgespielt werden | 92 % | 15 % | 51 % | 26 % |
| Biotec | Mutagen | 1000 | Hive | Einheit 5 & Mutant: Offensive +1 | 100 % | 81 % | 30 % | 18 % |
| Biotec | Flüstern | 1200 | Helipad | Helicopter wird von Planetenabwehr nicht erfasst | 1 % | 22 % | 48 % | 28 % |
| Biotec | Perpetuum | 1000 | Plasmareaktor | Jeder Plasmareaktor versorgt 2 Planeten mehr | 100 % | 77 % | 29 % | 21 % |
| Biotec | Chitinpanzer | 1500 | Abt. Forschung | Agressor & Regenerat. Panzer: Defensive +1 | 15 % | 79 % | 56 % | 24 % |
| Biotec | Neuronetz | 1000 | Abt. Forschung | Pro Runde 2 eigene Planeten tauschen oder 1 Einheit umsetzen | 15 % | 7 % | 59 % | 27 % |
| Biotec | Zellregeneration | 2000 | Abt. Forschung | Zu Zugbeginn: beschädigte Einheiten Defensive +1 | 15 % | 30 % | 57 % | 26 % |

- **Selten kaufbar** (in weniger als 15 % der Partien): Rekonfiguration (Scaretech, 1 %), Gravitationsboost (Scaretech, 1 %), Flüstern (Biotec, 1 %), Chitinpanzer (Biotec, 15 %), Neuronetz (Biotec, 15 %), Zellregeneration (Biotec, 15 %). Hier liegt es am Technologiebaum: Die Bots bauen die Voraussetzung selten.
- **Kaufbar, aber selten gekauft** (unter 20 %): Präzisionssprung (Starwing, 1500 Credits, 9 %), Feuerschwinge (Starwing, 1200 Credits, 16 %), Effektivierung (Lightforce, 2000 Credits, 4 %), Donnerschlag (Lightforce, 2000 Credits, 1 %), Schwarzer Schleier (Scaretech, 2000 Credits, 15 %). Für die Bots ist die Wirkung den Preis meist nicht wert.

## 7. Regel-Auffälligkeiten

**Überlastung (geänderte Regel).** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte im Spiel, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. Neu ist: Sie wird dabei **verdeckt neu ausgelegt**. Vorher blieb sie aufgedeckt liegen und konnte jede Runde erneut angegriffen werden; der Besitzer setzte dann immer wieder aus („Überlastungs-Sperre“, im alten Stand bis zu 3,9 ausgesetzte Züge je Partie).

Versuch mit der neuen Regel: Eine Fraktion legt ihre Energiequelle anfangs in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP, zu zweit 40 SP). Nach einer Überlastung legt sie sie verdeckt nach hinten, wie es die neue Regel erlaubt.

| Fraktion | Spieler | Aussetzen je Partie (hinten) | Aussetzen je Partie (Reihe 2) | Siegquote (hinten) | Siegquote (Reihe 2) |
|---|---|---|---|---|---|
| Starwing | 2 | 0,14 | 1,41 | 37 % | 44 % |
| Starwing | 4 | 0,00 | 0,93 | 36 % | 29 % |
| Lightforce | 2 | 0,07 | 1,09 | 40 % | 58 % |
| Lightforce | 4 | 0,00 | 0,63 | 34 % | 46 % |
| Biotec | 2 | 0,26 | 0,20 | 64 % | 74 % |
| Biotec | 4 | 0,33 | 1,70 | 11 % | 8 % |

**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt 31 Runden; 0 % der Partien hatten nach 120 Runden noch keinen Sieger, am häufigsten mit Starwing (1 % ihrer Partien) und Lightforce (0 %).

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
  - Sieg wie in der App: Ein zerstörtes Zentralgestirn gewinnt sofort. Wer das Siegpunkt-Ziel erreicht, löst die letzte Runde aus; danach gewinnt, wer die meisten Siegpunkte hat.
  - Startkapital-Ausgleich: Spieler 2, 3 und 4 bekommen 200, 300 bzw. 400 Credits mehr. Zu zweit gibt es nur 40 SP und ∞.
- **Tischregeln** (nicht in der App, im Simulator nachgebaut, `Tools/sim/board.ts`):
  - 3 Reihen × 7 Felder, Stapelregeln in Reihe 1; Planeten liegen verdeckt und werden durch einen Angriff aufgedeckt.
  - Reihe 2 ist erst angreifbar, wenn Reihe 1 leer ist, Reihe 3 erst, wenn Reihe 1 und 2 leer sind.
  - Hyperraumschiffe (und Scaretech-Aufklärer mit Wurmloch) überspringen nur die 1. Reihe: Reihe 3 erst, wenn Reihe 2 leer ist. Die Superwaffe erreicht alles.
  - Wer einen verdeckten Planeten angreift, erwischt zufällig einen der verdeckten Planeten der gewählten Reihe.
  - Überlastung: Eine gerettete Energiequelle wird verdeckt neu ausgelegt.
  - Auge des Raumes deckt zu Zugbeginn einen gegnerischen Planeten auf. Schwarzer Schleier legt Scaretech-Einheiten verdeckt. Neuronetz tauscht verdeckte Planeten; das Umsetzen von Einheiten bringt im Modell nichts.
- **Bots:** bewerten jede mögliche Aktion in Credits, mit exakt berechneten Kampfwahrscheinlichkeiten. Sie sehen nur, was am Tisch sichtbar ist. Energiequellen und das Zentralgestirn legen sie nach hinten und halten mindestens zwei Planeten als Schutz in Reihe 2. Upgrades bewerten sie über die Wirkung (Kampfwert vorher/nachher, gesparte Energiequellen) plus den sofortigen, sicheren Siegpunkt. In der letzten Runde kaufen sie nur noch Upgrades, reparieren nicht mehr und setzen ihre Einheiten ohne Rücksicht auf Verluste ein. Die Strategie wählt jede Fraktion je Spielerzahl und Siegpunkt-Einstellung (Abschnitt ${S.tuned}); innerhalb einer Partie passen die Bots sie nicht an.
- **Grenzen:** Bots bluffen nicht, sprechen sich nicht ab und planen nur einen Zug voraus (plus Sparziel). Menschen spielen anders, besonders mit Absprachen zu dritt oder zu viert. Die Ergebnisse zeigen Tendenzen im Kartenmaterial, keine exakten Siegchancen am Tisch.
- **Remis:** Partien ohne Sieger nach 120 Runden zählen nicht in die Siegquoten.

## 10. Nachrechnen

```bash
npm run sim -- all                  # Versuche A+B, Optimierung, Strategiewahl, Balance-Urteil, Bericht
npm run sim -- strategies --games 100
npm run sim -- tune --warm --gens 12 --g2 60 --g4 12 --sigma 0.12   # je Siegpunkt-Einstellung, oder --vp 40
npm run sim -- select --games 80                # Strategiewahl je Spielerzahl
npm run sim -- select --again --games 80        # zweiter Durchgang
npm run sim -- final --games 2000
npm run sim -- exploits --games 500
npm run sim -- final --games 150 --patch werte.json --tag name --label "Text"
npm run sim -- report
```

Umfang dieses Berichts: rund 1.988.000 simulierte Partien.
