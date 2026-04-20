import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/auth";
import { BIBLE_AUDIO_PUBLIC_VOICES } from "@/lib/bible/bible-audio-public-voices";
import { BIBLE_NARRATION_PREMIUM_MESSAGE } from "@/lib/server/bible-narration-gate";
import { resolveElevenLabsVoiceIdForBibleAudio } from "@/lib/server/bible-audio-voices";
import type { UserPlan } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * Server config + plan: `ready` is true only when the user is Premium and ElevenLabs voices are configured.
 */
export async function GET() {
  const plan: UserPlan = await getUserPlan();
  const narrationAllowed = plan === "premium";
  const hasKey = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const sampleVoiceId = resolveElevenLabsVoiceIdForBibleAudio("warm-male");
  const configured = hasKey && Boolean(sampleVoiceId);
  const ready = narrationAllowed && configured;

  let message: string | undefined;
  if (!narrationAllowed) {
    message = BIBLE_NARRATION_PREMIUM_MESSAGE;
  } else if (!configured) {
    message = "Set ELEVENLABS_API_KEY and ELEVENLABS_DEFAULT_VOICE_ID (or ELEVENLABS_VOICE_*) on the server.";
  }

  return NextResponse.json({
    ok: true,
    plan,
    ready,
    narrationAllowed,
    provider: "elevenlabs" as const,
    voices: BIBLE_AUDIO_PUBLIC_VOICES,
    message,
  });
}
