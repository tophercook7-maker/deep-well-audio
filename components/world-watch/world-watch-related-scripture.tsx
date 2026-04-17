"use client";

import { getVersesForTopic, worldWatchCategoryToTopicKey } from "@/lib/study/topic-scripture-map";
import { TopicScriptureLinks } from "@/components/study/topic-scripture-links";

/** Pick up to `max` verses with a stable rotation so nearby stories don’t all show the same pair. */
function pickRotatedVerses(verses: readonly string[], storyKey: string, max: number): string[] {
  const arr = [...verses];
  if (arr.length === 0) return [];
  if (arr.length <= max) return arr;
  let h = 0;
  for (let i = 0; i < storyKey.length; i++) h = (h * 31 + storyKey.charCodeAt(i)) >>> 0;
  const start = h % arr.length;
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    out.push(arr[(start + i) % arr.length]!);
  }
  return out;
}

/**
 * Contextual passages from the topic map, rotated per story so the same verses don’t repeat on every card.
 */
export function WorldWatchRelatedScripture({
  category,
  storyKey,
}: {
  category: string | null;
  /** Stable id (e.g. item id) to vary which verses appear for the same category. */
  storyKey: string;
}) {
  const topicKey = worldWatchCategoryToTopicKey(category);
  const pool = getVersesForTopic(topicKey);
  const verses = pickRotatedVerses(pool, storyKey, 2);

  return (
    <div className="rounded-xl border border-sky-500/20 bg-[rgba(8,12,20,0.35)] px-4 py-4 backdrop-blur-sm">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/75">Biblical context</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400/95">
        Passages that speak to this kind of moment—tap to read calmly in Study.
      </p>
      <div className="mt-3">
        <TopicScriptureLinks references={verses} variant="chips" />
      </div>
    </div>
  );
}
