/**
 * Curated Bible narration presets for the listen UI (labels + stable slug `id`).
 * Real ElevenLabs voice IDs stay server-side in env (ELEVENLABS_DEFAULT_VOICE_ID / ELEVENLABS_VOICE_*).
 * OpenAI names are only used if ElevenLabs is not configured.
 */

export type BibleTtsVoicePreset = {
  id: string;
  label: string;
  /** OpenAI `tts-1-hd` voice name */
  openaiVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
};

export const BIBLE_TTS_VOICE_PRESETS: BibleTtsVoicePreset[] = [
  { id: "warm-male", label: "Warm Male Narrator", openaiVoice: "onyx" },
  { id: "gentle-female", label: "Gentle Female Reader", openaiVoice: "nova" },
  { id: "deep-voice", label: "Deep Voice", openaiVoice: "echo" },
  { id: "calm-study", label: "Calm Study Voice", openaiVoice: "shimmer" },
  { id: "steady-narrator", label: "Steady Narrator", openaiVoice: "alloy" },
];

const PRESET_IDS = new Set(BIBLE_TTS_VOICE_PRESETS.map((v) => v.id));

export function isBibleTtsVoicePresetId(id: string | null | undefined): id is string {
  return typeof id === "string" && PRESET_IDS.has(id);
}

export function normalizeBibleTtsVoiceKey(key: string | null | undefined): string {
  if (isBibleTtsVoicePresetId(key)) return key;
  return BIBLE_TTS_VOICE_PRESETS[0]!.id;
}

export function getBibleTtsPreset(id: string): BibleTtsVoicePreset | undefined {
  return BIBLE_TTS_VOICE_PRESETS.find((v) => v.id === id);
}
