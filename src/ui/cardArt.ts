import { CARDS, FACTION_COLORS } from '../engine/data';
import { factionOfCardId, kindOfCardId } from '../engine/cards';

// Flache weiße Symbole wie in Helges Emblem-Ovalen (Box 100×100)
const gear = (() => {
  const teeth = 8;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? 47 : 36;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<path fill-rule="evenodd" d="M${pts.join('L')}Z M50 32a18 18 0 1 0 0.01 0Z"/>`;
})();
const ICONS = {
  building: '<circle cx="50" cy="50" r="29"/><ellipse cx="50" cy="52" rx="49" ry="14" fill="none" stroke="#07090b" stroke-width="13" transform="rotate(-22 50 50)"/><ellipse cx="50" cy="52" rx="49" ry="14" fill="none" stroke="#fff" stroke-width="5" transform="rotate(-22 50 50)"/><circle cx="50" cy="50" r="29" clip-path="url(#top)"/>',
  unit: '<path transform="rotate(62 50 50)" d="M50 4L60 44L94 66V76L60 68L57 86L66 94V98L50 94L34 98V94L43 86L40 68L6 76V66L40 44Z"/>',
  upgrade: gear,
};

const escapeXml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Generierter Platzhalter (Bildfenster der Karte), bis unter public/cards/<id>.png ein echtes Bild liegt. */
export function placeholderSvg(id: number): string {
  const card = CARDS[id];
  const color = FACTION_COLORS[factionOfCardId(id)];
  const icon = ICONS[kindOfCardId(id)];
  let seed = id * 7919 + 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const stars = Array.from({ length: 46 }, () =>
    `<circle cx="${(rnd() * 512).toFixed(0)}" cy="${(rnd() * 300).toFixed(0)}" r="${(0.4 + rnd() * 1.3).toFixed(1)}" fill="#fff" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 300">
<defs>
<radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="${color}" stop-opacity=".5"/><stop offset=".55" stop-color="${color}" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<clipPath id="top"><rect x="0" y="0" width="100" height="47" transform="rotate(-22 50 50)"/></clipPath>
<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".6"/></filter>
</defs>
<rect width="512" height="300" fill="#07090b"/><rect width="512" height="300" fill="url(#g)"/>${stars}
<g transform="translate(201 44) scale(1.1)" fill="#fff" filter="url(#s)">${icon}</g>
<text x="256" y="236" text-anchor="middle" font-family="Space Grotesk Variable,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#fff">${escapeXml(card.name)}</text>
<text x="256" y="266" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" letter-spacing="5" fill="#fff" fill-opacity=".5">BILD FOLGT</text>
</svg>`;
}

export const placeholderDataUri = (id: number) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(placeholderSvg(id))}`;

/** Pfad relativ zur Seite; der Kartendrucker unter Tools/ übergibt '../cards/'. */
export const cardArtUrl = (id: number, base = 'cards/') => `${base}${id}.png`;
