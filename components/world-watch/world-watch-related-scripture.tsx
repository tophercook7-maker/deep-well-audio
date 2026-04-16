"use client";

import { getVersesForTopic, worldWatchCategoryToTopicKey } from "@/lib/study/topic-scripture-map";
import { TopicScriptureLinks } from "@/components/study/topic-scripture-links";

/**
 * Related verses from the static topic map, keyed off World Watch category.
 */
export function WorldWatchRelatedScripture({ category }: { category: string | null }) {
  const topicKey = worldWatchCategoryToTopicKey(category);
  const verses = getVersesForTopic(topicKey).slice(0, 4);

  return (
    <div className="rounded-xl border border-sky-500/20 bg-[rgba(8,12,20,0.35)] px-4 py-4 backdrop-blur-sm">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/75">Related Scripture</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400/95">
        Explore passages connected to this kind of story—tap to read in Study.
      </p>
      <div className="mt-3">
        <TopicScriptureLinks references={verses} variant="chips" />
      </div>
    </div>
  );
}
