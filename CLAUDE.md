# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web-App port of the card game "Command & Conquer – Das Kartenspiel" (2005). A phone/tablet replaces a self-built ATmega644 terminal (light-barrier barcode reader, 2×20 LCD, 7 buttons) and is passed around the table (hot-seat). The camera reads EAN-8 barcodes on the physical cards. Board, rows and card placement stay physical; the app only does what the terminal did.

**The reference for all game rules is `Altes Projekt/CnC_Microcontroller_code.txt`.** Mechanics are ported 1:1; intentional deviations are listed in README.md under "Abweichungen vom Original". When changing a rule, keep that list in sync. Engine comments cite original line numbers (e.g. `Z. 1943–2483`). Where the manual (`.doc`) and the code disagree, the code wins. UI text and the user are German.

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

`.claude/launch.json` starts the dev server in http mode on port 5174 for the Browser pane.

## Deployment & PWA

- Hosted on **Cloudflare Pages**, connected to this private GitHub repo. Every push to `main` deploys (`npm run build` → `dist`, Node from `.node-version`). There is no deploy script.
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
- Randomness is injected (`Rng`). Tests use `dice(...)`, `noDice`, `started()`, `give()` from `testutil.ts`.

**`src/ui/`: Preact.**
- `App.tsx` holds the state machine (home → setup → handoff → HUD/flows → winner). `commit(fn)` structuredClones state, applies the engine call and persists to localStorage.
- Engine events become queued `Msg` dialogs (`eventMessages.tsx`), optionally with a `sound`.
- Flows in `flows.tsx` follow the terminal: scan → confirm card → execute.
- Design "Holografisches Glas" lives in `theme.css` (tokens on `:root`). Only large surfaces (`.panel`, `.dialog`, `.glass`) use `backdrop-filter`, for phone performance. Buttons and tiles use plain translucent gradients. Faction color arrives as `--fc` via `factionStyle()`.
- Fonts are self-hosted via `@fontsource-variable` (Exo 2 for display, Inter for body), so they work offline.

**`src/scanner/`:**
- Uses native `BarcodeDetector` if it supports `ean_8`, otherwise the `barcode-detector` ponyfill with zxing-wasm. The `.wasm` is bundled via `?url`, no CDN.
- A code is accepted only after two identical consecutive reads.
- The manual picker only lists cards by faction and never reveals ownership (enemy buildings are face-down on the table).

**Barcodes:**
- EAN-8 = `0000` + 3-digit index + GS1 check digit (`src/engine/ean.ts`).
- `barcode.test.ts` rasterizes all 160 and decodes them with zxing-wasm in Node.

**Card printer (`Tools/generate_barcodes.html` + `src/print/`):**
- It is a second Vite entry, so it is not double-clickable; open it via the dev server.
- It shares data and the EAN encoder with the app and renders SVG barcodes (integer module grid, ≥7-module quiet zone, 0.4 mm/module) on 63×88 mm cards or 38×21 mm labels.

**Asset fallbacks (drop-in, no code change):**
- Images: `public/cards/<cardTypeId>.png`, generated SVG placeholder if missing (`src/ui/cardArt.ts`). The printer page resolves images with base `../cards/`.
- Sounds: `public/sounds/<name>.mp3`, else synthesized via Web Audio (`src/ui/sound.ts`).
- Design graphics: `public/ui/background.svg`, `glass-sheen.svg`, `logo.svg`, referenced as CSS variables at the top of `theme.css`. Use absolute `/ui/...` URLs in CSS; Vite rewrites them relative for `base: './'`.
- 404s for these files in the console are expected. Don't download third-party assets without asking: original C&C sounds and images are EA-copyrighted.

## Legacy material

`Altes Projekt/` contains the original C code, manual, card lists and tech trees. The `.doc/.xls` files are password-protected (password in README). There is no Python on this machine. Read them read-only via Office COM from PowerShell, e.g. `Word.Application` `Documents.Open(path, $false, $true, $false, "<pw>")` or `Excel.Application` `Workbooks.Open(path, 0, $true, 5, "<pw>")`.
