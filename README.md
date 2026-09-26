# Domination – Das Kartenspiel (Web-App)

Science-Fiction-Kartenspiel für 2–4 Spieler. Es entstand 2005 als Microcontroller-gestütztes Kartenspiel (ATmega644) im Command & Conquer-Universum: physische Spielkarten mit Barcodes, gelesen über eine Reflexlichtschranke in einem selbstgebauten Kasten.
**Domination** verlegt das Spiel in ein eigenes Science-Fiction-Universum: Aus Gebäuden werden Planeten, aus Fußtruppen Aufklärer, aus Fahrzeugen Kampfschiffe und aus Flugzeugen Hyperraumschiffe. Die Regeln bleiben unverändert.

**Jetzt:** Eine Web-App für Handy und Tablet ersetzt den Kasten. Statt des Terminals wird das Handy herumgereicht.
Die Kamera ersetzt den Barcodeleser. Statt des alten proprietären Formats tragen die Karten echte EAN-8-Barcodes.
Die Spielmechanik ist 1:1 aus dem Microcontroller-Code übernommen. Abweichungen stehen unter [Abweichungen vom Original](#abweichungen-vom-original).

> Dieses Repo ist eine Kopie von `CnC-web` (inklusive Historie). `CnC-web` bleibt als Command-&-Conquer-Fassung unverändert bestehen.

## Spielen

**Adresse: https://domination-cardgame.pages.dev** (sobald das Cloudflare-Pages-Projekt angelegt ist, siehe unten)

Die App läuft im Browser und wird über **Cloudflare Pages** gehostet. Jeder Push auf `main` wird automatisch gebaut und veröffentlicht.

- **Am Handy:** die Online-Adresse öffnen und über das Browsermenü **„Zum Startbildschirm hinzufügen“** (Android: „App installieren“). Danach startet sie wie eine normale App im Vollbild.
- **Offline:** Nach dem ersten Öffnen liegen App, Barcode-Leser, Schriften, Design, Kartenbilder und Sounds auf dem Handy. Gespielt werden kann dann auch ohne Internet.
- **Updates:** Gibt es eine neue Version, erscheint unten der Hinweis „Neue Version verfügbar“. Erst beim Tippen auf „Aktualisieren“ wird neu geladen, der Spielstand bleibt erhalten.
- Die Kamera funktioniert, weil die Seite über HTTPS kommt.
- **Ton:** Effekte und Hintergrundmusik haben getrennte Regler (**Lautstärke** auf dem Startbildschirm und im Spielmenü ☰). Eigene Musik: `public/sounds/music.mp3`, Details in [`public/sounds/README.md`](public/sounds/README.md).

### Einrichtung von Cloudflare Pages

1. Auf GitHub der App **Cloudflare Workers and Pages** Zugriff auf das Repo geben: https://github.com/settings/installations → Configure → Repository access → `Domination-Cardgame` hinzufügen.
2. Cloudflare: **Workers & Pages** → **Create application** → ganz unten **„Looking to deploy Pages? Get started“**. Der Standard-Assistent legt sonst einen Worker an.
3. **Import an existing Git repository** → `Domination-Cardgame` → Projektname `domination-cardgame`, Framework „None“, Build-Befehl `npm run build`, Ausgabeordner `dist`. Die Node-Version kommt aus `.node-version`.
4. Richtig eingerichtet ist es, wenn im Build-Log **kein** `npx wrangler deploy` auftaucht.

## Entwicklung

```bash
npm install
npm run dev
```

- Der Dev-Server läuft mit HTTPS (selbstsigniertes Zertifikat), weil Handy-Browser die Kamera nur über HTTPS freigeben.
- Am Handy im selben WLAN die angezeigte **Network**-Adresse öffnen (z. B. `https://192.168.178.63:5173`) und die Zertifikatswarnung einmalig bestätigen. Beim ersten Zugriff fragt ggf. die Windows-Firewall nach, ob Node.js im privaten Netzwerk erreichbar sein darf.
- `npm run dev -- --mode http` startet ohne HTTPS (nur für die Vorschau am PC, dort ohne Kamera).
- Im Dev-Server ist der Service Worker aus. Offline-Verhalten und Update-Hinweis lassen sich mit `npm run build` und `npm run preview -- --mode http` testen.
- `npm test` führt die Engine-Tests aus (Regeln, alle 160 Barcodes mit ZXing dekodiert, Zufallspartien).
- `npm run build` erzeugt die statische Seite in `dist/`.

**Design:** „Holografisches Glas“, leicht in der Farbe der Fraktion am Zug getönt. Schriften wie im Projekt ModZart_Web: Silkscreen, Space Grotesk, JetBrains Mono. Hintergrund, Glanz-Overlay und Logo liegen als austauschbare Grafiken in [`public/ui/`](public/ui/README.md). Die App-Icons werden mit `npx pwa-assets-generator` aus `public/ui/logo.svg` erzeugt.

**Kartengrafiken von Helge Vogt:** Entwürfe (Photoshop-Vorlagen je Fraktion, Kartenrückseiten, Beispielkarten) liegen lokal in `domination_gfx/`. Der Ordner ist nicht im Repo (große PSD-Dateien, Beispielbilder fremder Künstler). Die finalen Kartenbilder werden später in seinem Stil erstellt.

**Kurzanleitung:** in der App auf dem Startbildschirm, aufklappbar nach Themen (`src/ui/Guide.tsx`).

**Manuelle Kartenauswahl** (nur zum Testen): Sie zeigt standardmäßig nur Karten, die im aktuellen Schritt gültig sind. Mit „Alle Karten zeigen“ lassen sich die Fehlermeldungen testen.

**Kartendrucker:** `Tools/generate_barcodes.html` (im Dev-Server unter `/Tools/generate_barcodes.html` oder über den Startbildschirm).
Er druckt alle 160 Karten im Pokerformat 63×88 mm (9 pro A4-Seite) oder nur die Barcodes als Etiketten (38×21 mm, 65 pro Bogen, z. B. Avery L7651) zum Aufkleben auf die alten Karten.
Beim Drucken „Tatsächliche Größe / 100 %“ wählen.

**Kartenbilder:** pro Kartentyp eine Datei `public/cards/<ID>.png` ablegen. Fehlende Bilder werden in App und Kartendrucker als Platzhalter gezeichnet. Die Checkliste aller 92 Dateinamen steht in [`public/cards/README.md`](public/cards/README.md).

---

## Spielübersicht

© 2005 Jochen Feldkötter & Raphael Ludwig — Quellen: Microcontroller-Code, Anleitung V1.01, Kartenliste 4P, Domination-Kartenliste

- **2–4 Spieler**, rundenbasiert, Hot-Seat (ein Gerät)
- **4 Fraktionen:** Starwing, Lightforce, Scaretech, BIOTEC
- **92 einzigartige Kartentypen** (pro Fraktion: 9 Planeten, 8 Einheiten, 6 Upgrades)
- **160 physische Karten** (viele Karten existieren 2–5× pro Fraktion, z. B. 3× Fährtensucher, 3× Protonenmond)
- **Gewinnbedingung:** 30/40 Siegpunkte erreichen ODER gegnerisches Zentralgestirn zerstören
- **Spielphasen pro Zug:** Credits kassieren → Überlastung prüfen (ggf. aussetzen) → Sonderaktion → Bauphase (fertige Karten aktivieren) → Aktionen (Kaufen/Angriff/Reparatur/Info/Inventar) → Zug beenden

### Begriffe

| Domination | früher (C&C) |
|---|---|
| Starwing / Lightforce / Scaretech | USA / China / GBA |
| Planet | Gebäude |
| Zentralgestirn | Kommandozentrale |
| Aufklärer | Fußeinheit |
| Kampfschiff | Fahrzeug |
| Hyperraumschiff | Flugzeug |
| Planetenabwehr (Planetenschild, Schutzring, Raumbarriere, Deflektor) | Flugabwehr |
| Energiequelle (Protonenmond, Elektronenmond, Plasmareaktor) | Kraftwerk |

BIOTEC behält vorerst seine Kartennamen (Hive, Helicopter, Panzer …), die Kategorien gelten aber auch dort.

### Spielfeld (aus Anleitung)

Jeder Spieler hat ein Spielfeld mit **3 Reihen × 7 Feldern**:

```
┌───┬───┬───┬───┬───┬───┬───┐
│ E │ E │ E │ E │ E │ E │ E │  1. Reihe: Einheiten (offen ausgespielt)
├───┼───┼───┼───┼───┼───┼───┤
│ P │ P │ P │ P │ P │ P │ P │  2. Reihe: Planeten (verdeckt!)
├───┼───┼───┼───┼───┼───┼───┤
│ P │ P │ P │ P │ P │ P │ P │  3. Reihe: Planeten (verdeckt!)
└───┴───┴───┴───┴───┴───┴───┘
              Spieler
```

**Platzierungsregeln:**
- Einheiten werden **offen** in Reihe 1 gelegt
- Planeten werden **verdeckt** in Reihe 2/3 gelegt (erst bei Angriff aufgedeckt)
- Stapeln: max. 3 Aufklärer, max. 2 Kampfschiffe, max. 1 Kampfschiff + 1 Aufklärer, Hyperraumschiffe alleine
- Planeten belegen 1–5 Felder je nach Typ (Spalte „Felder“ in der Kartenliste)

**Angriffsreihenfolge:**
- Planeten in Reihe 3 erst angreifbar, wenn Reihe 1 + 2 leer
- Planeten in Reihe 2 erst angreifbar, wenn Reihe 1 leer
- **Hyperraumschiffe** können eine Reihe überspringen
- **Scaretech Wurmloch:** Aufklärer können Reihe 1 überspringen
- **Scaretech Schwarzer Schleier (Upgrade):** Einheiten verdeckt ausspielen (nach Angriff aufgedeckt)
- **Photonenhagel & Erazor:** zerstören sich selbst nach dem Angriff, keine Siegpunkte

### Kernmechaniken

| Mechanik | Details |
|---|---|
| Startkapital | 1600 Credits |
| Einkommen/Runde | 400 Grund + 400 pro Handelsplanet (Handelssystem, Handelssektor, Antimaterieminen, Abt. Kapital) |
| Max. Käufe/Runde | 3 |
| Max. Angriffe/Runde | 3 (kostenlos mit Sternenparlament/Tribunal des Lichts/Dunklem Rat/Abt. Forschung, sonst 200 Credits) |
| Max. Reparaturen/Runde | 1 (kostet 200 Credits, +1 Def, mit Upgrade +2 Def) |
| Energiesystem | Energiequellen liefern je 3 Energie, jeder andere Planet verbraucht 1. Scaretech braucht keine Energie. |
| Kampfwürfel | W6 – Offensive ≥ Wurf = Treffer, dann Schaden von Defensive abziehen |
| Siegpunkte | Planeten + Upgrades + Sterne + Orden (Bester Stützpunkt: +5, Beste Streitmacht: +5) |
| Sonderaktionen | Ab Runde 5, bei wenig Einheiten/Planeten (≤7), Zufallsbonus (Credits, Sofort-Aktivierung, Reparatur) |
| Auge des Raumes | Starwing-Upgrade: Pro Runde eine verdeckte Gegnerkarte aufdecken |

### Fraktionen

**Starwing** (früher USA):
- ➖ Einheiten & Planeten teuer
- ➕ Wirkungsvolle Hyperraumschiffe (überspringen eine Reihe)
- ➕ Nostradamus: getarnt, ignoriert die Planetenabwehr
- ➕ Starke Planetenabwehr (Planetenschild)
- ➖ Energiequellen nötig (Energiesystem)
- ➕ Auge des Raumes: 1× pro Runde verdeckte Gegnerkarte aufdecken

**Lightforce** (früher China):
- ➕ Ausgewogenes Preis-Leistungs-Verhältnis
- ➕ Lichtpfeil (Hyperraumschiff überspringt eine Reihe)
- ➕ Mächtigste Kampfschiffe (Lichtkoloss, Inferno)
- ➖ Energiequellen nötig (Energiesystem)
- ➕ Nachtsicht-Upgrade wertet die Aufklärer auf

**Scaretech** (früher GBA):
- ➖ Einheiten günstig, aber schwach
- ➕ Wurmloch: Aufklärer überspringen Reihe 1
- ➕ Erazor: trifft fast immer, viel Schaden
- ➖ Photonenhagel/Erazor zerstören sich selbst, keine Siegpunkte
- ➕ Keine Energie nötig!
- ➕ Schwarzer Schleier: Einheiten verdeckt ausspielen
- ➕ Rekonfiguration: Reparatur +2 Def

**BIOTEC:**
- Späterer Zusatz, aufgebaut wie Lightforce, Kartennamen noch aus der alten Fassung
- ➕ Energiesystem wie Starwing/Lightforce (Plasmareaktoren)
- ➕ Vielfältige Panzer-Einheiten
- ➕ Neu entworfene Upgrades (Mutagen, Flüstern, Perpetuum, Chitinpanzer, Neuronetz, Zellregeneration)

### Kampftypen

1. **Einheit vs Einheit** – Rundenkampf bis einer fällt (beide würfeln abwechselnd)
2. **Einheit vs Planet** – Einmal-Angriff; Gegenangriff nur durch Planetenabwehr
3. **Hyperraumschiff vs Planet** – Erst Planetenabwehr (Off = Anzahl Abwehrplaneten + 1), dann Angriff des Schiffs
4. **Getarntes Schiff vs Planet** (Nostradamus, BIOTEC-Helicopter mit Flüstern) – ignoriert die Planetenabwehr komplett
5. **Superwaffe** (Ionenpulsar, Supernova, Schwarzes Loch, Abt. Forschung) – trifft immer, danach 3 Runden Nachladen

---

## Kartenwerte

Die Werte stehen in [`src/engine/data.ts`](src/engine/data.ts), direkt aus `defaultkarten[92]` im Microcontroller-Code. Die Namen stammen aus [`Unterlagen/Domination_Kartenliste.xls`](Unterlagen/Domination_Kartenliste.xls).

<details>
<summary>Komplette Kartentabelle (alle 92 Karten)</summary>

**Starwing (ID 0–22)**

| ID | Name | Typ | Anzahl | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Zentralgestirn | Planet | 1 | 2000 | 1 | 8 | 0 | 0 | Start |
| 1 | Aufklärungskomplex | Planet | 1 | 600 | 1 | 2 | 0 | 0 | Zentralgestirn |
| 2 | Protonenmond | Planet | 3 | 800 | 1 | 2 | 0 | 0 | Zentralgestirn |
| 3 | Handelssystem | Planet | 2 | 2000 | 2 | 4 | 0 | 0 | Protonenmond |
| 4 | Planetenschild | Planet | 3 | 1000 | 1 | 3 | 3 | 2 | Protonenmond |
| 5 | Orbitaldock | Planet | 1 | 2000 | 2 | 3 | 0 | 0 | Handelssystem |
| 6 | Hyperraumnebel | Planet | 1 | 1000 | 3 | 3 | 0 | 0 | Handelssystem |
| 7 | Sternenparlament | Planet | 1 | 2500 | 3 | 3 | 0 | 0 | Orbitaldock |
| 8 | Ionenpulsar | Planet | 1 | 3500 | 3 | 4 | 6 | 4 | Sternenparlament |
| 9 | Fährtensucher | Aufklärer | 3 | 225 | 1 | 1 | 1 | 1 | Aufklärungskomplex |
| 10 | Auge des Kolumbus | Aufklärer | 3 | 300 | 1 | 1 | 2 | 1 | Aufklärungskomplex |
| 11 | Phoenix | Kampfschiff | 3 | 700 | 2 | 2 | 2 | 1 | Orbitaldock |
| 12 | Pegasus | Kampfschiff | 3 | 900 | 2 | 3 | 3 | 1 | Orbitaldock |
| 13 | Weißer Golem | Kampfschiff | 2 | 1100 | 3 | 2 | 4 | 2 | Orbitaldock |
| 14 | Poseidons Fluch | Kampfschiff | 2 | 1200 | 2 | 4 | 4 | 3 | Orbitaldock |
| 15 | Zeus | Hyperraumschiff | 2 | 1200 | 3 | 3 | 3 | 1 | Hyperraumnebel |
| 16 | Nostradamus | Hyperraumschiff | 2 | 1400 | 3 | 3 | 3 | 2 | Hyperraumnebel |
| 17 | Schildgenerator | Upgrade | 1 | 1000 | 0 | – | – | – | Sternenparlament |
| 18 | Teilchenbeschleuniger | Upgrade | 1 | 800 | 0 | – | – | – | Protonenmond |
| 19 | Präzisionssprung | Upgrade | 1 | 1500 | 0 | – | – | – | Hyperraumnebel |
| 20 | Interstellare Macht | Upgrade | 1 | 1500 | 0 | – | – | – | Hyperraumnebel |
| 21 | Auge des Raumes | Upgrade | 1 | 500 | 0 | – | – | – | Sternenparlament |
| 22 | Feuerschwinge | Upgrade | 1 | 1200 | 0 | – | – | – | Orbitaldock |

**Lightforce (ID 23–45)**

| ID | Name | Typ | Anzahl | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|---|
| 23 | Zentralgestirn | Planet | 1 | 2000 | 1 | 8 | 0 | 0 | Start |
| 24 | Drohnenkolonie | Planet | 1 | 500 | 1 | 2 | 0 | 0 | Zentralgestirn |
| 25 | Elektronenmond | Planet | 3 | 1000 | 1 | 3 | 0 | 0 | Zentralgestirn |
| 26 | Schutzring | Planet | 3 | 700 | 1 | 3 | 2 | 2 | Drohnenkolonie |
| 27 | Handelssektor | Planet | 2 | 1500 | 2 | 4 | 0 | 0 | Elektronenmond |
| 28 | Weltraumwerft | Planet | 1 | 2000 | 2 | 4 | 0 | 0 | Handelssektor |
| 29 | Warpgate | Planet | 1 | 1000 | 3 | 3 | 0 | 0 | Handelssektor |
| 30 | Tribunal des Lichts | Planet | 1 | 2000 | 3 | 3 | 0 | 0 | Weltraumwerft |
| 31 | Supernova | Planet | 1 | 3500 | 3 | 4 | 6 | 4 | Tribunal des Lichts |
| 32 | Lichtfunke | Aufklärer | 3 | 200 | 1 | 1 | 1 | 1 | Drohnenkolonie |
| 33 | Strahlenjäger | Aufklärer | 3 | 300 | 1 | 1 | 2 | 1 | Drohnenkolonie |
| 34 | Sonnenfaust | Kampfschiff | 3 | 900 | 2 | 3 | 3 | 1 | Weltraumwerft |
| 35 | Glutdrache | Kampfschiff | 3 | 800 | 2 | 2 | 3 | 1 | Weltraumwerft |
| 36 | Inferno | Kampfschiff | 2 | 1000 | 3 | 2 | 4 | 2 | Weltraumwerft |
| 37 | Lichtkoloss | Kampfschiff | 2 | 1800 | 3 | 5 | 5 | 3 | Weltraumwerft |
| 38 | Novakanone | Kampfschiff | 2 | 1600 | 3 | 2 | 4 | 3 | Weltraumwerft |
| 39 | Lichtpfeil | Hyperraumschiff | 2 | 1200 | 3 | 3 | 3 | 2 | Warpgate |
| 40 | Sonnenkern | Upgrade | 1 | 1500 | 0 | – | – | – | Tribunal des Lichts |
| 41 | Effektivierung | Upgrade | 1 | 2000 | 0 | – | – | – | Drohnenkolonie |
| 42 | Quantensammler | Upgrade | 1 | 1000 | 0 | – | – | – | Elektronenmond |
| 43 | Donnerschlag | Upgrade | 1 | 2000 | 0 | – | – | – | Tribunal des Lichts |
| 44 | Nachtsicht | Upgrade | 1 | 1000 | 0 | – | – | – | Tribunal des Lichts |
| 45 | Lichtgeschwindigkeit | Upgrade | 1 | 500 | 0 | – | – | – | Warpgate |

**Scaretech (ID 46–68)**

| ID | Name | Typ | Anzahl | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|---|
| 46 | Zentralgestirn | Planet | 1 | 2000 | 1 | 8 | 0 | 0 | Start |
| 47 | Telecluster | Planet | 2 | 500 | 1 | 2 | 0 | 0 | Zentralgestirn |
| 48 | Antimaterieminen | Planet | 2 | 1500 | 3 | 3 | 0 | 0 | Zentralgestirn |
| 49 | Raumbarriere | Planet | 3 | 900 | 1 | 2 | 2 | 1 | Telecluster |
| 50 | Flottenbasis | Planet | 2 | 2500 | 2 | 3 | 0 | 0 | Antimaterieminen |
| 51 | Dunkler Rat | Planet | 1 | 2500 | 3 | 4 | 0 | 0 | Flottenbasis |
| 52 | Spionagezentrum | Planet | 1 | 2500 | 2 | 3 | 0 | 0 | Dunkler Rat |
| 53 | Schwarzes Loch | Planet | 1 | 3500 | 3 | 4 | 6 | 4 | Dunkler Rat |
| 54 | Wurmloch | Planet | 1 | 1500 | 3 | 2 | 0 | 0 | Telecluster |
| 55 | Shadow Arm | Aufklärer | 3 | 150 | 1 | 1 | 1 | 1 | Telecluster |
| 56 | Photonenhagel | Aufklärer | 3 | 250 | 2 | 0 | 3 | 2 | Telecluster |
| 57 | Schattenschleuder | Kampfschiff | 3 | 500 | 1 | 2 | 2 | 1 | Flottenbasis |
| 58 | Sternenaxt | Kampfschiff | 3 | 600 | 1 | 3 | 2 | 1 | Flottenbasis |
| 59 | Damokles | Kampfschiff | 2 | 900 | 2 | 4 | 3 | 2 | Flottenbasis |
| 60 | Rage | Kampfschiff | 2 | 800 | 2 | 1 | 3 | 2 | Flottenbasis |
| 61 | Erazor | Kampfschiff | 2 | 1000 | 3 | 0 | 5 | 5 | Flottenbasis |
| 62 | Doomhammer | Kampfschiff | 2 | 1200 | 3 | 2 | 4 | 3 | Flottenbasis |
| 63 | Künstliche Intelligenz | Upgrade | 1 | 1000 | 0 | – | – | – | Dunkler Rat |
| 64 | Assimilation | Upgrade | 1 | 1000 | 0 | – | – | – | Flottenbasis |
| 65 | Rekonfiguration | Upgrade | 1 | 2000 | 0 | – | – | – | Spionagezentrum |
| 66 | Rauminvasion | Upgrade | 1 | 800 | 0 | – | – | – | Flottenbasis |
| 67 | Gravitationsboost | Upgrade | 1 | 1000 | 0 | – | – | – | Spionagezentrum |
| 68 | Schwarzer Schleier | Upgrade | 1 | 2000 | 0 | – | – | – | Dunkler Rat |

**BIOTEC (ID 69–91)**

| ID | Name | Typ | Anzahl | Preis | Runden | Def | Off | Schaden | Freischaltung |
|---|---|---|---|---|---|---|---|---|---|
| 69 | Konzernführung | Planet | 1 | 2000 | 1 | 8 | 0 | 0 | Start |
| 70 | Hive | Planet | 1 | 500 | 1 | 2 | 0 | 0 | Konzernführung |
| 71 | Plasmareaktor | Planet | 3 | 1500 | 3 | 3 | 0 | 0 | Konzernführung |
| 72 | Deflektor | Planet | 3 | 900 | 1 | 2 | 2 | 1 | Hive |
| 73 | Abt. Kapital | Planet | 2 | 2500 | 2 | 3 | 0 | 0 | Hive |
| 74 | Manufaktur | Planet | 1 | 2500 | 3 | 4 | 0 | 0 | Abt. Kapital |
| 75 | Helipad | Planet | 1 | 2500 | 2 | 3 | 0 | 0 | Abt. Kapital |
| 76 | Abt. Forschung | Planet | 1 | 3500 | 3 | 4 | 6 | 4 | Manufaktur |
| 77 | Wumms | Planet | 1 | 1500 | 3 | 2 | 0 | 0 | Abt. Forschung |
| 78 | Einheit 5 | Aufklärer | 2 | 150 | 1 | 1 | 1 | 1 | Hive |
| 79 | Mutant | Aufklärer | 2 | 250 | 1 | 1 | 1 | 2 | Hive |
| 80 | Tyrant | Aufklärer | 2 | 500 | 2 | 2 | 3 | 2 | Hive |
| 81 | Extend | Aufklärer | 2 | 600 | 2 | 3 | 3 | 3 | Hive |
| 82 | Agressor Panzer | Kampfschiff | 3 | 900 | 2 | 4 | 3 | 2 | Manufaktur |
| 83 | Artillerie Panzer | Kampfschiff | 3 | 800 | 2 | 1 | 3 | 2 | Manufaktur |
| 84 | Regenerat. Panzer | Kampfschiff | 3 | 1000 | 3 | 3 | 5 | 5 | Manufaktur |
| 85 | Helicopter | Hyperraumschiff | 3 | 1200 | 3 | 2 | 4 | 3 | Helipad |
| 86 | Mutagen | Upgrade | 1 | 1000 | 0 | – | – | – | Hive |
| 87 | Flüstern | Upgrade | 1 | 1200 | 0 | – | – | – | Helipad |
| 88 | Perpetuum | Upgrade | 1 | 1000 | 0 | – | – | – | Plasmareaktor |
| 89 | Chitinpanzer | Upgrade | 1 | 1500 | 0 | – | – | – | Abt. Forschung |
| 90 | Neuronetz | Upgrade | 1 | 1000 | 0 | – | – | – | Abt. Forschung |
| 91 | Zellregeneration | Upgrade | 1 | 2000 | 0 | – | – | – | Abt. Forschung |

> **Namen ohne Eintrag in der Kartenliste** (Vorschläge, noch zu bestätigen): Feuerschwinge (22), Lichtfunke (32), Strahlenjäger (33), Sonnenfaust (34), Glutdrache (35), Inferno (36), Lichtkoloss (37), Novakanone (38), Lichtpfeil (39), Sonnenkern (40).
>
> BIOTEC-Upgrades 86–91 hießen im Original „Update 1–6“ (alle Abt. Forschung, 1000/1000/2000/800/1000/2000 Credits, ohne Wirkung). Namen, Preise und Voraussetzungen sind eine Neuentwicklung. „Perpetuum“ und „Flüstern“ und ihre Position im Baum stammen aus `CnC_Techtrees_4p.ppt`.

</details>

### Upgrade-Effekte (aus dem Code)

| ID | Name | Effekt |
|---|---|---|
| 17 | Starwing: Schildgenerator | Pegasus Def +1 (→4), Poseidons Fluch Def +1 (→5) |
| 18 | Starwing: Teilchenbeschleuniger | Energie-Upgrade: jeder Protonenmond +2 Energie extra |
| 19 | Starwing: Präzisionssprung | Zeus Off +1 (→4), Nostradamus Off +1 (→4) |
| 20 | Starwing: Interstellare Macht | Zeus Schaden +1 (→2), Nostradamus Schaden +1 (→3) |
| 21 | Starwing: Auge des Raumes | Im Original ohne Effekt. Die App erinnert jeden Zug: eine verdeckte Gegnerkarte aufdecken |
| 22 | Starwing: Feuerschwinge | Phoenix Off +1 (→3) |
| 40 | Lightforce: Sonnenkern | Sonnenfaust Schaden +1 (→2) |
| 41 | Lightforce: Effektivierung | Glutdrache Schaden +1 (→2) |
| 42 | Lightforce: Quantensammler | Energie-Upgrade: jeder Elektronenmond +2 Energie extra |
| 43 | Lightforce: Donnerschlag | Inferno Schaden +1 (→3), Novakanone Schaden +1 (→4) |
| 44 | Lightforce: Nachtsicht | Lichtfunke Off +1 (→2), Strahlenjäger Off +1 (→3) |
| 45 | Lightforce: Lichtgeschwindigkeit | Lichtpfeil Def +1 (→4) |
| 63 | Scaretech: Künstliche Intelligenz | Sternenaxt Schaden +1 (→2), Damokles Schaden +1 (→3) |
| 64 | Scaretech: Assimilation | Shadow Arm Schaden +1 (→2), Schattenschleuder Schaden +1 (→2) |
| 65 | Scaretech: Rekonfiguration | Reparatur-Upgrade: Reparatur heilt +2 statt +1 |
| 66 | Scaretech: Rauminvasion | Rage Schaden +1 (→3) |
| 67 | Scaretech: Gravitationsboost | Sternenaxt Off +1 (→3) |
| 68 | Scaretech: Schwarzer Schleier | Im Original ohne Effekt. Die App weist nach dem Kauf darauf hin, dass Einheiten verdeckt ausgespielt werden dürfen |
| 86 | BIOTEC: Mutagen | Einheit 5 Off +1 (→2), Mutant Off +1 (→2) |
| 87 | BIOTEC: Flüstern | Helicopter wird von der Planetenabwehr nicht erfasst (Kampf wie Nostradamus) |
| 88 | BIOTEC: Perpetuum | Energie-Upgrade: jeder Plasmareaktor +2 Energie (wie Teilchenbeschleuniger/Quantensammler) |
| 89 | BIOTEC: Chitinpanzer | Agressor Panzer Def +1 (→5), Regenerat. Panzer Def +1 (→4), auch bereits gebaute |
| 90 | BIOTEC: Neuronetz | Spielfeld: einmal pro Runde zwei eigene verdeckte Planeten tauschen oder eine eigene Einheit in Reihe 1 umsetzen (Stapelregeln gelten, aufgedeckte Karten bleiben offen). Die App erinnert zu Zugbeginn |
| 91 | BIOTEC: Zellregeneration | Zu Beginn jedes eigenen Zuges +1 Defensive für alle beschädigten Einheiten (bis zum Maximum) |

---

## Die Web-App

- **Hot-Seat wie das Original:** ein Gerät, das nach jedem Zug weitergereicht wird. Vor jedem Zug erscheint ein Übergabe-Bildschirm, der die Daten des Vorgängers verbirgt.
- **Die 7 Taster** des Kastens werden zu Buttons: Kaufen, Angriff, Reparatur, Info, Inventar, Zug beenden. OK/Abbruch sind die Bestätigungs-Buttons in jedem Ablauf.
- **Scannen:** Kamera als Vollbild-Sucher. Chrome/Android nutzt die eingebaute `BarcodeDetector`-API, iPhone/Safari den mitgelieferten ZXing-WASM-Leser (kein CDN, funktioniert offline). Ein Code gilt erst, wenn er zweimal hintereinander gleich gelesen wurde. Treffer werden mit Vibration und Piepton bestätigt. Falls die Kamera fehlt: „Karte manuell wählen“.
- **Kampf:** Würfe werden Schritt für Schritt mit W6 angezeigt (Treffer, wenn Offensive ≥ Wurf).
- **Spielstand** wird nach jeder Aktion im Browser gespeichert (übersteht Neuladen und Displaysperre). Während des Spiels bleibt das Display an.

### Barcodes

Jede **physische** Karte hat eine eigene Nummer 000–159 (wie im Original), mehrere Nummern zeigen über `kartenzeiger[]` auf denselben Kartentyp.
Der EAN-8-Code ist `0000` + dreistellige Nummer + Prüfziffer, z. B. Karte 7 → `00000079`. Die Nummern sind dieselben wie in der C&C-Fassung und in der Spalte „Kartennummer“ der Domination-Kartenliste.
Die alten Barcodes (Balkenbreiten für die Lichtschranke) sind mit Handykameras nicht lesbar, deshalb werden die Karten neu gedruckt oder mit Etiketten überklebt.

Der alte Generator in `Tools/` zeichnete die Barcodes mit zu kleiner Ruhezone (~3,7 statt 7 Module) und unscharfen Bruchteil-Pixeln.
Der neue Kartendrucker rendert sie als Vektorgrafik mit 0,4 mm pro Modul (32 mm breit inkl. Ruhezone).
Ein Test dekodiert alle 160 Codes mit ZXing.

## Projektstruktur

```
index.html, src/main.tsx      Web-App (Vite + TypeScript + Preact)
src/engine/                   Spiellogik ohne UI, 1:1 aus dem Microcontroller-Code
  data.ts                       Kartenwerte und -namen, kartenzeiger[], Konstanten
  ean.ts, cards.ts              EAN-8, Fraktion/Kartenart je physischer Karte
  state.ts, turn.ts             Spielzustand, Zugbeginn (Einkommen, Überlastung, Sonderaktion, Bauphase)
  buy.ts, combat.ts, actions.ts Kaufen + Upgrades, 5 Kampftypen, Reparatur/Info
  victory.ts                    Orden, Siegpunkte, Sieg
  *.test.ts                     Vitest: Regeln, Barcodes, Zufallspartien
src/scanner/                  Kamera + Barcode-Erkennung, manuelle Auswahl
src/ui/                       Bildschirme, Kampfansicht, Platzhalter-Grafiken
src/print/                    Kartendrucker (Tools/generate_barcodes.html)
public/cards/                 Kartenbilder <ID>.png (Checkliste in README.md)
Unterlagen/                   Domination-Kartenliste (neue Namen)
Altes Projekt/                Originalunterlagen der C&C-Fassung (Regelreferenz)
```

## Abweichungen vom Original

Die Mechanik folgt dem Microcontroller-Code. Folgende Programmierfehler bzw. fehlende Regeln wurden bewusst geändert:

1. **Superwaffe zählt nur einmal als Planet.** Im Original wurde sie bei jeder Reaktivierung nach dem Nachladen erneut gezählt (+1 Siegpunkt pro Ladezyklus).
2. **Energie-Upgrades** (Teilchenbeschleuniger, Quantensammler) geben den Sofortbonus nur für aktivierte Energiequellen. Im Original brachte eine Energiequelle im Bau +2 sofort und +5 bei Fertigstellung.
3. **Planetenabwehr gegen Hyperraumschiffe** zählt nur aktivierte Abwehrplaneten, nicht solche im Bau.
4. **Planetenkauf bei Energie ≤ 0 gesperrt.** Im Original nur bei genau 0.
5. **Überlastung:** Eine Energiequelle, die wegen Energiemangel wieder aufgebaut wird, bekommt ihre volle Defensive statt pauschal 3 (ein Protonenmond hat maximal 2).
6. **Volles Inventar** (40 Karten) meldet „nicht mehr möglich!“ statt in fremden Speicher zu schreiben.
7. **Auge des Raumes** (Spionagesatellit): Erinnerung zu Zugbeginn, dass eine verdeckte Gegnerkarte aufgedeckt werden darf.
8. **Schwarzer Schleier** (Tarnung): Hinweis nach dem Kauf, dass Einheiten verdeckt ausgespielt werden dürfen.
9. Jedes neue Spiel startet mit frischen Kartenwerten. Im Original wurde z. B. Lichtgeschwindigkeit (Mig-Panzerung) bei einem Neustart ohne Stromreset nicht zurückgesetzt.
10. **BIOTEC-Upgrades** (86–91) haben Namen, Preise, Voraussetzungen und Wirkungen bekommen. Im Original waren sie unfertig und wirkungslos.

Bewusst **wie im Original** belassen:
- Sonderaktion tritt mit 4/6 Wahrscheinlichkeit ein (der Kommentar im Code sagt 1:3).
- Orden ab 5 Planeten bzw. 5 Siegen (die Anleitung sagt „mehr als 6“).
- Startkapital 1600 (die Anleitung sagt 5000).
- Photonenhagel und Erazor haben Defensive 0 und werden dadurch nach jedem Angriff zerstört. Sie erhalten nie einen Stern.
- Bei Einheit vs Einheit schlagen beide in jeder Runde zu, auch wenn der Gegner gerade gefallen ist. Beide können fallen.
- Ein Abwehrplanet schlägt bei einem Angriff von Einheiten auch dann zurück, wenn er dabei zerstört wurde.
- Antimaterieminen brauchen 3 Runden Bauzeit (die Domination-Kartenliste nennt 2, der Code gewinnt).

---

### BIOTEC Einheiten (Detail aus der alten Kartenliste)

Die alte Kartenliste enthält bei BIOTEC teils andere Namen und Werte als der Code:

| Kartenliste-Name | Code-Name | Typ | Preis | Def | Off | Schaden | Voraussetzung |
|---|---|---|---|---|---|---|---|
| Einheit 5 (×2) | Einheit 5 | Aufklärer | 200 | 1 | 1 | 1 | Hive |
| Mutant (×2) | Mutant | Aufklärer | 230 | 1 | 2 | 1 | Hive |
| Tyrant (×2) | Tyrant | Aufklärer | 300 | 1 | 3 | 2 | Hive |
| Agressor (×2) | – | Kampfschiff | 400 | 3 | 3 | 3 | Hive |
| Panzer 1 (×3) | Agressor Panzer | Kampfschiff | 800–900 | 3 | 3 | 1 | Manufaktur |
| Panzer 2 (×3) | Artillerie Panzer | Kampfschiff | 800–1000 | 2 | 3 | 2 | Manufaktur |
| Panzer 3 (×3) | Regenerat. Panzer | Kampfschiff | 1600–1800 | 3 | 4 | 3 | Manufaktur |
| Panzer 4 (×1) | – | Kampfschiff | 2000 | 5 | 5 | 5 | Manufaktur |
| Helicopter (×2) | Helicopter | Hyperraumschiff | 1200 | 3 | 3 | 2 | Helipad |

> **Hinweis:** Die Werte im Code (defaultkarten[]) und der Kartenliste weichen teilweise ab. Die Web-App verwendet die Code-Werte, da sie die tatsächlich getestete Spielbalance darstellen.
> Auch die Zuordnung unterscheidet sich: Die Karte „Panzer 4“ (Nummer 151) zeigt im Code auf den Helicopter, „Agressor“ (140/141) auf „Extend“.

---

## Offene Punkte / TODO

- [ ] **Namen bestätigen:** Lightforce-Einheiten 32–39 und die Upgrades 22 und 40 haben Vorschlagsnamen (in der Kartenliste noch leer)
- [ ] **BIOTEC:** in das Domination-Universum übertragen (Namen, evtl. Fraktionsname)
- [ ] **Kartenbilder:** im Stil der Entwürfe von Helge Vogt (`domination_gfx/`), bis dahin Platzhalter-Grafiken. Dateien unter `public/cards/`
- [ ] **Cloudflare Pages:** Projekt `domination-cardgame` anlegen (siehe oben)
- [ ] **Techtree-Grafiken:** Freischaltungs-Bäume pro Fraktion als UI-Ansicht
- [ ] **BIOTEC Einheiten:** Werte-Diskrepanzen zwischen Code und Kartenliste abgleichen
- [x] **BIOTEC Upgrades 1–6:** neu entworfen, siehe Upgrade-Tabelle
- [x] **Auge des Raumes / Schwarzer Schleier:** als Hinweis in der App umgesetzt (Aufdecken bzw. verdeckt Ausspielen passiert am Tisch)
- [x] **EAN-8 Zuordnung:** alle 160 physischen Karten haben echte EAN-8-Codes (Kartendrucker)

---

## Altes Projekt

Der Ordner `Altes Projekt/` enthält die originalen Unterlagen der C&C-Fassung. Sie bleiben die Regelreferenz:

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

> **Hinweis:** Die .doc/.xls-Dateien sind mit Office-Passwort verschlüsselt (`hindu12`). `Unterlagen/Domination_Kartenliste.xls` ist nicht verschlüsselt.
> Die .ppt-Dateien enthalten eingebettete C&C-Screenshots als Thumbnails (nur als Referenz, nicht für das Spiel verwenden).
