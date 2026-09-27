// Spielfeld am Tisch, das die App-Engine nicht kennt (Anleitung Kap. 2, 3.1, 3.2, 8.2):
// 3 Reihen × 7 Felder je Spieler, Stapelregeln in Reihe 1, verdeckte Planeten und die Reihenfolge beim Angriff.
import { CARDS } from '../../src/engine/data';
import { cardIdOfEan, isAircraft, isSuperweapon } from '../../src/engine/cards';
import type { Rng } from '../../src/engine/state';

export const FIELDS = 7;
/** Scaretech-Planet Wurmloch: eigene Aufklärer dürfen die 1. Reihe überspringen */
export const WORMHOLE = 54;

export type UnitClass = 'foot' | 'vehicle' | 'air';
export type PlanetRow = 2 | 3;

export const unitClassOf = (ean: number): UnitClass => CARDS[cardIdOfEan(ean)].unitClass ?? 'foot';

export interface PlanetSpot {
  ean: number;
  row: PlanetRow;
  /** Wurde angegriffen (oder vom Auge des Raumes aufgedeckt) und liegt seitdem offen */
  revealed: boolean;
}

export interface Board {
  /** Reihe 1: je Feld die Einheiten (EAN) */
  front: number[][];
  /** Reihe 2 und 3 */
  planets: PlanetSpot[];
  /** Aktivierte Einheiten ohne Platz in Reihe 1: können weder angreifen noch angegriffen werden */
  waiting: number[];
  /** Verdeckt liegende Einheiten (Scaretech, Schwarzer Schleier) */
  hiddenUnits: number[];
}

export const newBoard = (): Board => ({
  front: Array.from({ length: FIELDS }, () => []),
  planets: [],
  waiting: [],
  hiddenUnits: [],
});

/** Stapelregel je Feld: höchstens 3 Aufklärer, 2 Kampfschiffe oder 1 Kampfschiff + 1 Aufklärer; Hyperraumschiffe allein */
export function fieldAccepts(field: readonly number[], cls: UnitClass): boolean {
  let foot = 0;
  let vehicle = 0;
  for (const ean of field) {
    const c = unitClassOf(ean);
    if (c === 'air') return false;
    if (c === 'foot') foot++;
    else vehicle++;
  }
  if (cls === 'air') return field.length === 0;
  if (cls === 'foot') return vehicle === 0 ? foot < 3 : vehicle === 1 && foot === 0;
  return foot === 0 ? vehicle < 2 : foot === 1 && vehicle === 0;
}

/** Feld für eine neue Einheit: erst zu Gleichartigen, dann ein leeres Feld, zuletzt gemischt (1 + 1) */
function pickField(front: readonly number[][], cls: UnitClass): number {
  let empty = -1;
  let mixed = -1;
  for (let i = 0; i < front.length; i++) {
    const field = front[i];
    if (!fieldAccepts(field, cls)) continue;
    if (field.length === 0) {
      if (empty < 0) empty = i;
    } else if (field.every((ean) => unitClassOf(ean) === cls)) {
      return i;
    } else if (mixed < 0) {
      mixed = i;
    }
  }
  return empty >= 0 ? empty : mixed;
}

export function placeUnit(b: Board, ean: number, hidden = false): boolean {
  const i = pickField(b.front, unitClassOf(ean));
  if (i < 0) return false;
  b.front[i].push(ean);
  if (hidden) b.hiddenUnits.push(ean);
  return true;
}

const CLASS_ORDER: Record<UnitClass, number> = { air: 0, vehicle: 1, foot: 2 };

/** Passen die wartenden Einheiten und zusätzlich extra (Baustapel, geplanter Kauf) noch in Reihe 1? */
export function roomForUnits(b: Board, extra: readonly number[]): boolean {
  const front = b.front.map((field) => [...field]);
  const all = [...b.waiting, ...extra].sort((x, y) => CLASS_ORDER[unitClassOf(x)] - CLASS_ORDER[unitClassOf(y)]);
  for (const ean of all) {
    const i = pickField(front, unitClassOf(ean));
    if (i < 0) return false;
    front[i].push(ean);
  }
  return true;
}

export const rowCount = (b: Board, row: PlanetRow) => b.planets.filter((p) => p.row === row).length;

/** Planet verdeckt in die gewünschte Reihe legen, sonst in die andere (14 Planeten passen immer) */
export function placePlanet(b: Board, ean: number, preferred: PlanetRow): PlanetRow {
  const row: PlanetRow = rowCount(b, preferred) < FIELDS ? preferred : preferred === 2 ? 3 : 2;
  b.planets.push({ ean, row, revealed: false });
  return row;
}

export const frontUnits = (b: Board): number[] => b.front.flat();

export const onBoard = (b: Board, ean: number) =>
  b.planets.some((p) => p.ean === ean) || b.front.some((field) => field.includes(ean));

export function removeFromBoard(b: Board, ean: number) {
  b.planets = b.planets.filter((p) => p.ean !== ean);
  b.front = b.front.map((field) => field.filter((e) => e !== ean));
  b.waiting = b.waiting.filter((e) => e !== ean);
  b.hiddenUnits = b.hiddenUnits.filter((e) => e !== ean);
}

/** Karte liegt ab jetzt offen (nach einem Kampf oder durch das Auge des Raumes) */
export function reveal(b: Board, ean: number) {
  const spot = b.planets.find((p) => p.ean === ean);
  if (spot) spot.revealed = true;
  b.hiddenUnits = b.hiddenUnits.filter((e) => e !== ean);
}

export const rowOccupied = (b: Board, row: 1 | PlanetRow) =>
  row === 1 ? b.front.some((field) => field.length > 0) : b.planets.some((p) => p.row === row);

export type Target =
  | { type: 'unit'; ean: number }
  | { type: 'hiddenUnit' }
  | { type: 'planet'; ean: number }
  | { type: 'hiddenPlanet'; row: PlanetRow };

export interface Reach {
  row2: boolean;
  row3: boolean;
}

/**
 * Welche Planetenreihen des Verteidigers erreicht der Angreifer?
 * - normal: Reihe 2 erst, wenn Reihe 1 leer ist; Reihe 3 erst, wenn Reihe 1 und 2 leer sind
 * - Hyperraumschiffe und Scaretech-Aufklärer mit Wurmloch überspringen nur die 1. Reihe:
 *   Reihe 2 immer, Reihe 3 erst, wenn Reihe 2 leer ist (Tischregel, vom Nutzer so festgelegt)
 * - Superwaffe: jede Karte
 */
export function reach(attackerEan: number, wormhole: boolean, def: Board): Reach {
  const id = cardIdOfEan(attackerEan);
  if (isSuperweapon(id)) return { row2: true, row3: true };
  const occ1 = rowOccupied(def, 1);
  const occ2 = rowOccupied(def, 2);
  const skip = isAircraft(id) || (wormhole && unitClassOf(attackerEan) === 'foot');
  return { row2: skip || !occ1, row3: skip ? !occ2 : !occ1 && !occ2 };
}

/** Alle erlaubten Ziele beim Verteidiger. Einheiten in Reihe 1 sind immer angreifbar. */
export function legalTargets(attackerEan: number, wormhole: boolean, def: Board): Target[] {
  const r = reach(attackerEan, wormhole, def);
  const out: Target[] = [];
  const units = frontUnits(def);
  for (const ean of units) if (!def.hiddenUnits.includes(ean)) out.push({ type: 'unit', ean });
  if (units.some((ean) => def.hiddenUnits.includes(ean))) out.push({ type: 'hiddenUnit' });
  for (const row of [2, 3] as const) {
    if (row === 2 ? !r.row2 : !r.row3) continue;
    const spots = def.planets.filter((p) => p.row === row);
    for (const p of spots) if (p.revealed) out.push({ type: 'planet', ean: p.ean });
    if (spots.some((p) => !p.revealed)) out.push({ type: 'hiddenPlanet', row });
  }
  return out;
}

/** Verdeckte Ziele: Der Angreifer greift eine Karte, welche es ist, entscheidet der Zufall */
export function resolveTarget(t: Target, def: Board, rng: Rng): number {
  const pick = <T>(list: T[]) => list[Math.floor(rng() * list.length)];
  switch (t.type) {
    case 'unit':
    case 'planet':
      return t.ean;
    case 'hiddenUnit':
      return pick(frontUnits(def).filter((ean) => def.hiddenUnits.includes(ean)));
    case 'hiddenPlanet':
      return pick(def.planets.filter((p) => p.row === t.row && !p.revealed)).ean;
  }
}

/** Neuronetz: zwei eigene verdeckte Planeten tauschen die Plätze */
export function swapPlanets(b: Board, a: number, c: number) {
  const pa = b.planets.find((p) => p.ean === a)!;
  const pc = b.planets.find((p) => p.ean === c)!;
  [pa.row, pc.row] = [pc.row, pa.row];
}
