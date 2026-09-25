import { PHYSICAL_CARDS } from './data';

const PREFIX = '0000';

const L_CODE = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const R_CODE = L_CODE.map((bits) => bits.replace(/[01]/g, (b) => (b === '0' ? '1' : '0')));

export const EAN8_MODULES = 67;
export const EAN8_QUIET_ZONE = 7;

export function checkDigit(first7: string): number {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(first7[i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10;
}

export function eanForIndex(index: number): string {
  const first7 = PREFIX + String(index).padStart(3, '0');
  return first7 + checkDigit(first7);
}

/** Liefert den Kartenindex 0–159 oder null, wenn der Code nicht zu diesem Spiel gehört. */
export function indexFromEan(code: string): number | null {
  if (!/^\d{8}$/.test(code) || !code.startsWith(PREFIX)) return null;
  if (checkDigit(code.slice(0, 7)) !== Number(code[7])) return null;
  const index = Number(code.slice(4, 7));
  return index < PHYSICAL_CARDS ? index : null;
}

/** 67 Module (1 = Balken) ohne Ruhezone. */
export function ean8Modules(code: string): string {
  let bits = '101';
  for (let i = 0; i < 4; i++) bits += L_CODE[Number(code[i])];
  bits += '01010';
  for (let i = 4; i < 8; i++) bits += R_CODE[Number(code[i])];
  return bits + '101';
}

/** Zusammenhängende Balken als [Startmodul, Breite], damit beim Rendern keine Nähte entstehen. */
export function ean8Bars(code: string): Array<[number, number]> {
  const bits = ean8Modules(code);
  const bars: Array<[number, number]> = [];
  for (let i = 0; i < bits.length; ) {
    if (bits[i] === '1') {
      let j = i;
      while (j < bits.length && bits[j] === '1') j++;
      bars.push([i, j - i]);
      i = j;
    } else i++;
  }
  return bars;
}
