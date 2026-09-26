// Kartenbilder mit Stable Diffusion XL über eine lokale ComfyUI-Instanz (http://127.0.0.1:8188).
// Stil: Helges Rückseiten-Motive als Stilreferenz (IP-Adapter „style transfer“), Motive in prompts.mjs.
//
//   npm run art -- --ids 17-22,40 --variants 3   Varianten erzeugen → art-work/<id>/<seed>.png
//   npm run art -- --sheet                        Kontaktbögen je Fraktion → art-work/sheet-<fraktion>.png
//   npm run art -- --apply                        gewählte Varianten (selection.json) → public/cards/<id>.png
//   npm run art -- --special biotec-back --variants 4   Sondermotiv (SPECIALS) → art-work/biotec-back/
// Optionen: --no-style (ohne Stilreferenz), --weight 0.35, --steps 30, --cfg 6, --host http://127.0.0.1:8188
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CARDS } from '../../src/engine/data.ts';
import { FACTION_KEYS, SPECIALS, STYLE_REF, promptFor } from './prompts.mjs';

const WORK = 'art-work';
const SELECTION = 'Tools/card-art/selection.json';
const LATENT = { width: 1344, height: 768 }; // SDXL-Auflösung 16:9
const WINDOW = { width: 1024, height: 598 }; // Bildfenster der Karte (512:299)
const MODELS = {
  checkpoint: 'sd_xl_base_1.0.safetensors',
  ipadapter: 'ip-adapter-plus_sdxl_vit-h.safetensors',
  clipVision: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors',
};

// ---------- Argumente ----------
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i < 0 ? def : args[i + 1]; };
const flag = (name) => args.includes(`--${name}`);
const HOST = opt('host', 'http://127.0.0.1:8188');
const parseIds = (s) => s.split(',').flatMap((part) => {
  const [a, b] = part.split('-').map(Number);
  return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i);
});
const ids = parseIds(opt('ids', '0-91'));
const variants = Number(opt('variants', 3));
const weight = Number(opt('weight', 0.35));
const steps = Number(opt('steps', 30));
const cfg = Number(opt('cfg', 6));
const useStyle = !flag('no-style');
const special = opt('special', null); // z. B. --special biotec-back
const seedFor = (id, v) => id * 1000 + v; // reproduzierbar: Variante v (1..n) der Karte id

// ---------- ComfyUI-API ----------
async function api(path, init) {
  const res = await fetch(HOST + path, init);
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res;
}
/** Lädt eine Stilreferenz einmal zu ComfyUI hoch (Name aus dem Dateipfad) */
const uploaded = new Map();
async function uploadRef(file) {
  if (uploaded.has(file)) return uploaded.get(file);
  const png = await sharp(file).png().toBuffer();
  const form = new FormData();
  form.append('image', new Blob([png], { type: 'image/png' }), `domination-${file.replace(/[\\/.]/g, '-')}.png`);
  form.append('overwrite', 'true');
  const { name } = await (await api('/upload/image', { method: 'POST', body: form })).json();
  uploaded.set(file, name);
  return name;
}

/** Auftrag für eine Karte oder ein Sondermotiv (SPECIALS in prompts.mjs) */
function jobFor(key, seed) {
  if (key in SPECIALS) {
    const s = SPECIALS[key];
    return { key, seed, label: key, positive: s.positive, negative: s.negative, ref: s.styleRef, latent: s.latent, weight: s.weight ?? weight };
  }
  const { faction, positive, negative } = promptFor(key);
  return { key, seed, label: `${key} ${CARDS[key].name}`, positive, negative, ref: STYLE_REF[faction], latent: LATENT, weight };
}

function workflow({ key, seed, positive, negative, latent, weight }, refName) {
  const wf = {
    ckpt: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: MODELS.checkpoint } },
    pos: { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['ckpt', 1] } },
    neg: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['ckpt', 1] } },
    latent: { class_type: 'EmptyLatentImage', inputs: { ...latent, batch_size: 1 } },
    sampler: {
      class_type: 'KSampler',
      inputs: {
        model: ['ckpt', 0], positive: ['pos', 0], negative: ['neg', 0], latent_image: ['latent', 0],
        seed, steps, cfg, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1,
      },
    },
    decode: { class_type: 'VAEDecode', inputs: { samples: ['sampler', 0], vae: ['ckpt', 2] } },
    save: { class_type: 'SaveImage', inputs: { images: ['decode', 0], filename_prefix: `domination/${key}` } },
  };
  if (useStyle) {
    wf.ref = { class_type: 'LoadImage', inputs: { image: refName } };
    wf.ipa = { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: MODELS.ipadapter } };
    wf.clipv = { class_type: 'CLIPVisionLoader', inputs: { clip_name: MODELS.clipVision } };
    wf.style = {
      class_type: 'IPAdapterAdvanced',
      inputs: {
        model: ['ckpt', 0], ipadapter: ['ipa', 0], image: ['ref', 0], clip_vision: ['clipv', 0],
        weight, weight_type: 'style transfer', combine_embeds: 'concat', start_at: 0, end_at: 1, embeds_scaling: 'V only',
      },
    };
    wf.sampler.inputs.model = ['style', 0];
  }
  return wf;
}

async function render(job, refName) {
  const { prompt_id: promptId } = await (await api('/prompt', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: workflow(job, refName), client_id: 'domination-card-art' }),
  })).json();
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    const hist = (await (await api(`/history/${promptId}`)).json())[promptId];
    if (!hist) continue;
    if (hist.status?.status_str === 'error') throw new Error(`${job.label}: ${JSON.stringify(hist.status.messages?.at(-1))}`);
    const img = Object.values(hist.outputs ?? {}).flatMap((o) => o.images ?? [])[0];
    if (!img) continue;
    const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type });
    return Buffer.from(await (await api(`/view?${q}`)).arrayBuffer());
  }
}

// ---------- Befehle ----------
async function generate() {
  try {
    await api('/system_stats');
  } catch {
    throw new Error(`ComfyUI ist unter ${HOST} nicht erreichbar. Zuerst ComfyUI starten (run_nvidia_gpu.bat).`);
  }
  const keys = special ? [special] : ids;
  const jobs = keys.flatMap((key, k) => Array.from({ length: variants }, (_, i) => jobFor(key, special ? 900000 + k * 1000 + i + 1 : seedFor(key, i + 1))))
    .filter(({ key, seed }) => !existsSync(join(WORK, String(key), `${seed}.png`)));
  console.log(`${jobs.length} Bilder zu erzeugen (${keys.length} Motive × ${variants} Varianten, vorhandene übersprungen)`);
  const t0 = Date.now();
  for (const [n, job] of jobs.entries()) {
    const t = Date.now();
    const png = await render(job, useStyle ? await uploadRef(job.ref) : null);
    mkdirSync(join(WORK, String(job.key)), { recursive: true });
    writeFileSync(join(WORK, String(job.key), `${job.seed}.png`), png);
    const avg = (Date.now() - t0) / (n + 1);
    console.log(`[${n + 1}/${jobs.length}] ${job.label} · Seed ${job.seed} · ${((Date.now() - t) / 1000).toFixed(0)} s · Rest ca. ${Math.round((avg * (jobs.length - n - 1)) / 60000)} min`);
  }
}

const variantFiles = (id) => (existsSync(join(WORK, String(id)))
  ? readdirSync(join(WORK, String(id))).filter((f) => f.endsWith('.png')).sort((a, b) => parseInt(a) - parseInt(b))
  : []);

async function sheets() {
  const TW = 336, TH = 192, LABEL = 26;
  for (const [fi, f] of FACTION_KEYS.entries()) {
    const cards = ids.filter((id) => Math.floor(id / 23) === fi && variantFiles(id).length);
    if (!cards.length) continue;
    const cols = Math.max(...cards.map((id) => variantFiles(id).length));
    const comps = [];
    for (const [row, id] of cards.entries()) {
      for (const [col, file] of variantFiles(id).entries()) {
        const input = await sharp(join(WORK, String(id), file)).resize(TW, TH, { fit: 'cover' }).png().toBuffer();
        comps.push({ input, left: col * (TW + 8), top: row * (TH + LABEL + 8) + LABEL });
        const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${LABEL}"><text x="4" y="19" font-family="Segoe UI,Arial" font-size="17" font-weight="700" fill="#fff">${id} ${CARDS[id].name.replace(/&/g, '&amp;')} · Variante ${col + 1}</text></svg>`;
        comps.push({ input: Buffer.from(label), left: col * (TW + 8), top: row * (TH + LABEL + 8) });
      }
    }
    const out = join(WORK, `sheet-${f}.png`);
    await sharp({ create: { width: cols * (TW + 8), height: cards.length * (TH + LABEL + 8), channels: 3, background: '#151719' } })
      .composite(comps).png().toFile(out);
    console.log(out);
  }
}

async function apply() {
  const selection = JSON.parse(readFileSync(SELECTION, 'utf8'));
  // Sondermotive (z. B. "biotec-back": 2) → Ziel aus SPECIALS, nur mit --special <name>
  // (die BIOTEC-Rückseite ist zugleich Stilvorlage; ein laufender Generator hält sie unter Windows offen)
  for (const [key, s] of Object.entries(SPECIALS).filter(([k]) => k === special)) {
    const files = variantFiles(key);
    const file = selection[key] && files[selection[key] - 1];
    if (!file) continue;
    await sharp(join(WORK, key, file)).resize({ width: s.outWidth }).webp({ quality: 82 }).toFile(s.out);
    console.log(`${s.out} ← Variante ${selection[key]} (${file})`);
  }
  for (const id of ids) {
    const files = variantFiles(id);
    const choice = selection[id];
    if (!choice || !files.length) continue;
    const file = files[choice - 1];
    if (!file) { console.log(`Karte ${id}: Variante ${choice} fehlt`); continue; }
    // 16:9 → Fensterformat 512:299: seitlich minimal beschneiden
    await sharp(join(WORK, String(id), file)).resize(WINDOW.width, WINDOW.height, { fit: 'cover' })
      .webp({ quality: 82 }).toFile(`public/cards/${id}.png`);
    console.log(`public/cards/${id}.png ← Variante ${choice} (${file})`);
  }
}

if (flag('sheet')) await sheets();
else if (flag('apply')) await apply();
else await generate();
