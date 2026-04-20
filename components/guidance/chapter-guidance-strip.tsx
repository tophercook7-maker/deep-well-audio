"use client";

import { useEffect, useMemo, useState } from "react";
import { BIBLE_LISTEN_PREFS_UPDATED_EVENT, readBibleContinueListeningSnapshot } from "@/lib/bible/listen-preferences";
import { resolveChapterGuidance, type ChapterGuidanceResult } from "@/lib/guidance/guided-next-step";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { GuidedNextLinks } from "@/components/guidance/guided-next-links";
import { GuidedNextStepCard } from "@/components/guidance/guided-next-step-card";

type ResolutionInput = {
  translation: StudyTranslationId;
  urlBook: string;
  chapter: number;
  bookApiId: string;
  maxChapterInBook: number;
};

export function useChapterGuidanceResolution(input: ResolutionInput): ChapterGuidanceResult {
  const { translation, urlBook, chapter, bookApiId, maxChapterInBook } = input;
  const [listenSnapshot, setListenSnapshot] = useState<ReturnType<typeof readBibleContinueListeningSnapshot> | null>(null);

  useEffect(() => {
    function refresh() {
      setListenSnapshot(readBibleContinueListeningSnapshot());
    }
    refresh();
    if (typeof window === "undefined") return;
    window.addEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
  }, []);

  return useMemo(
    () =>
      resolveChapterGuidance({
        translation,
        urlBook,
        chapter,
        bookApiId,
        maxChapterInBook,
        listenSnapshot,
      }),
    [translation, urlBook, chapter, bookApiId, maxChapterInBook, listenSnapshot],
  );
}

export function ChapterGuidanceStripContent({ resolved, className }: { resolved: ChapterGuidanceResult; className?: string }) {
  if (!resolved.primary && resolved.supporting.length === 0) return null;

  return (
    <section className={className} aria-label="Gentle next steps">
      <GuidedNextStepCard>
        <GuidedNextLinks heading="Continue here" primary={resolved.primary} supporting={resolved.supporting} variant="bible" />
      </GuidedNextStepCard>
    </section>
  );
}

export function ChapterGuidanceStrip(props: ResolutionInput & { className?: string }) {
  const resolved = useChapterGuidanceResolution(props);
  return <ChapterGuidanceStripContent resolved={resolved} className={props.className} />;
}

/** For deduping BibleChapterDiscovery: topic slugs already surfaced in guidance. */
export function topicSlugsFromChapterGuidanceSupporting(supporting: { type: string; href: string }[]): string[] {
  const slugs: string[] = [];
  for (const s of supporting) {
    if (s.type !== "topic") continue;
    const m = s.href.match(/\/studies\/topic\/([^/?#]+)/);
    if (m?.[1]) slugs.push(m[1]!);
  }
  return slugs;
}
