#!/usr/bin/env node
/**
 * POST /api/sync/all using SYNC_API_SECRET from .env.local.
 * Usage: from project root, with dev server running:
 *   node scripts/resync.mjs
 * Optional: SYNC_URL=https://your-domain.com node scripts/resync.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const raw = fs.readFileSync(envPath, "utf8");
let secret = "";
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  if (t.startsWith("SYNC_API_SECRET=")) {
    secret = t.slice("SYNC_API_SECRET=".length).trim().replace(/^["']|["']$/g, "");
    break;
  }
}
if (!secret) {
  console.error("Missing SYNC_API_SECRET in .env.local");
  process.exit(1);
}
const base = (process.env.SYNC_URL || "http://localhost:3000").replace(/\/$/, "");
const url = `${base}/api/sync/all`;

const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});
const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  console.error(res.status, text.slice(0, 500));
  process.exit(1);
}
console.log(JSON.stringify(body, null, 2));
if (!res.ok) process.exit(1);
