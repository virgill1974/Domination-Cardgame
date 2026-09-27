import { describe, expect, it } from 'vitest';
import type { Faction } from '../../src/engine/data';
import { playGame } from './game';
import { ARCHETYPES, ARCHETYPE_NAMES } from './params';

describe('Simulierte Partien', () => {
  const cases: Array<[Faction[], number | null]> = [
    [[0, 1], 30], [[2, 3], 40], [[3, 0], null],
    [[1, 2, 3], 30], [[0, 2, 1], null],
    [[0, 1, 2, 3], 30], [[3, 2, 1, 0], 40],
  ];

  it.each(cases)('%j bis %s Siegpunkte: Spielfeld und Engine bleiben stimmig', (factions, vp) => {
    for (let seed = 1; seed <= 3; seed++) {
      const seats = factions.map((faction, i) => ({ faction, bot: ARCHETYPES[ARCHETYPE_NAMES[(i + seed) % 5]] }));
      const r = playGame({ seats, vpLimit: vp, seed, check: true });
      expect(r.rounds).toBeGreaterThan(0);
      if (r.winner !== null) expect(factions).toContain(r.winner);
    }
  });

  it('gleicher Seed, gleiche Partie', () => {
    const setup = { seats: [{ faction: 0 as Faction, bot: ARCHETYPES.blitz }, { faction: 2 as Faction, bot: ARCHETYPES.haendler }], vpLimit: 30, seed: 7 };
    expect(JSON.stringify(playGame(setup))).toBe(JSON.stringify(playGame(setup)));
  });

  it('der Strategie-Bot schlägt den Zufallsspieler deutlich', () => {
    let wins = 0;
    const games = 20;
    for (let seed = 0; seed < games; seed++) {
      const smart = (seed % 4) as Faction;
      const dumb = ((seed + 1) % 4) as Faction;
      const seats = seed % 2
        ? [{ faction: smart, bot: ARCHETYPES.ausgewogen }, { faction: dumb, bot: 'random' as const }]
        : [{ faction: dumb, bot: 'random' as const }, { faction: smart, bot: ARCHETYPES.ausgewogen }];
      if (playGame({ seats, vpLimit: 30, seed }).winner === smart) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(16);
  });
});
