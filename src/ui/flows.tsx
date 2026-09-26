import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { CARDS, type Faction } from '../engine/data';
import { cardIdOfEan, kindOfEan } from '../engine/cards';
import { currentFaction, currentPlayer, findSlot, type GameState } from '../engine/state';
import { buy, buyCheck, buyScan } from '../engine/buy';
import {
  attack, attackConfirmAttacker, attackConfirmDefender, attackScanAttacker, attackScanDefender, type CombatResult,
} from '../engine/combat';
import { info, infoScan, ownCardScan, repair, repairCheck } from '../engine/actions';
import type { ErrorCode } from '../engine/messages';
import { Scanner } from '../scanner/Scanner';
import { CardView, DefBar, KV, type Msg } from './components';
import { errorMsg, eventMessages } from './eventMessages';
import { CombatView } from './Combat';

export interface FlowProps {
  game: GameState;
  commit: <R>(fn: (s: GameState) => R) => R;
  notify: (msgs: Msg[]) => void;
  close: () => void;
}

function Confirm({ title, ean, okLabel = 'OK', onOk, onCancel, children }: {
  title: string; ean: number; okLabel?: string; onOk: () => void; onCancel: () => void;
  children?: ComponentChildren;
}) {
  return (
    <div class="screen">
      <div class="title">{title}</div>
      <CardView ean={ean}>{children}</CardView>
      <div class="btn-row" style={{ marginTop: 'auto' }}>
        <button class="btn cancel" onClick={onCancel}>Abbruch</button>
        <button class="btn primary" onClick={onOk}>{okLabel}</button>
      </div>
    </div>
  );
}

/** Aktueller Zustand einer eigenen Karte (Defensive, Bau) für Bestätigungsseiten. */
function OwnState({ game, ean }: { game: GameState; ean: number }) {
  const p = currentPlayer(game);
  const i = findSlot(p, ean);
  if (i < 0) return <div class="muted small">Nicht in deinem Besitz.</div>;
  const slot = p.slots[i]!;
  const max = game.stats[cardIdOfEan(ean)].def;
  return (
    <div class="panel stack" style={{ gap: '6px' }}>
      <div class="row spread small"><span>Defensive</span><b>{slot.def} / {max}</b></div>
      <DefBar def={slot.def} max={max} />
      {slot.remaining > 0 && <div class="small muted">Noch {slot.remaining} Runde(n) bis zur Aktivierung</div>}
    </div>
  );
}

function useFail({ notify, close }: FlowProps) {
  return (code: ErrorCode) => {
    notify([errorMsg(code)]);
    close();
  };
}

export function BuyFlow(props: FlowProps) {
  const { game, commit, notify, close } = props;
  const fail = useFail(props);
  const [ean, setEan] = useState<number | null>(null);
  if (ean === null) {
    return (
      <Scanner
        title="Kaufen" hint="Karte scannen" manualFactions={[currentFaction(game)]} onCancel={close}
        available={(e) => buyCheck(game, e) === null}
        onCard={(e) => { const err = buyScan(game, e); if (err) fail(err); else setEan(e); }}
      />
    );
  }
  const card = CARDS[cardIdOfEan(ean)];
  const kind = kindOfEan(ean);
  return (
    <Confirm
      title="Kaufen" ean={ean} okLabel={`Kaufen · ${card.price} Credits`} onCancel={close}
      onOk={() => {
        const result = commit((s) => buy(s, ean));
        if (result.error) return fail(result.error);
        const body = kind === 'upgrade'
          ? 'Das Upgrade ist sofort aktiv.'
          : `Wird in ${game.stats[card.id].rounds} Runde(n) aktiviert. Karte bis dahin verdeckt auf den Baustapel legen.`;
        notify([{ tone: 'ok', sound: 'buy', title: `Gekauft: ${card.name}`, body }, ...eventMessages(result.events)]);
        close();
      }}
    >
      <div class="muted small">Credits: {currentPlayer(game).credits}</div>
    </Confirm>
  );
}

type AttackStep =
  | { step: 'attacker' }
  | { step: 'confirmAttacker'; attacker: number }
  | { step: 'defender'; attacker: number; free: boolean }
  | { step: 'confirmDefender'; attacker: number; defender: number; free: boolean }
  | { step: 'combat'; result: CombatResult };

export function AttackFlow(props: FlowProps) {
  const { game, commit, close } = props;
  const fail = useFail(props);
  const [state, setState] = useState<AttackStep>({ step: 'attacker' });
  const enemies = game.seats.filter((f) => f !== currentFaction(game)) as Faction[];

  switch (state.step) {
    case 'attacker':
      return (
        <Scanner
          title="Angriff" hint="Angreifer scannen" manualFactions={[currentFaction(game)]} onCancel={close}
          available={(e) => attackScanAttacker(game, e) === null && !attackConfirmAttacker(game, e).error}
          onCard={(e) => { const err = attackScanAttacker(game, e); if (err) fail(err); else setState({ step: 'confirmAttacker', attacker: e }); }}
        />
      );
    case 'confirmAttacker':
      return (
        <Confirm
          title="Angreifer" ean={state.attacker} onCancel={close}
          onOk={() => {
            const { error, free } = attackConfirmAttacker(game, state.attacker);
            if (error) fail(error);
            else setState({ step: 'defender', attacker: state.attacker, free });
          }}
        >
          <OwnState game={game} ean={state.attacker} />
        </Confirm>
      );
    case 'defender':
      return (
        <Scanner
          title={state.free ? 'Angriff kostenlos!' : 'Angriff · 200 Credits'} hint="Gegner scannen"
          manualFactions={enemies} onCancel={close}
          available={(e) => attackScanDefender(game, e) === null && attackConfirmDefender(game, e) === null}
          onCard={(e) => {
            const err = attackScanDefender(game, e);
            if (err) fail(err);
            else setState({ step: 'confirmDefender', attacker: state.attacker, defender: e, free: state.free });
          }}
        />
      );
    case 'confirmDefender':
      return (
        <Confirm
          title="Gegner" ean={state.defender} okLabel="Angreifen!" onCancel={close}
          onOk={() => {
            const err = attackConfirmDefender(game, state.defender);
            if (err) return fail(err);
            const { error, result } = commit((s) => attack(s, state.attacker, state.defender, Math.random));
            if (error) fail(error);
            else setState({ step: 'combat', result: result! });
          }}
        />
      );
    case 'combat':
      return <CombatView result={state.result} stats={game.stats} onDone={close} />;
  }
}

export function RepairFlow(props: FlowProps) {
  const { game, commit, notify, close } = props;
  const fail = useFail(props);
  const [ean, setEan] = useState<number | null>(null);
  if (ean === null) {
    return (
      <Scanner
        title="Reparatur" hint="Karte scannen" manualFactions={[currentFaction(game)]} onCancel={close}
        available={(e) => repairCheck(game, e) === null}
        onCard={(e) => { const err = ownCardScan(game, e); if (err) fail(err); else setEan(e); }}
      />
    );
  }
  return (
    <Confirm
      title="Reparatur · 200 Credits" ean={ean} okLabel="Reparieren" onCancel={close}
      onOk={() => {
        const result = commit((s) => repair(s, ean));
        if (result.error) return fail(result.error);
        notify([{ tone: 'ok', sound: 'repair', title: `+${result.amount} repariert`, cards: [ean] }]);
        close();
      }}
    >
      <OwnState game={game} ean={ean} />
    </Confirm>
  );
}

export function InfoFlow(props: FlowProps) {
  const { game, close } = props;
  const fail = useFail(props);
  const [ean, setEan] = useState<number | null>(null);
  if (ean === null) {
    return (
      <Scanner
        title="Info" hint="Eigene Karte scannen" manualFactions={[currentFaction(game)]} onCancel={close}
        available={(e) => infoScan(game, e) === null && !info(game, e).error}
        onCard={(e) => {
          const err = infoScan(game, e) ?? info(game, e).error;
          if (err) fail(err);
          else setEan(e);
        }}
      />
    );
  }
  const data = info(game, ean).info!;
  return (
    <div class="screen">
      <div class="title">Daten anzeigen</div>
      <CardView ean={ean}>
        <div class="panel stack" style={{ gap: '6px' }}>
          <div class="row spread small"><span>Defensive</span><b>{data.def} / {data.maxDef}</b></div>
          <DefBar def={data.def} max={data.maxDef} />
        </div>
        <KV items={[['Offensive', data.off], ['Schaden', data.dmg], ['Runden', data.rounds]]} />
      </CardView>
      <button class="btn primary block" style={{ marginTop: 'auto' }} onClick={close}>OK</button>
    </div>
  );
}
