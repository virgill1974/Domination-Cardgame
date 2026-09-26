import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource-variable/space-grotesk';
import '../ui/cardFace.css';
import './print.css';
import { CARDS, CARD_OF_EAN, FACTIONS, PHYSICAL_CARDS } from '../engine/data';
import { factionOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { cardFaceHtml } from '../ui/cardFace';
import { ean8Svg } from './barcodeSvg';

type Mode = 'cards' | 'labels';
const PER_SHEET: Record<Mode, number> = { cards: 9, labels: 65 };

let mode: Mode = 'cards';
let faction = -1;

const esc = (text: string | number) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Druckkarte im Layout von Helge Vogt, dasselbe wie die Kartenansicht der App (src/ui/cardFace.ts) */
const cardHtml = (ean: number) => `<div class="cell">${cardFaceHtml(ean, { base: '../', footer: 'barcode' })}</div>`;

function labelHtml(ean: number): string {
  const code = eanForIndex(ean);
  return `<div class="label"><div class="label-name">${esc(CARDS[CARD_OF_EAN[ean]].name)} · ${FACTIONS[factionOfEan(ean)]}</div>${ean8Svg(code, 0.36, 9)}<div class="digits">${code}</div></div>`;
}

function render() {
  const eans = Array.from({ length: PHYSICAL_CARDS }, (_, i) => i).filter((ean) => faction < 0 || factionOfEan(ean) === faction);
  const sheets: string[] = [];
  for (let i = 0; i < eans.length; i += PER_SHEET[mode]) {
    const chunk = eans.slice(i, i + PER_SHEET[mode]).map(mode === 'cards' ? cardHtml : labelHtml).join('');
    sheets.push(`<section class="sheet ${mode}">${chunk}</section>`);
  }
  document.getElementById('output')!.innerHTML = sheets.join('');
  document.getElementById('count')!.textContent =
    `${eans.length} ${mode === 'cards' ? 'Karten' : 'Etiketten'} auf ${sheets.length} A4-Seite(n)`;
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
