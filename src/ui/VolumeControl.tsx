import { createPortal } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { getVolume, play, setVolume, type Channel } from './sound';
import { kickMusic, setMusicPreview } from './music';

export function VolumeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button class="btn ghost block" onClick={() => setOpen(true)}>Lautstärke</button>
      {/* Portal: im Menü-Dialog (backdrop-filter) würde ein fixes Overlay sonst auf dessen Größe beschnitten */}
      {open && createPortal(<VolumeDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function VolumeDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    setMusicPreview(true);
    return () => setMusicPreview(false);
  }, []);

  return (
    <div class="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="dialog">
        <h3>Lautstärke</h3>
        <Slider channel="sfx" label="Effekte" onRelease={() => play('bonus')} />
        <Slider channel="music" label="Musik" onRelease={kickMusic} />
        <button class="btn primary block" onClick={onClose}>Fertig</button>
      </div>
    </div>
  );
}

function Slider({ channel, label, onRelease }: { channel: Channel; label: string; onRelease: () => void }) {
  const [value, setValue] = useState(() => Math.round(getVolume(channel) * 100));
  return (
    <label class="slider" style={{ '--p': `${value}%` }}>
      <span>{label}</span>
      <b>{value === 0 ? 'aus' : `${value} %`}</b>
      <input
        type="range" min={0} max={100} step={1} value={value} aria-label={label}
        onInput={(e) => {
          const v = Number(e.currentTarget.value);
          setValue(v);
          setVolume(channel, v / 100);
          if (channel === 'music') kickMusic();
        }}
        onChange={onRelease}
      />
    </label>
  );
}
