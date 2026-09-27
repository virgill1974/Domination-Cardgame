// Exakte Gefechtswahrscheinlichkeiten nach src/engine/combat.ts (W6, Treffer bei Offensive ≥ Wurf).
// Die Bots bewerten damit Angriffe und Käufe; der Bericht nutzt sie für die Kampfwert-Tabelle.

export interface Fighter {
  def: number;
  off: number;
  dmg: number;
}

export interface Outcome {
  /** Angreifer lebt, Verteidiger zerstört */
  attWin: number;
  /** Angreifer zerstört, Verteidiger lebt */
  defWin: number;
  /** beide zerstört */
  both: number;
  /** keiner zerstört */
  none: number;
  /** erwartete Rest-Defensive */
  attLeft: number;
  defLeft: number;
}

export const hitChance = (off: number) => Math.min(6, Math.max(0, off)) / 6;

type Dist = Map<number, number>; // Schlüssel a * 64 + d
const key = (a: number, d: number) => a * 64 + d;

function add(dist: Dist, k: number, p: number) {
  if (p > 0) dist.set(k, (dist.get(k) ?? 0) + p);
}

function summarize(dist: Dist): Outcome {
  const o: Outcome = { attWin: 0, defWin: 0, both: 0, none: 0, attLeft: 0, defLeft: 0 };
  for (const [k, p] of dist) {
    const a = Math.floor(k / 64);
    const d = k % 64;
    if (a > 0 && d === 0) o.attWin += p;
    else if (a === 0 && d > 0) o.defWin += p;
    else if (a === 0 && d === 0) o.both += p;
    else o.none += p;
    o.attLeft += a * p;
    o.defLeft += d * p;
  }
  return o;
}

const duelCache = new Map<string, Outcome>();

/**
 * Einheit gegen Einheit: Pro Durchgang schlägt erst der Angreifer, dann der Verteidiger zu, auch wenn er gerade
 * gefallen ist. Der erste Durchgang findet immer statt (do-while), danach geht es weiter, solange beide leben.
 */
export function unitDuel(att: Fighter, def: Fighter): Outcome {
  const k = `${att.def},${att.off},${att.dmg}|${def.def},${def.off},${def.dmg}`;
  const hit = duelCache.get(k);
  if (hit) return hit;
  const pa = hitChance(att.off);
  const pd = hitChance(def.off);
  const round = (a: number, d: number): Array<[number, number, number]> => {
    const d1 = Math.max(0, d - att.dmg);
    const a1 = Math.max(0, a - def.dmg);
    return [
      [a1, d1, pa * pd],
      [a, d1, pa * (1 - pd)],
      [a1, d, (1 - pa) * pd],
      [a, d, (1 - pa) * (1 - pd)],
    ];
  };
  const memo = new Map<number, Dist>();
  // Endverteilung ab einem Zustand, in dem die Schleife weiterläuft (beide leben)
  const loop = (a: number, d: number): Dist => {
    const mk = key(a, d);
    const cached = memo.get(mk);
    if (cached) return cached;
    const out: Dist = new Map();
    const stay = (1 - pa) * (1 - pd);
    if (stay >= 1) {
      // Beide können nie treffen: in der Engine eine Endlosschleife, hier als „keiner zerstört“ gewertet
      out.set(mk, 1);
    } else {
      for (const [a1, d1, p] of round(a, d)) {
        if (a1 === a && d1 === d) continue;
        const q = p / (1 - stay);
        if (a1 === 0 || d1 === 0) add(out, key(a1, d1), q);
        else for (const [k2, p2] of loop(a1, d1)) add(out, k2, q * p2);
      }
    }
    memo.set(mk, out);
    return out;
  };
  const start: Dist = new Map();
  for (const [a1, d1, p] of round(att.def, def.def)) {
    if (a1 === 0 || d1 === 0) add(start, key(a1, d1), p);
    else for (const [k2, p2] of loop(a1, d1)) add(start, k2, p * p2);
  }
  const result = summarize(start);
  duelCache.set(k, result);
  return result;
}

export interface PlanetAttack {
  /** Anzahl aktiver gegnerischer Abwehrplaneten, die zuerst auf ein Hyperraumschiff feuern (0 = keine) */
  flak?: number;
  /** Der angegriffene Planet ist selbst ein Abwehrplanet und schlägt zurück */
  shootsBack?: boolean;
  /** Superwaffe: trifft immer */
  always?: boolean;
}

/** Angriff auf einen Planeten (ein Schlag), auch Superwaffe gegen Einheit */
export function planetAttack(att: Fighter, def: Fighter, opts: PlanetAttack): Outcome {
  const dist: Dist = new Map();
  if (opts.always) {
    add(dist, key(att.def, Math.max(0, def.def - att.dmg)), 1);
    return summarize(dist);
  }
  const pa = hitChance(att.off);
  const strikeAtPlanet = (a: number, p: number) => {
    const d1 = Math.max(0, def.def - att.dmg);
    if (opts.shootsBack) {
      const pd = hitChance(def.off);
      const a1 = Math.max(0, a - def.dmg);
      add(dist, key(a1, d1), p * pa * pd);
      add(dist, key(a, d1), p * pa * (1 - pd));
      add(dist, key(a1, def.def), p * (1 - pa) * pd);
      add(dist, key(a, def.def), p * (1 - pa) * (1 - pd));
    } else {
      add(dist, key(a, d1), p * pa);
      add(dist, key(a, def.def), p * (1 - pa));
    }
  };
  const flak = opts.flak ?? 0;
  if (flak > 0) {
    // Planetenabwehr: Offensive = Anzahl + 1, Schaden = Anzahl
    const pf = hitChance(flak + 1);
    const a1 = Math.max(0, att.def - flak);
    if (a1 === 0) add(dist, key(0, def.def), pf);
    else strikeAtPlanet(a1, pf);
    strikeAtPlanet(att.def, 1 - pf);
  } else {
    strikeAtPlanet(att.def, 1);
  }
  return summarize(dist);
}
