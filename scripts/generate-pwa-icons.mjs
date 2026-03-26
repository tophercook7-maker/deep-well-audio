/**
 * Rasterizes public/brand/icon.svg into PNGs for manifest + Apple touch.
 * Run: npm run build:icons  (also runs automatically before build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "brand", "icon.svg");
const outDir = path.join(root, "public", "icons");

const BG = "#0b1220";

async function svgBuffer() {
  return fs.readFileSync(svgPath);
}

/** Full-bleed icons (192 / 512). */
async function rasterize(size) {
  const buf = await svgBuffer();
  return sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

/** Maskable: content scaled ~76% and centered on 512×512 for Android safe zone. */
async function maskable512() {
  const buf = await svgBuffer();
  const inner = 390;
  const resized = await sharp(buf).resize(inner, inner, { fit: "contain", background: BG }).png().toBuffer();
  return sharp({
    create: { width: 512, height: 512, channels: 4, background: BG },
  })
    .composite([{ input: resized, left: Math.round((512 - inner) / 2), top: Math.round((512 - inner) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const [p192, p512, p180, pMask] = await Promise.all([
    rasterize(192),
    rasterize(512),
    rasterize(180),
    maskable512(),
  ]);

  fs.writeFileSync(path.join(outDir, "icon-192.png"), p192);
  fs.writeFileSync(path.join(outDir, "icon-512.png"), p512);
  fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), p180);
  fs.writeFileSync(path.join(outDir, "maskable-512.png"), pMask);

  const fav32 = await rasterize(32);
  fs.writeFileSync(path.join(root, "public", "favicon-32.png"), fav32);

  console.log("Wrote public/icons/*.png and public/favicon-32.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
