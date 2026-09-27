// Partie-Pakete und ihre Verteilung auf Worker-Threads.
import { Worker } from 'node:worker_threads';
import { CARDS, type CardType, type Faction } from '../../src/engine/data';
import type { Bot } from './bot';
import { emptyAgg, mergeAgg, type Agg } from './stats';

export interface Job {
  id: number;
  seats: Faction[];
  bots: Bot[];
  vpLimit: number | null;
  seed: number;
  games: number;
  /** Karten- und Eröffnungsstatistik mitschreiben */
  details: boolean;
}

export type JobSpec = Omit<Job, 'id'> & { key: string };

/**
 * Kartenwerte nur im Simulator ändern: { "<Name oder Kartentyp-ID>": { price?, rounds?, def?, off?, dmg?, requires? } }.
 * requires darf eine Kartentyp-ID oder der Name eines Planeten derselben Fraktion sein.
 */
export type Patch = Record<string, Partial<Pick<CardType, 'price' | 'rounds' | 'def' | 'off' | 'dmg'>> & { requires?: number | string }>;

export function applyPatch(patch?: Patch) {
  if (!patch) return;
  for (const [name, values] of Object.entries(patch)) {
    const cards = CARDS.filter((c) => String(c.id) === name || c.name === name);
    if (!cards.length) throw new Error(`Unbekannte Karte im Patch: ${name}`);
    for (const c of cards) {
      const { requires, ...rest } = values;
      Object.assign(c as CardType, rest);
      if (requires !== undefined) {
        const req = typeof requires === 'number' ? requires
          : CARDS.find((x) => x.name === requires && Math.floor(x.id / 23) === Math.floor(c.id / 23))?.id;
        if (req === undefined) throw new Error(`Unbekannte Voraussetzung im Patch: ${requires}`);
        (c as CardType).requires = req;
      }
    }
  }
}

/** Alle Sitzordnungen mit n der 4 Fraktionen */
export function seatings(n: number): Faction[][] {
  const out: Faction[][] = [];
  const rec = (prefix: Faction[]) => {
    if (prefix.length === n) return void out.push(prefix);
    for (const f of [0, 1, 2, 3] as Faction[]) if (!prefix.includes(f)) rec([...prefix, f]);
  };
  rec([]);
  return out;
}

/** Große Aufträge in Pakete von höchstens chunk Partien teilen (bessere Auslastung) */
export function split(spec: JobSpec, chunk = 25): JobSpec[] {
  const out: JobSpec[] = [];
  for (let i = 0; i < spec.games; i += chunk) out.push({ ...spec, seed: spec.seed + i, games: Math.min(chunk, spec.games - i) });
  return out;
}

export class Pool {
  private workers: Worker[];

  constructor(size: number, workerFile: string, patch?: Patch) {
    this.workers = Array.from({ length: size }, () => new Worker(workerFile, { workerData: { patch } }));
  }

  /** Führt alle Aufträge aus und liefert je Schlüssel die addierte Zusammenfassung */
  run(specs: JobSpec[], onProgress?: (done: number, total: number) => void): Promise<Map<string, Agg>> {
    const jobs = specs.flatMap((s) => split(s));
    const result = new Map<string, Agg>();
    let next = 0;
    let done = 0;
    return new Promise((resolve, reject) => {
      if (!jobs.length) return resolve(result);
      const feed = (w: Worker) => {
        if (next >= jobs.length) return;
        w.postMessage({ ...jobs[next], id: next });
        next++;
      };
      for (const w of this.workers) {
        w.removeAllListeners('message');
        w.removeAllListeners('error');
        w.on('error', reject);
        w.on('message', (msg: { id: number; agg: Agg }) => {
          const key = jobs[msg.id].key;
          result.set(key, mergeAgg(result.get(key) ?? emptyAgg(), msg.agg));
          done++;
          onProgress?.(done, jobs.length);
          if (done === jobs.length) resolve(result);
          else feed(w);
        });
        feed(w);
      }
    });
  }

  async close() {
    await Promise.all(this.workers.map((w) => w.terminate()));
  }
}
