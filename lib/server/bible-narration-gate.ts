import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/auth";

/** Shown in `/api/bible/audio/status` when the account is not Premium. */
export const BIBLE_NARRATION_PREMIUM_MESSAGE = "Premium required for Bible audio";

const PREMIUM_DENIED_BODY = {
  ok: false,
  premiumRequired: true,
  message: "Premium required for Bible audio",
} as const;

/**
 * Route-level gate only: `/api/bible/audio` and `/api/bible/tts` must call this before any cache read,
 * synthesis, or storage. Do not add plan checks inside `lib/server/bible-tts-synthesize.ts`.
 */
export async function denyIfNotPremiumBibleAudio(): Promise<NextResponse | null> {
  const plan = await getUserPlan();
  if (plan === "premium") return null;
  console.warn("Blocked TTS for non-premium user", { plan });
  return NextResponse.json(PREMIUM_DENIED_BODY, { status: 403 });
}
