import { getTodaysDailyReading } from "@/lib/bible/daily-reading";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import { relatedChaptersForChapter, topicHintsForChapter } from "@/lib/bible/chapter-topic-hints";
import type { BibleContinueListeningSnapshot } from "@/lib/bible/listen-preferences";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";
import { listenChapterHref, nextChapterInBookPath } from "@/lib/guidance/guidance-patterns";

const r = STUDIES_PLATFORM_ROUTES;

export type GuidedNextKind =
  | "continue_chapter"
  | "continue_listening"
  | "today_reading"
  | "topic"
  | "related_chapter"
  | "listen_chapter"
  | "read_chapter";

export type GuidedNextStep = {
  type: GuidedNextKind;
  title: string;
  description?: string;
  href: string;
  /** Internal — not shown in v1 UI */
  reason?: string;
};

export type ChapterGuidanceResult = {
  primary: GuidedNextStep | null;
  supporting: GuidedNextStep[];
};

const MAX_SUPPORTING = 2;

function sameDailyChapter(urlBook: string, chapter: number, daily: { urlBook: string; chapter: number }): boolean {
  return urlBook.toLowerCase() === daily.urlBook.toLowerCase() && chapter === daily.chapter;
}

function dedupeSteps(steps: GuidedNextStep[]): GuidedNextStep[] {
  const seen = new Set<string>();
  const out: GuidedNextStep[] = [];
  for (const s of steps) {
    if (seen.has(s.href)) continue;
    seen.add(s.href);
    out.push(s);
  }
  return out;
}

/**
 * Ordered supporting links: today’s reading → topic → related passage.
 * Skips hrefs already used by primary.
 */
function collectChapterSupporting(
  translation: StudyTranslationId,
  urlBook: string,
  chapter: number,
  bookApiId: string,
  maxChapterInBook: number,
  excludeHref: Set<string>,
): GuidedNextStep[] {
  const today = getTodaysDailyReading();
  const onToday = sameDailyChapter(urlBook, chapter, today);
  const out: GuidedNextStep[] = [];

  if (!onToday) {
    const href = bibleChapterPath(translation, today.urlBook, today.chapter);
    if (!excludeHref.has(href)) {
      out.push({
        type: "today_reading",
        title: "Return to today’s reading",
        description: today.referenceLabel,
        href,
        reason: "daily_plan",
      });
    }
  }

  const hints = topicHintsForChapter(urlBook, chapter);
  if (hints[0]) {
    const href = r.topic(hints[0].slug);
    if (!excludeHref.has(href)) {
      out.push({
        type: "topic",
        title: `Explore ${hints[0].label}`,
        description: "Ground this in Scripture.",
        href,
        reason: "chapter_topic_hint",
      });
    }
  }

  const related = relatedChaptersForChapter(urlBook, chapter);
  if (related[0]) {
    const rc = related[0];
    const base = bibleChapterPath(translation, rc.urlBook, rc.chapter);
    const href = rc.verse != null ? `${base}#${rc.verse}` : base;
    if (!excludeHref.has(href)) {
      out.push({
        type: "related_chapter",
        title: "A related passage",
        description: rc.label,
        href,
        reason: "cross_chapter_link",
      });
    }
  }

  const nextRead = nextChapterInBookPath(translation, urlBook, chapter, maxChapterInBook);
  if (!nextRead && !excludeHref.has(listenChapterHref(bookApiId, chapter))) {
    out.push({
      type: "listen_chapter",
      title: "Listen here",
      description: "Hear this chapter read aloud.",
      href: listenChapterHref(bookApiId, chapter),
      reason: "listen_same_chapter",
    });
  }

  return dedupeSteps(out).filter((s) => !excludeHref.has(s.href)).slice(0, MAX_SUPPORTING);
}

/**
 * Context-based suggestions for Bible chapter readers.
 * Priority: resume listening elsewhere → primary in-book step → supporting (today → topic → related).
 */
export function resolveChapterGuidance(input: {
  translation: StudyTranslationId;
  urlBook: string;
  chapter: number;
  bookApiId: string;
  maxChapterInBook: number;
  listenSnapshot: BibleContinueListeningSnapshot | null;
}): ChapterGuidanceResult {
  const { translation, urlBook, chapter, bookApiId, maxChapterInBook, listenSnapshot } = input;

  const onThisListenChapter =
    listenSnapshot != null &&
    listenSnapshot.bookId === bookApiId &&
    listenSnapshot.chapter === chapter &&
    listenSnapshot.translation === translation;

  if (listenSnapshot?.canResume && !onThisListenChapter) {
    const href = listenChapterHref(listenSnapshot.bookId, listenSnapshot.chapter);
    const exclude = new Set([href]);
    return {
      primary: {
        type: "continue_listening",
        title: "Continue listening",
        description: "Pick up where you left off.",
        href,
        reason: "saved_listen_position",
      },
      supporting: collectChapterSupporting(translation, urlBook, chapter, bookApiId, maxChapterInBook, exclude),
    };
  }

  const nextRead = nextChapterInBookPath(translation, urlBook, chapter, maxChapterInBook);
  const exclude = new Set<string>();
  let primary: GuidedNextStep | null = null;

  if (nextRead) {
    primary = {
      type: "continue_chapter",
      title: "Read next",
      description: "Continue in this book.",
      href: nextRead,
      reason: "next_chapter_same_book",
    };
    exclude.add(nextRead);
  } else {
    const lh = listenChapterHref(bookApiId, chapter);
    primary = {
      type: "listen_chapter",
      title: "Listen here",
      description: "Hear this chapter read aloud.",
      href: lh,
      reason: "listen_same_chapter",
    };
    exclude.add(lh);
  }

  return {
    primary,
    supporting: collectChapterSupporting(translation, urlBook, chapter, bookApiId, maxChapterInBook, exclude),
  };
}

/** Topic page: editorial “where next” (v1). */
export function resolveTopicWhereNext(topicSlug: string): { primary: GuidedNextStep | null; supporting: GuidedNextStep[] } {
  const rows = TOPIC_WHERE_NEXT_EDITORIAL[topicSlug];
  if (!rows?.length) return { primary: null, supporting: [] };
  const [first, ...rest] = rows;
  return {
    primary: first ?? null,
    supporting: rest.slice(0, MAX_SUPPORTING),
  };
}

const TOPIC_WHERE_NEXT_EDITORIAL: Record<string, GuidedNextStep[]> = {
  anxiety: [
    {
      type: "read_chapter",
      title: "Read Philippians 4",
      description: "Prayer, thanksgiving, and God’s peace.",
      href: bibleChapterPath("web", "philippians", 4),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Peace",
      href: r.topic("peace"),
      reason: "topic_editorial",
    },
    {
      type: "listen_chapter",
      title: "Listen to Matthew 6",
      description: "Jesus on worry and the Father’s care.",
      href: listenChapterHref("MAT", 6),
      reason: "topic_editorial",
    },
  ],
  fear: [
    {
      type: "read_chapter",
      title: "Read Psalm 27",
      href: bibleChapterPath("web", "psalms", 27),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Faith",
      href: r.topic("faith"),
      reason: "topic_editorial",
    },
    {
      type: "read_chapter",
      title: "Read Isaiah 41",
      href: bibleChapterPath("web", "isaiah", 41),
      reason: "topic_editorial",
    },
  ],
  peace: [
    {
      type: "read_chapter",
      title: "Read John 14",
      description: "Christ’s peace.",
      href: bibleChapterPath("web", "john", 14),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Grace",
      href: r.topic("grace"),
      reason: "topic_editorial",
    },
    {
      type: "listen_chapter",
      title: "Listen to Philippians 4",
      href: listenChapterHref("PHP", 4),
      reason: "topic_editorial",
    },
  ],
  prayer: [
    {
      type: "read_chapter",
      title: "Read Matthew 6",
      description: "The Lord’s Prayer.",
      href: bibleChapterPath("web", "matthew", 6),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Salvation",
      href: r.topic("salvation"),
      reason: "topic_editorial",
    },
    {
      type: "listen_chapter",
      title: "Listen to Luke 11",
      href: listenChapterHref("LUK", 11),
      reason: "topic_editorial",
    },
  ],
  salvation: [
    {
      type: "read_chapter",
      title: "Read Ephesians 2",
      description: "Saved by grace through faith.",
      href: bibleChapterPath("web", "ephesians", 2),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Grace",
      href: r.topic("grace"),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Identity in Christ",
      href: r.topic("identity-in-christ"),
      reason: "topic_editorial",
    },
  ],
  faith: [
    {
      type: "read_chapter",
      title: "Read Romans 10",
      href: bibleChapterPath("web", "romans", 10),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Anxiety",
      href: r.topic("anxiety"),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Prayer",
      href: r.topic("prayer"),
      reason: "topic_editorial",
    },
  ],
  grace: [
    {
      type: "read_chapter",
      title: "Read Romans 5",
      href: bibleChapterPath("web", "romans", 5),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Peace",
      href: r.topic("peace"),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Forgiveness",
      href: r.topic("forgiveness"),
      reason: "topic_editorial",
    },
  ],
  "identity-in-christ": [
    {
      type: "read_chapter",
      title: "Read Romans 8",
      description: "Children of God.",
      href: bibleChapterPath("web", "romans", 8),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Salvation",
      href: r.topic("salvation"),
      reason: "topic_editorial",
    },
    {
      type: "topic",
      title: "Explore Fear",
      href: r.topic("fear"),
      reason: "topic_editorial",
    },
  ],
};

/** When a listen session reaches the end of a chapter: one primary + one optional link. */
export function resolveListenEndGuidance(input: {
  translation: StudyTranslationId;
  urlBook: string;
  chapter: number;
  bookApiId: string;
  maxChapterInBook: number;
}): { primary: GuidedNextStep | null; supporting: GuidedNextStep[] } {
  const { translation, urlBook, chapter, bookApiId, maxChapterInBook } = input;
  const nextListen = nextChapterInBookPath(translation, urlBook, chapter, maxChapterInBook);
  const readHref = bibleChapterPath(translation, urlBook, chapter);
  const hints = topicHintsForChapter(urlBook, chapter);

  const primary: GuidedNextStep | null = nextListen
    ? {
        type: "continue_chapter",
        title: "Listen next",
        description: "Continue in this book.",
        href: listenChapterHref(bookApiId, chapter + 1),
        reason: "listen_next_chapter",
      }
    : {
        type: "read_chapter",
        title: "Read this chapter",
        description: "Stay with the text.",
        href: readHref,
        reason: "read_after_listen",
      };

  const exclude = new Set<string>([primary?.href ?? ""]);
  const supporting: GuidedNextStep[] = [];

  if (hints[0]) {
    const th = r.topic(hints[0].slug);
    if (!exclude.has(th)) {
      supporting.push({
        type: "topic",
        title: `Explore ${hints[0].label}`,
        href: th,
        reason: "listen_topic_hint",
      });
      exclude.add(th);
    }
  }

  return {
    primary,
    supporting: dedupeSteps(supporting).slice(0, 1),
  };
}
