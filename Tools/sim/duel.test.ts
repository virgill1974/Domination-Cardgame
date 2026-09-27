import { describe, expect, it } from 'vitest';
import { CARDS, CARD_OF_EAN, type Faction } from '../../src/engine/data';
import { buy } from '../../src/engine/buy';
import { attack } from '../../src/engine/combat';
import type { GameState } from '../../src/engine/state';
import { give, mulberry32, started } from '../../src/engine/testutil';
import { UPGRADE_UNITS } from './bot';
import { planetAttack, unitDuel, type Fighter, type Outcome } from './duel';

const RUNS = 20_000;
const f = (def: number, off: number, dmg: number): Fighter => ({ def, off, dmg });

/** Monte-Carlo über die echte attack()-Funktion der Engine */
function simulate(template: GameState, att: number, def: number): Outcome {
  const rng = mulberry32(42);
  const o: Outcome = { attWin: 0, defWin: 0, both: 0, none: 0, attLeft: 0, defLeft: 0 };
  for (let i = 0; i < RUNS; i++) {
    const s = structuredClone(template);
    const { result, error } = attack(s, att, def, rng);
    if (error || !result) throw new Error(error);
    const a = result.destroyed.includes(att);
    const d = result.destroyed.includes(def);
    if (!a && d) o.attWin++;
    else if (a && !d) o.defWin++;
    else if (a && d) o.both++;
    else o.none++;
  }
  for (const k of ['attWin', 'defWin', 'both', 'none'] as const) o[k] /= RUNS;
  return o;
}

function expectClose(exact: Outcome, mc: Outcome) {
  for (const k of ['attWin', 'defWin', 'both', 'none'] as const) expect(Math.abs(exact[k] - mc[k])).toBeLessThan(0.015);
}

function setup(me: Faction, other: Faction, mine: number[], theirs: number[]): GameState {
  const s = started([me, other]);
  mine.forEach((ean) => give(s, me, ean));
  theirs.forEach((ean) => give(s, other, ean));
  s.players[me].credits = 10_000;
  return s;
}

describe('Gefechtswahrscheinlichkeiten stimmen mit der Engine überein', () => {
  it('Einheit gegen Einheit: Poseidons Fluch gegen Lichtkoloss', () => {
    const s = setup(0, 1, [28], [68]);
    expectClose(unitDuel(f(4, 4, 3), f(5, 5, 3)), simulate(s, 28, 68));
  });

  it('Einheit gegen Einheit: Fährtensucher gegen Sonnenfaust', () => {
    const s = setup(0, 1, [14], [60]);
    expectClose(unitDuel(f(1, 1, 1), f(3, 3, 1)), simulate(s, 14, 60));
  });

  it('Einweg-Einheit mit Defensive 0: Photonenhagel gegen Lichtfunke', () => {
    const s = setup(2, 1, [97], [54]);
    expectClose(unitDuel(f(0, 3, 2), f(1, 1, 1)), simulate(s, 97, 54));
  });

  it('Hyperraumschiff gegen Planet mit zwei Abwehrplaneten', () => {
    const s = setup(0, 1, [30], [48, 45, 46]);
    expectClose(planetAttack(f(3, 3, 1), f(4, 0, 0), { flak: 2 }), simulate(s, 30, 48));
  });

  it('Kampfschiff gegen Abwehrplanet, der zurückschießt', () => {
    const s = setup(0, 1, [20], [45]);
    expectClose(planetAttack(f(2, 2, 1), f(3, 2, 2), { shootsBack: true }), simulate(s, 20, 45));
  });

  it('Superwaffe trifft immer', () => {
    const s = setup(0, 1, [13], [48]);
    expectClose(planetAttack(f(4, 6, 4), f(4, 0, 0), { always: true }), simulate(s, 13, 48));
  });
});

describe('Upgrade-Tabelle des Bots entspricht der Engine', () => {
  const eanOf = (id: number) => CARD_OF_EAN.indexOf(id);
  const upgrades = CARDS.filter((c) => c.id % 23 >= 17).map((c) => c.id);

  it.each(upgrades)('Upgrade %i', (id) => {
    const faction = Math.floor(id / 23) as Faction;
    const s = started([faction, ((faction + 1) % 4) as Faction]);
    const req = CARDS[id].requires;
    if (!s.players[faction].slots.some((slot) => slot && CARD_OF_EAN[slot.ean] === req)) give(s, faction, eanOf(req));
    s.players[faction].credits = 10_000;
    const before = structuredClone(s.stats);
    expect(buy(s, eanOf(id)).error).toBeUndefined();
    const changed = s.stats.map((st, i) => (JSON.stringify(st) !== JSON.stringify(before[i]) ? i : -1)).filter((i) => i >= 0);
    expect(changed).toEqual(UPGRADE_UNITS[id] ?? []);
  });
});
