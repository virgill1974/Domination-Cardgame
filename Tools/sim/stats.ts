// Zusammenfassung vieler Partien, so dass Worker-Ergebnisse addiert werden können.
import type { GameResult } from './game';

export interface FactionAgg {
  games: number;
  wins: number;
  /** Partien ohne Sieger, an denen die Fraktion beteiligt war */
  draws: number;
  seatGames: number[];
  seatWins: number[];
  seatDraws: number[];
  vp: number;
  buildings: number;
  upgrades: number;
  stars: number;
  bestBase: number;
  bestArmy: number;
  /** Summen nur über gewonnene Partien */
  winBuildings: number;
  winUpgrades: number;
  winStars: number;
  winMedals: number;
  winByHq: number;
  overloads: number;
  attacks: number;
  kills: number;
  losses: number;
  firstAttack: number;
  firstAttackGames: number;
  /** Kartentyp → [Partien mit Kauf, davon gewonnen] */
  cards: Record<number, [number, number]>;
  /** Upgrade → Partien, in denen es kaufbar war */
  offered: Record<number, number>;
  /** Käufe der ersten 3 Runden → [Partien, Siege] */
  openings: Record<string, [number, number]>;
}

export interface Agg {
  games: number;
  draws: number;
  rounds: number;
  roundsSq: number;
  byPoints: number;
  byHq: number;
  /** Partien mit letzter Runde und davon Punktsiege eines anderen als des Auslösers */
  finalRounds: number;
  overtaken: number;
  factions: Record<number, FactionAgg>;
}

export const emptyAgg = (): Agg => ({ games: 0, draws: 0, rounds: 0, roundsSq: 0, byPoints: 0, byHq: 0, finalRounds: 0, overtaken: 0, factions: {} });

const emptyFaction = (): FactionAgg => ({
  games: 0, wins: 0, draws: 0, seatGames: [0, 0, 0, 0], seatWins: [0, 0, 0, 0], seatDraws: [0, 0, 0, 0], vp: 0, buildings: 0, upgrades: 0, stars: 0,
  bestBase: 0, bestArmy: 0, winBuildings: 0, winUpgrades: 0, winStars: 0, winMedals: 0, winByHq: 0, overloads: 0,
  attacks: 0, kills: 0, losses: 0, firstAttack: 0, firstAttackGames: 0, cards: {}, offered: {}, openings: {},
});

/** Eröffnung: Kartentypen der Käufe in den ersten 3 Runden, je Runde sortiert */
export function openingKey(buys: Array<[number, number]>): string {
  return [1, 2, 3].map((r) => buys.filter(([round]) => round === r).map(([, id]) => id).sort((a, b) => a - b).join('+') || '-').join('|');
}

export function addGame(agg: Agg, r: GameResult, withDetails = true) {
  agg.games++;
  agg.rounds += r.rounds;
  agg.roundsSq += r.rounds * r.rounds;
  if (r.winner === null) agg.draws++;
  else if (r.reason === 'headquarters') agg.byHq++;
  else agg.byPoints++;
  if (r.finalTrigger !== null) {
    agg.finalRounds++;
    if (r.reason === 'points' && r.winner !== r.finalTrigger) agg.overtaken++;
  }
  for (const p of r.players) {
    const fa = (agg.factions[p.faction] ??= emptyFaction());
    const won = r.winner === p.faction;
    fa.games++;
    fa.seatGames[p.seat]++;
    if (r.winner === null) {
      fa.draws++;
      fa.seatDraws[p.seat]++;
    }
    if (won) {
      fa.wins++;
      fa.seatWins[p.seat]++;
      fa.winBuildings += p.buildings;
      fa.winUpgrades += p.upgrades;
      fa.winStars += p.stars;
      fa.winMedals += (p.bestBase ? 1 : 0) + (p.bestArmy ? 1 : 0);
      if (r.reason === 'headquarters') fa.winByHq++;
    }
    fa.vp += p.vp;
    fa.buildings += p.buildings;
    fa.upgrades += p.upgrades;
    fa.stars += p.stars;
    fa.bestBase += p.bestBase ? 1 : 0;
    fa.bestArmy += p.bestArmy ? 1 : 0;
    fa.overloads += p.log.overloads;
    fa.attacks += p.log.attacks;
    fa.kills += p.log.kills;
    fa.losses += p.log.losses;
    if (p.log.firstAttack !== null) {
      fa.firstAttack += p.log.firstAttack;
      fa.firstAttackGames++;
    }
    if (!withDetails) continue;
    for (const id of new Set(p.log.buys.map(([, id]) => id))) {
      const c = (fa.cards[id] ??= [0, 0]);
      c[0]++;
      if (won) c[1]++;
    }
    for (const id of p.log.offered) fa.offered[id] = (fa.offered[id] ?? 0) + 1;
    const o = (fa.openings[openingKey(p.log.buys)] ??= [0, 0]);
    o[0]++;
    if (won) o[1]++;
  }
}

function addRecord(a: Record<string | number, [number, number]>, b: Record<string | number, [number, number]>) {
  for (const [k, [n, w]] of Object.entries(b)) {
    const t = (a[k] ??= [0, 0]);
    t[0] += n;
    t[1] += w;
  }
}

export function mergeAgg(a: Agg, b: Agg): Agg {
  a.games += b.games;
  a.draws += b.draws;
  a.rounds += b.rounds;
  a.roundsSq += b.roundsSq;
  a.byPoints += b.byPoints;
  a.byHq += b.byHq;
  a.finalRounds += b.finalRounds ?? 0;
  a.overtaken += b.overtaken ?? 0;
  for (const [k, fb] of Object.entries(b.factions)) {
    const fa = (a.factions[Number(k)] ??= emptyFaction());
    for (const key of Object.keys(fb) as Array<keyof FactionAgg>) {
      if (key === 'cards' || key === 'openings') addRecord(fa[key], fb[key]);
      else if (key === 'offered') for (const [id, n] of Object.entries(fb.offered ?? {})) fa.offered[Number(id)] = (fa.offered[Number(id)] ?? 0) + n;
      else if (key === 'seatGames' || key === 'seatWins' || key === 'seatDraws') fb[key].forEach((v, i) => (fa[key][i] += v));
      else fa[key] += fb[key];
    }
  }
  return a;
}

/** 95-%-Konfidenzintervall einer Quote (Wilson) */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (n === 0) return [0, 1];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
