/**
 * Curated Bible narration presets for the listen UI and legacy `/api/bible/tts`.
 * Slugs align with `lib/bible/bible-audio-public-voices.ts` (premium `/api/bible/audio`).
 * Real ElevenLabs voice IDs stay server-side in env (ELEVENLABS_DEFAULT_VOICE_ID / ELEVENLABS_VOICE_*).
 */

import { BIBLE_AUDIO_PUBLIC_VOICES, normalizeBibleAudioVoiceSlug } from "@/lib/bible/bible-audio-public-voices";

export type BibleTtsVoicePreset = {
  id: string;
  label: string;
  /** OpenAI `tts-1-hd` voice name (legacy TTS route fallback). */
  openaiVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
};

const OPENAI_BY_SLUG: Record<string, BibleTtsVoicePreset["openaiVoice"]> = {
  "warm-male": "onyx",
  "gentle-female": "nova",
  "deep-narrator": "echo",
  "calm-study": "shimmer",
  "steady-narrator": "alloy",
};

export const BIBLE_TTS_VOICE_PRESETS: BibleTtsVoicePreset[] = BIBLE_AUDIO_PUBLIC_VOICES.map((v) => ({
  id: v.slug,
  label: v.label,
  openaiVoice: OPENAI_BY_SLUG[v.slug] ?? "onyx",
}));

const PRESET_IDS = new Set(BIBLE_TTS_VOICE_PRESETS.map((v) => v.id));

export function isBibleTtsVoicePresetId(id: string | null | undefined): id is string {
  return typeof id === "string" && PRESET_IDS.has(id);
}

export function normalizeBibleTtsVoiceKey(key: string | null | undefined): string {
  return normalizeBibleAudioVoiceSlug(key);
}

export function getBibleTtsPreset(id: string): BibleTtsVoicePreset | undefined {
  const n = normalizeBibleAudioVoiceSlug(id);
  return BIBLE_TTS_VOICE_PRESETS.find((v) => v.id === n);
}
