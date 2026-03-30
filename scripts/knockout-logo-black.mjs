/**
 * Makes solid/near-black pixels transparent in public/logo.png (for transparent hero mark).
 * Re-writes public/logo.png, copies to public/logo-square.png, then run: npm run build:icons
 *
 * Threshold: all RGB channels must be <= MAX_BG to count as background (antialiased edges included).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "logo.png");
const squarePath = path.join(root, "public", "logo-square.png");

/** Background key: tune up if fringe remains, down if artwork darkens. */
const MAX_BG = 28;

async function knockoutBlack(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) throw new Error("expected RGBA");

  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (r <= MAX_BG && g <= MAX_BG && b <= MAX_BG) {
      out[i + 3] = 0;
    }
  }

  const tmp = `${inputPath}.tmp.png`;
  await sharp(out, { raw: { width, height, channels: 4 } })
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
  console.log(`Knocked out black (RGB<=${MAX_BG}) → public/logo.png + public/logo-square.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
