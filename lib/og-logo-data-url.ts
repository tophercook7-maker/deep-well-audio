import { readFile } from "node:fs/promises";
import path from "node:path";

let cached: string | null | undefined;

function mimeFromBuffer(buf: Buffer): string {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  )
    return "image/png";
  if (buf.length >= 12 && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return "image/png";
}

/** Base64 data URL for OG/Twitter ImageResponse (Node runtime only). */
export async function getOgLogoDataUrl(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    const filePath = path.join(process.cwd(), "public", "logo.png");
    const buf = await readFile(filePath);
    const mime = mimeFromBuffer(buf);
    cached = `data:${mime};base64,${buf.toString("base64")}`;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
