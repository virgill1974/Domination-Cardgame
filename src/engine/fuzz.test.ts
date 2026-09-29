import { describe, expect, it } from 'vitest';
import { PHYSICAL_CARDS, type Faction } from './data';
import { kindOfEan } from './cards';
import { currentFaction, newGame, ownedSlots, type GameState } from './state';
import { beginTurn } from './turn';
import { buy } from './buy';
import { attack } from './combat';
import { info, repair } from './actions';
import { endTurn, mainCheck } from './victory';
import { mulberry32 } from './testutil';

const GAMES = 300;

function assert(ok: boolean, what: string) {
  if (!ok) throw new Error(`Invariante verletzt: ${what}`);
}

function checkInvariants(s: GameState) {
  for (const p of s.players) {
    const slots = ownedSlots(p);
    const counted = slots.filter((slot) => slot.counted);
    const count = (kind: string) => counted.filter((slot) => kindOfEan(slot.ean) === kind).length;
    assert(p.buildings === count('building'), 'Gebäudezähler');
    assert(p.units === count('unit'), 'Einheitenzähler');
    assert(p.upgrades === count('upgrade'), 'Upgradezähler');
    assert(p.credits >= 0, 'Credits');
    assert(slots.every((slot) => slot.def >= 0 && slot.remaining >= 0), 'Kartenwerte');
    assert(new Set(slots.map((slot) => slot.ean)).size === slots.length, 'doppelte Karte');
  }
  assert(s.buys <= 3 && s.attacks <= 3 && s.repairs <= 1, 'Aktionszähler');
}

describe('Fuzz: zufällige Partien', () => {
  it('300 Partien laufen ohne Absturz und ohne inkonsistente Zähler', { timeout: 60_000 }, () => {
    let finished = 0;
    for (let game = 0; game < GAMES; game++) {
      const rng = mulberry32(game + 1);
      const pick = (n: number) => Math.floor(rng() * n);
      const factions = ([0, 1, 2, 3] as Faction[]).sort(() => rng() - 0.5).slice(0, 2 + pick(3));
      const s = newGame(factions, [30, 40, null][pick(3)]);
      for (let turn = 0; turn < 400 && s.winner === null; turn++) {
        if (beginTurn(s, rng).skipped) continue;
        for (let action = 0; action < 12 && s.winner === null; action++) {
          const ean = rng() < 0.9 ? currentFaction(s) * 40 + pick(40) : pick(PHYSICAL_CARDS);
          const r = rng();
          if (r < 0.45) buy(s, ean);
          else if (r < 0.85) attack(s, ean, pick(PHYSICAL_CARDS), rng);
          else if (r < 0.95) repair(s, ean);
          else info(s, ean);
          mainCheck(s);
          checkInvariants(s);
        }
        if (s.winner === null) endTurn(s);
      }
      if (s.winner !== null) finished++;
    }
    expect(finished).toBeGreaterThan(GAMES / 2);
  });
});
