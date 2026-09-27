/**
 * Bilder für den Druck in JPEG umwandeln: Chrome übernimmt JPEGs unverändert ins PDF, WebP-Bilder dagegen
 * als verlustfreie Rohpixel (sonst über 100 MB für wenige Seiten). 400 px Breite reichen für 300 dpi bei 30 mm.
 */
export function toJpeg(img: HTMLImageElement, width = 400) {
  // SVGs bleiben (Vektor, oft transparent), JPEG hätte keinen Alphakanal
  if (img.src.startsWith('data:') || /\.svg($|\?)/.test(img.src) || !img.naturalWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(width, img.naturalWidth);
  canvas.height = Math.round((canvas.width / img.naturalWidth) * img.naturalHeight);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = canvas.toDataURL('image/jpeg', 0.86);
}

/** Alle Bilder unter root nach dem Laden umwandeln; onEach läuft danach (z. B. Layout neu berechnen). */
export function jpegImages(root: ParentNode, onEach?: () => void, width?: number) {
  root.querySelectorAll('img').forEach((img) => {
    const convert = () => {
      toJpeg(img, width);
      onEach?.();
    };
    if (img.complete && img.naturalWidth) convert();
    else img.addEventListener('load', convert, { once: true });
  });
}
