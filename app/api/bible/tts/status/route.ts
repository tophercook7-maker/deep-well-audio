import { NextResponse } from "next/server";
import { BIBLE_TTS_VOICE_PRESETS } from "@/lib/bible/bible-tts-voices";
import { resolveTtsAvailability } from "@/lib/server/bible-tts-synthesize";

export const dynamic = "force-dynamic";

export async function GET() {
  const t = resolveTtsAvailability();
  return NextResponse.json({
    ready: t.ready,
    provider: t.provider,
    message: t.message,
    voices: BIBLE_TTS_VOICE_PRESETS.map((v) => ({ id: v.id, label: v.label })),
  });
}
