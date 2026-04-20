export function getBibleAudioStorageBucket(): string {
  const t = process.env.BIBLE_AUDIO_BUCKET?.trim();
  return t && t.length ? t : "bible-audio";
}

export const BIBLE_AUDIO_SIGNED_URL_TTL_SEC = 3600;
