# Design-Grafiken

Alle Grafiken des Designs „Holografisches Glas“ sind selbst erzeugt und frei austauschbar.
Eigene Bilder mit **gleichem Dateinamen** hier ablegen. Soll ein anderes Format verwendet werden (z. B. `background.jpg`), die Pfade oben in `src/ui/theme.css` anpassen (`--bg-image`, `--sheen-image`).

| Datei | Verwendung | Hinweise |
|---|---|---|
| `background.svg` | Hintergrund aller Bildschirme | wird bildschirmfüllend zugeschnitten (`cover`), Hochformat empfohlen, z. B. 1200×2000 px, dunkel halten |
| `glass-sheen.svg` | Glanz über Panels und Buttons | wird auf jede Fläche gestreckt, sollte überwiegend transparent sein |
| `logo.svg` | Emblem auf dem Startbildschirm, Quelle der App-Icons | quadratisch, transparenter Hintergrund |
| `pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico` | App-Icons (Startbildschirm, Browser-Tab) | werden aus `logo.svg` erzeugt: `npx pwa-assets-generator` |

Das Sternenfeld in `background.svg` wurde per Skript mit festem Zufallswert erzeugt, kann aber wie jede andere Datei einfach ersetzt werden.
