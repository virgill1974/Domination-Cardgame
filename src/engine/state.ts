import { CARDS, MAX_SLOTS, SEAT_BONUS, START_CREDITS, START_ENERGY, STARTING_EANS, type Faction } from './data';
import { cardIdOfEan } from './cards';

export interface Slot {
  ean: number;
  def: number;
  remaining: number;
  active: boolean;
  attacked: boolean;
  /** Karte wurde in anzahl_gebaeude/anzahl_einheiten gezählt (Korrektur 1: Superwaffe nur einmal). */
  counted: boolean;
}

export interface Player {
  faction: Faction;
  credits: number;
  energy: number;
  stars: number;
  buildings: number;
  units: number;
  upgrades: number;
  vp: number;
  bestBase: boolean;
  bestArmy: boolean;
  energyUpgrade: boolean;
  repairUpgrade: boolean;
  slots: (Slot | null)[];
}

export interface CardStats {
  rounds: number;
  def: number;
  off: number;
  dmg: number;
}

export interface GameState {
  version: 1;
  playerCount: number;
  vpLimit: number | null;
  /** Fraktion je Sitzplatz in Zugreihenfolge */
  seats: Faction[];
  /** indiziert nach Fraktion, wie player[] im Original */
  players: Player[];
  /** Kartenwerte dieses Spiels; Upgrades verändern sie (defaultkarten[]) */
  stats: CardStats[];
  round: number;
  /** -1 vor dem ersten Zug */
  seat: number;
  turnActive: boolean;
  buys: number;
  attacks: number;
  repairs: number;
  /** reptemp: +2-Reparatur mit Instandsetzung noch verfügbar */
  repairBonus: boolean;
  winner: Faction | null;
  winReason: 'points' | 'headquarters' | null;
  /**
   * Letzte Runde: Diese Fraktion hat die Siegpunkte zuerst erreicht. Die Runde wird zu Ende gespielt, danach gewinnt,
   * wer die meisten Siegpunkte hat. Fehlt in älteren Spielständen.
   */
  finalRound?: Faction | null;
}

export type Rng = () => number;
export const d6 = (rng: Rng): number => 1 + Math.floor(rng() * 6);

function newPlayer(faction: Faction): Player {
  const slots: (Slot | null)[] = Array.from({ length: MAX_SLOTS }, () => null);
  const eans = STARTING_EANS[faction];
  eans.forEach((ean, i) => {
    slots[MAX_SLOTS - eans.length + i] = {
      ean, def: CARDS[cardIdOfEan(ean)].def, remaining: 1, active: false, attacked: false, counted: false,
    };
  });
  return {
    faction, credits: START_CREDITS, energy: START_ENERGY, stars: 0, buildings: 0, units: 0, upgrades: 0, vp: 0,
    bestBase: false, bestArmy: false, energyUpgrade: false, repairUpgrade: false, slots,
  };
}

export function newGame(seats: Faction[], vpLimit: number | null): GameState {
  const players = ([0, 1, 2, 3] as Faction[]).map(newPlayer);
  seats.forEach((f, seat) => (players[f].credits += SEAT_BONUS[seat]));
  return {
    version: 1,
    playerCount: seats.length,
    vpLimit,
    seats,
    players,
    stats: CARDS.map(({ rounds, def, off, dmg }) => ({ rounds, def, off, dmg })),
    round: 0,
    seat: -1,
    turnActive: false,
    buys: 0,
    attacks: 0,
    repairs: 0,
    repairBonus: true,
    winner: null,
    winReason: null,
    finalRound: null,
  };
}

export const currentFaction = (s: GameState): Faction => s.seats[s.seat];
export const currentPlayer = (s: GameState): Player => s.players[currentFaction(s)];

/** index_suchen */
export function findSlot(p: Player, ean: number): number {
  return p.slots.findIndex((slot) => slot?.ean === ean);
}

export function ownedSlots(p: Player): Slot[] {
  return p.slots.filter((slot): slot is Slot => slot !== null);
}

export const slotCardId = (slot: Slot) => cardIdOfEan(slot.ean);

/** Besitzt der Spieler eine Karte dieses Typs (Upgrades sind ab Kauf aktiv)? */
export const hasCard = (p: Player, cardId: number) => ownedSlots(p).some((slot) => slotCardId(slot) === cardId);
