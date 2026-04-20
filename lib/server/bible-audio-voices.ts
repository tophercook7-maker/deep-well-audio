import {
  BIBLE_AUDIO_PUBLIC_VOICES,
  normalizeBibleAudioVoiceSlug,
  type BibleAudioPublicVoice,
} from "@/lib/bible/bible-audio-public-voices";

export type BibleAudioVoiceProviderName = "elevenlabs";

export type BibleAudioVoiceRegistryEntry = {
  slug: string;
  label: string;
  /** Logical provider for future multi-provider support. */
  providerName: BibleAudioVoiceProviderName;
};

/**
 * Curated server registry (slugs + labels mirror `BIBLE_AUDIO_PUBLIC_VOICES`).
 * ElevenLabs voice IDs are resolved from env only — never sent to the client.
 *
 * Env pattern: ELEVENLABS_VOICE_<SLUG_UPPER_WITH_UNDERSCORES>
 * Example: warm-male → ELEVENLABS_VOICE_WARM_MALE, then ELEVENLABS_DEFAULT_VOICE_ID.
 */
export const BIBLE_AUDIO_VOICE_REGISTRY: BibleAudioVoiceRegistryEntry[] = BIBLE_AUDIO_PUBLIC_VOICES.map((v) => ({
  slug: v.slug,
  label: v.label,
  providerName: "elevenlabs" as const,
}));

const SLUG_TO_ENV = (slug: string) =>
  `ELEVENLABS_VOICE_${slug.toUpperCase().replace(/-/g, "_")}` as const;

/** Legacy env alias for renamed slug deep-voice → deep-narrator. */
const DEEP_NARRATOR_ALIASES = ["ELEVENLABS_VOICE_DEEP_NARRATOR", "ELEVENLABS_VOICE_DEEP_VOICE"] as const;

export function resolveRegistryEntry(slug: string): BibleAudioVoiceRegistryEntry | undefined {
  const n = normalizeBibleAudioVoiceSlug(slug);
  return BIBLE_AUDIO_VOICE_REGISTRY.find((e) => e.slug === n);
}

/**
 * Resolve the ElevenLabs voice id for a curated slug (server-only env).
 */
export function resolveElevenLabsVoiceIdForBibleAudio(slug: string): string | null {
  const n = normalizeBibleAudioVoiceSlug(slug);
  if (n === "deep-narrator") {
    for (const key of DEEP_NARRATOR_ALIASES) {
      const v = process.env[key]?.trim();
      if (v) return v;
    }
  }
  const specific = process.env[SLUG_TO_ENV(n)]?.trim();
  if (specific) return specific;
  return process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim() || null;
}

export function listPublicVoicesForApi(): BibleAudioPublicVoice[] {
  return [...BIBLE_AUDIO_PUBLIC_VOICES];
}

export { normalizeBibleAudioVoiceSlug };
