import { readFile } from "node:fs/promises";
import path from "node:path";

let cached: string | null | undefined;

/** Base64 data URL for OG/Twitter ImageResponse (Node runtime only). */
export async function getOgLogoDataUrl(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    const filePath = path.join(process.cwd(), "public", "logo.png");
    const buf = await readFile(filePath);
    cached = `data:image/png;base64,${buf.toString("base64")}`;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
