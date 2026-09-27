# Design-Grafiken

Das Design folgt den Kartenentwürfen von **Helge Vogt** („Helge-Stil“): dunkle Metall- bzw. Tarn-Textur, Fasenrahmen, helle verwitterte Werte-Platten.
Fast alle Dateien hier werden von `npm run gfx` (`Tools/extract-helge.mjs`) aus Helges Photoshop-Vorlagen erzeugt. Die Vorlagen liegen lokal in `domination_gfx/Helge/` und nicht im Repo.
Nach dem Erzeugen werden die Dateien committet; die App braucht die Vorlagen nicht.

## `factions/<starwing|lightforce|scaretech|biotec|neutral>/`

| Datei | Verwendung | Herkunft |
|---|---|---|
| `card.webp` | Kartenhintergrund im Druck (652×899, mit weißem Barcode-Streifen) | Helges Vorderseite, Bildfenster geleert |
| `card-short.webp` | Kartenhintergrund in der App (ohne Barcode-Streifen) | dito |
| `tile.webp` | nahtlose Hintergrund-Kachel der App, Buttons und Panels | Patch-Synthese aus dem Kartenrahmen |
| `plate.webp` | Werte-Platte: Haupt-Buttons, Werte-Kacheln, Listen | Ausschnitt der Platte |
| `rim.webp` | Fasenrahmen (9-Slice) um Panels, Dialoge und Kartenbilder | Rahmen des Bildfensters |
| `back.webp` | Fraktions-Motiv auf Übergabe- und Setup-Bildschirm | Rückseiten-Motive (nicht bei `neutral`) |

Herkunft je Fraktion:
- **Starwing** und **Lightforce**: direkt aus `Vorderseite_Wings.psd` bzw. `Vorderseite_Flash.psd`. Rückseiten sind die Flügel (`PRINT_Flügel_05.psd`) und die Faust (`PRINT_Flash_03.psd`).
- **Scaretech**: Alle drei Vorlagen teilen dieselbe Rahmenstruktur. Deshalb wird die Starwing-Vorderseite mit einer aus Scaretechs Vorlage gelernten Farbtabelle umgefärbt. Die Rückseite ist der Totenkopf aus dem Demo-JPG.
- **Biotec** (generiert): dieselbe Struktur in Giftgrün mit Zellgewebe-Rauschen.
  - Die Rückseite ist eine gepanzerte Doppelhelix, gemalt mit Stable Diffusion und Helges Flügel-Motiv als Stilvorlage (`npm run art -- --special biotec-back`, siehe `Tools/card-art/`).
  - `npm run gfx` überschreibt sie nicht, solange `Tools/card-art/selection.json` eine Wahl für `biotec-back` enthält.
- **neutral** (generiert): entsättigtes Gunmetal für Start, Setup und Kurzanleitung.

## `gold/`

`metal.jpg` (Rahmentextur) und `plate.jpg` (Platte) in Gold für die Siegmarker-Münzen (`src/print/markers.ts`). Erzeugt mit `node Tools/gold-textures.mjs` aus `factions/neutral/` über eine Farbrampe.

## `helge/`

Weiße Symbolmasken, die per CSS `mask` eingefärbt werden, freigestellt aus Helges Scaretech-Vorlagen:
- `icon-cost`, `icon-time`, `icon-def`, `icon-off`, `icon-dmg`: Symbole der Werte-Platte
- `emblem-planet`, `emblem-ship`, `emblem-gear`: Symbole im Oval oben links (Planet, Einheit, Upgrade)

## Sonstiges

| Datei | Verwendung | Hinweise |
|---|---|---|
| `logo.svg` | Emblem auf dem Startbildschirm, Quelle der App-Icons | quadratisch, transparenter Hintergrund |
| `pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico` | App-Icons (Startbildschirm, Browser-Tab) | werden aus `logo.svg` erzeugt: `npx pwa-assets-generator` |

Die Beispielbilder in Helges Bildfenstern (Galaxien, Nebel) stammen von fremden Künstlern. Sie werden nicht übernommen, das Skript leert die Fenster.
