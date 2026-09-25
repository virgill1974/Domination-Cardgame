import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, it } from 'vitest';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';
import { PHYSICAL_CARDS } from './data';
import { EAN8_MODULES, EAN8_QUIET_ZONE, ean8Bars, eanForIndex } from './ean';

const require = createRequire(import.meta.url);

/** Rastert die Balken so, wie sie der Kartendrucker als SVG zeichnet (inkl. Ruhezone). */
function rasterize(code: string, px = 3, height = 60) {
  const modules = EAN8_MODULES + 2 * EAN8_QUIET_ZONE;
  const width = modules * px;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  for (const [x, w] of ean8Bars(code)) {
    for (let col = (x + EAN8_QUIET_ZONE) * px; col < (x + EAN8_QUIET_ZONE + w) * px; col++) {
      for (let row = 0; row < height; row++) {
        const i = (row * width + col) * 4;
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
  }
  return { data, width, height, colorSpace: 'srgb' as const };
}

describe('Barcodes lesbar mit ZXing', () => {
  beforeAll(() => {
    const wasm = readFileSync(require.resolve('zxing-wasm/reader/zxing_reader.wasm'));
    prepareZXingModule({ overrides: { wasmBinary: wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength) as ArrayBuffer } });
  });

  it('dekodiert alle 160 Karten als EAN-8', async () => {
    for (let i = 0; i < PHYSICAL_CARDS; i++) {
      const code = eanForIndex(i);
      const [result] = await readBarcodes(rasterize(code), { formats: ['EAN8'], tryHarder: false });
      expect(result?.text, `Karte ${i}`).toBe(code);
      expect(result.format).toBe('EAN8');
    }
  });
});
