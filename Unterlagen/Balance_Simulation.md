# Balance-Simulation Domination

Erzeugt am 27.9.2026 mit dem Balance-Simulator (`npm run sim`, Tools/sim/). Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt 9).

## Kurzfassung

**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt 5), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. 1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.

| Fraktion | Stärke | Bereich (95 %) | Einschätzung | Beste Spielweise (Abschnitt 4) | Optimierte Strategie: Schwerpunkte |
|---|---|---|---|---|---|
| Starwing | 0,92 | 0,88–0,96 | ausgeglichen | Festung | starke Verteidigung, sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades |
| Lightforce | 1,29 | 1,24–1,34 | **zu stark** | Festung | sammelt Siegpunkte (Planeten, Upgrades), volle 1. Reihe, starke Verteidigung |
| Scaretech | 0,46 | 0,43–0,49 | **zu schwach** | Festung | sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung, hält Credits zurück |
| Biotec | 1,32 | 1,28–1,35 | **zu stark** | Blitzangriff | zielt auf Planeten und das Zentralgestirn, hält Credits zurück, kauft sofort, statt zu sparen |


- **Stärkste Fraktion: Biotec** (1,32), **schwächste: Scaretech** (0,46).
- Am deutlichsten ist die Abweichung bei **2 Spielern**: Biotec gewinnt 90 % der entschiedenen Partien (fair: 50 %).
- Auffälligste Karte: **Extend** (Biotec, 600 Credits, 3/3/3) mit dem höchsten Kampfwert je Credit im Spiel (1,20 je 1000 Credits, beste Einheit einer anderen Fraktion: Damokles mit 0,77), schon über den Startplaneten Hive zu haben (Abschnitt 8).
- Am ausgeglichensten von den getesteten Änderungen: **Extend kostet 1000 statt 600** (mittlere Abweichung von fair 0,30 statt 0,35). Danach ist Lightforce am stärksten (1,43) und Scaretech am schwächsten (0,57); eine einzelne Änderung reicht also nicht (Abschnitt 6).
- Wer anfängt, hat einen Vorteil: Bei 4 Spielern gewinnt Platz 1 30 %, Platz 4 nur 20 % (Abschnitt 2).
- „∞“ zu zweit zieht sich: Ø 60 Runden, 36 % der Partien ohne Sieger nach 120 Runden, wenn beide Seiten defensiv spielen (Abschnitt 1).
- Regel-Schwachstelle **Überlastungs-Sperre**: Eine Energiequelle in Reihe 2 kann jede Runde erneut „zerstört“ werden; der Besitzer setzt dann immer wieder aus (Abschnitt 7).

## 1. Balance mit optimierten Strategien

Jede Fraktion spielt die Einstellungen, die der Optimierer für sie gefunden hat (Abschnitt 5). Alle Sitzordnungen, 300 Partien je Sitzordnung und Einstellung. Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.

### 2 Spieler (fair: 50 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 41,8 % (40 %–44 %) ▼ | 37,2 % (35 %–39 %) ▼ | 31,5 % (29 %–34 %) ▼ |
| Lightforce | 42,0 % (40 %–44 %) ▼ | 51,8 % (50 %–54 %) | 56,1 % (52 %–60 %) ▲ |
| Scaretech | 22,6 % (21 %–25 %) ▼ | 19,9 % (18 %–22 %) ▼ | 16,9 % (15 %–19 %) ▼ |
| Biotec | 93,7 % (92 %–95 %) ▲ | 91,1 % (90 %–92 %) ▲ | 84,8 % (83 %–86 %) ▲ |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 3.600 | 3.600 | 3.600 |
| Ø Runden | 15,1 | 18,8 | 59,9 |
| Sieg durch Zentralgestirn | 35,5 % | 39,8 % | 64,4 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 35,6 % |

### 3 Spieler (fair: 33 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 30,3 % (29 %–32 %) | 35,0 % (34 %–36 %) | 35,7 % (34 %–37 %) |
| Lightforce | 40,4 % (39 %–42 %) ▲ | 50,6 % (49 %–52 %) ▲ | 50,6 % (49 %–52 %) ▲ |
| Scaretech | 15,2 % (14 %–16 %) ▼ | 13,7 % (13 %–15 %) ▼ | 14,7 % (14 %–16 %) ▼ |
| Biotec | 47,4 % (46 %–49 %) ▲ | 34,0 % (33 %–35 %) | 32,9 % (32 %–34 %) |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 7.200 | 7.200 | 7.200 |
| Ø Runden | 15,1 | 18,4 | 34,3 |
| Sieg durch Zentralgestirn | 32,3 % | 42,8 % | 90,3 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 9,7 % |

### 4 Spieler (fair: 25 %)

| Fraktion | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Starwing | 22,6 % (22 %–24 %) | 24,8 % (24 %–26 %) | 27,9 % (27 %–29 %) |
| Lightforce | 33,5 % (32 %–35 %) ▲ | 40,9 % (40 %–42 %) ▲ | 34,3 % (33 %–35 %) ▲ |
| Scaretech | 11,5 % (11 %–12 %) ▼ | 16,3 % (15 %–17 %) ▼ | 12,8 % (12 %–14 %) ▼ |
| Biotec | 32,4 % (31 %–34 %) ▲ | 18,0 % (17 %–19 %) ▼ | 25,0 % (24 %–26 %) |

|  | 30 SP | 40 SP | ∞ |
|---|---|---|---|
| Partien | 7.200 | 7.200 | 7.200 |
| Ø Runden | 14,8 | 17,0 | 16,2 |
| Sieg durch Zentralgestirn | 46,1 % | 67,9 % | 99,9 % |
| Remis (nach 120 Runden) | 0,0 % | 0,0 % | 0,1 % |

## 2. Vorteil durch die Sitzreihenfolge

Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen.

| Spieler | Platz 1 | Platz 2 | Platz 3 | Platz 4 | fair |
|---|---|---|---|---|---|
| 2 | 56,1 % | 43,9 % |  |  | 50 % |
| 3 | 38,5 % | 32,9 % | 28,6 % |  | 33 % |
| 4 | 29,7 % | 26,5 % | 23,4 % | 20,4 % | 25 % |

## 3. Wenn alle dieselbe Spielweise wählen

Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. Stärke relativ zu fair, gemittelt über 2–4 Spieler (60 Partien je Sitzordnung).

**30 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 0,86 | 0,42 | 0,50 | 2,22 |
| Händler | 0,75 | 0,73 | 0,73 | 1,79 |
| Blitzangriff | 0,71 | 0,55 | 0,32 | 2,42 |
| Festung | 1,12 | 0,79 | 0,63 | 1,46 |
| Superwaffe | 0,54 | 0,55 | 0,65 | 2,25 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 0,97 | 0,50 | 0,62 | 1,91 |
| Händler | 1,05 | 0,59 | 0,81 | 1,54 |
| Blitzangriff | 0,72 | 0,54 | 0,39 | 2,35 |
| Festung | 1,33 | 0,66 | 0,57 | 1,44 |
| Superwaffe | 0,72 | 0,63 | 0,96 | 1,68 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 1,00 | 0,82 | 0,81 | 1,35 |
| Händler | 0,70 | 0,65 | 0,36 | 1,99 |
| Blitzangriff | 0,66 | 0,48 | 0,51 | 2,34 |
| Festung | 1,24 | 1,27 | 0,73 | 0,73 |
| Superwaffe | 0,93 | 0,92 | 1,04 | 1,11 |

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
| Ausgewogen | 0,88 | 0,39 | 0,53 | 2,21 |
| Händler | 0,81 | 0,79 | 0,78 | 1,82 |
| Blitzangriff | 0,48 | 0,27 | 0,29 | **2,41** |
| Festung | **1,27** | **0,88** | **1,04** | 2,26 |
| Superwaffe | 0,45 | 0,37 | 0,43 | 1,87 |

**40 SP**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 0,98 | 0,45 | 0,65 | 1,94 |
| Händler | 1,03 | 0,67 | 0,77 | 1,61 |
| Blitzangriff | 0,49 | 0,24 | 0,30 | **2,19** |
| Festung | **1,62** | **1,06** | **1,18** | 1,95 |
| Superwaffe | 0,68 | 0,46 | 0,75 | 1,50 |

**∞**

| Spielweise | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|
| Ausgewogen | 0,97 | 0,85 | 0,85 | 1,32 |
| Händler | 1,17 | 0,88 | 0,66 | 1,84 |
| Blitzangriff | 0,84 | 0,61 | 0,65 | **2,04** |
| Festung | 1,25 | 1,20 | 0,84 | 1,31 |
| Superwaffe | **1,42** | **1,28** | **1,32** | 1,69 |

## 5. Die optimierten Strategien

Der Optimierer (Evolutionsstrategie, 20 Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler, 30 SP). Startpunkt war die beste Spielweise aus Abschnitt 4. Ab etwa der Hälfte der Generationen änderte sich die Stärke nur noch im Rahmen des Zufalls.

| Einstellung | Ausgewogen | Starwing | Lightforce | Scaretech | Biotec |
|---|---|---|---|---|---|
| Wirtschaft (Handelsplaneten) | 1,00 | 2,65 | 1,84 | 1,46 | 0,84 |
| Einheiten | 1,00 | 1,99 | 1,79 | 1,69 | 1,71 |
| Hyperraumschiffe | 1,00 | 1,04 | 0,53 | 1,65 | 1,38 |
| Siegpunkte (Planeten, Upgrades) | 1,00 | 2,78 | 2,75 | 2,51 | 0,86 |
| Technologiebaum | 1,00 | 0,40 | 0,24 | 0,19 | 0,05 |
| Upgrade-Wirkungen | 1,00 | 2,70 | 0,79 | 0,82 | 1,32 |
| Superwaffe | 1,00 | 0,00 | 0,28 | 0,16 | 0,38 |
| Verteidigung | 1,00 | 2,98 | 2,36 | 2,36 | 0,65 |
| Mindestbesetzung Reihe 1 | 3,00 | 1,31 | 6,19 | 4,59 | 0,64 |
| Credit-Reserve | 400 | 171 | 339 | 932 | 1149 |
| Sparen auf teure Karten | 0,50 | 0,55 | 0,76 | 0,44 | 0,08 |
| Angriffslust | 200 | -115 | -355 | -140 | 184 |
| Planeten-/Zentralgestirn-Angriffe | 1,00 | 0,30 | 0,33 | 1,57 | 2,56 |
| Führenden angreifen (1) / Schwächsten (0) | 0,60 | 1,00 | 0,89 | 0,94 | 0,27 |
| Reparieren | 1,00 | 2,05 | 2,01 | 1,58 | 0,08 |
| Zentralgestirn hinten (≥ 0,5) | 1,00 | 0,86 | 0,82 | 0,87 | 0,92 |

### Starwing

- **Schwerpunkte gegenüber „Ausgewogen“:** starke Verteidigung, sammelt Siegpunkte (Planeten, Upgrades), kauft Upgrades, setzt auf Handelsplaneten, bremst den Führenden.
- **So gewinnt sie:** Ø 10,2 Planeten, 1,1 Upgrades, 14,4 Sterne, 1,1 Münzen; 53 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 8,2; 15,9 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssystem · R2: – · R3: Protonenmond (50 %, 32 %)
  - R1: Handelssystem · R2: Auge des Kolumbus · R3: Auge des Kolumbus (32 %, 29 %)
  - R1: Handelssystem · R2: – · R3: – (9 %, 15 %)
- **Karten, mit denen sie öfter gewinnt:** Feuerschwinge (+46 Pkt.), Schildgenerator (+21 Pkt.), Sternenparlament (+21 Pkt.), Teilchenbeschleuniger (+20 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Aufklärungskomplex (−8 Pkt.), Nostradamus (−5 Pkt.), Weißer Golem (−3 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Lightforce

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), volle 1. Reihe, starke Verteidigung, greift nur bei klarem Vorteil an, repariert viel.
- **So gewinnt sie:** Ø 10,4 Planeten, 0,8 Upgrades, 16,0 Sterne, 1,2 Münzen; 49 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 7,7; 17,1 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Handelssektor · R2: Strahlenjäger · R3: Elektronenmond (30 %, 46 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: Strahlenjäger, Strahlenjäger (23 %, 39 %)
  - R1: Handelssektor · R2: Strahlenjäger · R3: – (14 %, 32 %)
- **Karten, mit denen sie öfter gewinnt:** Quantensammler (+29 Pkt.), Lichtgeschwindigkeit (+27 Pkt.), Nachtsicht (+16 Pkt.), Warpgate (+15 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Novakanone (−9 Pkt.), Drohnenkolonie (−3 Pkt.), Handelssektor (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Scaretech

- **Schwerpunkte gegenüber „Ausgewogen“:** sammelt Siegpunkte (Planeten, Upgrades), starke Verteidigung, hält Credits zurück, bremst den Führenden, kaum Technologiebaum.
- **So gewinnt sie:** Ø 7,4 Planeten, 0,7 Upgrades, 13,5 Sterne, 0,6 Münzen; 67 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 6,2; 18,7 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Telecluster, Antimaterieminen · R2: Shadow Arm, Shadow Arm · R3: Shadow Arm (57 %, 16 %)
  - R1: Antimaterieminen, Shadow Arm, Shadow Arm · R2: Shadow Arm · R3: Shadow Arm (14 %, 11 %)
  - R1: Antimaterieminen, Shadow Arm, Shadow Arm · R2: Shadow Arm · R3: – (13 %, 15 %)
- **Karten, mit denen sie öfter gewinnt:** Rauminvasion (+28 Pkt.), Wurmloch (+27 Pkt.), Assimilation (+16 Pkt.), Künstliche Intelligenz (+12 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Antimaterieminen (+0 Pkt.), Shadow Arm (+0 Pkt.), Telecluster (+0 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

### Biotec

- **Schwerpunkte gegenüber „Ausgewogen“:** zielt auf Planeten und das Zentralgestirn, hält Credits zurück, kauft sofort, statt zu sparen, dünne 1. Reihe, greift den Schwächsten an.
- **So gewinnt sie:** Ø 3,0 Planeten, 0,2 Upgrades, 12,7 Sterne, 0,8 Münzen; 82 % der Siege durch ein zerstörtes Zentralgestirn.
- **Angriffe:** der erste im Schnitt in Runde 3,0; 29,6 Angriffe je Partie.
- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):
  - R1: Tyrant, Extend, Extend · R2: Einheit 5, Tyrant · R3: – (86 %, 35 %)
  - R1: Tyrant, Extend, Extend · R2: Tyrant · R3: – (14 %, 55 %)
- **Karten, mit denen sie öfter gewinnt:** Mutagen (+10 Pkt.), Tyrant (+0 Pkt.), Extend (+0 Pkt.), Einheit 5 (−1 Pkt.)
- **Karten, mit denen sie seltener gewinnt:** Hive (−33 Pkt.), Mutant (−5 Pkt.), Einheit 5 (−1 Pkt.)
  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.

## 6. Was wäre wenn: geänderte Kartenwerte

Dieselben optimierten Bots spielen mit geänderten Kartenwerten (nur im Simulator, alle Sitzordnungen, 2–4 Spieler, alle Siegpunkt-Einstellungen). Ihre Käufe passen sie selbst an; neu optimiert wurden sie nicht. Stärke relativ zu fair wie in der Kurzfassung.

| Änderung | Starwing | Lightforce | Scaretech | Biotec | mittlere Abweichung von fair |
|---|---|---|---|---|---|
| heutige Werte | 0,92 | 1,29 | 0,46 | 1,32 | 0,35 |
| Extend kostet 1000 statt 600 | 1,00 | 1,43 | 0,57 | 1,00 | 0,30 |
| Extend kostet 900, Schaden 2 statt 3 | 1,22 | 1,54 | 0,80 | 0,47 | 0,41 |
| Extend erst mit Manufaktur | 1,23 | 1,61 | 0,87 | 0,36 | 0,46 |
| Flottenbasis kostet 1800 statt 2500 | 0,89 | 1,28 | 0,51 | 1,29 | 0,32 |
| Extend erst mit Manufaktur + Flottenbasis 1800 | 1,21 | 1,63 | 0,90 | 0,32 | 0,48 |

*Mittlere Abweichung:* quadratisches Mittel der Abstände aller vier Fraktionen von 1,00; 0 wäre perfekt ausgeglichen.


Genaue Änderungen:

- Extend kostet 1000 statt 600: `{"Extend":{"price":1000}}`
- Extend kostet 900, Schaden 2 statt 3: `{"Extend":{"price":900,"dmg":2}}`
- Extend erst mit Manufaktur: `{"Extend":{"requires":"Manufaktur"}}`
- Flottenbasis kostet 1800 statt 2500: `{"Flottenbasis":{"price":1800}}`
- Extend erst mit Manufaktur + Flottenbasis 1800: `{"Extend":{"requires":"Manufaktur"},"Flottenbasis":{"price":1800}}`

## 7. Regel-Auffälligkeiten

**Überlastungs-Sperre.** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte laut Regel liegen, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. Liegt sie aufgedeckt in Reihe 2, kann der Gegner sie in jeder Runde erneut angreifen: Der Besitzer setzt dann immer wieder aus, ohne dass die Karte je verschwindet.

Versuch: Eine Fraktion legt ihre Energiequelle in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP).

| Fraktion | Spieler | Aussetzen je Partie (hinten) | Aussetzen je Partie (Reihe 2) | Siegquote (hinten) | Siegquote (Reihe 2) |
|---|---|---|---|---|---|
| Starwing | 2 | 0,07 | 3,89 | 42 % | 37 % |
| Starwing | 4 | 0,03 | 0,55 | 23 % | 21 % |
| Lightforce | 2 | 0,05 | 3,91 | 42 % | 42 % |
| Lightforce | 4 | 0,04 | 0,32 | 34 % | 34 % |
| Biotec | 2 | 0,01 | 0,04 | 94 % | 93 % |
| Biotec | 4 | 0,77 | 1,72 | 32 % | 31 % |

Vorschlag: Eine durch Überlastung „gerettete“ Energiequelle wird verdeckt neu ausgelegt, oder sie kann in der folgenden Runde nicht erneut angegriffen werden. Bis dahin gilt als Spieltipp: Energiequellen immer in die 3. Reihe.

**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt 60 Runden; 36 % der Partien hatten nach 120 Runden noch keinen Sieger, fast immer, wenn zwei verteidigende Fraktionen aufeinandertrafen.

## 8. Kampfwert der Einheiten

Mittlere Siegchance im Einzelgefecht gegen alle Einheiten der anderen Fraktionen (je zur Hälfte als Angreifer und als Verteidiger, Grundwerte ohne Upgrades), exakt berechnet. „je 1000 Credits“ setzt das ins Verhältnis zum Preis; fett = besonders günstig. Einheiten mit Defensive 0 zerstören sich bei jedem Angriff selbst. Startplaneten sind mit * markiert: Ihre Einheiten sind ab Runde 1 kaufbar.

| Fraktion | Einheit | Preis | Def/Off/Schaden | freigeschaltet durch | Kampfwert | je 1000 Credits |
|---|---|---|---|---|---|---|
| Starwing | Fährtensucher | 225 | 1/1/1 | Aufklärungskomplex * | 13 % | 0,59 |
| Starwing | Auge des Kolumbus | 300 | 1/2/1 | Aufklärungskomplex * | 19 % | 0,63 |
| Starwing | Phoenix | 700 | 2/2/1 | Orbitaldock | 27 % | 0,39 |
| Starwing | Pegasus | 900 | 3/3/1 | Orbitaldock | 48 % | 0,53 |
| Starwing | Weißer Golem | 1100 | 2/4/2 | Orbitaldock | 47 % | 0,43 |
| Starwing | Poseidons Fluch | 1200 | 4/4/3 | Orbitaldock | 80 % | 0,66 |
| Starwing | Zeus | 1200 | 3/3/1 | Hyperraumnebel | 48 % | 0,40 |
| Starwing | Nostradamus | 1400 | 3/3/2 | Hyperraumnebel | 60 % | 0,43 |
| Lightforce | Lichtfunke | 200 | 1/1/1 | Drohnenkolonie * | 13 % | 0,67 |
| Lightforce | Strahlenjäger | 300 | 1/2/1 | Drohnenkolonie * | 19 % | 0,65 |
| Lightforce | Glutdrache | 800 | 2/3/1 | Weltraumwerft | 34 % | 0,42 |
| Lightforce | Sonnenfaust | 900 | 3/3/1 | Weltraumwerft | 50 % | 0,56 |
| Lightforce | Inferno | 1000 | 2/4/2 | Weltraumwerft | 49 % | 0,49 |
| Lightforce | Lichtpfeil | 1200 | 3/3/2 | Warpgate | 63 % | 0,52 |
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
| Biotec | Extend | 600 | 3/3/3 | Hive * | 72 % | **1,20** |
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
  - Auge des Raumes deckt zu Zugbeginn einen gegnerischen Planeten auf. Schwarzer Schleier legt Scaretech-Einheiten verdeckt. Neuronetz tauscht verdeckte Planeten; das Umsetzen von Einheiten bringt im Modell nichts.
- **Bots:** bewerten jede mögliche Aktion in Credits, mit exakt berechneten Kampfwahrscheinlichkeiten. Sie sehen nur, was am Tisch sichtbar ist. Energiequellen und das Zentralgestirn legen sie nach hinten und halten mindestens zwei Planeten als Schutz in Reihe 2.
- **Grenzen:** Bots bluffen nicht, sprechen sich nicht ab und planen nur einen Zug voraus (plus Sparziel). Menschen spielen anders, besonders mit Absprachen zu dritt oder zu viert. Die Ergebnisse zeigen Tendenzen im Kartenmaterial, keine exakten Siegchancen am Tisch.
- **Remis:** Partien ohne Sieger nach 120 Runden zählen nicht in die Siegquoten.

## 10. Nachrechnen

```bash
npm run sim -- all                  # Versuche A+B, Optimierung, Balance-Urteil, Bericht
npm run sim -- strategies --games 60
npm run sim -- tune --gens 20 --g2 60 --g4 12
npm run sim -- final --games 300
npm run sim -- exploits
npm run sim -- final --games 150 --patch werte.json --tag name --label "Text"
npm run sim -- report
```

Umfang dieses Berichts: rund 1.103.000 simulierte Partien.
