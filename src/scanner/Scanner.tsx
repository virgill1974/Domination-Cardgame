import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CARDS, CARD_OF_EAN, FACTION_COLORS, PHYSICAL_CARDS, type Faction } from '../engine/data';
import { factionOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { scanFeedback, startCameraScan, type CameraScan } from './detector';

interface Props {
  title: string;
  hint: string;
  /** Fraktionen, deren Karten in der manuellen Auswahl erscheinen */
  manualFactions: Faction[];
  /** Nur diese Karten zeigt die manuelle Auswahl standardmäßig (Test-Hilfe) */
  available?: (ean: number) => boolean;
  onCard: (ean: number) => void;
  onCancel: () => void;
}

export function Scanner({ title, hint, manualFactions, available, onCard, onCancel }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Kamera wird gestartet …');
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manual, setManual] = useState(false);
  const [torch, setTorch] = useState<{ fn: (on: boolean) => Promise<void>; on: boolean } | null>(null);
  const onCardRef = useRef(onCard);
  onCardRef.current = onCard;

  useEffect(() => {
    if (manual) return;
    let scan: CameraScan | null = null;
    let cancelled = false;
    startCameraScan(video.current!, (ean) => {
      scanFeedback();
      onCardRef.current(ean);
    })
      .then((s) => {
        if (cancelled) return s.stop();
        scan = s;
        setStatus('Barcode in den Rahmen halten');
        if (s.torch) setTorch({ fn: s.torch, on: false });
      })
      .catch((err: Error) => {
        setCameraFailed(true);
        setStatus(err.name === 'NotAllowedError'
          ? 'Kamerazugriff verweigert. Bitte in den Browser-Einstellungen erlauben oder Karte manuell wählen.'
          : 'Keine Kamera verfügbar (HTTPS nötig). Karte manuell wählen.');
      });
    return () => {
      cancelled = true;
      scan?.stop();
    };
  }, [manual]);

  if (manual) {
    return <ManualPicker title={title} factions={manualFactions} available={available} onPick={onCard} onBack={() => setManual(false)} />;
  }

  return (
    <div class="scanner">
      <video ref={video} muted playsInline />
      <div class="top">
        <div class="title">{title}</div>
        <h2>{hint}</h2>
      </div>
      {!cameraFailed && <div class="frame" />}
      <div class="status">{status}</div>
      <div class="bottom">
        {torch && (
          <button class="btn block" onClick={() => torch.fn(!torch.on).then(() => setTorch({ ...torch, on: !torch.on }))}>
            Licht {torch.on ? 'aus' : 'an'}
          </button>
        )}
        <div class="row">
          <button class="btn grow" onClick={() => setManual(true)}>Karte manuell wählen</button>
          <button class="btn danger" onClick={onCancel}>Abbruch</button>
        </div>
      </div>
    </div>
  );
}

function ManualPicker({ title, factions, available, onPick, onBack }: {
  title: string; factions: Faction[]; available?: (ean: number) => boolean; onPick: (ean: number) => void; onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const cards = useMemo(
    () => Array.from({ length: PHYSICAL_CARDS }, (_, ean) => ean).filter((ean) => factions.includes(factionOfEan(ean))),
    [factions],
  );
  const pool = available && !showAll ? cards.filter(available) : cards;
  const q = query.trim().toLowerCase();
  const shown = pool.filter((ean) => !q || CARDS[CARD_OF_EAN[ean]].name.toLowerCase().includes(q) || eanForIndex(ean).includes(q));
  return (
    <div class="manual">
      <div class="screen">
        <div class="row spread">
          <div>
            <div class="title">{title}</div>
            <h2>Karte wählen</h2>
          </div>
          <button class="btn" onClick={onBack}>Kamera</button>
        </div>
        <input class="search" placeholder="Name oder Nummer suchen" value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
        {available && (
          <label class="check small">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.currentTarget.checked)} />
            Alle Karten zeigen (auch nicht verfügbare)
          </label>
        )}
        {shown.length === 0 && <div class="panel small muted">Gerade ist keine passende Karte verfügbar.</div>}
        <div class="list">
          {shown.map((ean) => (
            <button key={ean} class="list-item" style={{ '--fc': FACTION_COLORS[factionOfEan(ean)] }} onClick={() => onPick(ean)}
              data-unavailable={available && !available(ean) ? '' : undefined}>
              <span class="dot" />
              <span>{CARDS[CARD_OF_EAN[ean]].name}</span>
              <span class="code">{eanForIndex(ean)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
