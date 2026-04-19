/**
 * `/studies/lesson/[slug]` uses a single segment: `topicSlug--lessonSlug`
 * (lesson slugs in the catalog do not contain `--`).
 */
export function parseStudiesLessonFlatSlug(flat: string): { topicSlug: string; lessonSlug: string } | null {
  const ix = flat.indexOf("--");
  if (ix <= 0) return null;
  const topicSlug = flat.slice(0, ix).trim();
  const lessonSlug = flat.slice(ix + 2).trim();
  if (!topicSlug || !lessonSlug) return null;
  return { topicSlug, lessonSlug };
}
