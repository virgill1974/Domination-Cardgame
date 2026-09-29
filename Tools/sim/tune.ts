// Optimierer: einfache Evolutionsstrategie mit Ko-Evolution. Jede Fraktion sucht Einstellungen, die gegen die
// aktuell besten Einstellungen der anderen Fraktionen am häufigsten gewinnen (2er- und 4er-Partien, je Siegpunkt-Einstellung).
import type { Faction } from '../../src/engine/data';
import { mulberry32 } from '../../src/engine/testutil';
import type { Rng } from '../../src/engine/state';
import { seatings, type JobSpec, type Pool } from './jobs';
import { PARAM_KEYS, PARAM_RANGES, clampParams, type BotParams } from './params';

export interface TuneOptions {
  generations: number;
  /** Mutanten je Fraktion und Generation */
  lambda: number;
  seed: number;
  /** Partien je 2er-Sitzordnung (6 je Fraktion) */
  games2?: number;
  /** Partien je 4er-Sitzordnung (24) */
  games4?: number;
  /** Anfangsschrittweite als Anteil des Wertebereichs */
  sigma?: number;
  /** Siegpunkt-Einstellung der Testpartien (null = ∞), Standard 30 */
  vpLimit?: number | null;
}

export interface TuneStep {
  gen: number;
  sigma: number;
  /** Fitness (1 = faire Siegquote) des bisher Besten und des besten Mutanten je Fraktion */
  parent: number[];
  best: number[];
  accepted: boolean[];
}

export interface TuneResult {
  start: Record<Faction, BotParams>;
  best: Record<Faction, BotParams>;
  history: TuneStep[];
  /** Fitness der Endeinstellungen in der letzten Generation */
  fitness: number[];
}

function gauss(rng: Rng): number {
  const u = Math.max(1e-12, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function mutate(p: BotParams, sigma: number, rng: Rng): BotParams {
  const out = { ...p };
  for (const k of PARAM_KEYS) {
    if (rng() < 0.6) {
      const [lo, hi] = PARAM_RANGES[k];
      out[k] += gauss(rng) * sigma * (hi - lo);
    }
  }
  return clampParams(out);
}

const FACTIONS: Faction[] = [0, 1, 2, 3];

export async function tune(pool: Pool, start: Record<Faction, BotParams>, opts: TuneOptions): Promise<TuneResult> {
  const rng = mulberry32(opts.seed);
  const current = structuredClone(start);
  const g2 = opts.games2 ?? 50;
  // Zu zweit gibt es keine 30-SP-Partien: dann zählen 3er-Partien als „kleine“ Besetzung
  const small = (opts.vpLimit === undefined ? 30 : opts.vpLimit) === 30 ? 3 : 2;
  const g4 = opts.games4 ?? 10;
  const history: TuneStep[] = [];
  let lastFitness = [1, 1, 1, 1];
  for (let gen = 0; gen < opts.generations; gen++) {
    const sigma = (opts.sigma ?? 0.18) * Math.pow(0.9, gen);
    const cands = FACTIONS.map((f) => [current[f], ...Array.from({ length: opts.lambda }, () => mutate(current[f], sigma, rng))]);
    const specs: JobSpec[] = [];
    for (const f of FACTIONS) {
      cands[f].forEach((cand, ci) => {
        // Gleiche Seeds für alle Kandidaten einer Fraktion: Unterschiede kommen von den Einstellungen, nicht vom Würfel
        for (const seats of seatings(small).filter((s) => s.includes(f))) {
          specs.push({
            key: `${f}|${ci}|2`, seats, bots: seats.map((x) => (x === f ? cand : current[x])), vpLimit: opts.vpLimit === undefined ? 30 : opts.vpLimit,
            seed: (opts.seed * 1_000_003 + gen * 7919 + seats[0] * 101 + seats[1] * 13) >>> 0, games: g2, details: false,
          });
        }
        for (const seats of seatings(4)) {
          specs.push({
            key: `${f}|${ci}|4`, seats, bots: seats.map((x) => (x === f ? cand : current[x])), vpLimit: opts.vpLimit === undefined ? 30 : opts.vpLimit,
            seed: (opts.seed * 2_000_003 + gen * 104729 + seats.join('').split('').reduce((h, c) => h * 7 + Number(c), 0)) >>> 0,
            games: g4, details: false,
          });
        }
      });
    }
    const t0 = Date.now();
    const res = await pool.run(specs);
    const fit = (f: Faction, ci: number) => {
      const two = res.get(`${f}|${ci}|2`)!.factions[f];
      const four = res.get(`${f}|${ci}|4`)!.factions[f];
      return 0.5 * (two.wins / two.games) * small + 0.5 * (four.wins / four.games / 0.25);
    };
    const step: TuneStep = { gen, sigma, parent: [], best: [], accepted: [] };
    for (const f of FACTIONS) {
      const parent = fit(f, 0);
      let bi = 0;
      let bf = parent;
      for (let ci = 1; ci < cands[f].length; ci++) {
        const v = fit(f, ci);
        if (v > bf) {
          bf = v;
          bi = ci;
        }
      }
      step.parent.push(parent);
      step.best.push(bf);
      step.accepted.push(bi > 0);
      current[f] = cands[f][bi];
      lastFitness[f] = bf;
    }
    history.push(step);
    console.log(`Generation ${gen + 1}/${opts.generations} (${((Date.now() - t0) / 1000).toFixed(0)} s): `
      + FACTIONS.map((f) => `${step.parent[f].toFixed(2)}→${step.best[f].toFixed(2)}${step.accepted[f] ? '*' : ''}`).join('  '));
  }
  lastFitness = lastFitness.map((v) => Math.round(v * 1000) / 1000);
  return { start, best: current, history, fitness: lastFitness };
}
