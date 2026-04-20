export class BibleTtsRateLimitedError extends Error {
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super("Too many narration generations. Try again later.");
    this.name = "BibleTtsRateLimitedError";
    this.retryAfterSec = retryAfterSec;
  }
}

type WindowEntry = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
/** New TTS generations per window (cache misses only). */
const MAX_GENERATIONS_PER_WINDOW = 10;

const windows = new Map<string, WindowEntry>();

function pruneIfHuge() {
  if (windows.size < 5000) return;
  const now = Date.now();
  for (const [k, v] of windows) {
    if (now >= v.resetAt) windows.delete(k);
  }
}

/**
 * In-memory limiter for expensive ElevenLabs/OpenAI generation. Key should include IP and/or user id.
 * Not shared across serverless instances — still reduces abuse on a single instance.
 */
export function consumeBibleTtsGenerationSlot(key: string): { ok: boolean; retryAfterSec: number } {
  pruneIfHuge();
  const now = Date.now();
  let w = windows.get(key);
  if (!w || now >= w.resetAt) {
    w = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(key, w);
  }
  if (w.count >= MAX_GENERATIONS_PER_WINDOW) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((w.resetAt - now) / 1000)) };
  }
  w.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function assertBibleTtsGenerationAllowed(key: string): void {
  const r = consumeBibleTtsGenerationSlot(key);
  if (!r.ok) throw new BibleTtsRateLimitedError(r.retryAfterSec);
}

export function clientIpFromRequest(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first?.trim()) return first.trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "unknown";
}
