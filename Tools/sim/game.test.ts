import { describe, expect, it } from 'vitest';
import type { Faction } from '../../src/engine/data';
import { give, mulberry32, started } from '../../src/engine/testutil';
import { newBoard, placePlanet, reveal } from './board';
import { executeAttack, newLog, type Ctx } from './bot';
import { playGame } from './game';
import { ARCHETYPES, ARCHETYPE_NAMES } from './params';

describe('Überlastung am Tisch', () => {
  it('eine gerettete Energiequelle wird verdeckt neu ausgelegt', () => {
    const s = started([0, 1]);
    give(s, 0, 13); // Ionenpulsar (Superwaffe, trifft immer, Schaden 4)
    give(s, 1, 43); // Elektronenmond (Energiequelle, Defensive 3)
    s.players[1].energy = 0; // fällt nach der Zerstörung unter 0
    const boards = [0, 1, 2, 3].map(newBoard);
    placePlanet(boards[0], 13, 3);
    placePlanet(boards[1], 43, 2);
    reveal(boards[1], 43);
    const ctx: Ctx = {
      s, boards, dice: mulberry32(1), rng: mulberry32(2), logs: [0, 1, 2, 3].map(newLog),
      placement: [0, 1, 2, 3].map(() => ARCHETYPES.ausgewogen),
    };
    const result = executeAttack(ctx, 13, 1, { type: 'planet', ean: 43 })!;
    expect(result.rescued).toEqual([43]);
    const spot = boards[1].planets.find((p) => p.ean === 43)!;
    expect(spot.revealed).toBe(false);
    expect(spot.row).toBe(3); // Energiequellen legt der Bot nach hinten
  });
});

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
