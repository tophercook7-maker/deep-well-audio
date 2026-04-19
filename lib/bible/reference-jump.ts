import { bibleChapterPath, apiSlugToUrlBook } from "@/lib/bible/navigation-urls";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { parseScriptureTagForStudy } from "@/lib/study/refs";

export type BibleReferenceJump = { href: string; label: string; kind: "verse" | "chapter" };

/** Resolve a typed reference (e.g. `John 3:16`, `Psalm 23`) into a chapter reader URL. */
export function bibleReferenceJumpFromQuery(q: string, translation: StudyTranslationId): BibleReferenceJump | null {
  const ref = parseScriptureTagForStudy(q);
  if (!ref) return null;
  if (ref.kind === "verse") {
    const urlBook = apiSlugToUrlBook(ref.passage.book.apiSlug);
    return {
      kind: "verse",
      label: ref.passage.label,
      href: bibleChapterPath(translation, urlBook, ref.passage.chapter),
    };
  }
  const lastPlus = ref.apiQuery.lastIndexOf("+");
  if (lastPlus <= 0) return null;
  const apiSlug = ref.apiQuery.slice(0, lastPlus);
  const chStr = ref.apiQuery.slice(lastPlus + 1);
  const ch = Number.parseInt(chStr, 10);
  if (!Number.isFinite(ch) || ch < 1) return null;
  return {
    kind: "chapter",
    label: ref.title,
    href: bibleChapterPath(translation, apiSlugToUrlBook(apiSlug), ch),
  };
}
