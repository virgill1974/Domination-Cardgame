import { useEffect, useRef, useState } from 'preact/hooks';
import { CARDS } from '../engine/data';
import { cardIdOfEan, factionOfEan } from '../engine/cards';
import type { CombatKind, CombatResult, CombatStep } from '../engine/combat';
import type { CardStats } from '../engine/state';
import { CardArt, DefBar, DefValue, Die, factionStyle } from './components';
import { play } from './sound';
import { setCombatMusic } from './music';
import { glitch } from './glitch';

const KIND_LABEL: Record<CombatKind, string> = {
  unitVsUnit: 'Einheit vs Einheit',
  unitVsBuilding: 'Einheit vs Planet',
  airVsBuilding: 'Hyperraumschiff vs Planet',
  stealthVsBuilding: 'Schiff getarnt!',
  superweapon: 'Superwaffe',
};

const STEP_MS = 1100;
const name = (ean: number) => CARDS[cardIdOfEan(ean)].name;

function Fighter({ ean, def, max, dead }: { ean: number; def: number; max: number; dead: boolean }) {
  return (
    <div class={`fighter ${dead ? 'dead' : ''}`} style={factionStyle(factionOfEan(ean))}>
      <CardArt id={cardIdOfEan(ean)} />
      <div class="n">{name(ean)}</div>
      <DefBar def={def} max={max} />
      <div class="small muted"><DefValue def={def} max={max} /></div>
    </div>
  );
}

function StepLine({ step, result, rolling }: { step: CombatStep; result: CombatResult; rolling: boolean }) {
  const who = step.by === 'flak' ? `Planetenabwehr (${result.flakCount})` : step.by === 'attacker' ? 'Angreifer' : 'Gegner';
  const detail = step.roll === null
    ? 'trifft immer'
    : `braucht ≤ ${step.offense}, würfelt ${step.roll}`;
  return (
    <div class={`log-line ${step.hit ? 'hit' : 'miss'}`}>
      <Die value={step.roll} rolling={rolling} />
      <div class="grow">
        <b>{who} {step.hit ? 'trifft' : 'verfehlt'}</b>
        <div class="small muted">{detail}{step.hit ? ` · Schaden ${step.damage}` : ''}</div>
      </div>
    </div>
  );
}

export function CombatView({ result, stats, onDone }: { result: CombatResult; stats: CardStats[]; onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const done = shown >= result.steps.length;
  const prevShown = useRef(0);

  // Kampfmusik, solange die Kampfansicht offen ist
  useEffect(() => {
    setCombatMusic(true);
    return () => setCombatMusic(false);
  }, []);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 600 : STEP_MS);
    return () => clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    const single = shown - prevShown.current === 1;
    prevShown.current = shown;
    const step = result.steps[shown - 1];
    if (single && step) {
      if (step.roll === null) {
        play('superweapon');
        glitch('noise', 2.3);
      } else {
        play('dice');
        play(step.hit ? 'hit' : 'miss', 0.4);
        if (step.hit) setTimeout(() => glitch('rgb', 1.3), 400);
      }
    }
    if (done && result.destroyed.length && result.kind !== 'superweapon') {
      play('explosion', single ? 0.8 : 0);
      setTimeout(() => glitch('rgb', 2.2), single ? 800 : 0);
    }
  }, [shown]);

  const last = result.steps[shown - 1];
  const attDef = last ? last.attackerDef : result.attackerDefBefore;
  const defDef = last ? last.defenderDef : result.defenderDefBefore;
  const attMax = stats[cardIdOfEan(result.attackerEan)].def;
  const defMax = stats[cardIdOfEan(result.defenderEan)].def;

  return (
    <div class="screen">
      <div class="title">Angriff · {KIND_LABEL[result.kind]}</div>
      <div class="versus">
        <Fighter ean={result.attackerEan} def={attDef} max={Math.max(attMax, result.attackerDefBefore)} dead={done && result.destroyed.includes(result.attackerEan)} />
        <div class="vs">VS</div>
        <Fighter ean={result.defenderEan} def={defDef} max={Math.max(defMax, result.defenderDefBefore)} dead={done && result.destroyed.includes(result.defenderEan)} />
      </div>
      {result.kind === 'airVsBuilding' && <div class="small muted">Planetenabwehr beim Gegner: {result.flakCount}</div>}
      {/* Auswertung und Knopf oben, darunter das Protokoll mit dem jüngsten Wurf zuerst: nichts rutscht aus dem Bild */}
      {done ? <Summary result={result} /> : null}
      {done
        ? <button class="btn primary block" onClick={onDone}>OK</button>
        : <button class="btn block" onClick={() => setShown(result.steps.length)}>Überspringen</button>}
      <div class="log">
        {result.steps.slice(0, shown).map((step, i) => (
          <StepLine key={i} step={step} result={result} rolling={i === shown - 1 && !done} />
        )).reverse()}
      </div>
    </div>
  );
}

function Summary({ result }: { result: CombatResult }) {
  const lines: string[] = [];
  if (result.headquarters) lines.push('Zentrale zerstört!');
  const removed = result.destroyed.filter((ean) => !result.rescued.includes(ean));
  if (removed.length) lines.push(`Zerstört: ${removed.map(name).join(', ')}. Karte(n) vom Spielfeld nehmen und zurück auf den Stapel legen.`);
  for (const ean of result.rescued) {
    lines.push(`Überlastung: ${name(ean)} wird wieder aufgebaut und bleibt liegen. Der Besitzer setzt seine nächste Runde aus.`);
  }
  if (!result.destroyed.length) lines.push('Nichts zerstört.');
  if (result.attackerStar) lines.push('Der Angreifer erhält einen Stern (+1 Siegpunkt).');
  if (result.defenderStar) lines.push('Der Verteidiger erhält einen Stern (+1 Siegpunkt).');
  if (result.kind === 'superweapon') lines.push('Die Superwaffe lädt jetzt 3 Runden nach.');
  return (
    <div class="panel stack">
      {lines.map((l) => <div key={l}>{l}</div>)}
    </div>
  );
}
