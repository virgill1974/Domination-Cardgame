// Kommandozeile des Balance-Simulators (gestartet über Tools/sim/sim.mjs bzw. npm run sim -- <Befehl>).
//   smoke        wenige Partien im Hauptthread: Laufzeit und Plausibilität
//   strategies   Versuch A (alle gleiche Spielweise) und B (jede Fraktion probiert jede Spielweise)
//   tune         Optimierer: beste Einstellungen je Fraktion (Start: bestes Ergebnis aus B)
//   select       Strategiewahl: je Spielerzahl und Siegpunkt-Einstellung die beste von 8 Strategien (3 optimierte, 5 Spielweisen)
//   final        Balance-Urteil: jede Fraktion mit ihrer gewählten (sonst optimierten) Strategie
//   exploits     Überlastungs-Sperre: Energiequelle in Reihe 2 statt Reihe 3
//   report       Bericht Unterlagen/Balance_Simulation.md aus Tools/sim/out/*.json
//   all          strategies, tune, select, final, exploits, report
// Optionen: --games N (Partien je Sitzordnung), --workers N, --gens N, --patch datei.json,
//           final --tag name --label "Text": Was-wäre-wenn-Lauf neben dem Hauptergebnis, --rules datei.json: Regelvarianten
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS, FACTIONS, type Faction } from '../../src/engine/data';
import { playGame, type SimRules } from './game';
import { Pool, applyPatch, seatings, type JobSpec, type Patch } from './jobs';
import { ARCHETYPES, ARCHETYPE_LABEL, ARCHETYPE_NAMES, type BotParams } from './params';
import { writeReport } from './report';
import { addGame, emptyAgg, type Agg } from './stats';
import { tune } from './tune';

const argv = process.argv.slice(2);
const command = argv[0] ?? 'smoke';
const opt = (name: string, fallback: number) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? Number(argv[i + 1]) : fallback;
};
const optStr = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const OUT = join(process.cwd(), 'Tools', 'sim', 'out');
mkdirSync(OUT, { recursive: true });
const patchFile = optStr('patch');
const patch: Patch | undefined = patchFile ? JSON.parse(readFileSync(patchFile, 'utf8')) : undefined;
/** --rules datei.json: Regelvarianten nur im Simulator (siehe SimRules in game.ts), z. B. {"finishRound": true} */
const rulesFile = optStr('rules');
const rules: SimRules | undefined = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : undefined;
applyPatch(patch);

export const VP_MODES: Array<number | null> = [30, 40, null];
export const vpKey = (vp: number | null) => (vp === null ? 'inf' : String(vp));
/** Zu zweit gibt es nur 40 Siegpunkte oder ∞ (Spielregel) */
export const allowed = (players: number, vp: number | null) => !(players === 2 && vp === 30);
const workerFile = join(dirname(fileURLToPath(import.meta.url)), 'worker.js');

export interface Saved {
  meta: Record<string, unknown>;
  results: Record<string, Agg>;
}

export function save(name: string, data: unknown) {
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data));
}
export function load<T>(name: string): T | null {
  const file = join(OUT, `${name}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : null;
}

function progress(label: string) {
  let last = 0;
  return (done: number, total: number) => {
    const now = Date.now();
    if (now - last < 1000 && done < total) return;
    last = now;
    process.stdout.write(`\r${label}: ${done}/${total} Pakete`);
    if (done === total) process.stdout.write('\n');
  };
}

function seedOf(...parts: Array<number | string>): number {
  let h = 2166136261;
  for (const ch of parts.join('|')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// ---------------------------------------------------------------- Befehle

function smoke() {
  const games = opt('games', 60);
  const vpArg = optStr('vp') ?? '30';
  const vpLimit = vpArg === 'inf' ? null : Number(vpArg);
  const arch = (optStr('bot') ?? 'ausgewogen') as keyof typeof ARCHETYPES;
  for (const n of [2, 3, 4]) {
    const agg = emptyAgg();
    const t0 = performance.now();
    const orders = seatings(n);
    for (let i = 0; i < games; i++) {
      const seats = orders[i % orders.length].map((faction) => ({ faction, bot: ARCHETYPES[arch] }));
      addGame(agg, playGame({ seats, vpLimit, seed: i + 1 }));
    }
    const ms = (performance.now() - t0) / games;
    console.log(`${n} Spieler: ${ms.toFixed(1)} ms/Partie, Ø ${(agg.rounds / agg.games).toFixed(1)} Runden, `
      + `Remis ${agg.draws}, Punkte ${agg.byPoints}, Zentralgestirn ${agg.byHq}`);
    for (const [f, fa] of Object.entries(agg.factions)) {
      console.log(`  ${FACTIONS[Number(f)].padEnd(11)} Siege ${String(fa.wins).padStart(3)}/${fa.games}  `
        + `Ø SP ${(fa.vp / fa.games).toFixed(1)}  Planeten ${(fa.buildings / fa.games).toFixed(1)}  `
        + `Upgrades ${(fa.upgrades / fa.games).toFixed(1)}  Sterne ${(fa.stars / fa.games).toFixed(1)}  `
        + `Angriffe ${(fa.attacks / fa.games).toFixed(1)}  1. Angriff R${(fa.firstAttack / Math.max(1, fa.firstAttackGames)).toFixed(1)}  `
        + `Überlastung ${(fa.overloads / fa.games).toFixed(2)}`);
    }
  }
}

/** Eine Partie im Detail: Käufe je Runde und Endstand */
function trace() {
  const factions = (optStr('factions') ?? '0,3').split(',').map(Number) as Faction[];
  const arch = (optStr('bot') ?? 'ausgewogen') as keyof typeof ARCHETYPES;
  const r = playGame({ seats: factions.map((faction) => ({ faction, bot: ARCHETYPES[arch] })), vpLimit: 30, seed: opt('seed', 1) });
  for (const p of r.players) {
    console.log(`${FACTIONS[p.faction]}: ${p.vp} SP (Planeten ${p.buildings}, Upgrades ${p.upgrades}, Sterne ${p.stars}), `
      + `Angriffe ${p.log.attacks}, zerstört ${p.log.kills}, verloren ${p.log.losses}`);
    const byRound = new Map<number, string[]>();
    for (const [round, id] of p.log.buys) byRound.set(round, [...(byRound.get(round) ?? []), CARDS[id].name]);
    for (const [round, names] of byRound) console.log(`  R${round}: ${names.join(', ')}`);
  }
  console.log(`Sieger: ${r.winner === null ? 'keiner' : FACTIONS[r.winner]} (${r.reason}) nach ${r.rounds} Runden`);
}

/** Versuch A: alle spielen dieselbe Spielweise. Versuch B: eine Fraktion probiert jede Spielweise gegen „Ausgewogen“. */
async function strategies(pool: Pool) {
  const games = opt('games', 40);
  const specs: JobSpec[] = [];
  for (const arch of ARCHETYPE_NAMES) {
    for (const n of [2, 3, 4]) {
      for (const vp of VP_MODES.filter((v) => allowed(n, v))) {
        for (const seats of seatings(n)) {
          specs.push({
            key: `A|${arch}|${n}|${vpKey(vp)}`, seats, bots: seats.map(() => ARCHETYPES[arch]), vpLimit: vp,
            seed: seedOf('A', arch, n, vpKey(vp), seats.join()), games, details: false,
          });
        }
      }
    }
  }
  for (const f of [0, 1, 2, 3] as Faction[]) {
    for (const arch of ARCHETYPE_NAMES) {
      for (const n of [2, 3, 4]) {
        for (const vp of VP_MODES.filter((v) => allowed(n, v))) {
          for (const seats of seatings(n).filter((s) => s.includes(f))) {
            specs.push({
              key: `B|${f}|${arch}|${n}|${vpKey(vp)}`, seats,
              bots: seats.map((x) => (x === f ? ARCHETYPES[arch] : ARCHETYPES.ausgewogen)), vpLimit: vp,
              seed: seedOf('B', f, n, vpKey(vp), seats.join()), games, details: false,
            });
          }
        }
      }
    }
  }
  const t0 = Date.now();
  const results = await pool.run(specs, progress('Versuch A + B'));
  save('strategies', { meta: { games, date: new Date().toISOString(), seconds: (Date.now() - t0) / 1000, patch }, results: Object.fromEntries(results) });
}

/** Beste Spielweise je Fraktion aus Versuch B (Siegquote relativ zur Erwartung, gemittelt über alle Einstellungen) */
export function bestArchetypes(saved: Saved, vp = '30'): Record<Faction, BotParams> {
  const out = {} as Record<Faction, BotParams>;
  for (const f of [0, 1, 2, 3] as Faction[]) {
    let best = ARCHETYPE_NAMES[0];
    let bestScore = -1;
    for (const arch of ARCHETYPE_NAMES) {
      let score = 0;
      for (const n of [2, 3, 4]) {
        const agg = saved.results[`B|${f}|${arch}|${n}|${vp}`];
        if (agg) score += (agg.factions[f].wins / agg.factions[f].games) * n;
      }
      if (score > bestScore) {
        bestScore = score;
        best = arch;
      }
    }
    out[f] = { ...ARCHETYPES[best] };
  }
  return out;
}

/** Optimierung je Siegpunkt-Einstellung (--vp 30|40|inf für nur eine), gespeichert als tuned-<vp>.json */
async function runTune(pool: Pool) {
  const saved = load<Saved>('strategies');
  const vpArg = optStr('vp');
  const modes = vpArg ? [vpArg === 'inf' ? null : Number(vpArg)] : VP_MODES;
  for (const vp of modes) {
    console.log(`Optimierung für ${vp === null ? '∞' : vp + ' Siegpunkte'}`);
    // --warm: bei den zuletzt optimierten Einstellungen weitermachen (schnelles Nachjustieren nach Wertänderungen)
    const previous = argv.includes('--warm') ? load<{ best: Record<Faction, BotParams> }>(`tuned-${vpKey(vp)}`) : null;
    const start = previous ? previous.best : saved ? bestArchetypes(saved, vpKey(vp))
      : ([0, 1, 2, 3].map(() => ({ ...ARCHETYPES.ausgewogen })) as unknown as Record<Faction, BotParams>);
    const result = await tune(pool, start, {
      generations: opt('gens', 16), lambda: opt('lambda', 12), seed: opt('seed', 1), games2: opt('g2', 50), games4: opt('g4', 10), vpLimit: vp,
      sigma: opt('sigma', previous ? 0.08 : 0.18),
    });
    save(`tuned-${vpKey(vp)}`, { ...result, meta: { patch, vp: vpKey(vp), date: new Date().toISOString() } });
  }
  // Die Strategiewahl gehört zu den alten optimierten Einstellungen
  rmSync(join(OUT, 'selected.json'), { force: true });
}

/** Optimierte Einstellungen für eine Siegpunkt-Einstellung (ältere Läufe: tuned.json für alle) */
function tunedFor(vp: number | null): { best: Record<Faction, BotParams> } {
  const tuned = load<{ best: Record<Faction, BotParams> }>(`tuned-${vpKey(vp)}`) ?? load<{ best: Record<Faction, BotParams> }>('tuned');
  if (!tuned) throw new Error('Erst "tune" ausführen.');
  return tuned;
}

/** Kandidaten der Strategiewahl je Fraktion: die optimierten Einstellungen aller Siegpunkt-Einstellungen und die fünf Spielweisen */
function candidates(f: Faction): Array<{ name: string; params: BotParams }> {
  const tuned = VP_MODES.flatMap((vp) => {
    const t = load<{ best: Record<Faction, BotParams> }>(`tuned-${vpKey(vp)}`);
    return t ? [{ name: `optimiert für ${vp === null ? '∞' : `${vp} SP`}`, params: t.best[f] }] : [];
  });
  return [...tuned, ...ARCHETYPE_NAMES.map((a) => ({ name: ARCHETYPE_LABEL[a], params: ARCHETYPES[a] }))];
}

export interface Choice {
  name: string;
  params: BotParams;
  /** Siegquote (entschiedene Partien) je Kandidat */
  rates: Record<string, number>;
}
export const choiceKey = (f: Faction, n: number, vp: number | null) => `${f}|${n}|${vpKey(vp)}`;

/**
 * Strategiewahl: Der Optimierer bewertet 2 und 4 Spieler gemeinsam und kann dabei eine Strategie finden, die in einer
 * Spielerzahl versagt. Hier probiert jede Fraktion je Spielerzahl und Siegpunkt-Einstellung alle Kandidaten gegen die
 * optimierten Gegner (gleiche Seeds für alle Kandidaten) und behält die beste. „final“ nutzt diese Wahl.
 * --again: weiterer Durchgang, die Gegner spielen je zur Hälfte ihre optimierte und ihre zuletzt gewählte Strategie.
 * Das dämpft Kreisläufe (A schlägt B, B schlägt C …), wenn alle Fraktionen gleichzeitig wechseln.
 */
async function select(pool: Pool) {
  const games = opt('games', 50);
  const previous = argv.includes('--again') ? load<{ meta: { rounds?: number }; choice: Record<string, Choice> }>('selected') : null;
  const specs: JobSpec[] = [];
  for (const n of [2, 3, 4]) {
    for (const vp of VP_MODES.filter((v) => allowed(n, v))) {
      const tuned = tunedFor(vp).best;
      const fields: Array<Record<number, BotParams>> = [tuned];
      if (previous) fields.push(Object.fromEntries(([0, 1, 2, 3] as Faction[]).map((x) => [x, previous.choice[choiceKey(x, n, vp)]?.params ?? tuned[x]])));
      for (const f of [0, 1, 2, 3] as Faction[]) {
        candidates(f).forEach((c, ci) => {
          for (const seats of seatings(n).filter((s) => s.includes(f))) {
            fields.forEach((field, fi) => specs.push({
              key: `S|${f}|${ci}|${n}|${vpKey(vp)}`, seats, bots: seats.map((x) => (x === f ? c.params : field[x])), vpLimit: vp,
              seed: seedOf('S', n, vpKey(vp), seats.join(), fi), games: Math.ceil(games / fields.length), details: false, rules,
            }));
          }
        });
      }
    }
  }
  const t0 = Date.now();
  const results = await pool.run(specs, progress('Strategiewahl'));
  const choice: Record<string, Choice> = {};
  for (const n of [2, 3, 4]) {
    for (const vp of VP_MODES.filter((v) => allowed(n, v))) {
      for (const f of [0, 1, 2, 3] as Faction[]) {
        const cands = candidates(f);
        const rates = cands.map((_, ci) => {
          const fa = results.get(`S|${f}|${ci}|${n}|${vpKey(vp)}`)?.factions[f];
          return fa ? fa.wins / Math.max(1, fa.games - fa.draws) : 0;
        });
        const best = rates.indexOf(Math.max(...rates));
        choice[choiceKey(f, n, vp)] = { name: cands[best].name, params: cands[best].params, rates: Object.fromEntries(cands.map((c, i) => [c.name, rates[i]])) };
      }
    }
  }
  const rounds = (previous?.meta.rounds ?? 1) + (previous ? 1 : 0);
  save('selected', { meta: { games, rounds, date: new Date().toISOString(), seconds: (Date.now() - t0) / 1000, patch, rules }, choice });
}

/** Gewählte Strategie je Fraktion und Einstellung (Strategiewahl), sonst die optimierte */
function botFor(selected: { choice: Record<string, Choice> } | null, f: Faction, n: number, vp: number | null): BotParams {
  return selected?.choice[choiceKey(f, n, vp)]?.params ?? tunedFor(vp).best[f];
}

/** Balance-Urteil: alle Sitzordnungen, jede Fraktion mit ihrer gewählten bzw. optimierten Strategie */
async function final(pool: Pool) {
  const games = opt('games', 250);
  const selected = load<{ choice: Record<string, Choice> }>('selected');
  const specs: JobSpec[] = [];
  for (const n of [2, 3, 4]) {
    for (const vp of VP_MODES.filter((v) => allowed(n, v))) {
      for (const seats of seatings(n)) {
        specs.push({
          key: `C|${n}|${vpKey(vp)}`, seats, bots: seats.map((f) => botFor(selected, f, n, vp)), vpLimit: vp,
          seed: seedOf('C', n, vpKey(vp), seats.join()), games, details: true, rules,
        });
      }
    }
  }
  const t0 = Date.now();
  const results = await pool.run(specs, progress('Balance-Urteil'));
  // --tag name: Was-wäre-wenn-Lauf (meist mit --patch), landet in final-<name>.json statt im Hauptergebnis
  const tag = optStr('tag');
  save(tag ? `final-${tag}` : 'final', {
    meta: { games, date: new Date().toISOString(), seconds: (Date.now() - t0) / 1000, patch, rules, tag, label: optStr('label'), selected: !!selected },
    results: Object.fromEntries(results),
  });
}

/** Überlastungs-Sperre: Je eine Fraktion legt ihre Energiequelle in Reihe 2, sonst dieselben Bots und Seeds wie im Balance-Urteil */
async function exploits(pool: Pool) {
  const tuned = tunedFor(30);
  const games = opt('games', 150);
  const specs: JobSpec[] = [];
  for (const f of [0, 1, 3] as Faction[]) {
    for (const n of [2, 4]) {
      for (const seats of seatings(n).filter((s) => s.includes(f))) {
        specs.push({
          key: `X|${f}|${n}`, seats, vpLimit: n === 2 ? 40 : 30, games, details: false,
          bots: seats.map((x) => (x === f ? { ...tuned.best[x], reactorFront: true } : tuned.best[x])),
          seed: seedOf('C', n, n === 2 ? '40' : '30', seats.join()),
        });
      }
    }
  }
  const results = await pool.run(specs, progress('Überlastungs-Sperre'));
  save('exploits', { meta: { games, date: new Date().toISOString(), patch }, results: Object.fromEntries(results) });
}

/** Namen der Was-wäre-wenn-Läufe (final-<tag>.json) */
function variants(): string[] {
  return readdirSync(OUT).filter((f) => /^final-.+\.json$/.test(f)).map((f) => f.slice(0, -5)).sort();
}

async function main() {
  if (command === 'smoke') return smoke();
  if (command === 'trace') return trace();
  if (command === 'report') return writeReport(load, variants());
  const pool = new Pool(opt('workers', Math.max(1, cpus().length - 4)), workerFile, patch);
  try {
    if (command === 'strategies' || command === 'all') await strategies(pool);
    if (command === 'tune' || command === 'all') await runTune(pool);
    if (command === 'select' || command === 'all') await select(pool);
    if (command === 'final' || command === 'all') await final(pool);
    if (command === 'exploits' || command === 'all') await exploits(pool);
    if (command === 'all') writeReport(load, variants());
    if (!['strategies', 'tune', 'select', 'final', 'exploits', 'all'].includes(command)) console.error(`Unbekannter Befehl: ${command}`);
  } finally {
    await pool.close();
  }
}

await main();
