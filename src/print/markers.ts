// Siegmarker „Beste Streitmacht“ und „Bester Stützpunkt“ als goldene Münzen (Kartendrucker und Anleitung).
// Helges Kartenaufbau in Gold: schwarzer Rand, Metallring aus der Rahmentextur, verwitterte Platte in der Mitte,
// schwarzes Oval mit dem Kartenart-Emblem wie oben links auf den Karten. Texturen: Tools/gold-textures.mjs.
// Vorder- und Rückseite sind gleich.
import { MEDAL_MIN_BUILDINGS, MEDAL_MIN_STARS, MEDAL_POINTS } from '../engine/data';
import { KIND_EMBLEM, helgeIcon, uiAsset } from '../ui/assets';

export type MarkerKind = 'army' | 'base';

const INK = '#3a2606';
const CREAM = '#fff3cf';

const MARKERS: Record<MarkerKind, { title: string; min: number; what: string; emblem: string }> = {
  army: { title: 'BESTE STREITMACHT', min: MEDAL_MIN_STARS, what: 'STERNEN', emblem: KIND_EMBLEM.unit },
  base: { title: 'BESTER STÜTZPUNKT', min: MEDAL_MIN_BUILDINGS, what: 'PLANETEN', emblem: KIND_EMBLEM.building },
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

/** Positionen der Zählsymbole im flachen Bogen über dem Oval: so viele braucht man mindestens */
const countRow = (n: number) => Array.from({ length: n }, (_, i) => {
  const t = i - (n - 1) / 2;
  return [r2(100 + t * 14), r2(52 + t * t * 1.3)] as const;
});

/** Lichtkante wie Helges Fasen: oben links hell, unten rechts dunkel (erhaben) bzw. umgekehrt (vertieft) */
const bevelGrad = (id: string, raised: boolean) => {
  const [a, b] = raised ? ['rgba(255,247,214,.95)', 'rgba(20,10,0,.75)'] : ['rgba(20,10,0,.75)', 'rgba(255,247,214,.9)'];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset=".1" stop-color="${a}"/><stop offset=".5" stop-color="rgba(0,0,0,0)"/><stop offset=".9" stop-color="${b}"/></linearGradient>`;
};

let uid = 0;

/** Münze Ø 50 mm (viewBox 200 = 50 mm). base ist das Präfix zu public/ (Seiten unter Tools/: '../') */
export function markerSvg(kind: MarkerKind, size = '50mm', base = '../'): string {
  const m = MARKERS[kind];
  const id = `mk${kind}${uid++}`;
  const metal = uiAsset('gold/metal.jpg', base);
  const plate = uiAsset('gold/plate.jpg', base);
  const emblem = helgeIcon(m.emblem, base);
  // Umschrift: oben im Uhrzeigersinn (Buchstaben nach außen), unten gegen den Uhrzeigersinn (nach innen)
  const [tx1, ty1] = polar(80, 166);
  const [tx2, ty2] = polar(80, 14);
  const [bx1, by1] = polar(88.5, 142);
  const [bx2, by2] = polar(88.5, 38);
  const rimText = (path: string, text: string) =>
    `<text font-size="13.5" fill="#1a0f00" transform="translate(.9 1.2)"><textPath href="#${id}${path}" startOffset="50%">${text}</textPath></text>
    <text font-size="13.5" fill="${CREAM}"><textPath href="#${id}${path}" startOffset="50%">${text}</textPath></text>`;
  const icons = countRow(m.min).map(([x, y]) => kind === 'army'
    ? star(x, y, 5.6)
    : `<g transform="translate(${r2(x - 6)} ${r2(y - 6)}) scale(.12)"><rect width="100" height="100" mask="url(#${id}e)"/></g>`).join('');
  const relief = `${icons}
    <text x="100" y="132" font-family="Silkscreen, monospace" font-size="10" text-anchor="middle">AB ${m.min} ${m.what}</text>
    <text x="100" y="144" font-family="'Space Grotesk Variable', sans-serif" font-weight="700" font-size="9.5" text-anchor="middle">und die meisten</text>`;
  return `<svg class="coin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${m.title}">
  <defs>
    <clipPath id="${id}c"><circle cx="100" cy="100" r="97.5"/></clipPath>
    <clipPath id="${id}p"><circle cx="100" cy="100" r="70"/></clipPath>
    <mask id="${id}e" maskContentUnits="userSpaceOnUse"><image href="${emblem}" width="100" height="100"/></mask>
    <mask id="${id}o" maskContentUnits="userSpaceOnUse"><image href="${emblem}" x="77" y="71" width="46" height="46"/></mask>
    ${bevelGrad(`${id}hi`, true)}${bevelGrad(`${id}lo`, false)}
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".55" stop-color="#e2ac3c"/><stop offset="1" stop-color="#a86f14"/></linearGradient>
    <radialGradient id="${id}s" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="rgba(255,250,225,.45)"/><stop offset=".6" stop-color="rgba(255,250,225,0)"/><stop offset="1" stop-color="rgba(40,20,0,.3)"/></radialGradient>
    <path id="${id}t" d="M${tx1} ${ty1}A80 80 0 1 1 ${tx2} ${ty2}"/>
    <path id="${id}u" d="M${bx1} ${by1}A88.5 88.5 0 0 0 ${bx2} ${by2}"/>
  </defs>
  <circle cx="100" cy="100" r="100" fill="#000"/>
  <image href="${metal}" x="2.5" y="2.5" width="195" height="195" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}c)"/>
  <circle cx="100" cy="100" r="97.5" fill="url(#${id}s)"/>
  <circle cx="100" cy="100" r="96" fill="none" stroke="url(#${id}hi)" stroke-width="3"/>
  <g font-family="Silkscreen, monospace" text-anchor="middle">${rimText('t', m.title)}${rimText('u', `+${MEDAL_POINTS} SIEGPUNKTE`)}</g>
  ${[180, 0].map((deg) => { const [x, y] = polar(84, deg); return `<g fill="#1a0f00" transform="translate(.8 1)">${star(x, y, 4.6)}</g><g fill="${CREAM}">${star(x, y, 4.6)}</g>`; }).join('')}
  <circle cx="101.2" cy="102" r="72.5" fill="rgba(0,0,0,.55)"/>
  <circle cx="100" cy="100" r="72" fill="#120a00"/>
  <image href="${plate}" x="22" y="22" width="156" height="156" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}p)"/>
  <circle cx="100" cy="100" r="70" fill="url(#${id}s)" opacity=".45"/>
  <circle cx="100" cy="100" r="68.8" fill="none" stroke="url(#${id}hi)" stroke-width="2.4"/>
  <g fill="rgba(255,248,215,.85)" transform="translate(.7 .9)">${relief}</g>
  <g fill="${INK}">${relief}</g>
  <ellipse cx="100" cy="94" rx="30" ry="20.5" fill="#050505" stroke="url(#${id}lo)" stroke-width="1.6"/>
  <rect x="77" y="71" width="46" height="46" fill="url(#${id}g)" mask="url(#${id}o)"/>
</svg>`;
}
