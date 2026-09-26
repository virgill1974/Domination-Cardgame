// Erzeugt die Design-Grafiken im Stil von Helge Vogt aus seinen Entwürfen (domination_gfx/, nicht im Repo).
// Aufruf: npm run gfx  → schreibt nach public/ui/factions/<fraktion>/ und public/ui/helge/ (werden committet).
//
// Alle drei Fraktionsvorlagen haben dieselbe Rahmenstruktur (Tarnmuster, Dellen, Bolzen, Fasen, Platte),
// nur anders eingefärbt. Deshalb wird Scaretech aus der Starwing-Vorlage umgefärbt (Farbtabelle aus
// Scaretechs Vorlage gelernt), BIOTEC (organisch-grün) und Gunmetal (neutral) werden daraus generiert.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { readPsd } from './psd.mjs';

const SRC = 'domination_gfx/Helge';
const OUT = 'public/ui';
const W = 652;
const H = 899;
// Geometrie der Karte (Pixel bei 652×899)
const G = {
  frame: { x0: 28, y0: 28, x1: 624, y1: 725 },
  win: { x0: 67, y0: 122, x1: 579, y1: 421 },
  rim: { x0: 48, y0: 101, x1: 601, y1: 440 },
  plate: { x0: 39, y0: 457, x1: 600, y1: 703 },
  header: { x0: 28, y0: 28, x1: 340, y1: 112 },
  foot: { y0: 725, y1: 873 },
};
const inRect = (r, x, y) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;

// ---------- Bild-Helfer ----------
const img = (w, h) => ({ width: w, height: h, data: Buffer.alloc(w * h * 4) });
const px = (im, x, y) => (y * im.width + x) * 4;
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const toSharp = (im) => sharp(im.data, { raw: { width: im.width, height: im.height, channels: 4 } });
async function fromFile(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data };
}
function crop(im, x0, y0, w, h) {
  const out = img(w, h);
  for (let y = 0; y < h; y++) im.data.copy(out.data, y * w * 4, px(im, x0, y0 + y), px(im, x0 + w, y0 + y));
  return out;
}
function save(im, path, opts = {}) {
  const s = toSharp(im);
  return (path.endsWith('.png') ? s.png({ compressionLevel: 9 }) : s.webp({ quality: opts.quality ?? 82, alphaQuality: 90 })).toFile(path);
}

// ---------- Farbtabellen (Helligkeit der Starwing-Vorlage → Farbe) ----------
/** Lernt je Helligkeitsstufe der Quelle die mittlere Zielfarbe (getrennt für Platte und Rahmen). */
function learnLut(src, dst, sample) {
  const acc = { plate: new Float64Array(256 * 4), frame: new Float64Array(256 * 4) };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cls = sample(x, y);
    if (!cls) continue;
    const i = px(src, x, y);
    const l = Math.round(lum(src.data, i));
    const a = acc[cls];
    a[l * 4] += dst.data[i]; a[l * 4 + 1] += dst.data[i + 1]; a[l * 4 + 2] += dst.data[i + 2]; a[l * 4 + 3]++;
  }
  const finish = (a) => {
    const lut = [];
    for (let l = 0; l < 256; l++) lut.push(a[l * 4 + 3] > 3 ? [a[l * 4] / a[l * 4 + 3], a[l * 4 + 1] / a[l * 4 + 3], a[l * 4 + 2] / a[l * 4 + 3]] : null);
    // Lücken linear füllen, Ränder fortsetzen
    const known = lut.map((c, l) => (c ? l : -1)).filter((l) => l >= 0);
    for (let l = 0; l < 256; l++) {
      if (lut[l]) continue;
      const lo = known.filter((k) => k < l).at(-1);
      const hi = known.find((k) => k > l);
      if (lo === undefined) lut[l] = [...lut[hi]];
      else if (hi === undefined) lut[l] = [...lut[lo]];
      else { const t = (l - lo) / (hi - lo); lut[l] = lut[lo].map((v, k) => v + (lut[hi][k] - v) * t); }
    }
    // glätten
    return lut.map((_, l) => {
      const s = [0, 0, 0]; let n = 0;
      for (let k = Math.max(0, l - 3); k <= Math.min(255, l + 3); k++) { s[0] += lut[k][0]; s[1] += lut[k][1]; s[2] += lut[k][2]; n++; }
      return s.map((v) => v / n);
    });
  };
  return { plate: finish(acc.plate), frame: finish(acc.frame) };
}

/** Färbt ein Bild mit Tabellen um (Platte innerhalb von G.plate, sonst Rahmen). */
function applyLut(src, lut, isPlate = (x, y) => inRect(G.plate, x, y)) {
  const out = img(src.width, src.height);
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    const i = px(src, x, y);
    const c = (isPlate(x, y) ? lut.plate : lut.frame)[Math.round(lum(src.data, i))];
    out.data[i] = c[0]; out.data[i + 1] = c[1]; out.data[i + 2] = c[2]; out.data[i + 3] = src.data[i + 3];
  }
  return out;
}

// HSL-Umrechnung für generierte Paletten
function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl2rgb([h, s, l]) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
/** Neue Palette aus einer gelernten: Helligkeit bleibt, Farbton/Sättigung werden gesetzt. */
const recolor = (lut, { hue, sat, light = 1, lift = 0 }) =>
  lut.map((c) => { const [, , l] = rgb2hsl(c); return hsl2rgb([hue, sat, Math.min(1, l * light + lift)]); });

// ---------- Rauschen für BIOTEC (Zellgewebe) ----------
function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Worley-Rauschen, optional kachelbar (period in Zellen). Liefert F2-F1 (Zellgrenzen ≈ 0). */
function worley(x, y, cell, seed, period = 0) {
  const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
  let f1 = 1e9, f2 = 1e9;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    let gx = cx + i, gy = cy + j;
    const hx = period ? ((gx % period) + period) % period : gx;
    const hy = period ? ((gy % period) + period) % period : gy;
    const fx = (gx + 0.15 + 0.7 * hash(hx, hy, seed)) * cell;
    const fy = (gy + 0.15 + 0.7 * hash(hx, hy, seed + 7)) * cell;
    const d = Math.hypot(x - fx, y - fy);
    if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
  }
  return { f1: f1 / cell, edge: (f2 - f1) / cell };
}
/** Organische Überlagerung: dunkle Adern an Zellgrenzen, leicht gewölbte Zellen, grünliches Leuchten. */
function organic(im, mask, period = 0) {
  for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) {
    if (!mask(x, y)) continue;
    const a = worley(x, y, 46, 11, period ? period / 46 : 0);
    const b = worley(x, y, 17, 23, period ? period / 17 : 0);
    const vein = Math.exp(-a.edge * 14) * 0.55 + Math.exp(-b.edge * 10) * 0.18;
    const dome = 1.08 - a.f1 * 0.28;
    const i = px(im, x, y);
    for (let k = 0; k < 3; k++) {
      const glow = k === 1 ? 26 : k === 0 ? 10 : 0;
      im.data[i + k] = Math.max(0, Math.min(255, im.data[i + k] * dome * (1 - vein) + glow * Math.exp(-a.edge * 30)));
    }
  }
}

// ---------- Kachel für den App-Hintergrund (Patch-Synthese, nahtlos) ----------
function quiltTile(src, size, sources, seed = 1) {
  const P = 64, STEP = 40;
  const acc = new Float64Array(size * size * 4);
  let r = seed;
  const rnd = () => ((r = Math.imul(r ^ (r >>> 15), 2246822507) + 0x9e3779b9 | 0) >>> 0) / 4294967296;
  const feather = (t) => Math.sin(Math.PI * (t + 0.5) / P) ** 2;
  for (let pass = 0; pass < 2; pass++) for (let ty = 0; ty < size; ty += STEP) for (let tx = 0; tx < size; tx += STEP) {
    const s = sources[Math.floor(rnd() * sources.length)];
    const sx = s.x0 + Math.floor(rnd() * (s.x1 - s.x0 - P));
    const sy = s.y0 + Math.floor(rnd() * (s.y1 - s.y0 - P));
    const ox = tx + Math.floor(rnd() * 12) + pass * 20, oy = ty + Math.floor(rnd() * 12) + pass * 20;
    const flip = rnd() < 0.5;
    for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) {
      const wgt = feather(x) * feather(y) + 1e-4;
      const si = px(src, flip ? sx + P - 1 - x : sx + x, sy + y);
      const di = (((oy + y) % size) * size + ((ox + x) % size)) * 4;
      acc[di] += src.data[si] * wgt; acc[di + 1] += src.data[si + 1] * wgt; acc[di + 2] += src.data[si + 2] * wgt; acc[di + 3] += wgt;
    }
  }
  const out = img(size, size);
  for (let i = 0; i < size * size; i++) {
    const w = acc[i * 4 + 3] || 1;
    out.data[i * 4] = acc[i * 4] / w; out.data[i * 4 + 1] = acc[i * 4 + 1] / w; out.data[i * 4 + 2] = acc[i * 4 + 2] / w; out.data[i * 4 + 3] = 255;
  }
  return out;
}

// ---------- Kartenbausteine ----------
/** Karte ohne fremdes Fensterbild: Fenster schwarz, Barcode-Streifen weiß. */
function cleanCard(im) {
  const out = { ...im, data: Buffer.from(im.data) };
  for (let y = G.win.y0; y < G.win.y1; y++) for (let x = G.win.x0; x < G.win.x1; x++) {
    const i = px(out, x, y); out.data[i] = 6; out.data[i + 1] = 8; out.data[i + 2] = 10;
  }
  for (let y = G.foot.y0; y < G.foot.y1; y++) for (let x = G.frame.x0; x < G.frame.x1; x++) {
    const i = px(out, x, y); out.data[i] = out.data[i + 1] = out.data[i + 2] = 255;
  }
  return out;
}
/** Kurze Karte für die App: ohne Barcode-Streifen, unterer Rand direkt anschließend. */
function shortCard(card) {
  const top = G.foot.y0, bottom = H - G.foot.y1;
  const out = img(W, top + bottom);
  card.data.copy(out.data, 0, 0, px(card, 0, top));
  card.data.copy(out.data, px(out, 0, top), px(card, 0, G.foot.y1));
  return out;
}
/** Fasenrahmen des Bildfensters mit transparenter Mitte (9-Slice für Panels). */
function rim(card) {
  const r = G.rim;
  const out = crop(card, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
  const inner = { x0: G.win.x0 - r.x0, y0: G.win.y0 - r.y0, x1: G.win.x1 - r.x0, y1: G.win.y1 - r.y0 };
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) if (inRect(inner, x, y)) out.data[px(out, x, y) + 3] = 0;
  return out;
}
/** Platten-Ausschnitt ohne die abgeschlagenen Kanten. */
const plateCrop = (card) => crop(card, G.plate.x0 + 12, G.plate.y0 + 12, G.plate.x1 - G.plate.x0 - 24, G.plate.y1 - G.plate.y0 - 24);

/** Weiße Maske aus einem Bereich: dark = dunkle Formen (Werte-Symbole), sonst helle (Emblem im Oval). */
function mask(im, r, dark) {
  const out = img(r.x1 - r.x0, r.y1 - r.y0);
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  for (let y = r.y0; y < r.y1; y++) for (let x = r.x0; x < r.x1; x++) {
    const l = lum(im.data, px(im, x, y));
    const a = dark ? Math.max(0, Math.min(1, (95 - l) / 45)) : Math.max(0, Math.min(1, (l - 110) / 90));
    const o = px(out, x - r.x0, y - r.y0);
    out.data[o] = out.data[o + 1] = out.data[o + 2] = 255; out.data[o + 3] = a * 255;
    if (a > 0.5) { minX = Math.min(minX, x - r.x0); maxX = Math.max(maxX, x - r.x0); minY = Math.min(minY, y - r.y0); maxY = Math.max(maxY, y - r.y0); }
  }
  // quadratisch um die Form zuschneiden
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, half = Math.ceil(Math.max(maxX - minX, maxY - minY) / 2) + 2;
  const sq = img(half * 2, half * 2);
  for (let y = 0; y < half * 2; y++) for (let x = 0; x < half * 2; x++) {
    const sx = Math.round(cx - half + x), sy = Math.round(cy - half + y);
    if (sx < 0 || sy < 0 || sx >= out.width || sy >= out.height) continue;
    out.data.copy(sq.data, px(sq, x, y), px(out, sx, sy), px(out, sx, sy) + 4);
  }
  return sq;
}

// ---------- BIOTEC-Emblem (generiert, im flachen Stil der Rückseiten) ----------
function biotecBackSvg() {
  const rays = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2 + (i % 2) * 0.05;
    const len = 330 + (i % 3) * 60;
    return `<path d="M300 380 L${300 + Math.cos(a - 0.03) * len} ${380 + Math.sin(a - 0.03) * len} L${300 + Math.cos(a + 0.03) * len} ${380 + Math.sin(a + 0.03) * len}Z" fill="url(#ray)" opacity="${0.25 + (i % 4) * 0.08}"/>`;
  }).join('');
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const spores = Array.from({ length: 70 }, () => {
    const a = rnd() * Math.PI * 2, d = 120 + rnd() * 300;
    return `<circle cx="${300 + Math.cos(a) * d}" cy="${380 + Math.sin(a) * d * 1.1}" r="${1 + rnd() * 4}" fill="#d9ff9a" opacity="${0.3 + rnd() * 0.6}"/>`;
  }).join('');
  // Doppelhelix: zwei Stränge, Sprossen und Zellkugeln an den Knoten
  const strand = (sign) => Array.from({ length: 121 }, (_, i) => {
    const t = i / 120, y = 160 + t * 440, p = t * 12 * 0.62;
    return `${i ? 'L' : 'M'}${(300 + sign * Math.sin(p) * 88).toFixed(1)} ${y.toFixed(1)}`;
  }).join('');
  const nodes = Array.from({ length: 13 }, (_, i) => {
    const y = 175 + i * 34, p = i * 0.62 + 0.13;
    const x1 = 300 + Math.sin(p) * 88, x2 = 300 - Math.sin(p) * 88;
    const z1 = Math.cos(p) > 0, r1 = 15 + Math.cos(p) * 5, r2 = 15 - Math.cos(p) * 5;
    const bar = `<path d="M${x1} ${y}L${x2} ${y}" stroke="#bfe98a" stroke-width="8" stroke-linecap="round" opacity=".75"/>`;
    const c1 = `<circle cx="${x1}" cy="${y}" r="${r1}" fill="url(#cell)" stroke="#0c2008" stroke-width="3"/>`;
    const c2 = `<circle cx="${x2}" cy="${y}" r="${r2}" fill="url(#cell)" stroke="#0c2008" stroke-width="3"/>`;
    return bar + (z1 ? c2 + c1 : c1 + c2);
  }).join('');
  const helix = `<path d="${strand(1)}" fill="none" stroke="#0c2008" stroke-width="20" stroke-linecap="round"/><path d="${strand(-1)}" fill="none" stroke="#0c2008" stroke-width="20" stroke-linecap="round"/>`
    + `<path d="${strand(1)}" fill="none" stroke="#9fdc5c" stroke-width="13" stroke-linecap="round"/><path d="${strand(-1)}" fill="none" stroke="#7fc03f" stroke-width="13" stroke-linecap="round"/>`
    + nodes;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
<defs>
<radialGradient id="bg" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#2f6b14"/><stop offset=".45" stop-color="#11300a"/><stop offset="1" stop-color="#040a03"/></radialGradient>
<linearGradient id="ray" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8ff6a" stop-opacity=".9"/><stop offset="1" stop-color="#b8ff6a" stop-opacity="0"/></linearGradient>
<radialGradient id="cell" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f4ffe0"/><stop offset=".45" stop-color="#a6e85a"/><stop offset="1" stop-color="#3d7a18"/></radialGradient>
<radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#eaffb0" stop-opacity=".95"/><stop offset=".4" stop-color="#9be05a" stop-opacity=".45"/><stop offset="1" stop-color="#9be05a" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="600" height="760" fill="url(#bg)"/>${rays}
<ellipse cx="300" cy="380" rx="230" ry="260" fill="url(#core)"/>${spores}
<g filter="url(#glow)">${helix}</g>
</svg>`;
}

// ---------- Ablauf ----------
async function main() {
  const wings = readPsd(`${SRC}/KartenVorderseite/Vorderseite_Wings.psd`);
  const flash = readPsd(`${SRC}/KartenVorderseite/Vorderseite_Flash.psd`);
  const sctUnits = readPsd(`${SRC}/Karten Scaretech/Template_Scaretech_Einheiten.psd`);
  const sctPlanets = readPsd(`${SRC}/Karten Scaretech/Template_Scaretech_Planeten.psd`);
  const sctUpgrades = readPsd(`${SRC}/Karten Scaretech/Template_Scaretech_Upgrades.psd`);

  // Scaretech-Farbtabelle lernen: Text, Symbole, Emblem, Fenster und die Trennrille der Vorlage auslassen
  const dark = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (lum(sctUnits.data, px(sctUnits, x, y)) < 95) dark[y * W + x] = 1;
  const nearDark = (x, y) => {
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < W && yy < H && dark[yy * W + xx]) return true; }
    return false;
  };
  const sample = (x, y) => {
    if (!inRect(G.frame, x, y) || inRect(G.header, x, y)) return null;
    if (inRect({ x0: G.win.x0 - 2, y0: G.win.y0 - 2, x1: G.win.x1 + 2, y1: G.win.y1 + 2 }, x, y)) return null;
    if (inRect(G.plate, x, y)) return x > 280 && x < 315 ? null : nearDark(x, y) ? null : 'plate';
    return 'frame';
  };
  const sctLut = learnLut(wings, sctUnits, sample);
  const wingLut = learnLut(wings, wings, sample);
  const flashLut = learnLut(wings, flash, sample);

  // Kontrolle: Lightforce aus Starwing nachgebaut (Vorschau), Abweichung zur echten Vorlage
  const check = applyLut(wings, flashLut);
  let err = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (sample(x, y)) { const i = px(check, x, y); err += Math.abs(check.data[i] - flash.data[i]) + Math.abs(check.data[i + 1] - flash.data[i + 1]) + Math.abs(check.data[i + 2] - flash.data[i + 2]); n++; }
  console.log(`Kontrolle Lightforce aus Starwing: mittlere Abweichung ${(err / n / 3).toFixed(1)} von 255`);

  const factions = {
    starwing: { card: wings, lut: wingLut },
    lightforce: { card: flash, lut: flashLut },
    scaretech: { card: applyLut(wings, sctLut), lut: sctLut },
    biotec: {
      lut: {
        frame: recolor(sctLut.frame, { hue: 112, sat: 0.42, light: 0.95 }),
        plate: recolor(sctLut.plate, { hue: 88, sat: 0.62, light: 1.02, lift: 0.04 }),
      },
      organic: true,
    },
    neutral: {
      lut: {
        frame: recolor(wingLut.frame, { hue: 212, sat: 0.1, light: 0.95 }),
        plate: recolor(wingLut.plate, { hue: 214, sat: 0.08, light: 0.9 }),
      },
    },
  };
  for (const f of ['biotec', 'neutral']) {
    factions[f].card = applyLut(wings, factions[f].lut);
    if (factions[f].organic) organic(factions[f].card, (x, y) => inRect(G.frame, x, y) && !inRect(G.plate, x, y) && !inRect(G.rim, x, y));
  }

  // Quellbereiche für die Kachel: Rahmenstreifen ohne Fenster/Platte
  const tileSources = [
    { x0: 30, y0: 30, x1: 620, y1: 100 },
    { x0: 30, y0: 104, x1: 50, y1: 440 },
    { x0: 30, y0: 700, x1: 620, y1: 725 },
  ].filter((s) => s.x1 - s.x0 > 64 && s.y1 - s.y0 > 64);
  const baseTile = quiltTile(wings, 512, tileSources, 7);

  for (const [name, f] of Object.entries(factions)) {
    const dir = `${OUT}/factions/${name}`;
    mkdirSync(dir, { recursive: true });
    const card = cleanCard(f.card);
    await save(card, `${dir}/card.webp`);
    await save(shortCard(card), `${dir}/card-short.webp`);
    await save(rim(card), `${dir}/rim.webp`, { quality: 88 });
    await save(plateCrop(card), `${dir}/plate.webp`);
    let tile = name === 'starwing' ? baseTile : applyLut(baseTile, f.lut, () => false);
    if (f.organic) { tile = { ...tile, data: Buffer.from(tile.data) }; organic(tile, () => true, 512); }
    await save(tile, `${dir}/tile.webp`, { quality: 78 });
    console.log(`${name}: card, card-short, rim, plate, tile`);
  }

  // Rückseiten-Motive als Fraktionsembleme
  const back = (file) => `${OUT}/factions/${file}/back.webp`;
  const printEmblem = async (psd, out, box) => {
    const p = readPsd(psd);
    await toSharp(p).extract({ left: Math.round(box[0] * p.width), top: Math.round(box[1] * p.height), width: Math.round(box[2] * p.width), height: Math.round(box[3] * p.height) })
      .resize({ width: 600 }).webp({ quality: 80 }).toFile(out);
  };
  await printEmblem(`${SRC}/KartenVorderseite/PRINT_Flügel_05.psd`, back('starwing'), [0.08, 0.02, 0.84, 0.78]);
  await printEmblem(`${SRC}/KartenVorderseite/PRINT_Flash_03.psd`, back('lightforce'), [0.08, 0.1, 0.84, 0.78]);
  await sharp(`${SRC}/Karten Scaretech/Demo/Scaretech-Rückseite-Planet.jpg`).extract({ left: 60, top: 70, width: 532, height: 630 })
    .resize({ width: 600 }).webp({ quality: 80 }).toFile(back('scaretech'));
  await sharp(Buffer.from(biotecBackSvg())).webp({ quality: 82 }).toFile(back('biotec'));
  console.log('Rückseiten-Embleme');

  // Symbole (weiße Masken): Werte aus der Scaretech-Einheitenvorlage, Embleme aus den drei Vorlagen
  const icons = `${OUT}/helge`;
  mkdirSync(icons, { recursive: true });
  const rows = [['cost', 492], ['time', 536], ['def', 580], ['off', 622], ['dmg', 666]];
  for (const [name, cy] of rows) await save(mask(sctUnits, { x0: 78, y0: cy - 22, x1: 138, y1: cy + 22 }, true), `${icons}/icon-${name}.png`);
  const oval = { x0: 40, y0: 36, x1: 142, y1: 104 };
  await save(mask(sctPlanets, oval, false), `${icons}/emblem-planet.png`);
  await save(mask(sctUnits, oval, false), `${icons}/emblem-ship.png`);
  await save(mask(sctUpgrades, oval, false), `${icons}/emblem-gear.png`);
  console.log('Symbole');
}

await main();
