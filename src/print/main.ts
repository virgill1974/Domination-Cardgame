import './print.css';
import { CARDS, CARD_OF_EAN, FACTIONS, FACTION_COLORS, PHYSICAL_CARDS } from '../engine/data';
import { factionOfEan, kindOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { cardArtUrl, placeholderDataUri } from '../ui/cardArt';
import { requirementName, typeLabel, upgradeEffect } from '../ui/cardText';
import { ean8Svg } from './barcodeSvg';

type Mode = 'cards' | 'labels';
const PER_SHEET: Record<Mode, number> = { cards: 9, labels: 65 };

let mode: Mode = 'cards';
let faction = -1;

const esc = (text: string | number) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function stat(label: string, value: string | number) {
  return `<div class="stat"><span>${label}</span><b>${esc(value)}</b></div>`;
}

function cardHtml(ean: number): string {
  const id = CARD_OF_EAN[ean];
  const card = CARDS[id];
  const kind = kindOfEan(ean);
  const code = eanForIndex(ean);
  const stats = kind === 'upgrade'
    ? `<div class="effect">${esc(upgradeEffect(id))}</div>`
    : `<div class="stats">${stat('Preis', card.price)}${stat('Runden', card.rounds)}${stat('Def', card.def)}${
      card.off ? stat('Off', card.off) + stat('Schaden', card.dmg) : ''}</div>`;
  const price = kind === 'upgrade' ? stat('Preis', card.price) : '';
  return `<article class="card" style="--c:${FACTION_COLORS[factionOfEan(ean)]}">
  <header><h2>${esc(card.name)}</h2><small>${FACTIONS[factionOfEan(ean)]} · ${esc(typeLabel(id))}</small></header>
  <img class="art" alt="" src="${cardArtUrl(id, '../cards/')}" data-id="${id}">
  ${stats}
  <div class="req">${price}<span>Voraussetzung: <b>${esc(requirementName(id))}</b></span></div>
  <footer>${ean8Svg(code)}<div class="digits">${code}</div></footer>
</article>`;
}

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
  const out = document.getElementById('output')!;
  out.innerHTML = sheets.join('');
  out.querySelectorAll<HTMLImageElement>('img.art').forEach((img) => {
    img.addEventListener('error', () => (img.src = placeholderDataUri(Number(img.dataset.id))), { once: true });
  });
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
