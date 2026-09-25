import { useEffect } from 'preact/hooks';
import { useRegisterSW } from 'virtual:pwa-register/preact';

/** Hinweise des Service Workers: offline bereit bzw. neue Version. Neu geladen wird nur auf Wunsch. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 4000);
    return () => clearTimeout(t);
  }, [offlineReady]);

  // workbox-window lädt nur neu, wenn es das Update selbst angestoßen hat. Ein später gefundenes
  // Update (App lange offen) gilt als „extern“ und würde nie neu laden – daher selbst auf den Wechsel hören.
  const update = () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    void updateServiceWorker(true);
  };

  if (needRefresh) {
    return (
      <div class="toast glass" role="status">
        <div class="grow small">Neue Version verfügbar. Der Spielstand bleibt erhalten.</div>
        <button class="btn ghost" onClick={() => setNeedRefresh(false)}>Später</button>
        <button class="btn primary" onClick={update}>Aktualisieren</button>
      </div>
    );
  }
  if (offlineReady) {
    return <div class="toast glass small" role="status">Die App ist jetzt auch offline spielbar.</div>;
  }
  return null;
}
