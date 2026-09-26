import type { Faction } from './data';

export type GameEvent =
  | { type: 'overload' }
  | { type: 'special'; roll: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'activated'; ean: number }
  | { type: 'spySatellite' }
  | { type: 'camouflage' }
  | { type: 'neuronet' }
  | { type: 'regeneration'; count: number }
  | { type: 'medal'; medal: 'bestBase' | 'bestArmy' }
  | { type: 'winner'; faction: Faction; reason: 'points' | 'headquarters' };
