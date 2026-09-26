# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web app for the sci-fi card game **"Domination – Das Kartenspiel"**. It began in 2005 as "Command & Conquer – Das Kartenspiel"; this repo is a copy of `CnC-web` (history included) re-skinned into an own universe to avoid C&C licensing. `CnC-web` stays untouched as the C&C version; don't port changes back unless asked. A phone/tablet replaces a self-built ATmega644 terminal (light-barrier barcode reader, 2×20 LCD, 7 buttons) and is passed around the table (hot-seat). The camera reads EAN-8 barcodes on the physical cards. Board, rows and card placement stay physical; the app only does what the terminal did.

**The reference for all game rules is `Altes Projekt/CnC_Microcontroller_code.txt`.** Mechanics are ported 1:1; intentional deviations are listed in README.md under "Abweichungen vom Original". When changing a rule, keep that list in sync. Engine comments cite original line numbers (e.g. `Z. 1943–2483`). Where the manual (`.doc`) and the code disagree, the code wins. UI text and the user are German.

**Universe & naming** (`Unterlagen/Domination_Kartenliste.xls` is the source for names; README.md has the full table and a glossary):
- Factions: Starwing (was USA), Lightforce (China), Scaretech (GBA), BIOTEC (unchanged for now, incl. its card names). Code identifiers follow: `STARWING`, `LIGHTFORCE`, `SCARETECH`, `UPG.starwing*` etc. UPG keys keep their mechanic names (`starwingSpySatellite` = „Auge des Raumes“).
- UI terms: Gebäude → **Planet**, Kommandozentrale → **Zentralgestirn**, Fußeinheit → **Aufklärer**, Fahrzeug → **Kampfschiff**, Flugzeug → **Hyperraumschiff**, Flugabwehr → **Planetenabwehr**, Kraftwerk → **Energiequelle**. Engine internals (`building`, `isFlak`, `AIRCRAFT`, German test names) still use the old mechanic words; only user-visible text must use the new ones.
- Names without an XLS entry are proposals (Feuerschwinge 22, Lightforce 32–40); README lists them.
- Never reintroduce C&C names, logos or sounds in anything user-visible.
- `domination_gfx/` (git-ignored, local only): card design drafts by Helge Vogt (PSD templates, backs, demo cards). They are drafts; final card art will be generated later in his style. Its `Beispielbilder/` are third-party DeviantArt images, never ship them.

## Commands

Node is installed at `C:\Program Files\nodejs`; shells started before installation may lack it on PATH.

```bash
npm run dev                      # Vite with HTTPS (self-signed) on :5173, --host for phones in the LAN (camera needs HTTPS)
npm run dev -- --mode http       # without HTTPS (desktop preview; the Browser pane rejects the self-signed cert)
npm test                         # vitest run (engine rules, barcode decoding, fuzz games; ~10 s)
npx vitest run src/engine/game.test.ts -t "Superwaffe"   # single file / single test
npm run build                    # tsc --noEmit + vite build → dist/ (incl. service worker + manifest)
npm run preview -- --mode http   # serve dist/ to test PWA behaviour (service worker is off in dev)
npx pwa-assets-generator         # regenerate app icons in public/ui/ from public/ui/logo.svg
```

`.claude/launch.json` starts the dev server in http mode on port 5175 for the Browser pane (CnC-web uses 5174).

## Deployment & PWA

- Hosted on **Cloudflare Pages** at https://domination-cardgame.pages.dev (project to be created by the user, see README), connected to the private GitHub repo virgill1974/Domination-Cardgame. Every push to `main` deploys (`npm run build` → `dist`, Node from `.node-version`). There is no deploy script.
  - It is a Pages project, not a Worker. Don't add `wrangler.jsonc` or a `wrangler deploy` step; the user explicitly wants Pages.
  - Pages serves `index.html` (200) for missing files. The card-art and sound fallbacks rely on load/decode failing, not on a 404.
- `vite-plugin-pwa` (generateSW, `registerType: 'prompt'`) precaches everything needed to play offline (`workbox.globPatterns` in `vite.config.ts`: app, zxing `.wasm`, fonts, `public/ui`, `public/cards`, `public/sounds`). New asset types must be added there or they won't work offline.
- `src/ui/UpdatePrompt.tsx` shows "Neue Version verfügbar". It reloads on its own `controllerchange` listener, because workbox-window treats updates found while the app is long open as "external" and never fires its own reload. Keep that listener, and keep `clientsClaim: true`: without it, a page opened for the first time is uncontrolled and never gets `controllerchange`.
- The Browser pane cannot register service workers. Test offline/update behaviour with headless Chrome (puppeteer-core against `npm run preview`) instead.

## Architecture

**`src/engine/`: pure, framework-free game logic.** Functions mutate a `GameState` passed in; the UI never mutates state directly.
- **Card identity:** Every physical card has an index 0–159 ("EAN index", `ean` in code). `CARD_OF_EAN` (= `kartenzeiger[]`) maps it to one of 92 card types. Faction = `ean / 40`, kind = position within the 40-block (0–13 building, 14–33 unit, 34–39 upgrade). Inventory slots store the physical index, which makes "Karte vorhanden!" work.
- **Players:** `players[]` is indexed by **faction** (like `player[]` in C); `seats[]` gives turn order. All 4 factions always exist. Non-playing ones matter for medal comparisons.
- **`stats[]`:** per-game copy of card values. Upgrades overwrite entries here, like the original's mutable `defaultkarten[]`.
- **Actions** (`buy`, `attack`, `repair`, `info`) re-run every validation step themselves and return `{ error?: ErrorCode, ... }`. The step-wise helpers (`buyScan`, `attackScanAttacker`, `attackConfirmAttacker`, …) exist so the UI can report errors at the same moment the terminal did (after scan vs after OK). Keep the original check order.
- **`beginTurn`** = C `einstiegspunkt` (income, overload skip, special action, build phase). **`mainCheck`** = C `hauptanzeige` (medals, VP, win) and must run after every action. The UI calls it when a flow closes.
- `Slot.counted` tracks whether a card is in `buildings`/`units` (fix for recharging superweapons). The fuzz test asserts counters equal counted slots.
- BIOTEC upgrades 86–91 are a **new design** (the original had "Update 1–6" without effect). The table is in README.md.
  - Mutagen, Perpetuum and Chitinpanzer live in `applyUpgrade`.
  - Flüstern is the `stealthy` check in `combat.ts`.
  - Zellregeneration and the Neuronetz hint run in `beginTurn`.
- Randomness is injected (`Rng`). Tests use `dice(...)`, `noDice`, `started()`, `give()` from `testutil.ts`.

**`src/ui/`: Preact.**
- `App.tsx` holds the state machine (home → setup → handoff → HUD/flows → winner). `commit(fn)` structuredClones state, applies the engine call and persists to localStorage.
- Engine events become queued `Msg` dialogs (`eventMessages.tsx`), optionally with a `sound`.
- Flows in `flows.tsx` follow the terminal: scan → confirm card → execute.
- Button pairs use `.btn-row`: cancel (`.btn.cancel`, plain faction-tinted glass, never red) on the **left** at ⅓ width, main action on the right at ⅔. Both stretch to equal height when pixel text wraps. Red (`.btn.danger`) is reserved for deleting the game ("Spiel abbrechen" and its confirmation).
- Design "Holografisches Glas" lives in `theme.css` (tokens on `:root`). Only large surfaces (`.panel`, `.dialog`, `.glass`) use `backdrop-filter`, for phone performance. Buttons and tiles use plain translucent gradients.
- Faction color arrives as `--fc` and `--tint` via `factionStyle()`. `App.tsx` also puts it on the `display: contents` root, so dialogs and the scanner are tinted during a turn.
  - Primary buttons, the dialog top stroke and the scanner frame use `--accent-grad`/`--accent-ink`/`--accent-glow`/`--accent-line`. These are a silver/gray gradient on neutral screens and the faction color (white text) inside tinted elements. The user does not want the old cyan→violet→pink gradient anywhere (logo and icons included); only the background art keeps its nebula colors. Only error (red) and warning (orange) dialogs keep signal colors.
  - Custom properties resolve where they are declared. So anything derived from `--tint`/`--fc` (e.g. `--glass`) is re-declared under `:root, [style*='--tint']`. Don't define such derived variables on `:root` alone, or they stay cyan.
- Fonts as in the ModZart_Web project, self-hosted via fontsource (offline):
  - Silkscreen (pixel, `--font-display`): the user's favourite. Used for headings, faction names, all buttons, stat tiles and values, counters, card type lines, key/value tiles, badges, combat log headings.
  - Space Grotesk (`--font-body`): running text and card names (readability)
  - JetBrains Mono (`--font-mono`): card codes only
  - Pixel text is wide. Font sizes use `clamp()`; check 320 px width after changes.
  - Silkscreen/JetBrains are imported as latin-only subsets; German umlauts are included.
- `Guide.tsx` is the in-app Kurzanleitung, reachable only from the home screen. Rule values in it follow the code, not the manual.

**`src/scanner/`:**
- Uses native `BarcodeDetector` if it supports `ean_8`, otherwise the `barcode-detector` ponyfill with zxing-wasm. The `.wasm` is bundled via `?url`, no CDN.
- A code is accepted only after two identical consecutive reads.
- The manual picker is a testing aid; the user plans to remove it later.
  - Each flow passes `available(ean)`, built from the engine's pure checks: `buyCheck`, `repairCheck`, `attackScan*`/`attackConfirm*`, `infoScan`/`info`. The picker shows only those cards by default, plus an "Alle Karten zeigen" toggle for testing error messages.
  - For the defender step this reveals which enemy cards are in play; that is accepted for testing.

**Barcodes:**
- EAN-8 = `0000` + 3-digit index + GS1 check digit (`src/engine/ean.ts`).
- `barcode.test.ts` rasterizes all 160 and decodes them with zxing-wasm in Node.

**Card printer (`Tools/generate_barcodes.html` + `src/print/`):**
- It is a second Vite entry, so it is not double-clickable; open it via the dev server.
- It shares data and the EAN encoder with the app and renders SVG barcodes (integer module grid, ≥7-module quiet zone, 0.4 mm/module) on 63×88 mm cards or 38×21 mm labels.

**Asset fallbacks (drop-in, no code change):**
- Images: `public/cards/<cardTypeId>.png`, generated SVG placeholder if missing (`src/ui/cardArt.ts`). The printer page resolves images with base `../cards/`.
- Sounds: `public/sounds/<name>.mp3`, else synthesized via Web Audio (`src/ui/sound.ts`).
- Music: `public/sounds/music.mp3` loops during the game (`src/ui/music.ts`), else a generated ambient pad.
  - It is routed through a `MediaElementAudioSourceNode` into the music bus, because iOS ignores `<audio>.volume`.
  - `sound.ts` has two gain buses (`sfx`, `music`) with volumes persisted in localStorage. The UI is `VolumeControl.tsx`, rendered via portal because `backdrop-filter` on `.dialog` would trap a fixed overlay.
  - Browsers may reject `play()` without a gesture. `kickMusic()` runs on every pointerdown to retry.
- Design graphics: `public/ui/background.svg`, `glass-sheen.svg`, `logo.svg`, referenced as CSS variables at the top of `theme.css`. Use absolute `/ui/...` URLs in CSS; Vite rewrites them relative for `base: './'`.
- 404s for these files in the console are expected. Don't download third-party assets without asking: original C&C sounds and images are EA-copyrighted.

## Legacy material

`Altes Projekt/` contains the original C code, manual, card lists and tech trees. The `.doc/.xls` files are password-protected (password in README). There is no Python on this machine. Read them read-only via Office COM from PowerShell, e.g. `Word.Application` `Documents.Open(path, $false, $true, $false, "<pw>")` or `Excel.Application` `Workbooks.Open(path, 0, $true, 5, "<pw>")`.
