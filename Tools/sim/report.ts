// Bericht aus den Ergebnissen in Tools/sim/out/*.json: Unterlagen/Balance_Simulation.md und .pdf
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CARDS, CARD_OF_EAN, FACTIONS, FACTION_COLORS, SCARETECH, STARTING_EANS, type Faction } from '../../src/engine/data';
import { factionOfCardId, kindOfCardId } from '../../src/engine/cards';
import { UPGRADE_EFFECTS } from '../../src/ui/cardText';
import { unitDuel } from './duel';
import { cardsKey } from './jobs';
import { ARCHETYPES, ARCHETYPE_LABEL, ARCHETYPE_NAMES, PARAM_KEYS, PARAM_RANGES, type BotParams, type ParamKey } from './params';
import { markdownToHtml, printPdf, reportPage, writeHtml } from './pdf';
import { emptyAgg, mergeAgg, wilson, type Agg } from './stats';
import type { TuneResult } from './tune';

interface Saved {
  meta: { games: number; date: string; seconds: number; patch?: unknown; rules?: unknown; label?: string; selected?: boolean };
  results: Record<string, Agg>;
}

interface Selected {
  meta: { games: number; rounds?: number; cards?: string };
  choice: Record<string, { name: string; rates: Record<string, number> }>;
}

const F: Faction[] = [0, 1, 2, 3];

/**
 * Stärke, wenn nur diese Fraktion ihre Strategie wählt und die anderen bei ihren bleiben (beste Siegquote der Strategiewahl),
 * gemittelt über alle Einstellungen wie strengths()
 */
function soloStrength(selected: Selected, f: Faction): number {
  let r = 0;
  let cnt = 0;
  for (const [key, c] of Object.entries(selected.choice)) {
    const [kf, n] = key.split('|').map(Number);
    if (kf !== f) continue;
    r += Math.max(...Object.values(c.rates)) * n;
    cnt++;
  }
  return cnt ? r / cnt : 0;
}
/** Überlastungs-Sperre vor der Regeländerung: ausgesetzte Züge je Partie mit Energiequelle in Reihe 2 (Bericht vom 27.9.2026) */
const LOCK_BEFORE = '3,9';
/** Scaretech-Planet Wurmloch */
const WORMHOLE_ID = 54;
const NS = [2, 3, 4];
const VPS = ['30', '40', 'inf'];
const VP_LABEL: Record<string, string> = { 30: '30 SP', 40: '40 SP', inf: '∞' };
const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits).replace('.', ',')} %`;
const num = (x: number, digits = 1) => x.toFixed(digits).replace('.', ',');

/** Anteil an den entschiedenen Partien, in denen die Fraktion mitspielte */
function share(agg: Agg | undefined, f: Faction): { k: number; n: number } {
  const fa = agg?.factions[f];
  if (!fa || !agg) return { k: 0, n: 0 };
  return { k: fa.wins, n: Math.max(1, fa.games - fa.draws) };
}

/** Siegquote relativ zur fairen Erwartung 1/n (1,00 = fair) */
const rel = (k: number, n: number, players: number) => (k / n) * players;

/** Stärke relativ zu fair, gemittelt über die Spielerzahlen mit Partien (zu zweit gibt es keine 30 SP) */
function meanRel(saved: Saved, key: (n: number) => string, f: Faction): number {
  let r = 0;
  let cnt = 0;
  for (const n of NS) {
    const { k, n: m } = share(saved.results[key(n)], f);
    if (!m) continue;
    r += rel(k, m, n);
    cnt++;
  }
  return cnt ? r / cnt : 0;
}

function cell(agg: Agg | undefined, f: Faction, players: number): string {
  const { k, n } = share(agg, f);
  if (!n) return '–';
  const [lo, hi] = wilson(k, n);
  const exp = 1 / players;
  const mark = lo > exp + 0.02 ? ' ▲' : hi < exp - 0.02 ? ' ▼' : '';
  return `${pct(k / n)} (${pct(lo, 0)}–${pct(hi, 0)})${mark}`;
}

function table(head: string[], rows: string[][]): string {
  return [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

function sumAgg(aggs: Array<Agg | undefined>): Agg {
  return aggs.reduce<Agg>((acc, a) => (a ? mergeAgg(acc, a) : acc), emptyAgg());
}

type Strength = { f: Faction; r: number; lo: number; hi: number };

/** Stärke je Fraktion (1 = fair) mit 95-%-Bereich, gemittelt über die gewählten Spielerzahlen und Siegpunkt-Einstellungen */
function strengths(saved: Saved, ns = NS, vps = VPS): Strength[] {
  return F.map((f) => {
    let r = 0;
    let lo = 0;
    let hi = 0;
    let cnt = 0;
    for (const n of ns) {
      for (const vp of vps) {
        const { k, n: m } = share(saved.results[`C|${n}|${vp}`], f);
        if (!m) continue;
        const [l, h] = wilson(k, m);
        r += rel(k, m, n);
        lo += l * n;
        hi += h * n;
        cnt++;
      }
    }
    return { f, r: r / cnt, lo: lo / cnt, hi: hi / cnt };
  });
}

/** Mittlere Abweichung aller Fraktionen von fair (quadratisches Mittel): 0 = alle genau fair */
const deviation = (st: Array<{ r: number }>) => Math.sqrt(st.reduce((n, x) => n + (x.r - 1) ** 2, 0) / st.length);

/** Anteil als Prozentpunkte, ohne „-0“ */
const points = (x: number) => `${Math.round(x * 100) || 0} Pkt.`;

/** Vorteil von Platz 1 gegenüber dem letzten Platz (Anteil entschiedener Partien, über alle Siegpunkt-Einstellungen) */
function seatEdgeOf(saved: Saved, n: number): number {
  const all = sumAgg(VPS.map((v) => saved.results[`C|${n}|${v}`]));
  const rate = (i: number) => {
    let k = 0;
    let m = 0;
    for (const fa of Object.values(all.factions)) {
      k += fa.seatWins[i];
      m += fa.seatGames[i] - fa.seatDraws[i];
    }
    return m ? k / m : 0;
  };
  return rate(0) - rate(n - 1);
}
const verdictText = (r: number) =>
  r >= 1.2 ? '**zu stark**' : r >= 1.1 ? 'etwas zu stark' : r <= 0.8 ? '**zu schwach**' : r <= 0.9 ? 'etwas zu schwach' : 'ausgeglichen';

// ---------------------------------------------------------------- Diagramme (nur im PDF)

function scaleMax(values: number[]): number {
  return Math.max(2, Math.ceil(Math.max(...values) * 2) / 2);
}

function axis(L: number, R: number, top: number, bottom: number, max: number): string {
  const x = (v: number) => L + (v / max) * (R - L);
  let svg = '';
  for (let v = 0; v <= max + 1e-9; v += 0.5) {
    svg += `<line x1="${x(v)}" y1="${top}" x2="${x(v)}" y2="${bottom}" stroke="#d6d3cb" stroke-width="1"/>`;
    svg += `<text x="${x(v)}" y="${bottom + 14}" text-anchor="middle" fill="#5a6068">${num(v, 1)}</text>`;
  }
  svg += `<line x1="${x(1)}" y1="${top - 6}" x2="${x(1)}" y2="${bottom}" stroke="#1b1f24" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  svg += `<text x="${x(1)}" y="${top - 9}" text-anchor="middle" fill="#1b1f24" font-weight="600">fair</text>`;
  return svg;
}

function strengthChart(rows: Strength[], caption: string): string {
  const W = 640;
  const L = 100;
  const R = 610;
  const top = 24;
  const rowH = 30;
  const bottom = top + rows.length * rowH;
  const max = scaleMax(rows.map((x) => x.hi));
  const x = (v: number) => L + (v / max) * (R - L);
  let svg = `<svg viewBox="0 0 ${W} ${bottom + 22}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, sans-serif" font-size="11">`;
  svg += axis(L, R, top, bottom, max);
  rows.forEach((row, i) => {
    const y = top + i * rowH + 6;
    svg += `<text x="${L - 8}" y="${y + 13}" text-anchor="end" font-weight="600" fill="#1b1f24">${FACTIONS[row.f]}</text>`;
    svg += `<rect x="${x(0)}" y="${y}" width="${x(row.r) - x(0)}" height="18" rx="2" fill="${FACTION_COLORS[row.f]}" stroke="#0006"/>`;
    svg += `<line x1="${x(row.lo)}" y1="${y + 9}" x2="${x(row.hi)}" y2="${y + 9}" stroke="#1b1f24" stroke-width="1.2"/>`;
    for (const v of [row.lo, row.hi]) svg += `<line x1="${x(v)}" y1="${y + 4}" x2="${x(v)}" y2="${y + 14}" stroke="#1b1f24" stroke-width="1.2"/>`;
    svg += `<text x="${x(Math.max(row.r, row.hi)) + 6}" y="${y + 13}" fill="#1b1f24">${num(row.r, 2)}</text>`;
  });
  return `<figure class="chart">${svg}</svg><figcaption>${caption}</figcaption></figure>`;
}

function variantChart(rows: Array<{ label: string; st: Strength[] }>, caption: string): string {
  const W = 640;
  const L = 250;
  const R = 610;
  const top = 24;
  const rowH = 26;
  const bottom = top + rows.length * rowH;
  const max = scaleMax(rows.flatMap((r) => r.st.map((s) => s.r)));
  const x = (v: number) => L + (v / max) * (R - L);
  let svg = `<svg viewBox="0 0 ${W} ${bottom + 22}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, sans-serif" font-size="10.5">`;
  svg += axis(L, R, top, bottom, max);
  rows.forEach((row, i) => {
    const y = top + i * rowH + rowH / 2;
    const esc = row.label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    svg += `<text x="${L - 10}" y="${y + 4}" text-anchor="end" fill="#1b1f24">${esc}</text>`;
    svg += `<line x1="${x(Math.min(...row.st.map((s) => s.r)))}" y1="${y}" x2="${x(Math.max(...row.st.map((s) => s.r)))}" y2="${y}" stroke="#8a9098" stroke-width="2"/>`;
    for (const s of row.st) svg += `<circle cx="${x(s.r)}" cy="${y}" r="6" fill="${FACTION_COLORS[s.f]}" stroke="#1b1f24" stroke-width="1"/>`;
  });
  const legend = F.map((f, i) => `<circle cx="${L + i * 90 + 6}" cy="${bottom + 30}" r="5" fill="${FACTION_COLORS[f]}" stroke="#1b1f24"/>`
    + `<text x="${L + i * 90 + 15}" y="${bottom + 34}" fill="#1b1f24">${FACTIONS[f]}</text>`).join('');
  svg = svg.replace(`viewBox="0 0 ${W} ${bottom + 22}"`, `viewBox="0 0 ${W} ${bottom + 42}"`);
  return `<figure class="chart">${svg}${legend}</svg><figcaption>${caption}</figcaption></figure>`;
}

// ---------------------------------------------------------------- Karten

function unitIds(f: Faction) {
  return CARDS.filter((c) => factionOfCardId(c.id) === f && kindOfCardId(c.id) === 'unit').map((c) => c.id);
}

/** Kampfwert jeder Einheit: mittlere Siegchance (als Angreifer und Verteidiger) gegen alle Einheiten der anderen Fraktionen */
function duelTable(): Array<{ id: number; score: number; per1000: number }> {
  const all = F.flatMap(unitIds);
  const fighter = (id: number) => ({ def: CARDS[id].def, off: CARDS[id].off, dmg: CARDS[id].dmg });
  return all.map((id) => {
    const enemies = all.filter((e) => factionOfCardId(e) !== factionOfCardId(id));
    let sum = 0;
    for (const e of enemies) sum += 0.5 * (unitDuel(fighter(id), fighter(e)).attWin + unitDuel(fighter(e), fighter(id)).defWin);
    const score = sum / enemies.length;
    return { id, score, per1000: (score / CARDS[id].price) * 1000 };
  });
}

const START_CARD_IDS = new Set(Object.values(STARTING_EANS).flat().map((ean) => CARD_OF_EAN[ean]));

/** Gewählte Strategien einer Fraktion über alle Einstellungen, häufigste zuerst */
function chosenText(selected: Selected, f: Faction): string {
  const count = new Map<string, number>();
  for (const [key, c] of Object.entries(selected.choice)) if (key.startsWith(`${f}|`)) count.set(c.name, (count.get(c.name) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1]).map(([name, n]) => `${name} (${n})`).join(', ');
}

function openingText(key: string): string {
  return key.split('|').map((part, i) => {
    const names = part === '-' ? '–' : part.split('+').map((id) => CARDS[Number(id)].name).join(', ');
    return `R${i + 1}: ${names}`;
  }).join(' · ');
}

// ---------------------------------------------------------------- Strategien

const PARAM_LABEL: Record<ParamKey, string> = {
  econ: 'Wirtschaft (Handelsplaneten)', military: 'Einheiten', air: 'Hyperraumschiffe', vp: 'Siegpunkte (Planeten, Upgrades)',
  tech: 'Technologiebaum', upgrades: 'Upgrade-Wirkungen', superweapon: 'Superwaffe', defense: 'Verteidigung',
  minFront: 'Mindestbesetzung Reihe 1', reserve: 'Credit-Reserve', patience: 'Sparen auf teure Karten',
  aggression: 'Angriffslust', hqFocus: 'Planeten-/Zentralgestirn-Angriffe', leader: 'Führenden angreifen (1) / Schwächsten (0)',
  repair: 'Reparieren', hqBack: 'Zentralgestirn hinten (≥ 0,5)',
};

/** Klartext je Stellschraube: [deutlich höher, deutlich niedriger als „Ausgewogen“] */
const PARAM_PHRASE: Record<ParamKey, [string, string]> = {
  econ: ['setzt auf Handelsplaneten', 'wenig Wirtschaft'], military: ['viele Einheiten', 'wenige Einheiten'],
  air: ['setzt auf Hyperraumschiffe', 'kaum Hyperraumschiffe'], vp: ['sammelt Siegpunkte (Planeten, Upgrades)', 'kaum Siegpunkte über Planeten und Upgrades'],
  tech: ['baut den Technologiebaum aus', 'kaum Technologiebaum'], upgrades: ['kauft Upgrades', 'kaum Upgrades'],
  superweapon: ['strebt die Superwaffe an', 'keine Superwaffe'], defense: ['starke Verteidigung', 'wenig Verteidigung'],
  minFront: ['volle 1. Reihe', 'dünne 1. Reihe'], reserve: ['hält Credits zurück', 'gibt fast alles aus'],
  patience: ['spart auf teure Karten', 'kauft sofort, statt zu sparen'], aggression: ['greift oft an', 'greift nur bei klarem Vorteil an'],
  hqFocus: ['zielt auf Planeten und das Zentralgestirn', 'greift kaum Planeten an'], leader: ['bremst den Führenden', 'greift den Schwächsten an'],
  repair: ['repariert viel', 'repariert kaum'], hqBack: ['Zentralgestirn hinten', 'Zentralgestirn vorn'],
};

/** Die deutlichsten Abweichungen von „Ausgewogen“, stärkste zuerst (Hyperraumschiffe nicht bei Scaretech: sie hat keine) */
function describe(p: BotParams, f: Faction, limit = 5): string[] {
  const base = ARCHETYPES.ausgewogen;
  return PARAM_KEYS
    .map((k) => ({ k, d: (p[k] - base[k]) / (PARAM_RANGES[k][1] - PARAM_RANGES[k][0]) }))
    .filter(({ k, d }) => Math.abs(d) >= 0.12 && k !== 'hqBack' && !(k === 'air' && f === SCARETECH))
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    .slice(0, limit)
    .map(({ k, d }) => PARAM_PHRASE[k][d > 0 ? 0 : 1]);
}

function fmtParam(k: ParamKey, v: number): string {
  if (k === 'reserve' || k === 'aggression') return String(Math.round(v));
  return num(v, 2);
}

/** Beste Spielweise je Fraktion aus Versuch B (30 SP, gemittelt über die Spielerzahlen mit Partien) */
function bestArchetype(strategies: Saved, f: Faction, vp = '30'): { name: string; r: number } {
  let best = { name: '–', r: -1 };
  for (const a of ARCHETYPE_NAMES) {
    const r = meanRel(strategies, (n) => `B|${f}|${a}|${n}|${vp}`, f);
    if (r > best.r) best = { name: ARCHETYPE_LABEL[a], r };
  }
  return best;
}

// ---------------------------------------------------------------- Bericht

export function writeReport(load: <T>(name: string) => T | null, variantNames: string[] = []) {
  const strategies = load<Saved>('strategies');
  // Optimierte Einstellungen je Siegpunkt-Einstellung; ältere Läufe haben nur tuned.json (für alle)
  const tunedBy: Record<string, TuneResult | null> = Object.fromEntries(VPS.map((vp) => [vp, load<TuneResult>(`tuned-${vp}`) ?? load<TuneResult>('tuned')]));
  const tuned = tunedBy['30'];
  const tunedModes = VPS.filter((vp) => load<TuneResult>(`tuned-${vp}`) !== null);
  const final = load<Saved>('final');
  // Strategiewahl je Spielerzahl und Siegpunkt-Einstellung (run.ts select); nur gültig, wenn das Balance-Urteil sie benutzt hat
  const selected = final?.meta.selected ? load<Selected>('selected') : null;
  const exploits = load<Saved>('exploits');
  const variants = variantNames.map((name) => load<Saved>(name)).filter((v): v is Saved => v !== null);
  // Abschnittsnummern: Es zählen nur Abschnitte, für die es Daten gibt
  const S: Record<string, number> = {};
  const present: Array<[string, boolean]> = [
    ['balance', !!final], ['seats', !!final], ['same', !!strategies], ['fit', !!strategies], ['tuned', !!tuned], ['upgrades', !!final],
    ['whatif', !!final && variants.length > 0], ['rules', !!final], ['cards', true], ['model', true], ['repro', true],
  ];
  for (const [key, on] of present) if (on) S[key] = Object.keys(S).length + 1;
  // Überlastung: ausgesetzte Züge je Partie mit der Energiequelle hinten bzw. in Reihe 2 (Versuch „exploits“)
  const overloadRows = F.filter((f) => f !== SCARETECH).flatMap((f) => [2, 4].map((n) => {
    // Zu zweit gibt es keine 30-SP-Partien mehr: Vergleich bei 40 SP
    const baseAgg = final?.results[`C|${n}|${n === 2 ? '40' : '30'}`];
    const xAgg = exploits?.results[`X|${f}|${n}`];
    const b = baseAgg?.factions[f];
    const x = xAgg?.factions[f];
    if (!b || !x) return null;
    const sb = share(baseAgg, f);
    const sx = share(xAgg, f);
    return { f, n, back: b.overloads / b.games, front: x.overloads / x.games, winBack: sb.k / sb.n, winFront: sx.k / sx.n };
  })).filter((r) => r !== null);
  // Upgrades: kaufbar, gekauft, Siegquote je Upgrade über alle Partien des Balance-Urteils
  const upgradeRows = final ? (() => {
    const all = sumAgg(Object.values(final.results));
    return F.flatMap((f) => {
      const fa = all.factions[f];
      if (!fa) return [];
      return CARDS.filter((c) => factionOfCardId(c.id) === f && kindOfCardId(c.id) === 'upgrade').map((c) => {
        const [n, wins] = fa.cards[c.id] ?? [0, 0];
        const offered = fa.offered?.[c.id] ?? 0;
        return {
          f, id: c.id, name: c.name, price: c.price, requires: CARDS[c.requires].name, n, offered: offered / fa.games,
          bought: offered ? Math.min(1, n / offered) : 0, winWith: n ? wins / n : 0, winWithout: (fa.wins - wins) / Math.max(1, fa.games - n),
        };
      });
    });
  })() : null;
  const duels = duelTable();
  const charts: Record<string, string> = {};
  const out: string[] = [];
  const w = (...lines: string[]) => out.push(...lines);
  const date = new Date().toLocaleDateString('de-DE');

  w('# Balance-Simulation Domination', '');
  w(`Erzeugt am ${date} mit dem Balance-Simulator (\`npm run sim\`, Tools/sim/). `
    + `Die Partien laufen über die echte Spiel-Engine der App. Spielfeld, verdeckte Planeten und die Entscheidungen übernehmen Strategie-Bots (Modell und Grenzen in Abschnitt ${S.model}).`, '');
  const patched = final?.meta.patch ?? strategies?.meta.patch;
  if (patched) w(`> **Achtung:** Diese Ergebnisse gelten für geänderte Kartenwerte: \`${JSON.stringify(patched)}\``, '');

  // ---------- Kurzfassung
  if (final) {
    w('## Kurzfassung', '');
    const verdict = strengths(final);
    w(`**Stärke** je Fraktion, wenn jede ihre beste gefundene Strategie spielt (Abschnitt ${S.tuned}${selected ? ', je Spielerzahl und Siegpunkt-Einstellung die beste von acht' : ''}), gemittelt über 2–4 Spieler und alle Siegpunkt-Einstellungen. `
      + '1,00 ist eine faire Siegquote (1 / Spielerzahl), 1,20 heißt 20 % häufiger als fair.', '');
    w(table(['Fraktion', 'Stärke', 'Bereich (95 %)', 'Einschätzung', `Beste Spielweise (Abschnitt ${S.fit})`, selected ? 'Gewählte Strategien (Anzahl Einstellungen)' : 'Optimierte Strategie bei 30 SP: Schwerpunkte'],
      verdict.map(({ f, r, lo, hi }) => [
        FACTIONS[f], num(r, 2), `${num(lo, 2)}–${num(hi, 2)}`, verdictText(r),
        strategies ? bestArchetype(strategies, f).name : '–',
        selected ? chosenText(selected, f) : tuned ? describe(tuned.best[f], f, 3).join(', ') : '–',
      ])), '');
    charts.strength = strengthChart(verdict, 'Stärke je Fraktion (Balken) mit 95-%-Bereich (Linie). Gestrichelt: faire Siegquote.');
    w('@@CHART:strength@@', '');

    // Auffälligkeiten automatisch aus den Zahlen
    const notes: string[] = [];
    const sorted = [...verdict].sort((a, b) => b.r - a.r);
    notes.push(`**Stärkste Fraktion: ${FACTIONS[sorted[0].f]}** (${num(sorted[0].r, 2)}), **schwächste: ${FACTIONS[sorted[3].f]}** (${num(sorted[3].r, 2)}).`);
    // Die Siegquoten der Strategiewahl gelten nur für die Kartenwerte, mit denen sie lief
    if (selected && selected.meta.cards === cardsKey()) {
      const solo = F.map((f) => ({ f, r: soloStrength(selected, f), all: verdict.find((v) => v.f === f)!.r }));
      const strong = solo.filter((x) => x.r >= 1.1 && x.all >= 1.1).map((x) => FACTIONS[x.f]);
      const weak = solo.filter((x) => x.r <= 0.9 && x.all <= 0.9).map((x) => FACTIONS[x.f]);
      const unsure = solo.filter((x) => Math.abs(x.r - x.all) >= 0.15).map((x) => FACTIONS[x.f]);
      notes.push('**Wie sicher ist das?** Die Stärke hängt auch davon ab, welche Strategien die anderen spielen. Wählt nur eine Fraktion ihre beste Strategie und die anderen bleiben bei ihren, '
        + `ergibt sich: ${solo.map((x) => `${FACTIONS[x.f]} ${num(x.r, 2)}`).join(', ')}. `
        + (strong.length ? `In beiden Messungen zu stark: **${strong.join(', ')}**. ` : '')
        + (weak.length ? `In beiden Messungen zu schwach: **${weak.join(', ')}**. ` : '')
        + (unsure.length ? `Bei ${unsure.join(' und ')} liegen die Messungen weit auseinander: Dort entscheidet eher die Spielweise der anderen als das Kartenmaterial.` : ''));
    }
    let worst = { f: 0 as Faction, n: 2, r: 1 };
    for (const n of NS) for (const s of strengths(final, [n])) if (Math.abs(s.r - 1) > Math.abs(worst.r - 1)) worst = { f: s.f, n, r: s.r };
    notes.push(`Am deutlichsten ist die Abweichung bei **${worst.n} Spielern**: ${FACTIONS[worst.f]} gewinnt ${pct(worst.r / worst.n, 0)} der entschiedenen Partien (fair: ${pct(1 / worst.n, 0)}).`);
    const top = [...duels].sort((a, b) => b.per1000 - a.per1000)[0];
    const next = [...duels].filter((d) => factionOfCardId(d.id) !== factionOfCardId(top.id)).sort((a, b) => b.per1000 - a.per1000)[0];
    const c = CARDS[top.id];
    notes.push(`Auffälligste Karte: **${c.name}** (${FACTIONS[factionOfCardId(top.id)]}, ${c.price} Credits, ${c.def}/${c.off}/${c.dmg}) mit dem höchsten Kampfwert je Credit im Spiel `
      + `(${num(top.per1000, 2)} je 1000 Credits, beste Einheit einer anderen Fraktion: ${CARDS[next.id].name} mit ${num(next.per1000, 2)})`
      + `${START_CARD_IDS.has(c.requires) ? `, schon über den Startplaneten ${CARDS[c.requires].name} zu haben` : ''} (Abschnitt ${S.cards}).`);
    const label = (v: Saved) => v.meta.label ?? JSON.stringify(v.meta.patch ?? v.meta.rules);
    // Fairste Sitzreihenfolge unter den getesteten Varianten (Summe der Vorteile von Platz 1 zu zweit und zu viert)
    const seatScore = (v: Saved) => Math.abs(seatEdgeOf(v, 2)) + Math.abs(seatEdgeOf(v, 4));
    const bestSeat = [...variants].sort((a, b) => seatScore(a) - seatScore(b))[0];
    if (bestSeat && seatScore(bestSeat) < seatScore(final) - 0.03) {
      notes.push(`Fairste getestete Sitzreihenfolge: **${label(bestSeat)}**. Vorteil des Startspielers zu zweit ${points(seatEdgeOf(bestSeat, 2))} statt ${points(seatEdgeOf(final, 2))}, `
        + `zu viert ${points(seatEdgeOf(bestSeat, 4))} statt ${points(seatEdgeOf(final, 4))} (Abschnitt ${S.whatif}).`);
    }
    const best = variants.map((v) => ({ v, st: strengths(v) })).sort((a, b) => deviation(a.st) - deviation(b.st))[0];
    if (best && deviation(best.st) < deviation(verdict) - 0.02) {
      const order = [...best.st].sort((a, b) => b.r - a.r);
      notes.push(`Am ausgeglichensten von den getesteten Änderungen: **${best.v.meta.label ?? JSON.stringify(best.v.meta.patch)}** `
        + `(mittlere Abweichung von fair ${num(deviation(best.st), 2)} statt ${num(deviation(verdict), 2)}). `
        + (deviation(best.st) <= 0.05
          ? `Damit liegen alle Fraktionen zwischen ${num(order[3].r, 2)} und ${num(order[0].r, 2)}, also nahe bei fair (Abschnitt ${S.whatif}).`
          : `Danach ist ${FACTIONS[order[0].f]} am stärksten (${num(order[0].r, 2)}) und ${FACTIONS[order[3].f]} am schwächsten (${num(order[3].r, 2)}) (Abschnitt ${S.whatif}).`));
    }
    const four = sumAgg(VPS.map((v) => final.results[`C|4|${v}`]));
    const seatRate = (agg: Agg, i: number) => {
      let k = 0;
      let m = 0;
      for (const fa of Object.values(agg.factions)) {
        k += fa.seatWins[i];
        m += fa.seatGames[i] - fa.seatDraws[i];
      }
      return m ? k / m : 0;
    };
    const two = sumAgg(VPS.map((v) => final.results[`C|2|${v}`]));
    const edge = Math.max(Math.abs(seatEdgeOf(final, 2)), Math.abs(seatEdgeOf(final, 4)));
    notes.push(`**Sitzreihenfolge** (mit letzter Runde und Startkapital-Ausgleich): Zu viert gewinnt Platz 1 ${pct(seatRate(four, 0), 0)} und Platz 4 ${pct(seatRate(four, 3), 0)} (fair: 25 %), `
      + `zu zweit Platz 1 ${pct(seatRate(two, 0), 0)} und Platz 2 ${pct(seatRate(two, 1), 0)}. `
      + (edge < 0.03 ? 'Das ist praktisch fair.' : seatEdgeOf(final, 4) + seatEdgeOf(final, 2) > 0 ? 'Der Startspieler hat noch einen kleinen Vorteil.' : 'Die späteren Plätze sind jetzt leicht im Vorteil.')
      + ` (Abschnitt ${S.seats})`);
    const pointGames = sumAgg(Object.entries(final.results).filter(([k]) => !k.endsWith('|inf')).map(([, a]) => a));
    if (pointGames.finalRounds) {
      notes.push(`**Letzte Runde:** In ${pct(pointGames.overtaken / Math.max(1, pointGames.byPoints), 0)} der Punktsiege gewann nicht, wer das Siegpunkt-Ziel zuerst erreicht hatte, `
        + 'sondern ein Spieler, der in der letzten Runde noch vorbeizog (Upgrades, Sterne, zerstörte Planeten).');
    }
    if (upgradeRows) {
      const perGame = F.map((f) => {
        const fa = sumAgg(Object.values(final.results)).factions[f];
        return `${FACTIONS[f]} ${num(fa ? fa.upgrades / fa.games : 0)}`;
      });
      const rare = upgradeRows.filter((u) => u.offered < 0.15).map((u) => u.name);
      const skipped = upgradeRows.filter((u) => u.offered >= 0.15 && u.bought < 0.2).map((u) => u.name);
      notes.push(`**Upgrades** je Partie: ${perGame.join(', ')}. `
        + (rare.length ? `Selten kaufbar, weil die Voraussetzung selten gebaut wird: ${rare.join(', ')}. ` : '')
        + (skipped.length ? `Kaufbar, aber selten gekauft (Wirkung für den Preis zu schwach): ${skipped.join(', ')}. ` : '')
        + `(Abschnitt ${S.upgrades})`);
    }
    const inf2 = final.results['C|2|inf'];
    if (inf2 && inf2.draws / inf2.games > 0.1) {
      notes.push(`„∞“ zu zweit zieht sich: Ø ${num(inf2.rounds / inf2.games, 0)} Runden, ${pct(inf2.draws / inf2.games, 0)} der Partien ohne Sieger nach 120 Runden (Abschnitt ${S.rules}).`);
    }
    if (overloadRows.length) {
      const worstFront = Math.max(...overloadRows.map((r) => r.front));
      notes.push(`**Überlastung mit der neuen Regel** (gerettete Energiequelle wird verdeckt neu ausgelegt): Selbst wenn eine Fraktion ihre Energiequelle anfangs in Reihe 2 legt, setzt sie höchstens `
        + `${num(worstFront, 2)} Züge je Partie aus, vorher waren es bis zu ${LOCK_BEFORE} (Abschnitt ${S.rules}).`);
    }
    for (const n of notes) w(`- ${n}`);
    w('');
  }

  // ---------- 1. Balance-Urteil
  if (final) {
    w(`## ${S.balance}. Balance mit optimierten Strategien`, '');
    w(`Jede Fraktion spielt ${selected ? 'je Spielerzahl und Siegpunkt-Einstellung die beste von acht Strategien (Strategiewahl,' : 'die Einstellungen, die der Optimierer für sie gefunden hat ('} Abschnitt ${S.tuned}). Alle Sitzordnungen, ${final.meta.games} Partien je Sitzordnung und Einstellung. `
      + 'Angegeben ist der Anteil an den entschiedenen Partien mit 95-%-Konfidenzintervall; ▲/▼ = deutlich über/unter fair.', '');
    for (const n of NS) {
      // Zu zweit gibt es keine 30-SP-Partien
      const modes = VPS.filter((v) => final.results[`C|${n}|${v}`]);
      w(`### ${n} Spieler (fair: ${pct(1 / n, 0)})`, '');
      w(table(['Fraktion', ...modes.map((v) => VP_LABEL[v])], F.map((f) => [FACTIONS[f], ...modes.map((v) => cell(final.results[`C|${n}|${v}`], f, n))])), '');
      w(table(['', ...modes.map((v) => VP_LABEL[v])], [
        ['Partien', ...modes.map((v) => (final.results[`C|${n}|${v}`]?.games ?? 0).toLocaleString('de-DE'))],
        ['Ø Runden', ...modes.map((v) => { const a = final.results[`C|${n}|${v}`]; return a ? num(a.rounds / a.games) : '–'; })],
        ['Sieg durch Zentralgestirn', ...modes.map((v) => { const a = final.results[`C|${n}|${v}`]; return a ? pct(a.byHq / a.games) : '–'; })],
        ['Remis (nach 120 Runden)', ...modes.map((v) => { const a = final.results[`C|${n}|${v}`]; return a ? pct(a.draws / a.games) : '–'; })],
      ]), '');
    }

    // ---------- 2. Sitzreihenfolge
    w(`## ${S.seats}. Vorteil durch die Sitzreihenfolge`, '');
    w('Anteil an den entschiedenen Partien nach Platz in der Zugreihenfolge (Platz 1 beginnt), über alle Fraktionen und Siegpunkt-Einstellungen. '
      + 'Es gelten die Regeln gegen den Vorteil des Startspielers: Wer das Siegpunkt-Ziel erreicht, löst die letzte Runde aus, und Spieler 2, 3 und 4 bekommen 200, 300 bzw. 400 Credits mehr Startkapital.', '');
    w(table(['Spieler', 'Platz 1', 'Platz 2', 'Platz 3', 'Platz 4', 'fair'], NS.map((n) => {
      const all = sumAgg(VPS.map((v) => final.results[`C|${n}|${v}`]));
      const seat = (i: number) => {
        let k = 0;
        let m = 0;
        for (const fa of Object.values(all.factions)) {
          k += fa.seatWins[i];
          m += fa.seatGames[i] - fa.seatDraws[i];
        }
        return m ? pct(k / m) : '–';
      };
      return [String(n), ...[0, 1, 2, 3].map((i) => (i < n ? seat(i) : '')), pct(1 / n, 0)];
    })), '');
  }

  // ---------- 3. Alle gleich
  if (strategies) {
    w(`## ${S.same}. Wenn alle dieselbe Spielweise wählen`, '');
    w('Alle Spieler nutzen denselben Bot. Unterschiede kommen dann nur vom Kartenmaterial der Fraktionen. '
      + `Stärke relativ zu fair, gemittelt über 2–4 Spieler, bei 30 SP über 3–4 (${strategies.meta.games} Partien je Sitzordnung).`, '');
    for (const vp of VPS) {
      w(`**${VP_LABEL[vp]}**`, '');
      w(table(['Spielweise', ...F.map((f) => FACTIONS[f])], ARCHETYPE_NAMES.map((a) => [ARCHETYPE_LABEL[a], ...F.map((f) =>
        num(meanRel(strategies, (n) => `A|${a}|${n}|${vp}`, f), 2))])), '');
    }

    // ---------- 4. Spielweise je Fraktion
    w(`## ${S.fit}. Welche Spielweise passt zu welcher Fraktion`, '');
    w('Eine Fraktion probiert jede Spielweise, alle Gegner spielen „Ausgewogen“. Stärke relativ zu fair, gemittelt über 2–4 Spieler (bei 30 SP über 3–4). Fett: beste Spielweise der Fraktion.', '');
    w('- **Ausgewogen:** alles in Maßen (Referenz).',
      '- **Händler:** zuerst Handelsplaneten und Einkommen, die Armee später.',
      '- **Blitzangriff:** früh günstige Einheiten, greift jede Runde an, zielt auf Planeten und das Zentralgestirn.',
      '- **Festung:** Planeten, Upgrades, Planetenabwehr, Reparaturen; sammelt Siegpunkte und greift nur bei klarem Vorteil an.',
      '- **Superwaffe:** spart früh auf den Technologiebaum bis zur Superwaffe.', '');
    for (const vp of VPS) {
      w(`**${VP_LABEL[vp]}**`, '');
      const rows = ARCHETYPE_NAMES.map((a) => F.map((f) => meanRel(strategies, (n) => `B|${f}|${a}|${n}|${vp}`, f)));
      const bestOf = F.map((_, fi) => Math.max(...rows.map((r) => r[fi])));
      w(table(['Spielweise', ...F.map((f) => FACTIONS[f])], ARCHETYPE_NAMES.map((a, ai) => [
        ARCHETYPE_LABEL[a], ...rows[ai].map((v, fi) => (v === bestOf[fi] ? `**${num(v, 2)}**` : num(v, 2))),
      ])), '');
    }
  }

  // ---------- 5. Optimierte Strategien
  if (tuned) {
    w(`## ${S.tuned}. Die optimierten Strategien`, '');
    const gens = tuned.history.length;
    const perMode = tunedModes.length > 1;
    w(`Der Optimierer (Evolutionsstrategie, ${gens} Generationen) hat je Fraktion die Einstellungen gesucht, die gegen die jeweils besten der anderen am häufigsten gewinnen (2 und 4 Spieler)`
      + (perMode ? ', getrennt für jede Siegpunkt-Einstellung, denn in langen Partien lohnt sich eine andere Spielweise als in kurzen. ' : ', 30 SP. ')
      + `Startpunkt war die beste Spielweise aus Abschnitt ${S.fit}, bei späteren Läufen die zuletzt optimierten Einstellungen (weiter optimiert mit den aktuellen Regeln). `
      + 'Weil alle vier Fraktionen gleichzeitig optimiert werden, schwankt die Stärke von Generation zu Generation.', '');
    if (perMode) {
      w('**Schwerpunkte je Siegpunkt-Einstellung** (die drei deutlichsten Abweichungen von „Ausgewogen“):', '');
      w(table(['Fraktion', ...tunedModes.map((vp) => VP_LABEL[vp])], F.map((f) => [
        FACTIONS[f], ...tunedModes.map((vp) => describe(tunedBy[vp]!.best[f], f, 3).join(', ')),
      ])), '');
    }
    if (selected) {
      const settings = NS.flatMap((n) => VPS.filter((vp) => selected.choice[`0|${n}|${vp}`]).map((vp) => ({ n, vp })));
      w('**Strategiewahl.** Der Optimierer bewertet 2 und 4 Spieler gemeinsam. Dabei kann er eine Strategie finden, die bei einer Spielerzahl versagt '
        + '(im ersten Lauf etwa ein Biotec, das bei ∞ zu zweit nie angriff und deshalb nie gewann). Darum probiert jede Fraktion je Spielerzahl und Siegpunkt-Einstellung '
        + `${Object.keys(selected.choice['0|4|30']?.rates ?? {}).length} Strategien gegen die optimierten Gegner (${selected.meta.games} Partien je Sitzordnung): `
        + 'ihre drei optimierten und die fünf Spielweisen. Im Balance-Urteil spielt sie die beste davon, so wie ein Mensch seine Spielweise der Runde anpasst. '
        + ((selected.meta.rounds ?? 1) > 1 ? `Das lief in ${selected.meta.rounds} Durchgängen: Ab dem zweiten spielen die Gegner je zur Hälfte ihre optimierte und ihre zuletzt gewählte Strategie. Das dämpft Kreisläufe, in denen jede Wahl die vorige aushebelt.` : ''), '');
      w(table(['Fraktion', ...settings.map(({ n, vp }) => `${n} Sp. ${VP_LABEL[vp]}`)], F.map((f) => [
        FACTIONS[f], ...settings.map(({ n, vp }) => selected.choice[`${f}|${n}|${vp}`].name),
      ])), '');
    }
    if (perMode) w('**Alle Einstellungen der Optimierung für 30 SP:**', '');
    w(table(['Einstellung', 'Ausgewogen', ...F.map((f) => FACTIONS[f])], PARAM_KEYS.map((k) => [
      PARAM_LABEL[k], fmtParam(k, ARCHETYPES.ausgewogen[k]), ...F.map((f) => fmtParam(k, tuned.best[f][k])),
    ])), '');
    const all = final ? sumAgg(Object.values(final.results)) : null;
    for (const f of F) {
      w(`### ${FACTIONS[f]}`, '');
      const notes = describe(tuned.best[f], f);
      w(`- **Schwerpunkte gegenüber „Ausgewogen“:** ${notes.length ? notes.join(', ') : 'kaum Abweichungen'}.`);
      const fa = all?.factions[f];
      if (fa && fa.wins) {
        w(`- **So gewinnt sie:** Ø ${num(fa.winBuildings / fa.wins)} Planeten, ${num(fa.winUpgrades / fa.wins)} Upgrades, ${num(fa.winStars / fa.wins)} Sterne, `
          + `${num(fa.winMedals / fa.wins)} Münzen; ${pct(fa.winByHq / fa.wins, 0)} der Siege durch ein zerstörtes Zentralgestirn.`);
        w(`- **Angriffe:** der erste im Schnitt in Runde ${num(fa.firstAttack / Math.max(1, fa.firstAttackGames))}; ${num(fa.attacks / fa.games)} Angriffe je Partie.`);
        if (f === SCARETECH) {
          const [n, wins] = fa.cards[WORMHOLE_ID] ?? [0, 0];
          w(`- **Wurmloch** (Aufklärer überspringen Reihe 1): in ${pct(n / fa.games, 0)} der Partien gebaut`
            + (n ? `, Siegquote dann ${pct(wins / n, 0)} (sonst insgesamt ${pct(fa.wins / fa.games, 0)}).` : '.'));
        }
        const openings = Object.entries(fa.openings).sort((a, b) => b[1][0] - a[1][0]).slice(0, 3);
        if (openings.length) {
          w('- **Häufigste Eröffnungen** (Käufe der ersten drei Runden, „–“ = gespart; Anteil der Partien, Siegquote):');
          for (const [key, [n, wins]] of openings) w(`  - ${openingText(key)} (${pct(n / fa.games, 0)}, ${pct(wins / n, 0)})`);
        }
        const rate = fa.wins / fa.games;
        const cards = Object.entries(fa.cards)
          .map(([id, [n, wins]]) => ({ id: Number(id), n, lift: wins / n - rate }))
          .filter((c) => c.n >= fa.games * 0.05);
        const fmt = (list: typeof cards) => list.map((c) => `${CARDS[c.id].name} (${c.lift >= 0 ? '+' : '−'}${num(Math.abs(c.lift) * 100, 0)} Pkt.)`).join(', ');
        w(`- **Karten, mit denen sie öfter gewinnt:** ${fmt([...cards].sort((a, b) => b.lift - a.lift).slice(0, 4))}`);
        w(`- **Karten, mit denen sie seltener gewinnt:** ${fmt([...cards].sort((a, b) => a.lift - b.lift).slice(0, 3))}`);
        w('  - Das ist ein Zusammenhang, keine Ursache: Wer vorn liegt, kauft andere Karten als wer zurückliegt.');
      }
      w('');
    }
  }

  // ---------- 6. Upgrades
  if (final && upgradeRows) {
    w(`## ${S.upgrades}. Upgrades`, '');
    w('Ein Upgrade zählt sofort und dauerhaft als Siegpunkt und wirkt ab dem Kauf. Die Bots bewerten Einheiten-Upgrades über den Kampfwert der betroffenen Einheiten vorher und nachher, '
      + 'für die eigenen und die voraussichtlich noch gekauften. Energie-Upgrades zählen als gesparte Energiequellen. '
      + 'In der **letzten Runde** kaufen sie nur noch Upgrades, die billigsten zuerst: Andere Karten werden bis zum Spielende nicht mehr fertig.', '');
    w(table(['Fraktion', 'Ø Upgrades je Partie', ...VPS.map((v) => VP_LABEL[v])], F.map((f) => {
      const per = (aggs: Array<Agg | undefined>) => {
        const fa = sumAgg(aggs).factions[f];
        return fa ? num(fa.upgrades / fa.games) : '–';
      };
      return [FACTIONS[f], per(Object.values(final.results)), ...VPS.map((v) => per(NS.map((n) => final.results[`C|${n}|${v}`])))];
    })), '');
    w('*Kaufbar:* Anteil der Partien, in denen die Voraussetzung mindestens einmal aktiv war. *Gekauft:* Anteil dieser Partien, in denen die Fraktion das Upgrade kaufte. '
      + '*Siegquote mit/ohne:* Siegquote der Fraktion in Partien mit bzw. ohne das Upgrade, über alle Spielerzahlen. Das ist ein Zusammenhang, keine Ursache: '
      + 'Wer vorn liegt, hat mehr Credits für Upgrades, und Käufe in der letzten Runde zählen mit.', '');
    w(table(['Fraktion', 'Upgrade', 'Preis', 'Voraussetzung', 'Wirkung', 'kaufbar', 'gekauft', 'Siegquote mit', 'ohne'], upgradeRows.map((u) => [
      FACTIONS[u.f], u.name, String(u.price), u.requires, UPGRADE_EFFECTS[u.id] ?? '–', pct(u.offered, 0),
      u.offered ? pct(u.bought, 0) : '–', u.n ? pct(u.winWith, 0) : '–', pct(u.winWithout, 0),
    ])), '');
    const rare = upgradeRows.filter((u) => u.offered < 0.15);
    const skipped = upgradeRows.filter((u) => u.offered >= 0.15 && u.bought < 0.2);
    if (rare.length) {
      w(`- **Selten kaufbar** (in weniger als 15 % der Partien): ${rare.map((u) => `${u.name} (${FACTIONS[u.f]}, ${pct(u.offered, 0)})`).join(', ')}. `
        + 'Hier liegt es am Technologiebaum: Die Bots bauen die Voraussetzung selten.');
    }
    if (skipped.length) {
      w(`- **Kaufbar, aber selten gekauft** (unter 20 %): ${skipped.map((u) => `${u.name} (${FACTIONS[u.f]}, ${u.price} Credits, ${pct(u.bought, 0)})`).join(', ')}. `
        + 'Für die Bots ist die Wirkung den Preis meist nicht wert.');
    }
    w('');
  }

  // ---------- 7. Was wäre wenn
  if (final && variants.length) {
    w(`## ${S.whatif}. Was wäre wenn: geänderte Werte und Regeln`, '');
    w('Dieselben optimierten Bots spielen mit geänderten Kartenwerten oder Regeln (nur im Simulator, alle Sitzordnungen, 2–4 Spieler, alle Siegpunkt-Einstellungen). '
      + 'Ihre Käufe passen sie selbst an; neu optimiert wurden sie nicht. Stärke relativ zu fair wie in der Kurzfassung.', '');
    const seatEdge = (saved: Saved, n: number) => points(seatEdgeOf(saved, n));
    const biotecTwo = (saved: Saved) => {
      const { k, n } = share(sumAgg(VPS.map((v) => saved.results[`C|2|${v}`])), 3);
      return n ? pct(k / n, 0) : '–';
    };
    const extra = (saved: Saved) => [seatEdge(saved, 2), seatEdge(saved, 4), biotecTwo(saved)];
    const base = strengths(final);
    const rows = [['heutige Regeln und Werte', ...base.map((x) => num(x.r, 2)), num(deviation(base), 2), ...extra(final)]];
    const chartRows = [{ label: 'heutige Regeln und Werte', st: base }];
    for (const v of variants) {
      const st = strengths(v);
      const label = v.meta.label ?? JSON.stringify(v.meta.patch ?? v.meta.rules);
      rows.push([label, ...st.map((x) => num(x.r, 2)), num(deviation(st), 2), ...extra(v)]);
      chartRows.push({ label, st });
    }
    w(table(['Änderung', ...F.map((f) => FACTIONS[f]), 'mittlere Abweichung', 'Vorteil Platz 1 (2 Sp.)', 'Vorteil Platz 1 (4 Sp.)', 'Biotec zu zweit'], rows), '');
    w('*Mittlere Abweichung:* quadratisches Mittel der Abstände aller vier Fraktionen von 1,00; 0 wäre perfekt ausgeglichen. '
      + '*Vorteil Platz 1:* Siegquote des Startspielers minus Siegquote des letzten Platzes (fair: 0). *Biotec zu zweit:* Anteil der Siege von Biotec mit 2 Spielern (fair: 50 %).', '');
    charts.variants = variantChart(chartRows, 'Stärke der Fraktionen je Änderung. Je näher die Punkte an der gestrichelten Linie liegen, desto ausgeglichener.');
    w('@@CHART:variants@@', '');
    w('Genaue Änderungen:', '');
    for (const v of variants) {
      const what = [v.meta.patch && `Kartenwerte \`${JSON.stringify(v.meta.patch)}\``, v.meta.rules && `Regeln \`${JSON.stringify(v.meta.rules)}\``].filter(Boolean);
      w(`- ${v.meta.label ?? 'Änderung'}: ${what.join(', ')}`);
    }
    w('');
  }

  // ---------- 7. Regel-Auffälligkeiten
  if (final) {
    w(`## ${S.rules}. Regel-Auffälligkeiten`, '');
    w('**Überlastung (geänderte Regel).** Wird eine Energiequelle zerstört und die Energie fällt unter 0, bleibt die Karte im Spiel, bekommt ihre volle Defensive zurück und der Besitzer setzt eine Runde aus. '
      + 'Neu ist: Sie wird dabei **verdeckt neu ausgelegt**. Vorher blieb sie aufgedeckt liegen und konnte jede Runde erneut angegriffen werden; '
      + `der Besitzer setzte dann immer wieder aus („Überlastungs-Sperre“, im alten Stand bis zu ${LOCK_BEFORE} ausgesetzte Züge je Partie).`, '');
    if (overloadRows.length) {
      w('Versuch mit der neuen Regel: Eine Fraktion legt ihre Energiequelle anfangs in Reihe 2 statt in Reihe 3 (sonst gleiche Strategie; 30 SP, zu zweit 40 SP). '
        + 'Nach einer Überlastung legt sie sie verdeckt nach hinten, wie es die neue Regel erlaubt.', '');
      w(table(['Fraktion', 'Spieler', 'Aussetzen je Partie (hinten)', 'Aussetzen je Partie (Reihe 2)', 'Siegquote (hinten)', 'Siegquote (Reihe 2)'],
        overloadRows.map((r) => [FACTIONS[r.f], String(r.n), num(r.back, 2), num(r.front, 2), pct(r.winBack, 0), pct(r.winFront, 0)])), '');
    }
    const inf2 = final.results['C|2|inf'];
    if (inf2) {
      const drawRate = (f: Faction) => {
        const fa = inf2.factions[f];
        return fa ? fa.draws / fa.games : 0;
      };
      const most = [...F].sort((a, b) => drawRate(b) - drawRate(a)).slice(0, 2);
      w(`**„∞“ zu zweit.** Ohne Siegpunkte gewinnt nur, wer das gegnerische Zentralgestirn zerstört. Zu zweit dauerte das im Schnitt ${num(inf2.rounds / inf2.games, 0)} Runden; `
        + `${pct(inf2.draws / inf2.games, 0)} der Partien hatten nach 120 Runden noch keinen Sieger`
        + (inf2.draws ? `, am häufigsten mit ${FACTIONS[most[0]]} (${pct(drawRate(most[0]), 0)} ihrer Partien) und ${FACTIONS[most[1]]} (${pct(drawRate(most[1]), 0)}).` : '.'), '');
    }
  }

  // ---------- 8. Kampfwerte
  w(`## ${S.cards}. Kampfwert der Einheiten`, '');
  w('Mittlere Siegchance im Einzelgefecht gegen alle Einheiten der anderen Fraktionen (je zur Hälfte als Angreifer und als Verteidiger, Grundwerte ohne Upgrades), exakt berechnet. '
    + '„je 1000 Credits“ setzt das ins Verhältnis zum Preis; fett = besonders günstig. Einheiten mit Defensive 0 zerstören sich bei jedem Angriff selbst. '
    + 'Startplaneten sind mit * markiert: Ihre Einheiten sind ab Runde 1 kaufbar.', '');
  const maxPer = Math.max(...duels.map((d) => d.per1000));
  w(table(['Fraktion', 'Einheit', 'Preis', 'Def/Off/Schaden', 'freigeschaltet durch', 'Kampfwert', 'je 1000 Credits'], [...duels]
    .sort((a, b) => factionOfCardId(a.id) - factionOfCardId(b.id) || CARDS[a.id].price - CARDS[b.id].price)
    .map((d) => {
      const c = CARDS[d.id];
      return [FACTIONS[factionOfCardId(d.id)], c.name, String(c.price), `${c.def}/${c.off}/${c.dmg}`,
        `${CARDS[c.requires].name}${START_CARD_IDS.has(c.requires) ? ' *' : ''}`,
        pct(d.score, 0), d.per1000 >= maxPer * 0.6 ? `**${num(d.per1000, 2)}**` : num(d.per1000, 2)];
    })), '');

  // ---------- 9. Modell
  w(`## ${S.model}. Modell und Grenzen`, '');
  w('- **Regeln:** Einkommen, Bauzeiten, Energie, Kaufen, alle Kampfarten, Reparatur, Upgrades, Münzen, Siegpunkte und Sonderaktion kommen unverändert aus der App-Engine (`src/engine/`).',
    '  - Sieg wie in der App: Ein zerstörtes Zentralgestirn gewinnt sofort. Wer das Siegpunkt-Ziel erreicht, löst die letzte Runde aus; danach gewinnt, wer die meisten Siegpunkte hat.',
    '  - Startkapital-Ausgleich: Spieler 2, 3 und 4 bekommen 200, 300 bzw. 400 Credits mehr. Zu zweit gibt es nur 40 SP und ∞.',
    '- **Tischregeln** (nicht in der App, im Simulator nachgebaut, `Tools/sim/board.ts`):',
    '  - 3 Reihen × 7 Felder, Stapelregeln in Reihe 1; Planeten liegen verdeckt und werden durch einen Angriff aufgedeckt.',
    '  - Reihe 2 ist erst angreifbar, wenn Reihe 1 leer ist, Reihe 3 erst, wenn Reihe 1 und 2 leer sind.',
    '  - Hyperraumschiffe (und Scaretech-Aufklärer mit Wurmloch) überspringen nur die 1. Reihe: Reihe 3 erst, wenn Reihe 2 leer ist. Die Superwaffe erreicht alles.',
    '  - Wer einen verdeckten Planeten angreift, erwischt zufällig einen der verdeckten Planeten der gewählten Reihe.',
    '  - Überlastung: Eine gerettete Energiequelle wird verdeckt neu ausgelegt.',
    '  - Auge des Raumes deckt zu Zugbeginn einen gegnerischen Planeten auf. Schwarzer Schleier legt Scaretech-Einheiten verdeckt. Neuronetz tauscht verdeckte Planeten; das Umsetzen von Einheiten bringt im Modell nichts.',
    '- **Bots:** bewerten jede mögliche Aktion in Credits, mit exakt berechneten Kampfwahrscheinlichkeiten. Sie sehen nur, was am Tisch sichtbar ist. '
      + 'Energiequellen und das Zentralgestirn legen sie nach hinten und halten mindestens zwei Planeten als Schutz in Reihe 2. '
      + 'Upgrades bewerten sie über die Wirkung (Kampfwert vorher/nachher, gesparte Energiequellen) plus den sofortigen, sicheren Siegpunkt. '
      + 'In der letzten Runde kaufen sie nur noch Upgrades, reparieren nicht mehr und setzen ihre Einheiten ohne Rücksicht auf Verluste ein. '
      + 'Die Strategie wählt jede Fraktion je Spielerzahl und Siegpunkt-Einstellung (Abschnitt ${S.tuned}); innerhalb einer Partie passen die Bots sie nicht an.',
    '- **Grenzen:** Bots bluffen nicht, sprechen sich nicht ab und planen nur einen Zug voraus (plus Sparziel). Menschen spielen anders, besonders mit Absprachen zu dritt oder zu viert. '
      + 'Die Ergebnisse zeigen Tendenzen im Kartenmaterial, keine exakten Siegchancen am Tisch.',
    '- **Remis:** Partien ohne Sieger nach 120 Runden zählen nicht in die Siegquoten.', '');

  w(`## ${S.repro}. Nachrechnen`, '');
  w('```bash', 'npm run sim -- all                  # Versuche A+B, Optimierung, Strategiewahl, Balance-Urteil, Bericht', 'npm run sim -- strategies --games 100', 'npm run sim -- tune --warm --gens 12 --g2 60 --g4 12 --sigma 0.12   # je Siegpunkt-Einstellung, oder --vp 40',
    'npm run sim -- select --games 80                # Strategiewahl je Spielerzahl', 'npm run sim -- select --again --games 80        # zweiter Durchgang', 'npm run sim -- final --games 2000', 'npm run sim -- exploits --games 500', 'npm run sim -- final --games 150 --patch werte.json --tag name --label "Text"', 'npm run sim -- report', '```', '');
  const total = (s: Saved | null) => (s ? sumAgg(Object.values(s.results)).games : 0);
  // Strategiewahl: je Fraktion und Kandidat alle Sitzordnungen mit ihr (2 Sp.: 2 × 6, 3 Sp.: 3 × 18, 4 Sp.: 3 × 24)
  const selectGames = selected ? selected.meta.games * 138 * 4 * Object.keys(selected.choice['0|4|30']?.rates ?? {}).length : 0;
  const games = total(final) + total(strategies) + total(exploits) + selectGames + variants.reduce((n, v) => n + total(v), 0)
    + VPS.reduce((n, vp) => n + (tunedModes.includes(vp) || vp === '30' ? (tunedBy[vp]?.history.length ?? 0) * 4 * 13 * (6 * 60 + 24 * 12) : 0), 0);
  w(`Umfang dieses Berichts: rund ${(Math.round(games / 1000) * 1000).toLocaleString('de-DE')} simulierte Partien.`, '');

  const md = out.filter((line) => !line.startsWith('@@CHART')).join('\n');
  const dir = join(process.cwd(), 'Unterlagen');
  const mdFile = join(dir, 'Balance_Simulation.md');
  writeFileSync(mdFile, md);
  console.log(`Bericht geschrieben: ${mdFile}`);

  const outDir = join(process.cwd(), 'Tools', 'sim', 'out');
  mkdirSync(outDir, { recursive: true });
  const htmlFile = join(outDir, 'Balance_Simulation.html');
  writeHtml(htmlFile, reportPage(markdownToHtml(out.join('\n'), charts), `Stand ${date} · Strategie-Bots auf der Spiel-Engine der App`));
  const pdfFile = join(dir, 'Balance_Simulation.pdf');
  if (printPdf(htmlFile, pdfFile)) console.log(`PDF geschrieben: ${pdfFile}`);
  else console.log(`Kein Chrome/Edge gefunden: ${htmlFile} im Browser öffnen und als PDF drucken.`);
}
