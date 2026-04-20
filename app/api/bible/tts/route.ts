import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { denyIfNotPremiumBibleAudio } from "@/lib/server/bible-narration-gate";
import { isStudyTranslationId, type BibleApiVerse } from "@/lib/study/bible-api";
import { buildChapterTtsText } from "@/lib/bible/build-chapter-tts-text";
import { isBibleTtsVoicePresetId } from "@/lib/bible/bible-tts-voices";
import {
  BibleTtsRateLimitedError,
  assertBibleTtsGenerationAllowed,
  clientIpFromRequest,
} from "@/lib/server/bible-tts-generation-rate-limit";
import {
  buildBibleTtsCacheObjectPath,
  downloadCachedBibleTtsMp3,
  getOrCreateInFlightGeneration,
  uploadCachedBibleTtsMp3,
} from "@/lib/server/bible-tts-cache";
import {
  elevenPlaybackCacheSegment,
  normalizeElevenLabsPlayback,
  predictedChapterTtsProvider,
  synthesizeChapterMp3,
} from "@/lib/server/bible-tts-synthesize";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Bible chapter TTS. ElevenLabs / OpenAI keys stay server-only.
 * Cached MP3s are stored in Supabase Storage (see `bible-tts` bucket) to avoid repeat API cost.
 */

type Body = {
  verses?: BibleApiVerse[];
  referenceLine?: string | null;
  /** Required for cache key (e.g. web, kjv, asv). */
  translation?: string;
  /** Curated preset id (same as voiceId). */
  voicePreset?: string;
  /** Alias for voicePreset — curated slug, not a raw ElevenLabs id. */
  voiceId?: string;
  /** Optional ElevenLabs voice_settings (stability / similarity_boost, each 0–1). */
  playback?: unknown;
  cacheKey?: string;
};

function isVerse(x: unknown): x is BibleApiVerse {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.book_id === "string" &&
    typeof o.chapter === "number" &&
    typeof o.verse === "number" &&
    typeof o.text === "string"
  );
}

function singleChapterFromVerses(verses: BibleApiVerse[]): { bookId: string; chapter: number } | null {
  const first = verses[0]!;
  for (const v of verses) {
    if (v.book_id !== first.book_id || v.chapter !== first.chapter) return null;
  }
  return { bookId: first.book_id, chapter: first.chapter };
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const denied = await denyIfNotPremiumBibleAudio();
  if (denied) return denied;

  const verses = body.verses;
  if (!Array.isArray(verses) || verses.length === 0 || !verses.every(isVerse)) {
    return NextResponse.json({ error: "verses array required" }, { status: 400 });
  }

  const translationRaw = body.translation;
  if (typeof translationRaw !== "string" || !isStudyTranslationId(translationRaw)) {
    return NextResponse.json({ error: "translation required (web, kjv, or asv)" }, { status: 400 });
  }

  const voicePreset = body.voicePreset ?? body.voiceId ?? "";
  if (!isBibleTtsVoicePresetId(voicePreset)) {
    return NextResponse.json({ error: "Invalid voice selection" }, { status: 400 });
  }

  const chapterInfo = singleChapterFromVerses(verses);
  if (!chapterInfo) {
    return NextResponse.json({ error: "verses must be a single chapter" }, { status: 400 });
  }

  const { text } = buildChapterTtsText(verses, body.referenceLine ?? null);
  if (!text.trim()) {
    return NextResponse.json({ error: "Empty chapter" }, { status: 400 });
  }

  const elevenPlayback = normalizeElevenLabsPlayback(body.playback);
  const provider = predictedChapterTtsProvider(voicePreset);
  if (provider === "none") {
    return NextResponse.json(
      {
        error:
          "TTS is not configured. Set ELEVENLABS_API_KEY and a voice ID, or OPENAI_API_KEY as fallback.",
      },
      { status: 503 },
    );
  }

  const playbackSuffix = provider === "elevenlabs" ? elevenPlaybackCacheSegment(body.playback) : "";

  let objectPath: string;
  try {
    objectPath = buildBibleTtsCacheObjectPath({
      translation: translationRaw,
      apiBookId: chapterInfo.bookId,
      chapter: chapterInfo.chapter,
      voicePresetId: voicePreset,
      provider,
      playbackSuffix,
    });
  } catch {
    return NextResponse.json({ error: "Invalid chapter for narration cache" }, { status: 400 });
  }

  try {
    const cached = await downloadCachedBibleTtsMp3(objectPath);
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(cached.length),
          "Cache-Control": "private, max-age=604800",
          "X-TTS-Cache": "hit",
          "X-TTS-Provider": provider,
        },
      });
    }

    const user = await getSessionUser();
    const ip = clientIpFromRequest(request);
    const rateKey = user ? `u:${user.id}` : `ip:${ip}`;

    const buf = await getOrCreateInFlightGeneration(objectPath, async () => {
      assertBibleTtsGenerationAllowed(rateKey);
      const { audio } = await synthesizeChapterMp3({
        text,
        voicePresetId: voicePreset,
        elevenPlayback,
      });
      const b = Buffer.from(audio);
      void uploadCachedBibleTtsMp3(objectPath, b);
      return b;
    });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buf.length),
        "Cache-Control": "private, max-age=604800",
        "X-TTS-Cache": "miss",
        "X-TTS-Provider": provider,
      },
    });
  } catch (e) {
    if (e instanceof BibleTtsRateLimitedError) {
      return NextResponse.json(
        { error: e.message },
        {
          status: 429,
          headers: { "Retry-After": String(e.retryAfterSec) },
        },
      );
    }
    const msg = e instanceof Error ? e.message : "TTS failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
