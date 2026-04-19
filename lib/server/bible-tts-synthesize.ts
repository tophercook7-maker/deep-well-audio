import { chunkTextForTts } from "@/lib/bible/tts-chunk-text";
import { getBibleTtsPreset } from "@/lib/bible/bible-tts-voices";

export type TtsProvider = "elevenlabs" | "openai";

/** Optional ElevenLabs `voice_settings` (server-validated; 0–1). */
export type ElevenLabsPlaybackSettings = {
  stability?: number;
  similarity_boost?: number;
};

const DEFAULT_STABILITY = 0.52;
const DEFAULT_SIMILARITY = 0.82;

function clamp01(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(1, Math.max(0, n));
}

export function normalizeElevenLabsPlayback(input: unknown): ElevenLabsPlaybackSettings {
  if (!input || typeof input !== "object") return {};
  const o = input as Record<string, unknown>;
  return {
    stability: clamp01(o.stability),
    similarity_boost: clamp01(o.similarity_boost),
  };
}

function resolveElevenPlayback(settings: ElevenLabsPlaybackSettings) {
  return {
    stability: settings.stability ?? DEFAULT_STABILITY,
    similarity_boost: settings.similarity_boost ?? DEFAULT_SIMILARITY,
  };
}

function elevenVoiceIdForPreset(presetId: string): string | null {
  const envKey = `ELEVENLABS_VOICE_${presetId.toUpperCase().replace(/-/g, "_")}`;
  const specific = process.env[envKey]?.trim();
  if (specific) return specific;
  const fallback = process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim();
  return fallback || null;
}

async function fetchElevenLabsMp3(
  apiKey: string,
  voiceId: string,
  text: string,
  playback: ElevenLabsPlaybackSettings,
): Promise<Uint8Array> {
  const vs = resolveElevenPlayback(playback);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_turbo_v2_5",
      voice_settings: {
        stability: vs.stability,
        similarity_boost: vs.similarity_boost,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs: ${res.status} ${err.slice(0, 500)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function fetchOpenAiMp3(apiKey: string, voice: string, text: string): Promise<Uint8Array> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL?.trim() || "tts-1-hd",
      voice,
      input: text,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI TTS: ${res.status} ${err.slice(0, 500)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export async function synthesizeChapterMp3(opts: {
  text: string;
  voicePresetId: string;
  elevenPlayback?: ElevenLabsPlaybackSettings;
}): Promise<{ audio: Uint8Array; provider: TtsProvider }> {
  const preset = getBibleTtsPreset(opts.voicePresetId);
  if (!preset) throw new Error("Invalid voice preset");

  const chunks = chunkTextForTts(opts.text);
  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const elevenPlayback = opts.elevenPlayback ?? {};

  if (elevenKey) {
    const voiceId = elevenVoiceIdForPreset(preset.id);
    if (!voiceId) {
      throw new Error(
        "ElevenLabs is configured but no voice ID is set. Add ELEVENLABS_DEFAULT_VOICE_ID (shared) or ELEVENLABS_VOICE_WARM_MALE, ELEVENLABS_VOICE_GENTLE_FEMALE, etc.",
      );
    }
    const buffers: Uint8Array[] = [];
    for (const part of chunks) {
      buffers.push(await fetchElevenLabsMp3(elevenKey, voiceId, part, elevenPlayback));
    }
    return { audio: concatUint8Arrays(buffers), provider: "elevenlabs" };
  }

  if (openaiKey) {
    const buffers: Uint8Array[] = [];
    for (const part of chunks) {
      buffers.push(await fetchOpenAiMp3(openaiKey, preset.openaiVoice, part));
    }
    return { audio: concatUint8Arrays(buffers), provider: "openai" };
  }

  throw new Error(
    "TTS is not configured. Set ELEVENLABS_API_KEY (server-only) and a voice ID, or OPENAI_API_KEY as fallback.",
  );
}

export type TtsStatus = {
  ready: boolean;
  provider: "elevenlabs" | "openai" | "none";
  elevenlabs: boolean;
  openai: boolean;
  /** Shown when ready is false (misconfiguration hint). */
  message?: string;
};

export function resolveTtsAvailability(): TtsStatus {
  const elevenKey = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const openaiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasElevenVoice = Boolean(elevenVoiceIdForPreset("warm-male"));

  if (elevenKey && hasElevenVoice) {
    return { ready: true, provider: "elevenlabs", elevenlabs: true, openai: openaiKey };
  }

  if (elevenKey && !hasElevenVoice) {
    return {
      ready: false,
      provider: "none",
      elevenlabs: true,
      openai: openaiKey,
      message:
        "ELEVENLABS_API_KEY is set but no ElevenLabs voice ID was found. Add ELEVENLABS_DEFAULT_VOICE_ID or per-voice ELEVENLABS_VOICE_* variables.",
    };
  }

  if (openaiKey) {
    return { ready: true, provider: "openai", elevenlabs: false, openai: true };
  }

  return {
    ready: false,
    provider: "none",
    elevenlabs: false,
    openai: false,
    message:
      "No narration API configured. Set ELEVENLABS_API_KEY and ELEVENLABS_DEFAULT_VOICE_ID on the server (recommended), or OPENAI_API_KEY as fallback.",
  };
}
