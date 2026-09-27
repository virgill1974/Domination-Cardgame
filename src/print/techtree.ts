// Technologiebäume je Fraktion im Aufbau der alten C&C-Techtrees (Altes Projekt/CnC_Techtrees_4p.ppt):
// Planeten als Kette in der Mitte (von oben nach unten nach Voraussetzung), daneben die Einheiten und
// Upgrades, die ein Planet freischaltet. Berechnet aus CARDS[].requires, gestaltet im Helge-Stil.
import '@fontsource/silkscreen/latin-400.css';
import '@fontsource-variable/space-grotesk';
import './techtree.css';
import { CARDS, FACTIONS, FACTION_COLORS, NO_REQUIREMENT, type Faction } from '../engine/data';
import { factionOfCardId, kindOfCardId } from '../engine/cards';
import { factionAsset, helgeIcon } from '../ui/assets';
import { cardArtUrl, placeholderDataUri } from '../ui/cardArt';
import { jpegImages } from './jpeg';

const BASE = '../';
const MAX_COLS = 4; // Kacheln je Zeile in einer Seitengruppe
const EMBLEM = { building: 'emblem-planet', unit: 'emblem-ship', upgrade: 'emblem-gear' } as const;

const esc = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function tile(id: number): string {
  const kind = kindOfCardId(id);
  const fallback = placeholderDataUri(id).replace(/'/g, '%27');
  const name = CARDS[id].name;
  const long = name.length > (kind === 'building' ? 20 : 17);
  return `<figure class="tile ${kind}" data-id="${id}">
  <figcaption${long ? ' class="long"' : ''}>${esc(name)}</figcaption>
  <div class="pic"><img alt="" src="${cardArtUrl(id, `${BASE}cards/`)}" onerror="this.onerror=null;this.src='${fallback}'">
  <i class="emb" style="--m:url('${helgeIcon(EMBLEM[kind], BASE)}')"></i></div>
</figure>`;
}

/** Seitengruppe: erst Einheiten, darunter Upgrades (wie im alten GBA-Baum), je höchstens MAX_COLS pro Zeile */
function group(ids: number[], side: 'left' | 'right', owner: number): string {
  if (!ids.length) return `<div class="group ${side}"></div>`;
  const rows: number[][] = [];
  for (const part of [ids.filter((id) => kindOfCardId(id) === 'unit'), ids.filter((id) => kindOfCardId(id) === 'upgrade')]) {
    for (let i = 0; i < part.length; i += MAX_COLS) rows.push(part.slice(i, i + MAX_COLS));
  }
  return `<div class="group ${side}" data-owner="${owner}">${rows.map((r) => `<div class="grow">${r.map(tile).join('')}</div>`).join('')}</div>`;
}

function page(f: Faction): string {
  const ids = CARDS.map((c) => c.id).filter((id) => factionOfCardId(id) === f);
  const planets = ids.filter((id) => kindOfCardId(id) === 'building');
  const childrenOf = (p: number) => ids.filter((id) => kindOfCardId(id) !== 'building' && CARDS[id].requires === p);

  // Ebenen: Tiefe in der Kette der Voraussetzungen, innerhalb einer Ebene nach Elternplanet sortiert
  const depth = new Map<number, number>();
  const depthOf = (id: number): number => {
    if (!depth.has(id)) depth.set(id, CARDS[id].requires === NO_REQUIREMENT ? 0 : depthOf(CARDS[id].requires) + 1);
    return depth.get(id)!;
  };
  const levels: number[][] = [];
  for (const p of planets) (levels[depthOf(p)] ??= []).push(p);
  for (const level of levels) level.sort((a, b) => CARDS[a].requires - CARDS[b].requires || a - b);

  const rows = levels.map((level) => {
    // Linker Planet einer Mehrfach-Ebene gibt seine Karten nach links, alle anderen nach rechts
    const left = level.length > 1 ? childrenOf(level[0]) : [];
    const right = level.slice(level.length > 1 ? 1 : 0).flatMap(childrenOf);
    const rightOwner = level.slice(level.length > 1 ? 1 : 0).find((p) => childrenOf(p).length) ?? level.at(-1)!;
    return `<div class="row">
  ${group(left, 'left', level[0])}
  <div class="center">${level.map(tile).join('')}</div>
  ${group(right, 'right', rightOwner)}
</div>`;
  }).join('');

  const style = `--fc:${FACTION_COLORS[f]};--tex:url('${factionAsset(null, 'tile.webp', BASE)}');--rim:url('${factionAsset(f, 'rim.webp', BASE)}')`;
  const legend = (kind: keyof typeof EMBLEM, label: string) =>
    `<span class="legend"><i style="--m:url('${helgeIcon(EMBLEM[kind], BASE)}')"></i>${label}</span>`;
  return `<section class="page" style="${style}" data-faction="${f}">
  <header><img class="back" alt="" src="${factionAsset(f, 'back.webp', BASE)}"><h2>Technologiebaum – ${FACTIONS[f]}</h2></header>
  <div class="tree">${rows}<svg class="arrows"></svg></div>
  <footer>
    ${legend('building', 'Planet')}${legend('unit', 'Einheit')}${legend('upgrade', 'Upgrade')}
    <span class="legend arrow">→ schaltet frei</span>
    <span class="brand">Domination – Das Kartenspiel</span>
  </footer>
</section>`;
}

/** Pfeile nach dem Layout einzeichnen: Planet → Planet (von unten nach oben), Planet → Seitengruppe (waagerecht) */
function drawArrows(section: HTMLElement) {
  const tree = section.querySelector<HTMLElement>('.tree')!;
  const svg = tree.querySelector('svg')!;
  const box = tree.getBoundingClientRect();
  const scale = tree.offsetWidth / box.width; // Bildschirm-Zoom herausrechnen
  const rect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { l: (r.left - box.left) * scale, r: (r.right - box.left) * scale, t: (r.top - box.top) * scale, b: (r.bottom - box.top) * scale };
  };
  const pic = (id: number) => tree.querySelector(`.center .tile[data-id="${id}"] .pic`);
  const lines: string[] = [];
  const head = `marker-end="url(#head-${section.dataset.faction})"`;
  const arrow = (x1: number, y1: number, x2: number, y2: number) =>
    lines.push(`<path d="M${x1} ${y1}L${x2} ${y2}" ${head}/>`);

  // Planet → Planet als rechtwinklige Leitung (runter, quer, runter), damit keine Beschriftung gekreuzt wird
  for (const t of tree.querySelectorAll<HTMLElement>('.center .tile')) {
    const id = Number(t.dataset.id);
    const parent = CARDS[id].requires;
    const from = parent === NO_REQUIREMENT ? null : pic(parent);
    if (!from) continue;
    const a = rect(from), b = rect(t);
    const x1 = (a.l + a.r) / 2, x2 = (b.l + b.r) / 2;
    const mid = (a.b + b.t) / 2;
    lines.push(`<path d="M${x1} ${a.b + 1}V${mid}H${x2}V${b.t}" ${head}/>`);
  }
  for (const g of tree.querySelectorAll<HTMLElement>('.group[data-owner]')) {
    const owner = pic(Number(g.dataset.owner));
    if (!owner) continue;
    const a = rect(owner), gr = rect(g);
    const y = (a.t + a.b) / 2;
    if (g.classList.contains('left')) arrow(a.l - 2, y, gr.r + 4, y);
    else arrow(a.r + 2, y, gr.l - 16, y); // Piktogramm ragt links aus der Kachel
  }
  svg.setAttribute('viewBox', `0 0 ${tree.offsetWidth} ${tree.offsetHeight}`);
  // dunkle Unterlinie als Schatten statt CSS-Filter (ein Filter lässt Chrome die ganze PDF-Seite rastern)
  const shade = lines.map((l) => l.replace('<path ', '<path class="shade" ').replace(/ marker-end="[^"]*"/, ''));
  svg.innerHTML = `<defs><marker id="head-${section.dataset.faction}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#f2f5f7"/></marker></defs>${shade.join('')}${lines.join('')}`;
}

/** Kacheln verkleinern, bis der Baum auf die Seite passt (Fraktionen mit vielen Ebenen, z. B. BIOTEC) */
function fit(section: HTMLElement) {
  const tree = section.querySelector<HTMLElement>('.tree')!;
  let k = 1;
  section.style.setProperty('--k', '1');
  while (k > 0.6 && (tree.scrollHeight > tree.clientHeight + 1 || tree.scrollWidth > tree.clientWidth + 1)) {
    k -= 0.04;
    section.style.setProperty('--k', k.toFixed(2));
  }
}

const layout = (section: HTMLElement) => {
  fit(section);
  drawArrows(section);
};

let faction = -1;
function render() {
  const out = document.getElementById('output')!;
  out.innerHTML = ([0, 1, 2, 3] as Faction[]).filter((f) => faction < 0 || f === faction).map(page).join('');
  const draw = () => out.querySelectorAll<HTMLElement>('.page').forEach(layout);
  // nach Schriften und Bildern neu zeichnen, weil sich die Kachelgrößen dann noch verschieben können
  requestAnimationFrame(draw);
  void document.fonts.ready.then(draw);
  jpegImages(out, draw);
}

document.querySelectorAll<HTMLButtonElement>('[data-faction]').forEach((btn) => {
  btn.addEventListener('click', () => {
    faction = Number(btn.dataset.faction);
    document.querySelectorAll('[data-faction]').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});
document.getElementById('print')!.addEventListener('click', () => window.print());
window.addEventListener('beforeprint', () => document.querySelectorAll<HTMLElement>('.page').forEach(layout));
render();
