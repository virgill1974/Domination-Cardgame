import { CARDS, FACTION_COLORS } from '../engine/data';
import { factionOfCardId, kindOfCardId } from '../engine/cards';

const ICONS = {
  building: '<path d="M8 88V46l20-13v13l20-13v13l20-13V14h14v74z"/><path fill="#070a1a" d="M16 58h10v10H16zm20 0h10v10H36zm20 0h10v10H56zm0 18h10v12H56z"/>',
  foot: '<circle cx="50" cy="20" r="11"/><path d="M34 35h32l7 34H60l-3 25H43l-3-25H27z"/><path d="M68 40l22-18 4 5-22 19z"/>',
  vehicle: '<rect x="6" y="62" width="88" height="22" rx="11"/><path d="M14 62l9-16h54l9 16z"/><rect x="32" y="32" width="32" height="16" rx="5"/><rect x="60" y="36" width="36" height="6"/>',
  air: '<path d="M50 4l7 26 37 26v9l-37-10-2 25 13 10v6l-18-5-18 5v-6l13-10-2-25-37 10v-9l37-26z"/>',
  upgrade: '<path d="M50 6l38 34H66v14H34V40H12z"/><path d="M34 62h32v12H34zm0 18h32v12H34z"/>',
};

const escapeXml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Generierter Platzhalter (4:3), bis unter public/cards/<id>.png ein echtes Bild liegt. */
export function placeholderSvg(id: number): string {
  const card = CARDS[id];
  const color = FACTION_COLORS[factionOfCardId(id)];
  const kind = kindOfCardId(id);
  const icon = ICONS[kind === 'unit' ? card.unitClass! : kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<defs>
<radialGradient id="g" cx="50%" cy="40%" r="68%"><stop offset="0" stop-color="${color}" stop-opacity=".55"/><stop offset=".55" stop-color="${color}" stop-opacity=".1"/><stop offset="1" stop-color="#070a1a" stop-opacity="0"/></radialGradient>
<pattern id="p" width="28" height="48.5" patternUnits="userSpaceOnUse"><path d="M14 0L28 8.1V24.2L14 32.3L0 24.2V8.1ZM14 32.3V48.5" fill="none" stroke="#bfe6ff" stroke-opacity=".08"/></pattern>
<linearGradient id="i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="${color}"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="400" height="300" fill="#070a1a"/><rect width="400" height="300" fill="url(#g)"/><rect width="400" height="300" fill="url(#p)"/>
<g transform="translate(145 38) scale(1.1)" fill="url(#i)" filter="url(#glow)">${icon}</g>
<path d="M0 0H400V96C280 122 120 122 0 96Z" fill="url(#s)"/>
<text x="200" y="240" text-anchor="middle" font-family="Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#eef3ff">${escapeXml(card.name)}</text>
<text x="200" y="272" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" letter-spacing="5" fill="#d2deff" fill-opacity=".5">BILD FOLGT</text>
</svg>`;
}

export const placeholderDataUri = (id: number) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(placeholderSvg(id))}`;

/** Pfad relativ zur Seite; der Kartendrucker unter Tools/ übergibt '../cards/'. */
export const cardArtUrl = (id: number, base = 'cards/') => `${base}${id}.png`;
