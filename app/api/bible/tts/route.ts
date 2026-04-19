import { NextResponse } from "next/server";
import type { BibleApiVerse } from "@/lib/study/bible-api";
import { buildChapterTtsText } from "@/lib/bible/build-chapter-tts-text";
import { isBibleTtsVoicePresetId } from "@/lib/bible/bible-tts-voices";
import { normalizeElevenLabsPlayback, synthesizeChapterMp3 } from "@/lib/server/bible-tts-synthesize";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Bible chapter TTS. `ELEVENLABS_API_KEY` is read only on the server — never exposed to the client.
 * Future: return cached or pre-generated audio before calling ElevenLabs.
 */

type Body = {
  verses?: BibleApiVerse[];
  referenceLine?: string | null;
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

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const verses = body.verses;
  if (!Array.isArray(verses) || verses.length === 0 || !verses.every(isVerse)) {
    return NextResponse.json({ error: "verses array required" }, { status: 400 });
  }

  const voicePreset = body.voicePreset ?? body.voiceId ?? "";
  if (!isBibleTtsVoicePresetId(voicePreset)) {
    return NextResponse.json({ error: "Invalid voice selection" }, { status: 400 });
  }

  const { text } = buildChapterTtsText(verses, body.referenceLine ?? null);
  if (!text.trim()) {
    return NextResponse.json({ error: "Empty chapter" }, { status: 400 });
  }

  const elevenPlayback = normalizeElevenLabsPlayback(body.playback);

  try {
    const { audio, provider } = await synthesizeChapterMp3({
      text,
      voicePresetId: voicePreset,
      elevenPlayback,
    });

    const buf = Buffer.from(audio);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buf.length),
        "Cache-Control": "private, max-age=604800",
        "X-TTS-Provider": provider,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
