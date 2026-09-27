// Siegmarker „Beste Streitmacht“ und „Bester Stützpunkt“ als goldene Münzen (Kartendrucker und Anleitung).
// Reines Vektor-SVG ohne Filter, damit der Druck scharf und das PDF klein bleibt. Vorder- und Rückseite sind gleich.
import { MEDAL_MIN_BUILDINGS, MEDAL_MIN_STARS, MEDAL_POINTS } from '../engine/data';

export type MarkerKind = 'army' | 'base';

const INK = '#3d2a0a';
const SHINE = 'rgba(255, 246, 205, 0.85)';

const MARKERS: Record<MarkerKind, { title: string; min: number; what: string }> = {
  army: { title: 'BESTE STREITMACHT', min: MEDAL_MIN_STARS, what: 'STERNEN' },
  base: { title: 'BESTER STÜTZPUNKT', min: MEDAL_MIN_BUILDINGS, what: 'PLANETEN' },
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const polar = (r: number, deg: number) => [r2(100 + r * Math.cos((deg * Math.PI) / 180)), r2(100 + r * Math.sin((deg * Math.PI) / 180))];

/** Fünfzackiger Stern um (x, y) */
function star(x: number, y: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${r2(x + rr * Math.cos(a))},${r2(y + rr * Math.sin(a))}`;
  });
  return `<polygon points="${pts.join(' ')}"/>`;
}

/** Kleiner Planet mit Ring um (x, y) */
const planet = (x: number, y: number, r: number) =>
  `<circle cx="${x}" cy="${y}" r="${r}"/><ellipse cx="${x}" cy="${y}" rx="${r2(r * 1.9)}" ry="${r2(r * 0.45)}" fill="none" stroke-width="${r2(r * 0.35)}" transform="rotate(-18 ${x} ${y})"/>`;

/** Fünf Symbole im flachen Bogen über dem Emblem: so viele braucht man mindestens */
const countRow = (n: number, draw: (x: number, y: number) => string) =>
  Array.from({ length: n }, (_, i) => {
    const t = i - (n - 1) / 2;
    return draw(r2(100 + t * 13), r2(50 + t * t * 1.1));
  }).join('');

/** Streitmacht: Raumjäger vor zwei gekreuzten Klingen */
const BLADE = '<path d="M100 58 L104 66 L104 116 L96 116 L96 66 Z"/><rect x="89" y="115" width="22" height="4" rx="1.5"/><rect x="97.5" y="119" width="5" height="9" rx="1"/>';
const ARMY_EMBLEM = `
  <g transform="rotate(-40 100 92)">${BLADE}</g>
  <g transform="rotate(40 100 92)">${BLADE}</g>
  <path d="M100 68 L105 82 L107 93 L123 105 L123 111 L107 108 L104 115 L100 112 L96 115 L93 108 L77 111 L77 105 L93 93 L95 82 Z" stroke="#e4b44e" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"/>
  <path d="M100 76 L102.5 86 L100 97 L97.5 86 Z" fill="#f3d27a"/>`;

/** Stützpunkt: Festung mit drei Türmen auf einem beringten Planeten */
const BASE_EMBLEM = `
  <ellipse cx="100" cy="106" rx="38" ry="8" fill="none" stroke-width="3.6" transform="rotate(-10 100 106)"/>
  <circle cx="100" cy="106" r="17"/>
  <path d="M62 106 A38 8 0 0 0 138 106" fill="none" stroke-width="3.6" transform="rotate(-10 100 106)"/>
  <path d="M80 94 V78 H78 V72 H82 V75 H85 V72 H89 V75 H92 V72 H96 V78 H94 V84 H92 V64 H90 V58 H94 V61 H97.6 V58 H102.4 V61 H106 V58 H110 V64 H108 V84 H106 V78 H104 V72 H108 V75 H111 V72 H115 V75 H118 V72 H122 V78 H120 V94 Z"/>
  <path d="M97 94 V87 A3 3 0 0 1 103 87 V94 Z" fill="#f3d27a"/>`;

let uid = 0;

/** Münze Ø 50 mm (viewBox 200 = 50 mm), size überschreibt die Druckgröße */
export function markerSvg(kind: MarkerKind, size = '50mm'): string {
  const m = MARKERS[kind];
  const id = `mk${kind}${uid++}`;
  const knurl = Array.from({ length: 150 }, (_, i) => {
    const [x1, y1] = polar(91, i * 2.4);
    const [x2, y2] = polar(98.5, i * 2.4);
    return `M${x1} ${y1}L${x2} ${y2}`;
  }).join('');
  // Umschrift: oben im Uhrzeigersinn (Buchstaben nach außen), unten gegen den Uhrzeigersinn (nach innen)
  const [tx1, ty1] = polar(70, 168);
  const [tx2, ty2] = polar(70, 12);
  const [bx1, by1] = polar(79, 146);
  const [bx2, by2] = polar(79, 34);
  const emblem = kind === 'army' ? ARMY_EMBLEM : BASE_EMBLEM;
  const icons = kind === 'army' ? countRow(m.min, (x, y) => star(x, y, 5.2)) : countRow(m.min, (x, y) => planet(x, y, 2.6));
  const relief = `${icons}${emblem}
    <text x="100" y="131" font-family="Silkscreen, monospace" font-size="9.5" text-anchor="middle">AB ${m.min} ${m.what}</text>
    <text x="100" y="142.5" font-family="'Space Grotesk Variable', sans-serif" font-weight="700" font-size="9" text-anchor="middle">und die meisten</text>`;
  return `<svg class="coin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${m.title}">
  <defs>
    <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff4c2"/><stop offset=".28" stop-color="#e7b64a"/><stop offset=".55" stop-color="#9b6a16"/>
      <stop offset=".75" stop-color="#f1cf72"/><stop offset="1" stop-color="#7d5210"/>
    </linearGradient>
    <linearGradient id="${id}b" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#f5d57a"/><stop offset=".5" stop-color="#c8922e"/><stop offset="1" stop-color="#a7741c"/>
    </linearGradient>
    <radialGradient id="${id}f" cx=".38" cy=".32" r=".8">
      <stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#eec35a"/><stop offset="1" stop-color="#b07c1e"/>
    </radialGradient>
    <path id="${id}t" d="M${tx1} ${ty1}A70 70 0 1 1 ${tx2} ${ty2}"/>
    <path id="${id}u" d="M${bx1} ${by1}A79 79 0 0 0 ${bx2} ${by2}"/>
  </defs>
  <circle cx="100" cy="100" r="99" fill="url(#${id}r)" stroke="#5a3a08" stroke-width="1"/>
  <path d="${knurl}" stroke="#6b470c" stroke-opacity=".75" stroke-width="1.1"/>
  <circle cx="100" cy="100" r="90" fill="url(#${id}b)" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="100" cy="100" r="86.5" fill="none" stroke="${SHINE}" stroke-width=".8"/>
  <g font-family="Silkscreen, monospace" text-anchor="middle">
    <text font-size="14.5" fill="${SHINE}" transform="translate(.6 .8)"><textPath href="#${id}t" startOffset="50%">${m.title}</textPath></text>
    <text font-size="14.5" fill="${INK}"><textPath href="#${id}t" startOffset="50%">${m.title}</textPath></text>
    <text font-size="14.5" fill="${SHINE}" transform="translate(.6 .8)"><textPath href="#${id}u" startOffset="50%">+${MEDAL_POINTS} SIEGPUNKTE</textPath></text>
    <text font-size="14.5" fill="${INK}"><textPath href="#${id}u" startOffset="50%">+${MEDAL_POINTS} SIEGPUNKTE</textPath></text>
  </g>
  ${[180, 0].map((deg) => { const [x, y] = polar(75, deg); return `<g fill="${INK}">${star(x, y, 4.5)}</g>`; }).join('')}
  <circle cx="100" cy="100" r="64" fill="url(#${id}f)" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="100" cy="100" r="61" fill="none" stroke="${SHINE}" stroke-width=".7"/>
  <g fill="${SHINE}" stroke="${SHINE}" stroke-width="0" transform="translate(.7 .9)">${relief}</g>
  <g fill="${INK}" stroke="${INK}" stroke-width="0">${relief}</g>
</svg>`;
}
