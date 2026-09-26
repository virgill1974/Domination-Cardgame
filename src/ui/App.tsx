import { useEffect, useRef, useState } from 'preact/hooks';
import type { Faction } from '../engine/data';
import { currentFaction, newGame, type GameState } from '../engine/state';
import { beginTurn } from '../engine/turn';
import { mainCheck } from '../engine/victory';
import { buyPrecheck } from '../engine/buy';
import { attackPrecheck } from '../engine/combat';
import { repairPrecheck } from '../engine/actions';
import { loadGame, saveGame } from '../storage';
import { MessageDialog, factionStyle, type Msg } from './components';
import { Guide } from './Guide';
import { errorMsg, eventMessages } from './eventMessages';
import { AttackFlow, BuyFlow, InfoFlow, RepairFlow, type FlowProps } from './flows';
import { Handoff, Home, Hud, Inventory, Setup, Winner, type Action } from './screens';
import { play, unlockAudio } from './sound';
import { kickMusic, setMusicActive } from './music';
import { VolumeButton } from './VolumeControl';
import { UpdatePrompt } from './UpdatePrompt';

type View = 'home' | 'setup' | 'guide' | 'game';
type Flow = Exclude<Action, 'end'>;

const FLOWS = { buy: BuyFlow, attack: AttackFlow, repair: RepairFlow, info: InfoFlow } as const;
const PRECHECKS = { buy: buyPrecheck, attack: attackPrecheck, repair: repairPrecheck } as const;

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState === 'visible') navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {});
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      void lock?.release();
    };
  }, [active]);
}

function useUiSounds(current: Msg | undefined) {
  useEffect(() => {
    const onPointer = () => {
      unlockAudio();
      kickMusic();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('button, a.btn, .list-item')) play('click');
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('click', onClick, true);
    };
  }, []);
  useEffect(() => {
    if (current?.sound) play(current.sound);
  }, [current]);
}

export function App() {
  const [game, setGame] = useState<GameState | null>(loadGame);
  const gameRef = useRef(game);
  const [view, setView] = useState<View>('home');
  const [flow, setFlow] = useState<Flow | null>(null);
  const [queue, setQueue] = useState<Msg[]>([]);
  const [dialog, setDialog] = useState<'menu' | 'end' | 'quit' | null>(null);
  useWakeLock(view === 'game');
  useUiSounds(queue[0]);
  // Musik während der Partie; beim Sieg blendet sie aus, damit die Fanfare frei steht
  const musicOn = view === 'game' && !!game && game.winner === null;
  useEffect(() => setMusicActive(musicOn), [musicOn]);

  const replace = (next: GameState | null) => {
    gameRef.current = next;
    setGame(next);
    saveGame(next);
  };
  const commit = <R,>(fn: (s: GameState) => R): R => {
    const next = structuredClone(gameRef.current!);
    const result = fn(next);
    replace(next);
    return result;
  };
  const notify = (msgs: Msg[]) => msgs.length && setQueue((q) => [...q, ...msgs]);

  // Rückkehr ins Hauptmenü des Terminals: Orden und Sieg prüfen (hauptanzeige)
  const closeFlow = () => {
    setFlow(null);
    const g = gameRef.current;
    if (g && g.turnActive && g.winner === null) notify(eventMessages(commit(mainCheck)));
  };

  const onAction = (action: Action) => {
    if (action === 'end') return setDialog('end');
    const precheck = PRECHECKS[action as keyof typeof PRECHECKS];
    const error = precheck?.(gameRef.current!);
    if (error) return notify([errorMsg(error)]);
    setFlow(action);
  };

  const startTurn = () => notify(eventMessages(commit((s) => beginTurn(s, Math.random)).events));

  const start = (seats: Faction[], vpLimit: number | null) => {
    replace(newGame(seats, vpLimit));
    setView('game');
  };

  let screen;
  if (view === 'guide') {
    screen = <Guide onClose={() => setView('home')} />;
  } else if (view === 'home' || view === 'setup' || !game) {
    screen = view === 'setup'
      ? <Setup onStart={start} onBack={() => setView('home')} />
      : <Home canResume={!!game} onNew={() => setView('setup')} onResume={() => setView('game')} onGuide={() => setView('guide')} />;
  } else if (game.winner !== null) {
    screen = <Winner game={game} onNew={() => { replace(null); setView('setup'); }} />;
  } else if (!game.turnActive) {
    screen = <Handoff game={game} onStart={startTurn} onMenu={() => setDialog('menu')} />;
  } else if (flow === 'inventory') {
    screen = <Inventory game={game} onClose={closeFlow} />;
  } else if (flow) {
    const FlowView = FLOWS[flow];
    const props: FlowProps = { game, commit, notify, close: closeFlow };
    screen = <FlowView {...props} />;
  } else {
    screen = <Hud game={game} onAction={onAction} onMenu={() => setDialog('menu')} />;
  }

  // Fraktion am Zug färbt auch Dialoge und Scanner-Overlay ein
  const tint = view === 'game' && game?.turnActive && game.winner === null ? factionStyle(currentFaction(game)) : undefined;

  return (
    <div class="app-root" style={tint}>
      {screen}
      {dialog === 'end' && (
        <div class="overlay">
          <div class="dialog">
            <h3>Zug beenden?</h3>
            <div class="btn-row">
              <button class="btn cancel" onClick={() => setDialog(null)}>Abbruch</button>
              <button class="btn primary" onClick={() => { commit((s) => (s.turnActive = false)); setDialog(null); }}>OK</button>
            </div>
          </div>
        </div>
      )}
      {dialog === 'menu' && (
        <div class="overlay" onClick={(e) => e.target === e.currentTarget && setDialog(null)}>
          <div class="dialog">
            <h3>Menü</h3>
            <button class="btn primary block" onClick={() => setDialog(null)}>Weiterspielen</button>
            <VolumeButton />
            <button class="btn block" onClick={() => { setDialog(null); setView('home'); }}>Zum Startbildschirm</button>
            <button class="btn danger block" onClick={() => setDialog('quit')}>Spiel abbrechen</button>
          </div>
        </div>
      )}
      {dialog === 'quit' && (
        <div class="overlay">
          <div class="dialog error">
            <h3>Spiel wirklich abbrechen?</h3>
            <div>Der Spielstand wird gelöscht.</div>
            <div class="btn-row">
              <button class="btn cancel" onClick={() => setDialog('menu')}>Nein</button>
              <button class="btn danger" onClick={() => { replace(null); setDialog(null); setFlow(null); setView('home'); }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      {queue.length > 0 && <MessageDialog key={queue.length} msg={queue[0]} onClose={() => setQueue((q) => q.slice(1))} />}
      <UpdatePrompt />
    </div>
  );
}
