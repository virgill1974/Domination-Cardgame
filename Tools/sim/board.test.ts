import { describe, expect, it } from 'vitest';
import {
  fieldAccepts, legalTargets, newBoard, placePlanet, placeUnit, reach, resolveTarget, reveal, roomForUnits, type Board,
} from './board';

// Starwing-EANs: 0 Zentralgestirn, 2 Protonenmond, 7 Planetenschild, 13 Ionenpulsar (Superwaffe)
// Einheiten: 14 Fährtensucher (Aufklärer), 20 Phoenix (Kampfschiff), 30 Zeus (Hyperraumschiff)
// Scaretech: 94/95 Shadow Arm (Aufklärer), 100 Schattenschleuder (Kampfschiff)
const FOOT = [14, 15, 16, 17, 18, 19];
const VEHICLE = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const AIR = [30, 31, 32, 33];

describe('Stapelregeln in Reihe 1', () => {
  it('höchstens 3 Aufklärer, 2 Kampfschiffe oder 1 + 1, Hyperraumschiffe allein', () => {
    expect(fieldAccepts([14, 15], 'foot')).toBe(true);
    expect(fieldAccepts([14, 15, 16], 'foot')).toBe(false);
    expect(fieldAccepts([20], 'vehicle')).toBe(true);
    expect(fieldAccepts([20, 21], 'vehicle')).toBe(false);
    expect(fieldAccepts([20], 'foot')).toBe(true);
    expect(fieldAccepts([20, 14], 'foot')).toBe(false);
    expect(fieldAccepts([14, 15], 'vehicle')).toBe(false);
    expect(fieldAccepts([30], 'foot')).toBe(false);
    expect(fieldAccepts([14], 'air')).toBe(false);
    expect(fieldAccepts([], 'air')).toBe(true);
  });

  it('7 Felder: 4 Hyperraumschiffe + 6 Kampfschiffe füllen die Reihe', () => {
    const b = newBoard();
    for (const ean of [...AIR, ...VEHICLE.slice(0, 6)]) expect(placeUnit(b, ean)).toBe(true);
    expect(placeUnit(b, VEHICLE[6])).toBe(false);
    expect(roomForUnits(b, [FOOT[0]])).toBe(false);
  });

  it('Aufklärer werden zu Aufklärern gelegt, damit Platz bleibt', () => {
    const b = newBoard();
    for (const ean of FOOT) placeUnit(b, ean);
    expect(b.front.filter((f) => f.length > 0)).toHaveLength(2);
    expect(roomForUnits(b, [...VEHICLE])).toBe(true);
  });
});

function boardWith(units: number[], row2: number[], row3: number[]): Board {
  const b = newBoard();
  units.forEach((ean) => placeUnit(b, ean));
  row2.forEach((ean) => placePlanet(b, ean, 2));
  row3.forEach((ean) => placePlanet(b, ean, 3));
  return b;
}

describe('Reihenfolge beim Angriff', () => {
  it('Reihe 2 erst ohne Einheiten, Reihe 3 erst, wenn Reihe 1 und 2 leer sind', () => {
    expect(reach(14, false, boardWith([20], [2], [0]))).toEqual({ row2: false, row3: false });
    expect(reach(14, false, boardWith([], [2], [0]))).toEqual({ row2: true, row3: false });
    expect(reach(14, false, boardWith([], [], [0]))).toEqual({ row2: true, row3: true });
  });

  it('Hyperraumschiffe überspringen nur die 1. Reihe', () => {
    expect(reach(30, false, boardWith([20], [2], [0]))).toEqual({ row2: true, row3: false });
    expect(reach(30, false, boardWith([20], [], [0]))).toEqual({ row2: true, row3: true });
    expect(reach(30, false, boardWith([], [2], [0]))).toEqual({ row2: true, row3: false });
  });

  it('Scaretech-Aufklärer mit Wurmloch wie Hyperraumschiffe, Kampfschiffe nicht', () => {
    expect(reach(94, true, boardWith([20], [2], [0]))).toEqual({ row2: true, row3: false });
    expect(reach(94, false, boardWith([20], [2], [0]))).toEqual({ row2: false, row3: false });
    expect(reach(100, true, boardWith([20], [2], [0]))).toEqual({ row2: false, row3: false });
  });

  it('die Superwaffe erreicht alles', () => {
    expect(reach(13, false, boardWith([20], [2], [0]))).toEqual({ row2: true, row3: true });
  });

  it('verdeckte Planeten sind ein Ziel je Reihe, aufgedeckte einzeln', () => {
    const b = boardWith([], [2, 7], [0]);
    reveal(b, 7);
    const targets = legalTargets(14, false, b);
    expect(targets).toContainEqual({ type: 'planet', ean: 7 });
    expect(targets).toContainEqual({ type: 'hiddenPlanet', row: 2 });
    expect(targets.some((t) => t.type === 'hiddenPlanet' && t.row === 3)).toBe(false);
    // Zufallsauswahl bleibt in der gewählten Reihe und trifft nur Verdecktes
    for (let i = 0; i < 20; i++) expect(resolveTarget({ type: 'hiddenPlanet', row: 2 }, b, () => i / 20)).toBe(2);
  });

  it('verdeckte Einheiten (Schwarzer Schleier) sind ein gemeinsames Ziel', () => {
    const b = newBoard();
    placeUnit(b, 94, true);
    placeUnit(b, 95, false);
    const targets = legalTargets(14, false, b);
    expect(targets).toContainEqual({ type: 'unit', ean: 95 });
    expect(targets).toContainEqual({ type: 'hiddenUnit' });
    expect(targets.some((t) => t.type === 'unit' && t.ean === 94)).toBe(false);
  });
});
