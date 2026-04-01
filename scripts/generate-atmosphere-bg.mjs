/**
 * Writes `public/atmosphere/site-cinematic-bg.webp` — a compact warm gradient + glow
 * placeholder. Replace that file with your own photo (same path) for a true cinematic look.
 */
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "atmosphere");
const outFile = join(outDir, "site-cinematic-bg.webp");

const w = 1920;
const h = 1280;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
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

await mkdir(outDir, { recursive: true });
const buf = await sharp(Buffer.from(svg)).webp({ quality: 78, effort: 5 }).toBuffer();
await writeFile(outFile, buf);
console.log("Wrote", outFile, `${Math.round(buf.length / 1024)}KB`);
