// Stellschrauben der Strategie-Bots (bot.ts) und die fünf lesbaren Spielweisen.
// Gewichte um 1 sind neutral; der Optimierer (tune.ts) bewegt sich innerhalb von PARAM_RANGES.

export interface BotParams {
  /** Handelsplaneten und Einkommen */
  econ: number;
  /** Einheiten allgemein */
  military: number;
  /** Hyperraumschiffe zusätzlich (erreichen Reihe 2 trotz Einheiten) */
  air: number;
  /** Wert eines Siegpunkts (× 700 Credits) */
  vp: number;
  /** Freischalten entlang des Technologiebaums */
  tech: number;
  /** Upgrade-Wirkungen */
  upgrades: number;
  /** Superwaffe anstreben */
  superweapon: number;
  /** Planetenabwehr und Mindestbesetzung der 1. Reihe */
  defense: number;
  /** gewünschte Anzahl Einheiten in Reihe 1 */
  minFront: number;
  /** Credits, die nach Käufen übrig bleiben sollen */
  reserve: number;
  /** 0…1: Bereitschaft, auf eine teure, lohnende Karte zu sparen */
  patience: number;
  /** Angriff, wenn Erwartungswert + aggression > 0 (Credits) */
  aggression: number;
  /** Gewicht für Angriffe auf Planeten und das Zentralgestirn */
  hqFocus: number;
  /** 1 = den Führenden angreifen, 0 = den Schwächsten */
  leader: number;
  /** Reparaturneigung */
  repair: number;
  /** ≥ 0,5: Zentralgestirn in die 3. Reihe, sonst in die 2. */
  hqBack: number;
  /** Nur für Versuche (wird nicht optimiert): Energiequellen in die 2. Reihe legen */
  reactorFront?: boolean;
}

/** Die optimierbaren Stellschrauben (ohne Versuchsschalter) */
export type ParamKey = Exclude<keyof BotParams, 'reactorFront'>;

export const PARAM_RANGES: Record<ParamKey, [number, number]> = {
  econ: [0, 3],
  military: [0, 3],
  air: [0, 3],
  vp: [0, 3],
  tech: [0, 3],
  upgrades: [0, 3],
  superweapon: [0, 4],
  defense: [0, 3],
  minFront: [0, 7],
  reserve: [0, 1500],
  patience: [0, 1],
  aggression: [-400, 1200],
  hqFocus: [0, 3],
  leader: [0, 1],
  repair: [0, 3],
  hqBack: [0, 1],
};

export const PARAM_KEYS = Object.keys(PARAM_RANGES) as ParamKey[];

const BALANCED: BotParams = {
  econ: 1, military: 1, air: 1, vp: 1, tech: 1, upgrades: 1, superweapon: 1, defense: 1,
  minFront: 3, reserve: 400, patience: 0.5, aggression: 200, hqFocus: 1, leader: 0.6, repair: 1, hqBack: 1,
};

export const ARCHETYPES = {
  /** Referenzgegner: alles in Maßen */
  ausgewogen: BALANCED,
  /** Wirtschaft zuerst, später Armee */
  haendler: { ...BALANCED, econ: 2.2, military: 0.7, vp: 0.9, tech: 1.2, reserve: 300, patience: 0.8, aggression: 100, minFront: 2 },
  /** früh billige Einheiten, jede Runde angreifen */
  blitz: {
    ...BALANCED, econ: 0.4, military: 1.9, air: 1.2, vp: 0.6, tech: 0.8, upgrades: 0.7, superweapon: 0.2,
    defense: 0.5, minFront: 2, reserve: 200, patience: 0.2, aggression: 600, hqFocus: 1.6, leader: 0.3, repair: 0.6,
  },
  /** Planeten, Upgrades, Abwehr und Reparatur: Siegpunkte sammeln */
  festung: {
    ...BALANCED, military: 0.7, vp: 1.9, upgrades: 1.7, superweapon: 0.5, defense: 1.9, minFront: 4,
    reserve: 600, patience: 0.6, aggression: -100, hqFocus: 0.6, leader: 0.8, repair: 1.8,
  },
  /** schnell den Technologiebaum hinauf zur Superwaffe */
  superwaffe: { ...BALANCED, econ: 1.2, military: 0.8, vp: 0.8, tech: 1.9, superweapon: 2.6, patience: 0.9, hqFocus: 1.8, aggression: 150 },
} satisfies Record<string, BotParams>;

export type ArchetypeName = keyof typeof ARCHETYPES;
export const ARCHETYPE_NAMES = Object.keys(ARCHETYPES) as ArchetypeName[];

export const ARCHETYPE_LABEL: Record<ArchetypeName, string> = {
  ausgewogen: 'Ausgewogen',
  haendler: 'Händler',
  blitz: 'Blitzangriff',
  festung: 'Festung',
  superwaffe: 'Superwaffe',
};

export function clampParams(p: BotParams): BotParams {
  const out = { ...p };
  for (const k of PARAM_KEYS) {
    const [lo, hi] = PARAM_RANGES[k];
    out[k] = Math.min(hi, Math.max(lo, out[k]));
  }
  return out;
}
