/**
 * Writes `public/atmosphere/site-atmosphere.webp`.
 *
 * 1) If `public/atmosphere/source/a_photograph_captures_a_pair_of_adul.png` exists, compress/resizes that
 *    photo (premium WebP, capped width for performance).
 * 2) Otherwise writes a compact SVG gradient placeholder (same as before).
 */
import { access, mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "atmosphere");
const sourceDir = join(outDir, "source");
const sourcePng = join(sourceDir, "a_photograph_captures_a_pair_of_adul.png");
const outFile = join(outDir, "site-atmosphere.webp");
/** Legacy filename — regenerated for any code/env still pointing here */
const legacyOut = join(outDir, "site-cinematic-bg.webp");

const MAX_W = 2400;
const PLACEHOLDER_W = 1920;
const PLACEHOLDER_H = 1280;

async function pathExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

await mkdir(outDir, { recursive: true });

if (await pathExists(sourcePng)) {
  const buf = await sharp(sourcePng)
    .rotate()
    .resize(MAX_W, null, { withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  await writeFile(outFile, buf);
  await writeFile(legacyOut, buf);
  console.log("Atmosphere from source PNG →", outFile, `(${Math.round(buf.length / 1024)} KB)`);
} else {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PLACEHOLDER_W}" height="${PLACEHOLDER_H}" viewBox="0 0 ${PLACEHOLDER_W} ${PLACEHOLDER_H}">
  <defs>
    <linearGradient id="base" x1="0%" y1="0%" x2="55%" y2="100%">
      <stop offset="0%" stop-color="#16110e"/>
      <stop offset="100%" stop-color="#07090e"/>
    </linearGradient>
    <radialGradient id="warmHalo" cx="50%" cy="32%" r="55%">
      <stop offset="0%" stop-color="rgba(195,148,88,0.38)"/>
      <stop offset="42%" stop-color="rgba(72,48,32,0.18)"/>
      <stop offset="100%" stop-color="rgba(7,9,12,0)"/>
    </radialGradient>
    <radialGradient id="focus" cx="50%" cy="38%" r="28%">
      <stop offset="0%" stop-color="rgba(255,228,190,0.14)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#base)"/>
  <rect width="100%" height="100%" fill="url(#warmHalo)"/>
  <rect width="100%" height="100%" fill="url(#focus)"/>
</svg>`;
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 78, effort: 5 }).toBuffer();
  await writeFile(outFile, buf);
  await writeFile(legacyOut, buf);
  console.warn(
    "No source PNG at",
    sourcePng,
    "— wrote gradient placeholder. Add the Bible photo there and re-run npm run build:atmosphere"
  );
  console.log("Wrote", outFile, `${Math.round(buf.length / 1024)} KB`);
}
