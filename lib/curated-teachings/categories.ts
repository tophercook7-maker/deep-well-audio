/**
 * Editorial categories for the curated YouTube library (distinct from podcast Explore categories).
 */
export const CURATED_CATEGORY_ORDER = [
  "bible-foundations",
  "verse-by-verse",
  "sermons-preaching",
  "christian-living",
  "apologetics",
  "discernment",
  "prophecy-end-times",
  "world-watch",
] as const;

export type CuratedCategorySlug = (typeof CURATED_CATEGORY_ORDER)[number];

export type CuratedCategoryMeta = {
  slug: CuratedCategorySlug;
  label: string;
  shortLabel: string;
  description: string;
};

export const CURATED_CATEGORY_META: Record<CuratedCategorySlug, CuratedCategoryMeta> = {
  "bible-foundations": {
    slug: "bible-foundations",
    label: "Bible Foundations",
    shortLabel: "Foundations",
    description: "Overview, context, and core truths of Scripture.",
  },
  "verse-by-verse": {
    slug: "verse-by-verse",
    label: "Verse-by-Verse Teaching",
    shortLabel: "Verse-by-verse",
    description: "Careful, passage-level exposition and study.",
  },
  "sermons-preaching": {
    slug: "sermons-preaching",
    label: "Sermons & Preaching",
    shortLabel: "Sermons",
    description: "Pulpit ministry and faithful proclamation.",
  },
  "christian-living": {
    slug: "christian-living",
    label: "Christian Living",
    shortLabel: "Living",
    description: "Discipleship, holiness, and everyday faithfulness.",
  },
  apologetics: {
    slug: "apologetics",
    label: "Apologetics",
    shortLabel: "Apologetics",
    description: "Reasons for faith and winsome defense of Christianity.",
  },
  discernment: {
    slug: "discernment",
    label: "Discernment",
    shortLabel: "Discernment",
    description: "Testing ideas, teachers, and cultural voices against Scripture.",
  },
  "prophecy-end-times": {
    slug: "prophecy-end-times",
    label: "Prophecy & End Times",
    shortLabel: "Prophecy",
    description: "Eschatology and prophetic themes—handled with care.",
  },
  "world-watch": {
    slug: "world-watch",
    label: "World Watch",
    shortLabel: "World Watch",
    description: "Current events and culture through a biblical lens.",
  },
};

export function isCuratedCategorySlug(s: string): s is CuratedCategorySlug {
  return (CURATED_CATEGORY_ORDER as readonly string[]).includes(s);
}

export function getCuratedCategoriesForNav(): CuratedCategoryMeta[] {
  return CURATED_CATEGORY_ORDER.map((slug) => CURATED_CATEGORY_META[slug]);
}
