import { describe, expect, it } from 'vitest';
import { CARDS, CARD_OF_EAN, PHYSICAL_CARDS } from './data';
import { factionOfCardId, factionOfEan, kindOfCardId, kindOfEan } from './cards';
import { ean8Bars, ean8Modules, eanForIndex, indexFromEan } from './ean';

describe('Kartendaten', () => {
  it('hat 92 Kartentypen und 160 physische Karten', () => {
    expect(CARDS).toHaveLength(92);
    expect(CARD_OF_EAN).toHaveLength(PHYSICAL_CARDS);
  });

  it('ordnet jede physische Karte einem Typ derselben Fraktion und Art zu', () => {
    for (let ean = 0; ean < PHYSICAL_CARDS; ean++) {
      expect(factionOfCardId(CARD_OF_EAN[ean])).toBe(factionOfEan(ean));
      expect(kindOfCardId(CARD_OF_EAN[ean])).toBe(kindOfEan(ean));
    }
  });

  it('übernimmt Stichproben aus defaultkarten[]', () => {
    expect(CARDS[14]).toMatchObject({ name: 'Poseidons Fluch', price: 1200, rounds: 2, def: 4, off: 4, dmg: 3, requires: 5 });
    expect(CARDS[48]).toMatchObject({ name: 'Antimaterieminen', price: 1500, rounds: 3 });
    // 1500 statt 2000 (Balance-Anpassung, README „Abweichungen vom Original“ 11)
    expect(CARDS[3]).toMatchObject({ name: 'Handelssystem', price: 1500, rounds: 2 });
    expect(CARDS[77]).toMatchObject({ name: 'Wumms', price: 1500, def: 2, requires: 76 });
  });
});

describe('EAN-8', () => {
  it('kodiert und dekodiert alle 160 Karten', () => {
    for (let i = 0; i < PHYSICAL_CARDS; i++) {
      const code = eanForIndex(i);
      expect(code).toMatch(/^0000\d{4}$/);
      expect(indexFromEan(code)).toBe(i);
    }
  });

  it('berechnet die Prüfziffer nach GS1', () => {
    expect(eanForIndex(7)).toBe('00000079');
    expect(eanForIndex(159)).toBe('00001595');
  });

  it('lehnt fremde oder beschädigte Codes ab', () => {
    expect(indexFromEan('00000078')).toBeNull();
    expect(indexFromEan('12345670')).toBeNull();
    expect(indexFromEan(eanForIndex(160))).toBeNull();
    expect(indexFromEan('0000007')).toBeNull();
  });

  it('erzeugt 67 Module mit Guard-Pattern und zusammengefasste Balken', () => {
    const bits = ean8Modules(eanForIndex(42));
    expect(bits).toHaveLength(67);
    expect(bits.slice(0, 3)).toBe('101');
    expect(bits.slice(31, 36)).toBe('01010');
    expect(bits.slice(64)).toBe('101');
    const rebuilt = Array(67).fill('0');
    for (const [x, w] of ean8Bars(eanForIndex(42))) for (let k = 0; k < w; k++) rebuilt[x + k] = '1';
    expect(rebuilt.join('')).toBe(bits);
  });
});
