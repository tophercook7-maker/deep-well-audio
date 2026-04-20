/**
 * Deterministic Supabase Storage object key for premium Bible audio.
 * Example: `kjv/john/3/warm-male.mp3`
 */
export function bibleAudioObjectPath(translation: string, bookSlug: string, chapter: number, voiceSlug: string): string {
  const ch = Math.floor(chapter);
  return `${translation}/${bookSlug}/${ch}/${voiceSlug}.mp3`;
}
