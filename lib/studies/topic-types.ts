import type { STUDIES_HUB_CATEGORY_ORDER } from "@/lib/studies/hub-categories";

export type StudiesHubCategorySlug = (typeof STUDIES_HUB_CATEGORY_ORDER)[number];

/** Linked chapter card for topic → Bible navigation. */
export type TopicChapterCard = {
  urlBook: string;
  chapter: number;
  /** Verse anchor when helpful */
  verse?: number;
  label: string;
  /** Optional one-line “why here” */
  note?: string;
};

export type TopicChapterTiers = {
  primary: TopicChapterCard[];
  supporting: TopicChapterCard[];
  relatedPassages: TopicChapterCard[];
};

export type TopicQuickHelp = {
  /** Short heading, e.g. “When you feel overwhelmed” */
  lead: string;
  /** Two or three calm, direct lines (shown before key verses) */
  lines?: [string, string] | [string, string, string];
  /** Three references that parse for Bible links */
  verseRefs: [string, string, string];
  /** Optional closing line (use when `lines` is omitted, e.g. legacy topics) */
  encouragement?: string;
};

/**
 * Central graph + discovery metadata for a study topic.
 * Long-form prose stays in `content/study/topics.ts`; this layer holds structure, SEO helpers, and linking.
 */
export type TopicEngineRecord = {
  slug: string;
  searchAliases: string[];
  /** One or more hub browse buckets */
  hubCategories: StudiesHubCategorySlug[];
  chapterTiers: TopicChapterTiers;
  /** Hand-curated; typically 3–6 slugs */
  relatedTopicSlugs: string[];
  /** Optional one-line previews keyed by exact `keyScriptureRefs` line */
  keyRefSnippets?: Partial<Record<string, string>>;
  quickHelp?: TopicQuickHelp;
  /** Hub: spotlight in featured row */
  featured?: boolean;
  /** Hub: “recently expanded” strip */
  recentlyExpanded?: boolean;
  /** Hub: lighter entry row */
  quickHelpHighlight?: boolean;
};
