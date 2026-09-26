import type { Faction } from '../engine/data';

// Grafiken aus Tools/extract-helge.mjs (public/ui/). base ist das Präfix zu public/ relativ zur Seite
// (App: '', Kartendrucker unter Tools/: '../'). Die Adresse wird absolut aufgelöst: Sie landet in
// CSS-Variablen, und ein relatives url() würde sonst relativ zur gebauten CSS-Datei (assets/) gesucht.
export const FACTION_KEYS = ['starwing', 'lightforce', 'scaretech', 'biotec'] as const;
export type FactionKey = (typeof FACTION_KEYS)[number] | 'neutral';

const absolute = (path: string) => (typeof document === 'undefined' ? path : new URL(path, document.baseURI).href);

export const uiAsset = (path: string, base = '') => absolute(`${base}ui/${path}`);
export const factionKey = (f: Faction | null): FactionKey => (f === null ? 'neutral' : FACTION_KEYS[f]);
export const factionAsset = (f: Faction | null, file: string, base = '') => uiAsset(`factions/${factionKey(f)}/${file}`, base);
export const helgeIcon = (name: string, base = '') => uiAsset(`helge/${name}.png`, base);
