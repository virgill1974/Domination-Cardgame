# Soundeffekte

Die App erzeugt alle Klänge selbst (Web Audio). Liegt hier eine Datei `<name>.mp3`, spielt die App stattdessen dieses Sample.
Geeignet sind kurze MP3-Dateien. Achte auf die Lizenz: CC0 bzw. „frei verwendbar“, z. B. Kenney.nl oder Freesound (Filter CC0).
Nur Sounds mit passender Lizenz verwenden, keine Originalsounds aus kommerziellen Spielen.

| Datei | Wann |
|---|---|
| `click.mp3` | jeder Button |
| `scan.mp3` | Barcode erkannt |
| `error.mp3` | Fehlermeldung („Falsche Karte!“ usw.) |
| `buy.mp3` | Karte gekauft |
| `activate.mp3` | Karten zu Zugbeginn aktiviert |
| `bonus.mp3` | Sonderaktion, Schwarzer Schleier gekauft |
| `medal.mp3` | Orden erhalten |
| `repair.mp3` | Reparatur |
| `turn.mp3` | Übergabe an den nächsten Spieler, Auge des Raumes |
| `overload.mp3` | Überlastung (Zug aussetzen) |
| `dice.mp3` | Würfelwurf im Kampf |
| `hit.mp3` | Treffer |
| `miss.mp3` | Verfehlt |
| `explosion.mp3` | Karte im Kampf zerstört (vorhanden: eigener Sound, 5 s) |
| `superweapon.mp3` | Superwaffe feuert (inkl. Einschlag) |
| `victory.mp3` | Siegesfanfare |

## Hintergrundmusik

Drei Stücke laufen in Schleife und blenden beim Wechsel weich ineinander über:

| Datei | Wann | vorhanden | ohne Datei |
|---|---|---|---|
| `menu.mp3` | Startbildschirm, Spieleinrichtung, Kurzanleitung | „Domination Cardgame title“, 3:04 | erzeugte, getragene Klangfläche (Dm – B♭ – F – C) |
| `music.mp3` | während der Partie | „Domination Cardgame ingame“, 3:28 | erzeugte, ruhige Sci-Fi-Klangfläche (Am – F – C – G) |
| `combat.mp3` | solange die Kampfansicht läuft, danach zurück zur Partie-Musik | „Domination Cardgame battle“, 2:19 | erzeugter Action-Loop (138 BPM, Beat, Bass, Arpeggio) |

Beim Sieg ist Stille, damit die Fanfare frei steht.
Jede Datei darf bis 20 MB groß sein und wird für das Offline-Spiel mit auf dem Handy gespeichert. Für einen sauberen Übergang am Schleifenende sollte der Anfang nahtlos an das Ende passen.
Auch hier gilt: nur Musik mit passender Lizenz (z. B. CC0 oder selbst komponiert).

Effekte und Musik haben getrennte Regler im Dialog **Lautstärke** (Startbildschirm und Spielmenü ☰).
