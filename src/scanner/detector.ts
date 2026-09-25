import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { indexFromEan } from '../engine/ean';
import { play } from '../ui/sound';

interface Detector {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
}

let detectorPromise: Promise<Detector> | null = null;

function createDetector(): Promise<Detector> {
  detectorPromise ??= (async () => {
    const Native = (globalThis as { BarcodeDetector?: any }).BarcodeDetector;
    if (Native && (await Native.getSupportedFormats()).includes('ean_8')) return new Native({ formats: ['ean_8'] });
    const { BarcodeDetector, prepareZXingModule } = await import('barcode-detector/ponyfill');
    prepareZXingModule({
      overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
    });
    return new BarcodeDetector({ formats: ['ean_8'] });
  })();
  return detectorPromise;
}

export interface CameraScan {
  stop(): void;
  torch: ((on: boolean) => Promise<void>) | null;
}

/**
 * Startet die Rückkamera und meldet einen Kartenindex, sobald derselbe gültige Code
 * zweimal hintereinander erkannt wurde (schützt vor Fehllesungen).
 */
export async function startCameraScan(video: HTMLVideoElement, onCard: (index: number) => void): Promise<CameraScan> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
  });
  video.srcObject = stream;
  video.setAttribute('playsinline', 'true');
  await video.play();
  const detector = await createDetector();

  let running = true;
  let last: number | null = null;
  const loop = async () => {
    while (running) {
      try {
        const codes = video.readyState >= 2 ? await detector.detect(video) : [];
        const index = codes.map((c) => indexFromEan(c.rawValue)).find((i) => i !== null) ?? null;
        if (index !== null && index === last) {
          running = false;
          onCard(index);
          break;
        }
        last = index;
      } catch {
        // einzelne Frames können fehlschlagen, z. B. während die Kamera anläuft
      }
      await new Promise((r) => setTimeout(r, 90));
    }
  };
  void loop();

  const track = stream.getVideoTracks()[0];
  const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
  return {
    stop() {
      running = false;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
    torch: caps.torch
      ? (on) => track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] })
      : null,
  };
}

export function scanFeedback() {
  navigator.vibrate?.(60);
  play('scan');
}
