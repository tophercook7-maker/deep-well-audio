/**
 * Curated narration voices — slug + label only (safe for the browser).
 * Server registry must stay in sync for validation and ElevenLabs voice ID resolution.
 */
export type BibleAudioPublicVoice = {
  slug: string;
  label: string;
};

export const BIBLE_AUDIO_PUBLIC_VOICES: BibleAudioPublicVoice[] = [
  { slug: "warm-male", label: "Warm Male Narrator" },
  { slug: "gentle-female", label: "Gentle Female Reader" },
  { slug: "deep-narrator", label: "Deep Narrator" },
  { slug: "calm-study", label: "Calm Study Voice" },
  { slug: "steady-narrator", label: "Steady Reader" },
];

const SLUGS = new Set(BIBLE_AUDIO_PUBLIC_VOICES.map((v) => v.slug));

/** Normalize legacy slugs (e.g. deep-voice → deep-narrator). */
export function normalizeBibleAudioVoiceSlug(slug: string | null | undefined): string {
  if (typeof slug !== "string" || !slug.trim()) return BIBLE_AUDIO_PUBLIC_VOICES[0]!.slug;
  const t = slug.trim();
  if (t === "deep-voice") return "deep-narrator";
  if (SLUGS.has(t)) return t;
  return BIBLE_AUDIO_PUBLIC_VOICES[0]!.slug;
}

export function isBibleAudioVoiceSlug(id: string | null | undefined): id is string {
  return typeof id === "string" && SLUGS.has(id);
}
