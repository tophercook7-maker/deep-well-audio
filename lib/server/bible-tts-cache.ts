import { createServiceClient } from "@/lib/db";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { getBibleBookByApiId } from "@/lib/study/bible-books";
import type { TtsProvider } from "@/lib/server/bible-tts-synthesize";

function trimEnv(s: string | undefined): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  return t.length ? t : null;
}

export function getBibleTtsStorageBucket(): string {
  return trimEnv(process.env.BIBLE_TTS_STORAGE_BUCKET) ?? "bible-tts";
}

/** Optional first path segment to invalidate all cached audio (model or voice mapping change). */
export function getBibleTtsCacheVersionPrefix(): string | null {
  const v = trimEnv(process.env.BIBLE_TTS_CACHE_VERSION);
  return v;
}

function voicePresetToFileSegment(presetId: string): string {
  return presetId.replace(/-/g, "_");
}

function providerToFileSegment(p: TtsProvider): string {
  return p === "elevenlabs" ? "el" : "oa";
}

/**
 * Stable object path under the bucket, e.g. `kjv/john_3_warm_male_el.mp3` or `v2/kjv/john_3_warm_male_el.mp3`.
 * Mirrors user-facing pattern: translation + book + chapter + voice (+ provider + optional playback).
 */
export function buildBibleTtsCacheObjectPath(opts: {
  translation: StudyTranslationId;
  apiBookId: string;
  chapter: number;
  voicePresetId: string;
  provider: TtsProvider;
  playbackSuffix: string;
}): string {
  const book = getBibleBookByApiId(opts.apiBookId);
  if (!book) throw new Error("Unknown book");
  const bookSeg = book.apiSlug.replace(/\+/g, "_").toLowerCase();
  const ch = Math.floor(opts.chapter);
  if (ch < 1 || ch > 200) throw new Error("Invalid chapter");
  const voiceSeg = voicePresetToFileSegment(opts.voicePresetId);
  const prov = providerToFileSegment(opts.provider);
  const base = `${opts.translation}_${bookSeg}_${ch}_${voiceSeg}_${prov}${opts.playbackSuffix}.mp3`;
  const version = getBibleTtsCacheVersionPrefix();
  if (version) return `${version}/${base}`;
  return base;
}

export async function downloadCachedBibleTtsMp3(objectPath: string): Promise<Buffer | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  const bucket = getBibleTtsStorageBucket();
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) return null;
  const ab = await data.arrayBuffer();
  return Buffer.from(ab);
}

export async function uploadCachedBibleTtsMp3(objectPath: string, audio: Buffer): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;
  const bucket = getBibleTtsStorageBucket();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, audio, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  if (error) {
    console.error("bible-tts cache upload:", error.message);
    return false;
  }
  return true;
}

const inFlight = new Map<string, Promise<Buffer>>();

/**
 * Deduplicate concurrent cache-miss syntheses for the same object path (saves ElevenLabs cost).
 */
export function getOrCreateInFlightGeneration(objectPath: string, run: () => Promise<Buffer>): Promise<Buffer> {
  const existing = inFlight.get(objectPath);
  if (existing) return existing;
  const p = (async () => {
    try {
      return await run();
    } finally {
      inFlight.delete(objectPath);
    }
  })();
  inFlight.set(objectPath, p);
  return p;
}
