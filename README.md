# CnC – Das Kartenspiel (Web-App)

Ursprünglich ein Microcontroller-gestütztes Kartenspiel (ATmega644) im Command & Conquer-Universum.
Physische Spielkarten mit Barcodes, gelesen über eine Reflexlichtschranke in einem selbstgebauten Kasten.

**Jetzt:** Eine Web-App für Handy und Tablet ersetzt den Kasten. Statt des Terminals wird das Handy herumgereicht.
Die Kamera ersetzt den Barcodeleser. Statt des alten proprietären Formats tragen die Karten echte EAN-8-Barcodes.
Die Spielmechanik ist 1:1 aus dem Microcontroller-Code übernommen. Abweichungen stehen unter [Abweichungen vom Original](#abweichungen-vom-original).

## Schnellstart

```bash
npm install
npm run dev
```

- Der Dev-Server läuft mit HTTPS (selbstsigniertes Zertifikat), weil Handy-Browser die Kamera nur über HTTPS freigeben.
- Am Handy im selben WLAN die angezeigte **Network**-Adresse öffnen (z. B. `https://192.168.178.63:5173`) und die Zertifikatswarnung einmalig bestätigen. Beim ersten Zugriff fragt ggf. die Windows-Firewall nach, ob Node.js im privaten Netzwerk erreichbar sein darf.
- `npm run dev -- --mode http` startet ohne HTTPS (nur für die Vorschau am PC, dort ohne Kamera).
- `npm test` führt die Engine-Tests aus (Regeln, alle 160 Barcodes mit ZXing dekodiert, Zufallspartien).
- `npm run build` erzeugt die statische Seite in `dist/` (Hosting später z. B. per GitHub Pages).

**Kartendrucker:** `Tools/generate_barcodes.html` (im Dev-Server unter `/Tools/generate_barcodes.html` oder über den Startbildschirm).
Er druckt alle 160 Karten im Pokerformat 63×88 mm (9 pro A4-Seite) oder nur die Barcodes als Etiketten (38×21 mm, 65 pro Bogen, z. B. Avery L7651) zum Aufkleben auf die alten Karten.
Beim Drucken „Tatsächliche Größe / 100 %“ wählen.

**Kartenbilder:** pro Kartentyp eine Datei `public/cards/<ID>.png` ablegen. Fehlende Bilder werden in App und Kartendrucker als Platzhalter gezeichnet. Die Checkliste aller 92 Dateinamen steht in [`public/cards/README.md`](public/cards/README.md).

---

## Spielübersicht

© 2005 Jochen Feldkötter & Raphael Ludwig — Quellen: Microcontroller-Code, Anleitung V1.01, Kartenliste 4P

- **2–4 Spieler**, rundenbasiert, Hot-Seat (ein Gerät)
- **4 Fraktionen:** USA, China, GBA, BIOTEC
- **92 einzigartige Kartentypen** (pro Fraktion: 14 Gebäude, 20 Einheiten, 6 Upgrades = 40 Karten)
- **~160 physische Karten** (viele Karten existieren 2–5× pro Fraktion, z.B. 3× Ranger, 3× Fusionsreaktor)
- **Gewinnbedingung:** 30/40 Siegpunkte erreichen ODER gegnerische Zentrale zerstören
- **Spielphasen pro Zug:** Credits kassieren → Überlastung prüfen (ggf. aussetzen) → Sonderaktion → Bauphase (fertige Karten aktivieren) → Aktionen (Kaufen/Angriff/Reparatur/Info/Inventar) → Zug beenden

### Spielfeld (aus Anleitung)

Jeder Spieler hat ein Spielfeld mit **3 Reihen × 7 Feldern**:

```
┌───┬───┬───┬───┬───┬───┬───┐
│ E │ E │ E │ E │ E │ E │ E │  1. Reihe: Einheiten (offen ausgespielt)
├───┼───┼───┼───┼───┼───┼───┤
│ G │ G │ G │ G │ G │ G │ G │  2. Reihe: Gebäude (verdeckt!)
├───┼───┼───┼───┼───┼───┼───┤
│ G │ G │ G │ G │ G │ G │ G │  3. Reihe: Gebäude (verdeckt!)
└───┴───┴───┴───┴───┴───┴───┘
              Spieler
```

**Platzierungsregeln:**
- Einheiten werden **offen** in Reihe 1 gelegt
- Gebäude werden **verdeckt** in Reihe 2/3 gelegt (erst bei Angriff aufgedeckt)
- Stacking: max 3 Fußsoldaten, max 2 Fahrzeuge, max 1 Fahrzeug + 1 Fuß, Flugzeuge alleine
- Gebäude belegen 1–5 Felder je nach Typ (in Kartenliste dokumentiert)

**Angriffsreihenfolge:**
- Gebäude in Reihe 3 erst angreifbar wenn Reihe 1 + 2 leer
- Gebäude in Reihe 2 erst angreifbar wenn Reihe 1 leer
- **Flugzeuge** können eine Reihe überspringen
- **GBA Tunnelsystem:** Fußeinheiten können Reihe 1 überspringen
- **GBA Tarnung (Upgrade):** Einheiten verdeckt ausspielen (nach Angriff aufgedeckt)
- **Sprengstoff-LKW & Terroristen:** Zerstören sich selbst nach Angriff, keine Siegpunkte

### Kernmechaniken

| Mechanik | Details |
|---|---|
| Startkapital | 1600 Credits |
| Einkommen/Runde | 400 Grund + 400 pro Nachschublager |
| Max. Käufe/Runde | 3 |
| Max. Angriffe/Runde | 3 (kostenlos mit Strategiezentrum, sonst 200 Credits) |
| Max. Reparaturen/Runde | 1 (kostet 200 Credits, +1 Def, mit Upgrade +2 Def) |
| Energiesystem | Kraftwerke liefern je 3 Energie, jedes Gebäude (außer Kraftwerk) verbraucht 1. GBA braucht keine Energie. |
| Kampfwürfel | W6 – Offensive ≥ Wurf = Treffer, dann Schaden von Defensive abziehen |
| Siegpunkte | Gebäude + Upgrades + Sterne + Orden (Bester Stützpunkt: +5, Beste Streitmacht: +5) |
| Sonderaktionen | Ab Runde 5, bei wenig Einheiten/Gebäuden (≤7), Zufallsbonus (Credits, Sofort-Aktivierung, Reparatur) |
| Spionagesatellit | USA-Upgrade: Pro Runde eine verdeckte Gegnerkarte aufdecken |

### Fraktions-Vor- & Nachteile (aus Anleitung)

**USA:**
- ➖ Einheiten & Gebäude teuer
- ➕ Wirkungsvolle Flugzeuge (überspringen eine Reihe)
- ➕ Stealth-Fighter: getarnt, ignoriert Flugabwehr
- ➕ Starke Flugabwehr (Patriot-Batterie)
- ➖ Kraftwerke nötig (Energiesystem)
- ➕ Spionagesatellit: 1× pro Runde verdeckte Gegnerkarte aufdecken
- ➕ 14 verschiedene Gebäude

**China:**
- ➕ Ausgewogenes Preis-Leistungs-Verhältnis
- ➕ Mig (Flugzeug überspringt Reihe)
- ➕ Mächtigste Fahrzeuge (Weltenherrscher, Infernalgeschütz)
- ➖ Kraftwerke nötig (Energiesystem)
- ➕ Nationalismus-Upgrade wertet Fußeinheiten auf
- ➕ 14 verschiedene Gebäude

**GBA:**
- ➖ Einheiten günstig aber schwach
- ➕ Tunnelsystem: Fußeinheiten überspringen Reihe 1
- ➕ Sprengstoff-LKW: trifft fast immer, viel Schaden
- ➖ Terroristen/LKW zerstören sich selbst, keine Siegpunkte
- ➕ Keine Energie nötig!
- ➕ Tarnung: Einheiten verdeckt ausspielen
- ➕ Instandsetzung: Vollreparatur (+2 Def) pro Runde
- ➖ Nur 12 verschiedene Gebäude

**BIOTEC:**
- Späterer Zusatz, analog zu China aufgebaut
- ➖ Upgrades noch nicht vollständig designed
- ➕ Energiesystem wie USA/China (Plasmareaktoren)
- ➕ Vielfältige Panzer-Einheiten (4 verschiedene Panzertypen)

### Kampftypen

1. **Einheit vs Einheit** – Rundenkampf bis einer fällt (beide würfeln abwechselnd)
2. **Einheit vs Gebäude** – Einmal-Angriff; Gegenangriff nur bei Flugabwehr
3. **Flugzeug vs Gebäude** – Erst Flugabwehr (Off = Anzahl Türme + 1), dann Flugzeug-Angriff
4. **Tarnkappenbomber vs Gebäude** – Ignoriert Flugabwehr komplett
5. **Superwaffe** – Trifft immer, danach 3 Runden Cooldown (Freischaltung zurückgesetzt)

---

## Kartenwerte

Die Werte stehen in [`src/engine/data.ts`](src/engine/data.ts), direkt aus `defaultkarten[92]` im Microcontroller-Code:

<details>
<summary>Komplette Kartentabelle (alle 92 Karten)</summary>

**USA (ID 0–22)**

| ID | Name | Typ | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|
| 0 | Kommandozentrale | Gebäude | 2000 | 1 | 8 | 0 | 0 | Start |
| 1 | Kaserne | Gebäude | 600 | 1 | 2 | 0 | 0 | Zentrale |
| 2 | Fusionsreaktor | Gebäude | 800 | 1 | 2 | 0 | 0 | Zentrale |
| 3 | Versorgungszentrum | Gebäude | 2000 | 2 | 4 | 0 | 0 | Fusionsreaktor |
| 4 | Patriot-Batterie | Gebäude | 1000 | 1 | 3 | 3 | 2 | Fusionsreaktor |
| 5 | Waffenfabrik | Gebäude | 2000 | 2 | 3 | 0 | 0 | Versorgungszentrum |
| 6 | Flugfeld | Gebäude | 1000 | 3 | 3 | 0 | 0 | Versorgungszentrum |
| 7 | Strategiezentrum | Gebäude | 2500 | 3 | 3 | 0 | 0 | Waffenfabrik |
| 8 | Partikelkanone | Gebäude | 3500 | 3 | 4 | 6 | 4 | Strategiezentrum |
| 9 | Ranger | Einheit | 225 | 1 | 1 | 1 | 1 | Kaserne |
| 10 | Raketentrooper | Einheit | 300 | 1 | 1 | 2 | 1 | Kaserne |
| 11 | Panzerjeep | Einheit | 700 | 2 | 2 | 2 | 1 | Waffenfabrik |
| 12 | Crusader | Einheit | 900 | 2 | 3 | 3 | 1 | Waffenfabrik |
| 13 | Tomahawk | Einheit | 1100 | 3 | 2 | 4 | 2 | Waffenfabrik |
| 14 | Paladin | Einheit | 1200 | 2 | 4 | 4 | 3 | Waffenfabrik |
| 15 | Raptor | Einheit | 1200 | 3 | 3 | 3 | 1 | Flugfeld |
| 16 | Stealth-Fighter | Einheit | 1400 | 3 | 3 | 3 | 2 | Flugfeld |
| 17 | Panzerung | Upgrade | 1000 | 0 | – | – | – | Strategiezentrum |
| 18 | Kontrollstäbe | Upgrade | 800 | 0 | – | – | – | Fusionsreaktor |
| 19 | Laserzielerfassung | Upgrade | 1500 | 0 | – | – | – | Flugfeld |
| 20 | Raketenmagazin | Upgrade | 1500 | 0 | – | – | – | Flugfeld |
| 21 | Spionagesatellit | Upgrade | 500 | 0 | – | – | – | Strategiezentrum |
| 22 | TOW-Rakete | Upgrade | 1200 | 0 | – | – | – | Waffenfabrik |

**China (ID 23–45)**

| ID | Name | Typ | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|
| 23 | Kommandozentrale | Gebäude | 2000 | 1 | 8 | 0 | 0 | Start |
| 24 | Kaserne | Gebäude | 500 | 1 | 2 | 0 | 0 | Zentrale |
| 25 | Atomreaktor | Gebäude | 1000 | 1 | 3 | 0 | 0 | Zentrale |
| 26 | Bunker | Gebäude | 700 | 1 | 3 | 2 | 2 | Kaserne |
| 27 | Versorgungszentrum | Gebäude | 1500 | 2 | 4 | 0 | 0 | Atomreaktor |
| 28 | Waffenfabrik | Gebäude | 2000 | 2 | 4 | 0 | 0 | Versorgungszentrum |
| 29 | Flugplatz | Gebäude | 1000 | 3 | 3 | 0 | 0 | Versorgungszentrum |
| 30 | Propagandazentrum | Gebäude | 2000 | 3 | 3 | 0 | 0 | Waffenfabrik |
| 31 | Atomraketensilo | Gebäude | 3500 | 3 | 4 | 6 | 4 | Propagandazentrum |
| 32 | Rotgardist | Einheit | 200 | 1 | 1 | 1 | 1 | Kaserne |
| 33 | Panzerjäger | Einheit | 300 | 1 | 1 | 2 | 1 | Kaserne |
| 34 | Faust Maos | Einheit | 900 | 2 | 3 | 3 | 1 | Waffenfabrik |
| 35 | Drachenpanzer | Einheit | 800 | 2 | 2 | 3 | 1 | Waffenfabrik |
| 36 | Infernalgeschütz | Einheit | 1000 | 3 | 2 | 4 | 2 | Waffenfabrik |
| 37 | Weltenherrscher | Einheit | 1800 | 3 | 5 | 5 | 3 | Waffenfabrik |
| 38 | Nukleargeschütz | Einheit | 1600 | 3 | 2 | 4 | 3 | Waffenfabrik |
| 39 | Mig | Einheit | 1200 | 3 | 3 | 3 | 2 | Flugplatz |
| 40 | Nuklearpanzer | Upgrade | 1500 | 0 | – | – | – | Propagandazentrum |
| 41 | Schwarzes Napalm | Upgrade | 2000 | 0 | – | – | – | Kaserne |
| 42 | Überlastung | Upgrade | 1000 | 0 | – | – | – | Atomreaktor |
| 43 | Uran-Rakete | Upgrade | 2000 | 0 | – | – | – | Propagandazentrum |
| 44 | Nationalismus | Upgrade | 1000 | 0 | – | – | – | Propagandazentrum |
| 45 | Mig-Panzerung | Upgrade | 500 | 0 | – | – | – | Flugplatz |

**GBA (ID 46–68)**

| ID | Name | Typ | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|
| 46 | Kommandocenter | Gebäude | 2000 | 1 | 8 | 0 | 0 | Start |
| 47 | Kaserne | Gebäude | 500 | 1 | 2 | 0 | 0 | Zentrale |
| 48 | Geheimlager | Gebäude | 1500 | 3 | 3 | 0 | 0 | Zentrale |
| 49 | Stinger-Stellung | Gebäude | 900 | 1 | 2 | 2 | 1 | Kaserne |
| 50 | Waffenhändler | Gebäude | 2500 | 2 | 3 | 0 | 0 | Geheimlager |
| 51 | Palast | Gebäude | 2500 | 3 | 4 | 0 | 0 | Waffenhändler |
| 52 | Schwarzmarkt | Gebäude | 2500 | 2 | 3 | 0 | 0 | Palast |
| 53 | SCUD-Sturm | Gebäude | 3500 | 3 | 4 | 6 | 4 | Palast |
| 54 | Tunnelsystem | Gebäude | 1500 | 3 | 2 | 0 | 0 | Kaserne |
| 55 | Rebell | Einheit | 150 | 1 | 1 | 1 | 1 | Kaserne |
| 56 | Terrorist | Einheit | 250 | 2 | 0 | 3 | 2 | Kaserne |
| 57 | Kampfjeep | Einheit | 500 | 1 | 2 | 2 | 1 | Waffenhändler |
| 58 | Scorpion | Einheit | 600 | 1 | 3 | 2 | 1 | Waffenhändler |
| 59 | Marodeur | Einheit | 900 | 2 | 4 | 3 | 2 | Waffenhändler |
| 60 | Raketenbuggy | Einheit | 800 | 2 | 1 | 3 | 2 | Waffenhändler |
| 61 | Sprengstoff-LKW | Einheit | 1000 | 3 | 0 | 5 | 5 | Waffenhändler |
| 62 | SCUD-Werfer | Einheit | 1200 | 3 | 2 | 4 | 3 | Waffenhändler |
| 63 | Toxingranaten | Upgrade | 1000 | 0 | – | – | – | Palast |
| 64 | Spezialmunition | Upgrade | 1000 | 0 | – | – | – | Waffenhändler |
| 65 | Instandsetzung | Upgrade | 2000 | 0 | – | – | – | Schwarzmarkt |
| 66 | Buggy-Munition | Upgrade | 800 | 0 | – | – | – | Waffenhändler |
| 67 | Scorpion-Raketen | Upgrade | 1000 | 0 | – | – | – | Schwarzmarkt |
| 68 | Tarnung | Upgrade | 2000 | 0 | – | – | – | Palast |

**BIOTEC (ID 69–91)**

| ID | Name | Typ | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|
| 69 | Konzernführung | Gebäude | 2000 | 1 | 8 | 0 | 0 | Start |
| 70 | Hive | Gebäude | 500 | 1 | 2 | 0 | 0 | Zentrale |
| 71 | Plasmareaktor | Gebäude | 1500 | 3 | 3 | 0 | 0 | Zentrale |
| 72 | Deflektor | Gebäude | 900 | 1 | 2 | 2 | 1 | Hive |
| 73 | Abt. Kapital | Gebäude | 2500 | 2 | 3 | 0 | 0 | Hive |
| 74 | Manufaktur | Gebäude | 2500 | 3 | 4 | 0 | 0 | Abt. Kapital |
| 75 | Helipad | Gebäude | 2500 | 2 | 3 | 0 | 0 | Abt. Kapital |
| 76 | Abt. Forschung | Gebäude | 3500 | 3 | 4 | 6 | 4 | Manufaktur |
| 77 | Wumms | Gebäude | 1500 | 3 | 2 | 0 | 0 | Abt. Forschung |
| 78 | Einheit 5 | Einheit (Fuß) | 150 | 1 | 1 | 1 | 1 | Hive |
| 79 | Mutant | Einheit (Fuß) | 250 | 1 | 1 | 1 | 2 | Hive |
| 80 | Tyrant | Einheit (Fuß) | 500 | 2 | 2 | 3 | 2 | Hive |
| 81 | Extend | Einheit (Fuß) | 600 | 2 | 3 | 3 | 3 | Hive |
| 82 | Agressor Panzer | Einheit (Fahr.) | 900 | 2 | 4 | 3 | 2 | Manufaktur |
| 83 | Artillerie Panzer | Einheit (Fahr.) | 800 | 2 | 1 | 3 | 2 | Manufaktur |
| 84 | Regenerat. Panzer | Einheit (Fahr.) | 1000 | 3 | 3 | 5 | 5 | Manufaktur |
| 85 | Helicopter | Einheit (Flug) | 1200 | 3 | 2 | 4 | 3 | Helipad |
| 86 | Update 1 | Upgrade | 1000 | 0 | – | – | – | Abt. Forschung |
| 87 | Update 2 | Upgrade | 1000 | 0 | – | – | – | Abt. Forschung |
| 88 | Update 3 | Upgrade | 2000 | 0 | – | – | – | Abt. Forschung |
| 89 | Update 4 | Upgrade | 800 | 0 | – | – | – | Abt. Forschung |
| 90 | Update 5 | Upgrade | 1000 | 0 | – | – | – | Abt. Forschung |
| 91 | Update 6 | Upgrade | 2000 | 0 | – | – | – | Abt. Forschung |

</details>

### Upgrade-Effekte (aus dem Code)

| ID | Name | Effekt |
|---|---|---|
| 17 | USA: Panzerung | Crusader Def +1 (→4), Paladin Def +1 (→5) |
| 18 | USA: Kontrollstäbe | Energie-Upgrade: jedes Kraftwerk +2 Energie extra |
| 19 | USA: Laserzielerfassung | Raptor Off +1 (→4), Stealth Off +1 (→4) |
| 20 | USA: Raketenmagazin | Raptor Schaden +1 (→2), Stealth Schaden +1 (→3) |
| 21 | USA: Spionagesatellit | Im Original ohne Effekt. Die App erinnert jeden Zug: eine verdeckte Gegnerkarte aufdecken |
| 22 | USA: TOW-Rakete | Panzerjeep Off +1 (→3) |
| 40 | China: Nuklearpanzer | Faust Maos Schaden +1 (→2) |
| 41 | China: Schwarzes Napalm | Drachenpanzer Schaden +1 (→2) |
| 42 | China: Überlastung | Energie-Upgrade: jedes Kraftwerk +2 Energie extra |
| 43 | China: Uran-Rakete | Infernalgeschütz Schaden +1 (→3), Nukleargeschütz +1 (→4) |
| 44 | China: Nationalismus | Rotgardist Off +1 (→2), Panzerjäger Off +1 (→3) |
| 45 | China: Mig-Panzerung | Mig Def +1 (→4) |
| 63 | GBA: Toxingranaten | Scorpion Schaden +1 (→2), Marodeur Schaden +1 (→3) |
| 64 | GBA: Spezialmunition | Rebell Schaden +1 (→2), Kampfjeep Schaden +1 (→2) |
| 65 | GBA: Instandsetzung | Reparatur-Upgrade: Reparatur heilt +2 statt +1 |
| 66 | GBA: Buggy-Munition | Raketenbuggy Schaden +1 (→3) |
| 67 | GBA: Scorpion-Raketen | Scorpion Off +1 (→3) |
| 68 | GBA: Tarnung | Im Original ohne Effekt. Die App weist nach dem Kauf darauf hin, dass Einheiten verdeckt ausgespielt werden dürfen |
| 86–91 | BIOTEC: Update 1–6 | _(Alle 6 nicht implementiert im Original)_ |

---

## Die Web-App

- **Hot-Seat wie das Original:** ein Gerät, das nach jedem Zug weitergereicht wird. Vor jedem Zug erscheint ein Übergabe-Bildschirm, der die Daten des Vorgängers verbirgt.
- **Die 7 Taster** des Kastens werden zu Buttons: Kaufen, Angriff, Reparatur, Info, Inventar, Zug beenden. OK/Abbruch sind die Bestätigungs-Buttons in jedem Ablauf.
- **Scannen:** Kamera als Vollbild-Sucher. Chrome/Android nutzt die eingebaute `BarcodeDetector`-API, iPhone/Safari den mitgelieferten ZXing-WASM-Leser (kein CDN, funktioniert offline). Ein Code gilt erst, wenn er zweimal hintereinander gleich gelesen wurde. Treffer werden mit Vibration und Piepton bestätigt. Falls die Kamera fehlt: „Karte manuell wählen“.
- **Kampf:** Würfe werden Schritt für Schritt mit W6 angezeigt (Treffer, wenn Offensive ≥ Wurf).
- **Spielstand** wird nach jeder Aktion im Browser gespeichert (übersteht Neuladen und Displaysperre). Während des Spiels bleibt das Display an.

### Barcodes

Jede **physische** Karte hat eine eigene Nummer 000–159 (wie im Original), mehrere Nummern zeigen über `kartenzeiger[]` auf denselben Kartentyp.
Der EAN-8-Code ist `0000` + dreistellige Nummer + Prüfziffer, z. B. Karte 7 → `00000079`.
Die alten Barcodes (Balkenbreiten für die Lichtschranke) sind mit Handykameras nicht lesbar, deshalb werden die Karten neu gedruckt oder mit Etiketten überklebt.

Der alte Generator in `Tools/` zeichnete die Barcodes mit zu kleiner Ruhezone (~3,7 statt 7 Module) und unscharfen Bruchteil-Pixeln.
Der neue Kartendrucker rendert sie als Vektorgrafik mit 0,4 mm pro Modul (32 mm breit inkl. Ruhezone).
Ein Test dekodiert alle 160 Codes mit ZXing.

## Projektstruktur

```
index.html, src/main.tsx      Web-App (Vite + TypeScript + Preact)
src/engine/                   Spiellogik ohne UI, 1:1 aus dem Microcontroller-Code
  data.ts                       Kartenwerte, kartenzeiger[], Konstanten
  ean.ts, cards.ts              EAN-8, Fraktion/Kartenart je physischer Karte
  state.ts, turn.ts             Spielzustand, Zugbeginn (Einkommen, Überlastung, Sonderaktion, Bauphase)
  buy.ts, combat.ts, actions.ts Kaufen + Upgrades, 5 Kampftypen, Reparatur/Info
  victory.ts                    Orden, Siegpunkte, Sieg
  *.test.ts                     Vitest: Regeln, Barcodes, Zufallspartien
src/scanner/                  Kamera + Barcode-Erkennung, manuelle Auswahl
src/ui/                       Bildschirme, Kampfansicht, Platzhalter-Grafiken
src/print/                    Kartendrucker (Tools/generate_barcodes.html)
public/cards/                 Kartenbilder <ID>.png (Checkliste in README.md)
Altes Projekt/                Originalunterlagen
```

## Abweichungen vom Original

Die Mechanik folgt dem Microcontroller-Code. Folgende Programmierfehler bzw. fehlende Regeln wurden bewusst geändert:

1. **Superwaffe zählt nur einmal als Gebäude.** Im Original wurde sie bei jeder Reaktivierung nach dem Nachladen erneut gezählt (+1 Siegpunkt pro Ladezyklus).
2. **Energie-Upgrades** (Kontrollstäbe, Überlastung) geben den Sofortbonus nur für aktivierte Reaktoren. Im Original brachte ein Reaktor im Bau +2 sofort und +5 bei Fertigstellung.
3. **Flugabwehr gegen Flugzeuge** zählt nur aktivierte Stellungen, nicht solche im Bau.
4. **Gebäudekauf bei Energie ≤ 0 gesperrt.** Im Original nur bei genau 0.
5. **Überlastung:** Ein Reaktor, der wegen Energiemangel wieder aufgebaut wird, bekommt seine volle Defensive statt pauschal 3 (ein USA-Fusionsreaktor hat maximal 2).
6. **Volles Inventar** (40 Karten) meldet „nicht mehr möglich!“ statt in fremden Speicher zu schreiben.
7. **Spionagesatellit:** Erinnerung zu Zugbeginn, dass eine verdeckte Gegnerkarte aufgedeckt werden darf.
8. **Tarnung:** Hinweis nach dem Kauf, dass Einheiten verdeckt ausgespielt werden dürfen.
9. Jedes neue Spiel startet mit frischen Kartenwerten. Im Original wurde z. B. die Mig-Panzerung bei einem Neustart ohne Stromreset nicht zurückgesetzt.

Bewusst **wie im Original** belassen:
- Sonderaktion tritt mit 4/6 Wahrscheinlichkeit ein (der Kommentar im Code sagt 1:3).
- Orden ab 5 Gebäuden bzw. 5 Siegen (die Anleitung sagt „mehr als 6“).
- Startkapital 1600 (die Anleitung sagt 5000).
- Terrorist und Sprengstoff-LKW haben Defensive 0 und werden dadurch nach jedem Angriff zerstört. Sie erhalten nie einen Stern.
- Bei Einheit vs Einheit schlagen beide in jeder Runde zu, auch wenn der Gegner gerade gefallen ist. Beide können fallen.
- Eine Flugabwehrstellung schlägt bei einem Bodenangriff auch dann zurück, wenn sie dabei zerstört wurde.

---

### Mehrfachkarten (physisches Deck)

Viele Kartentypen existieren mehrfach im physischen Deck (aus EAN-Liste & Kartenliste):

| Fraktion | Typ | Beispiel | Anzahl im Deck |
|---|---|---|---|
| USA | Fusionsreaktor | 3× (Haupt + 2 weitere) |
| USA | Patriot-Batterie | 3× |
| USA | Ranger | 3× |
| USA | Raketentrooper | 3× |
| USA | Panzerjeep/Crusader | je 3× |
| USA | Tomahawk/Paladin/Raptor/Stealth | je 2× |
| GBA | Geheimlager | 2× (= 2 Nachschublager) |
| GBA | Stinger-Stellung | 3× |
| GBA | Rebell/Terrorist/Kampfjeep/Scorpion | je 3× |
| China | Atomreaktor | 3× |
| China | Bunker | 3× |
| China | Rotgardist/Panzerjäger/Faust Maos/Drachenpanzer | je 3× |
| BIOTEC | Plasmareaktor | 3× |
| BIOTEC | Deflektor | 3× |
| BIOTEC | Einheit 5/Mutant/Tyrant/Agressor | je 2–3× |

> Jede physische Karte hat eine eigene EAN-Nummer (000–159), aber mehrere EAN-Nummern können auf denselben Kartentyp zeigen (via `kartenzeiger[]` im Code).

### BIOTEC Einheiten (Detail aus Kartenliste)

Die Kartenliste enthält bei BIOTEC teils andere Namen und Werte als der Code. Die Kartenliste zeigt, dass BIOTEC *deutlich mehr* Einheiten-Varianten hat als die anderen Fraktionen:

| Kartenliste-Name | Code-Name | Typ | Preis | Def | Off | Schaden | Voraussetzung |
|---|---|---|---|---|---|---|---|
| Einheit 5 (×2) | Einheit 5 | Fuß | 200 | 1 | 1 | 1 | Hive |
| Mutant (×2) | Mutant | Fuß | 230 | 1 | 2 | 1 | Hive |
| Tyrant (×2) | Tyrant | Fuß | 300 | 1 | 3 | 2 | Hive |
| Agressor (×2) | – | Fahr. | 400 | 3 | 3 | 3 | Hive |
| Panzer 1 (×3) | Agressor Panzer | Fahr. | 800–900 | 3 | 3 | 1 | Manufaktur |
| Panzer 2 (×3) | Artillerie Panzer | Fahr. | 800–1000 | 2 | 3 | 2 | Manufaktur |
| Panzer 3 (×3) | Regenerat. Panzer | Fahr. | 1600–1800 | 3 | 4 | 3 | Manufaktur |
| Panzer 4 (×1) | – | Fahr. | 2000 | 5 | 5 | 5 | Manufaktur |
| Helicopter (×2) | Helicopter | Flug | 1200 | 3 | 3 | 2 | Helipad |

> **Hinweis:** Die Werte im Code (defaultkarten[]) und der Kartenliste weichen teilweise ab. Die Web-App verwendet die Code-Werte, da sie die tatsächlich getestete Spielbalance darstellen.
> Auch die Zuordnung unterscheidet sich: Die Karte „Panzer 4“ (Nummer 151) zeigt im Code auf den Helicopter, „Agressor“ (140/141) auf „Extend“.

---

## Offene Punkte / TODO

- [ ] **BIOTEC Upgrades 1–6:** Im Original nicht implementiert, die Effekte müssen noch designed werden. Bis dahin sind sie in der App kaufbar (Siegpunkt), aber ohne Wirkung.
- [ ] **BIOTEC Upgrade 3:** In Kartenliste definiert als "Jeder Plasmareaktor kann 2 Gebäude zusätzlich versorgen" (= Energie-Upgrade, analog zu USA Kontrollstäbe / China Überlastung)
- [x] **USA Spionagesatellit / GBA Tarnung:** Als Hinweis in der App umgesetzt (Aufdecken bzw. verdeckt Ausspielen passiert am Tisch)
- [x] **Startkapital:** ~~Anleitung sagt 5000, Code hat 1600~~ → **1600 ist korrekt** (Anleitung veraltet)
- [x] **EAN-8 Zuordnung:** alle 160 physischen Karten haben echte EAN-8-Codes (Kartendrucker)
- [ ] **Kartenbilder:** Kommen später neu, bis dahin Platzhalter-Grafiken (farbcodiert nach Fraktion + Kartentyp-Icon). Dateien unter `public/cards/`
- [ ] **Techtree-Grafiken:** Freischaltungs-Bäume pro Fraktion als UI-Ansicht
- [ ] **BIOTEC Einheiten:** Werte-Diskrepanzen zwischen Code und Kartenliste abgleichen
- [ ] **Hosting:** zurzeit nur lokal (`npm run dev`). Später z. B. GitHub Pages (braucht bei privatem Repo GitHub Pro) oder Cloudflare Pages/Netlify

---

## Altes Projekt

Der Ordner `Altes Projekt/` enthält die originalen Unterlagen:

| Datei | Inhalt |
|---|---|
| `CnC_Microcontroller_code.txt` | Kompletter AVR-C-Quellcode (ATmega644) – **die Spiellogik-Referenz** |
| `CnC_Anleitung V1.01.doc` | Spielanleitung (verschlüsselt) |
| `CnC_Anleitung.ppt` | Spielanleitung als Präsentation (Grafiken) |
| `CnC_Kartenliste_4p.xls` | Kartenliste 4 Spieler (verschlüsselt) |
| `CnC_aktuelle Werteliste.xls` | Aktuelle Kartenwerte (verschlüsselt) |
| `CnC_EAN-Code Generator.xls` | Barcode-Generator (verschlüsselt) |
| `CnC_Techtrees_4p.ppt` | Techtrees pro Fraktion – enthält ~70 Einheiten/Gebäude-Thumbnails (~90×69 px) |
| `CnC_Schaltplan.ppt` | Hardware-Schaltplan (ATmega644 Pinout) |
| `CnC_Spielfeld.ppt` | Spielfeld-Layout |
| `CnC_Struktur.ppt` | Programmstruktur |
| `CnC_Anweisungssheet_4p.ppt` | Kurzanleitung – enthält Anweisungsblatt-Grafik (1037×718) + Einheiten-Thumbnails |

> **Hinweis:** Die .doc/.xls-Dateien sind mit Office-Passwort verschlüsselt (`hindu12`).
> Die .ppt-Dateien enthalten eingebettete C&C-Screenshots als Thumbnails (zu klein als Kartenbilder, aber nützlich als Referenz).
