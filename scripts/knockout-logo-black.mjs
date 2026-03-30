/**
 * Removes the black plate from public/logo.png while keeping the wordmark.
 *
 * The wordmark is often the same “neutral dark gray” as the plate (low chroma), so a single
 * global or edge flood eats the letters. We:
 * 1) Flood-fill only the **upper** rectangle (wave area) from the top/left/right edges
 *    so black never connects into the text band via BFS.
 * 2) In the **lower** band (text + baseline), knock out only **near‑pure black**
 *    (very low luma + low chroma) so glyphs stay.
 *
 * Re-writes public/logo.png, copies to public/logo-square.png — then: npm run build:icons
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "logo.png");
const squarePath = path.join(root, "public", "logo-square.png");

/** First row of the lower “type” band. Keep this **above** the wordmark only (waveform ~top 35–42% of this asset). */
const LOWER_BAND_START_RATIO = 0.4;

/** Upper band: flood through flat dark neutrals (plate + soft halos), not through saturated waveform. */
const PLATE_LUMA_MAX = 40;
const PLATE_CHROMA_MAX = 14;

/** Lower band: only delete near-black plate between letters / under baseline. Letter ink is usually brighter. */
const TEXT_ZONE_LUMA_MAX = 18;
const TEXT_ZONE_CHROMA_MAX = 10;

function luma(r, g, b) {
  return (r + g + b) / 3;
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function canExpandPlate(r, g, b) {
  return luma(r, g, b) <= PLATE_LUMA_MAX && chroma(r, g, b) <= PLATE_CHROMA_MAX;
}

function isTextZonePlate(r, g, b) {
  return luma(r, g, b) <= TEXT_ZONE_LUMA_MAX && chroma(r, g, b) <= TEXT_ZONE_CHROMA_MAX;
}

async function knockoutBlack(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;
  if (channels !== 4) throw new Error("expected RGBA");

  const orig = Buffer.from(data);
  const out = Buffer.from(orig);
  const splitY = Math.floor(H * LOWER_BAND_START_RATIO);

  const n = W * H;
  const fillUpper = new Uint8Array(n);

  const at = (x, y) => y * W + x;
  const idx = (x, y) => at(x, y) * 4;

  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  let qt = 0;
  let qh = 0;

  function push(x, y) {
    if (y >= splitY) return;
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const a = at(x, y);
    if (fillUpper[a]) return;
    const i = idx(x, y);
    const r = orig[i];
    const g = orig[i + 1];
    const b = orig[i + 2];
    if (!canExpandPlate(r, g, b)) return;
    fillUpper[a] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  }

  for (let x = 0; x < W; x++) push(x, 0);
  for (let y = 0; y < splitY; y++) {
    push(0, y);
    push(W - 1, y);
  }

  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    const neigh = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neigh) {
      if (ny >= splitY) continue;
      if (nx < 0 || nx >= W || ny < 0) continue;
      push(nx, ny);
    }
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = at(x, y);
      const i = idx(x, y);
      const r = orig[i];
      const g = orig[i + 1];
      const b = orig[i + 2];

      if (y < splitY) {
        if (fillUpper[p]) out[i + 3] = 0;
      } else if (isTextZonePlate(r, g, b)) {
        out[i + 3] = 0;
      }
    }
  }

  const tmp = `${inputPath}.tmp.png`;
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, inputPath);
}

async function main() {
  if (!fs.existsSync(logoPath)) {
    console.error("Missing public/logo.png");
    process.exit(1);
  }
  await knockoutBlack(logoPath);
  fs.copyFileSync(logoPath, squarePath);
  console.log(
    `Knocked out plate (upper flood y<${(LOWER_BAND_START_RATIO * 100).toFixed(0)}%, lower luma<=${TEXT_ZONE_LUMA_MAX}) → public/logo.png + public/logo-square.png`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
