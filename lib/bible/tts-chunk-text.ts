/** Safe chunk size for ElevenLabs / OpenAI per-request limits. */
export const TTS_CHUNK_MAX_CHARS = 3800;

/**
 * Split long text at whitespace near max length so each chunk stays under provider limits.
 */
export function chunkTextForTts(text: string, maxChars: number = TTS_CHUNK_MAX_CHARS): string[] {
  const t = text.trim();
  if (t.length <= maxChars) return [t];

  const out: string[] = [];
  let rest = t;
  while (rest.length > 0) {
    if (rest.length <= maxChars) {
      out.push(rest);
      break;
    }
    let cut = rest.lastIndexOf(" ", maxChars);
    if (cut < maxChars * 0.5) cut = maxChars;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return out.filter(Boolean);
}
