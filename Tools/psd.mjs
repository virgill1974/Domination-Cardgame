// Minimaler PSD-Leser: liefert nur das zusammengesetzte Bild (Composite) als RGB(A)-Rohdaten.
// Helges Vorlagen sind flach gespeichert (keine Ebenen), 8 Bit, RGB, RLE (PackBits) oder unkomprimiert.
import { readFileSync } from 'node:fs';

export function readPsd(path) {
  const b = readFileSync(path);
  if (b.toString('latin1', 0, 4) !== '8BPS') throw new Error(`${path}: keine PSD-Datei`);
  const version = b.readUInt16BE(4);
  const channels = b.readUInt16BE(12);
  const height = b.readUInt32BE(14);
  const width = b.readUInt32BE(18);
  const depth = b.readUInt16BE(22);
  const mode = b.readUInt16BE(24);
  if (depth !== 8 || mode !== 3) throw new Error(`${path}: nur 8-Bit-RGB unterstützt (depth ${depth}, mode ${mode})`);
  let o = 26;
  o += 4 + b.readUInt32BE(o); // Farbmodus-Daten
  o += 4 + b.readUInt32BE(o); // Bildressourcen
  o += version === 2 ? 8 + Number(b.readBigUInt64BE(o)) : 4 + b.readUInt32BE(o); // Ebenen + Masken
  const compression = b.readUInt16BE(o);
  o += 2;
  const n = Math.min(channels, 4);
  const planes = [];
  if (compression === 1) {
    const counts = [];
    for (let i = 0; i < channels * height; i++) {
      counts.push(version === 2 ? b.readUInt32BE(o) : b.readUInt16BE(o));
      o += version === 2 ? 4 : 2;
    }
    for (let c = 0; c < channels; c++) {
      const plane = Buffer.alloc(width * height);
      let pos = 0;
      for (let y = 0; y < height; y++) {
        const end = o + counts[c * height + y];
        while (o < end) {
          const len = b.readInt8(o++);
          if (len >= 0) { b.copy(plane, pos, o, o + len + 1); o += len + 1; pos += len + 1; }
          else if (len !== -128) { plane.fill(b[o], pos, pos + 1 - len); pos += 1 - len; o++; }
        }
      }
      if (c < n) planes.push(plane);
    }
  } else if (compression === 0) {
    for (let c = 0; c < n; c++) { planes.push(b.subarray(o, o + width * height)); o += width * height; }
  } else {
    throw new Error(`${path}: Kompression ${compression} nicht unterstützt`);
  }
  // Interleaved RGBA (fehlender Alphakanal = deckend)
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = planes[0][i];
    data[i * 4 + 1] = planes[1][i];
    data[i * 4 + 2] = planes[2][i];
    data[i * 4 + 3] = planes[3] ? planes[3][i] : 255;
  }
  return { width, height, data };
}
