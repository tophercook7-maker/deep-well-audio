/**
 * Static topic → passage references for “Study by Topic” and related surfaces.
 * Strings are passed to `normalizeScriptureTagInput` + `openFromScriptureTag`.
 */
export const topicScriptureMap = {
  anxiety: {
    label: "Anxiety",
    description:
      "These passages focus on trusting God instead of worrying about life, provision, and the future.",
    verses: ["Matthew 6:25-34", "Philippians 4:6-7", "Psalm 55:22"],
  },
  faith: {
    label: "Faith",
    description: "These passages explain what faith is and how it grows through hearing and trusting God.",
    verses: ["Hebrews 11:1", "Romans 10:17"],
  },
  wisdom: {
    label: "Wisdom",
    description:
      "These verses lift up God's wisdom over our own and invite us to ask him for insight in everyday choices.",
    verses: ["Proverbs 3:5-6", "James 1:5"],
  },
  fear: {
    label: "Fear",
    description: "These passages name fear and point to God's peace, strength, and presence instead.",
    verses: ["2 Timothy 1:7", "Psalm 34:4"],
  },
  end_times: {
    label: "End Times",
    description:
      "These chapters touch on the last days, endurance, and keeping faith when the world feels unstable.",
    verses: ["Matthew 24", "2 Timothy 3", "Revelation 13"],
  },
  hope: {
    label: "Hope",
    description: "These verses anchor hope in God's promises and character—not luck, but trust in him.",
    verses: ["Romans 15:13", "Jeremiah 29:11"],
  },
} as const;

export type TopicKey = keyof typeof topicScriptureMap;

/** Stable order for the Bible page topic picker. */
export const STUDY_TOPIC_ORDER: TopicKey[] = [
  "anxiety",
  "faith",
  "wisdom",
  "fear",
  "end_times",
  "hope",
];

/** When a teaching has no tags or detectable refs, offer these as a gentle default. */
export const TEACHING_SCRIPTURE_FALLBACK_TOPIC: TopicKey = "faith";

/** Ordered labels for the Bible page topic picker (from each topic’s label). */
export const STUDY_TOPIC_PICKER: { key: TopicKey; label: string }[] = STUDY_TOPIC_ORDER.map((key) => ({
  key,
  label: topicScriptureMap[key].label,
}));

/** Map World Watch editorial category → topic verses (no DB column required). */
export function worldWatchCategoryToTopicKey(category: string | null): TopicKey {
  const c = (category ?? "").trim();
  switch (c) {
    case "global":
      return "end_times";
    case "faith_public_life":
      return "faith";
    case "culture":
      return "wisdom";
    case "prayer_watch":
      return "hope";
    case "other":
    default:
      return "faith";
  }
}

export function getVersesForTopic(key: TopicKey): readonly string[] {
  return topicScriptureMap[key].verses;
}
