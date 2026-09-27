import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/silkscreen/latin-400.css';
import '@fontsource-variable/space-grotesk';
import '../ui/cardFace.css';
import './print.css';
import { CARDS, CARD_OF_EAN, FACTIONS, PHYSICAL_CARDS } from '../engine/data';
import { factionOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { cardBackHtml, cardFaceHtml } from '../ui/cardFace';
import { ean8Svg } from './barcodeSvg';
import { markerSvg, type MarkerKind } from './markers';

/** cards: Vorderseiten, backs: Rückseiten, duplex: abwechselnd Vorder- und Rückseitenbogen, labels: Etiketten, markers: Siegmarker */
type Mode = 'cards' | 'backs' | 'duplex' | 'labels' | 'markers';
const PER_SHEET: Record<Exclude<Mode, 'markers'>, number> = { cards: 9, backs: 9, duplex: 9, labels: 65 };
/** Münzen je Siegmarker auf dem Bogen: 2 ergeben einen Marker (Vorder- und Rückseite), der Rest ist Ersatz */
const COINS_PER_MARKER = 6;
const COLS = 3;

let mode: Mode = 'cards';
let faction = -1;

const esc = (text: string | number) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Druckkarte im Layout von Helge Vogt, dasselbe wie die Kartenansicht der App (src/ui/cardFace.ts) */
const cardHtml = (ean: number) => `<div class="cell">${cardFaceHtml(ean, { base: '../', footer: 'barcode' })}</div>`;
const backHtml = (ean: number) => `<div class="cell" data-ean="${ean}">${cardBackHtml(ean, { base: '../' })}</div>`;

/**
 * Rückseitenbogen für Duplexdruck (Wenden an der langen Kante): Jede Zeile ist gespiegelt, damit die
 * Rückseite genau hinter ihrer Vorderseite liegt. Unvollständige Zeilen werden mit leeren Zellen aufgefüllt.
 */
function mirroredBacks(chunk: number[]): string {
  const cells: string[] = [];
  for (let row = 0; row < Math.ceil(chunk.length / COLS); row++) {
    const line = Array.from({ length: COLS }, (_, c) => chunk[row * COLS + c]);
    cells.push(...line.reverse().map((ean) => (ean === undefined ? '<div class="cell empty"></div>' : backHtml(ean))));
  }
  return cells.join('');
}

function labelHtml(ean: number): string {
  const code = eanForIndex(ean);
  return `<div class="label"><div class="label-name">${esc(CARDS[CARD_OF_EAN[ean]].name)} · ${FACTIONS[factionOfEan(ean)]}</div>${ean8Svg(code, 0.36, 9)}</div>`;
}

/** Siegmarker: je zwei gleiche Münzen ausschneiden und Rücken an Rücken auf Pappe kleben */
function markerSheet(): string {
  const coins = (kind: MarkerKind) => Array.from({ length: COINS_PER_MARKER }, () => `<div class="coin-cell">${markerSvg(kind)}</div>`).join('');
  return `<section class="sheet markers">
  <p class="sheet-note">Siegmarker · je zwei gleiche Münzen ausschneiden und Rücken an Rücken auf Pappe kleben (Ersatz inklusive)</p>
  ${coins('army')}${coins('base')}
</section>`;
}

function render() {
  if (mode === 'markers') {
    document.getElementById('output')!.innerHTML = markerSheet();
    document.getElementById('count')!.textContent = `2 Siegmarker, je ${COINS_PER_MARKER} Münzen auf 1 A4-Seite`;
    return;
  }
  const eans = Array.from({ length: PHYSICAL_CARDS }, (_, i) => i).filter((ean) => faction < 0 || factionOfEan(ean) === faction);
  const sheets: string[] = [];
  for (let i = 0; i < eans.length; i += PER_SHEET[mode]) {
    const chunk = eans.slice(i, i + PER_SHEET[mode]);
    if (mode === 'labels') sheets.push(`<section class="sheet labels">${chunk.map(labelHtml).join('')}</section>`);
    if (mode === 'cards' || mode === 'duplex') sheets.push(`<section class="sheet cards">${chunk.map(cardHtml).join('')}</section>`);
    if (mode === 'backs' || mode === 'duplex') sheets.push(`<section class="sheet cards backs">${mirroredBacks(chunk)}</section>`);
  }
  document.getElementById('output')!.innerHTML = sheets.join('');
  const what = mode === 'labels' ? 'Etiketten' : mode === 'backs' ? 'Rückseiten' : 'Karten';
  document.getElementById('count')!.textContent = mode === 'duplex'
    ? `${eans.length} Karten auf ${sheets.length / 2} Blatt (${sheets.length} Seiten, beidseitig)`
    : `${eans.length} ${what} auf ${sheets.length} A4-Seite(n)`;
}

document.querySelectorAll<HTMLButtonElement>('[data-faction]').forEach((btn) => {
  btn.addEventListener('click', () => {
    faction = Number(btn.dataset.faction);
    document.querySelectorAll('[data-faction]').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode as Mode;
    document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});
document.getElementById('print')!.addEventListener('click', () => window.print());
render();
