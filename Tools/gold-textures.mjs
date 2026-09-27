// Goldvarianten von Helges Metall für die Siegmarker-Münzen (src/print/markers.ts):
// Die neutralen Gunmetal-Grafiken (public/ui/factions/neutral/) werden über eine Farbrampe eingefärbt.
// Aufruf: node Tools/gold-textures.mjs → public/ui/gold/{metal,plate}.jpg (JPEG, damit PDFs klein bleiben)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'public/ui/factions/neutral';
const OUT = 'public/ui/gold';
mkdirSync(OUT, { recursive: true });

// Helligkeit 0…1 → Gold, von tiefem Bronze bis zum hellen Glanz
const RAMP = [[0, [38, 22, 4]], [0.3, [112, 72, 16]], [0.55, [196, 140, 42]], [0.8, [240, 198, 96]], [1, [255, 244, 196]]];
const gold = (t) => {
  const i = Math.max(1, RAMP.findIndex(([p]) => p >= t));
  const [p0, c0] = RAMP[i - 1];
  const [p1, c1] = RAMP[i];
  const k = (t - p0) / (p1 - p0);
  return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
};

/** Graustufen, Kontrast auf lo…hi gestreckt, dann auf die Farbrampe gelegt */
async function recolor(file, out, lo, hi) {
  const { data, info } = await sharp(`${SRC}/${file}`).greyscale().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const t = Math.min(1, Math.max(0, lo + (data[i * info.channels] / 255) * (hi - lo)));
    px.set(gold(t), i * 3);
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } }).jpeg({ quality: 86 }).toFile(`${OUT}/${out}`);
}

// Kachel: Luminanz im Mittel 0,2 bei geringer Streuung, Platte 0,57. Kontrast strecken und in den Goldbereich legen (Mittel ≈ 0,45 bzw. 0,68)
await recolor('tile.webp', 'metal.jpg', -0.53, 4.47);
await recolor('plate.webp', 'plate.jpg', -0.81, 1.79);
console.log('Goldtexturen geschrieben');
