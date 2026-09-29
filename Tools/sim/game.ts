// Eine simulierte Partie: echte Engine (Zugbeginn, Kaufen, Kampf, Siegpunkte) + Spielfeld am Tisch + Bots.
import type { Faction } from '../../src/engine/data';
import { kindOfEan } from '../../src/engine/cards';
import { currentFaction, newGame, ownedSlots, slotCardId } from '../../src/engine/state';
import { mulberry32 } from '../../src/engine/testutil';
import { beginTurn } from '../../src/engine/turn';
import { endTurn, victoryPoints } from '../../src/engine/victory';
import { isSuperweapon } from '../../src/engine/cards';
import { frontUnits, newBoard, onBoard } from './board';
import {
  RANDOM_PLACEMENT, newLog, placeActivated, placeWaiting, playRandomTurn, playTurn, turnStartSpecials,
  type Bot, type Ctx, type PlayerLog,
} from './bot';

export interface SeatSetup {
  faction: Faction;
  bot: Bot;
}

/**
 * Regelvarianten, die nur im Simulator getestet werden (die App kennt sie nicht).
 * „Runde zu Ende spielen“ und der Startkapital-Ausgleich sind inzwischen Spielregeln (Engine).
 */
export interface SimRules {
  /** Angriffe erst ab dieser Runde (Schonzeit) */
  firstAttackRound?: number;
}

export interface GameSetup {
  seats: SeatSetup[];
  vpLimit: number | null;
  seed: number;
  rules?: SimRules;
  /** Abbruch als Remis nach so vielen Runden */
  maxRounds?: number;
  /** Spielfeld und Engine nach jedem Zug gegeneinander prüfen (Tests) */
  check?: boolean;
}

export interface PlayerResult {
  faction: Faction;
  seat: number;
  vp: number;
  buildings: number;
  upgrades: number;
  stars: number;
  bestBase: boolean;
  bestArmy: boolean;
  log: PlayerLog;
}

export interface GameResult {
  winner: Faction | null;
  reason: 'points' | 'headquarters' | null;
  /** Wer die letzte Runde ausgelöst hat (Siegpunkt-Ziel zuerst erreicht) */
  finalTrigger: Faction | null;
  rounds: number;
  players: PlayerResult[];
}

export const MAX_ROUNDS = 120;


export function playGame(setup: GameSetup): GameResult {
  const s = newGame(setup.seats.map((x) => x.faction), setup.vpLimit);
  const ctx: Ctx = {
    s,
    boards: [0, 1, 2, 3].map(newBoard),
    dice: mulberry32(setup.seed),
    rng: mulberry32(setup.seed ^ 0x5bd1e995),
    logs: [0, 1, 2, 3].map(newLog),
    placement: [0, 1, 2, 3].map(() => RANDOM_PLACEMENT),
    firstAttackRound: setup.rules?.firstAttackRound,
  };
  for (const { faction, bot } of setup.seats) ctx.placement[faction] = bot === 'random' ? RANDOM_PLACEMENT : bot;
  const botOf = new Map(setup.seats.map((x) => [x.faction, x.bot] as const));
  const maxRounds = setup.maxRounds ?? MAX_ROUNDS;
  // Punktsiege entscheidet die Engine am Ende der letzten Runde (endTurn); ein zerstörtes Zentralgestirn sofort
  while (s.winner === null) {
    const start = beginTurn(s, ctx.dice);
    if (s.round > maxRounds) break;
    const f = currentFaction(s);
    if (start.skipped) {
      ctx.logs[f].overloads++;
      continue;
    }
    const bot = botOf.get(f)!;
    const P = bot === 'random' ? RANDOM_PLACEMENT : bot;
    for (const e of start.events) if (e.type === 'activated') placeActivated(ctx, f, e.ean, P);
    placeWaiting(ctx, f);
    turnStartSpecials(ctx, f, P);
    if (bot === 'random') playRandomTurn(ctx);
    else playTurn(ctx, bot);
    if (setup.check) checkConsistency(ctx);
    if (s.winner === null) endTurn(s);
  }
  return {
    winner: s.winner,
    reason: s.winReason,
    finalTrigger: s.finalRound ?? null,
    rounds: Math.min(s.round, maxRounds),
    players: setup.seats.map(({ faction }, seat) => {
      const p = s.players[faction];
      return {
        faction, seat, vp: victoryPoints(p), buildings: p.buildings, upgrades: p.upgrades, stars: p.stars,
        bestBase: p.bestBase, bestArmy: p.bestArmy, log: ctx.logs[faction],
      };
    }),
  };
}

/** Spielfeld und Engine-Zustand müssen zusammenpassen */
export function checkConsistency(ctx: Ctx) {
  const { s, boards } = ctx;
  for (const f of s.seats) {
    const p = s.players[f];
    const board = boards[f];
    const slots = ownedSlots(p);
    const fail = (what: string) => {
      throw new Error(`Spielfeld ${f}: ${what}`);
    };
    for (const slot of slots) {
      const placed = onBoard(board, slot.ean) || board.waiting.includes(slot.ean);
      const shouldBe = kindOfEan(slot.ean) !== 'upgrade' && (slot.active || (isSuperweapon(slotCardId(slot)) && slot.counted));
      if (shouldBe && !placed) fail(`aktive Karte ${slot.ean} fehlt`);
      if (!shouldBe && placed) fail(`Karte ${slot.ean} liegt, ist aber nicht aktiv`);
    }
    const eans = new Set(slots.map((slot) => slot.ean));
    for (const ean of [...frontUnits(board), ...board.planets.map((sp) => sp.ean), ...board.waiting]) {
      if (!eans.has(ean)) fail(`Karte ${ean} liegt, gehört aber nicht mehr dem Spieler`);
    }
    if (board.planets.filter((sp) => sp.row === 2).length > 7 || board.planets.filter((sp) => sp.row === 3).length > 7) {
      fail('mehr als 7 Planeten in einer Reihe');
    }
  }
}
