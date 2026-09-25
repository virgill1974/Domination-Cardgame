// Fehlermeldungen des Terminals (Anleitung Anhang B / Code Z. 1865–1908)
export const ERRORS = {
  wrongCard: 'Falsche Karte!',
  notOwned: 'noch nicht gekauft!',
  noEnergy: 'nicht genug Energie!',
  noCredits: 'nicht genug Credits!',
  alreadyOwned: 'Karte vorhanden!',
  nothingToRepair: 'nichts zu reparieren',
  notPossible: 'nicht mehr möglich!',
  notActive: 'noch nicht aktiviert',
  locked: 'nicht freigeschaltet',
} as const;

export type ErrorCode = keyof typeof ERRORS;

export const SPECIAL_TEXT = {
  1: '1000 Credits extra',
  2: '1500 Credits extra',
  3: '500 Credits extra',
  4: '500 Credits extra',
  5: 'Alles aktiviert!',
  6: 'Alles +1 repariert',
} as const;
