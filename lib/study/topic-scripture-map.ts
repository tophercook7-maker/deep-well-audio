/**
 * Static topic → passage references for “Study by Topic” and related surfaces.
 * Strings are passed to `normalizeScriptureTagInput` + `openFromScriptureTag`.
 */
export const topicScriptureMap = {
  anxiety: [
    "Matthew 6:25-34",
    "Philippians 4:6-7",
    "Psalm 55:22",
  ],
  faith: ["Hebrews 11:1", "Romans 10:17"],
  wisdom: ["Proverbs 3:5-6", "James 1:5"],
  fear: ["2 Timothy 1:7", "Psalm 34:4"],
  end_times: [
    "Matthew 24",
    "2 Timothy 3",
    "Revelation 13",
  ],
  hope: ["Romans 15:13", "Jeremiah 29:11"],
} as const;

export type TopicKey = keyof typeof topicScriptureMap;

/** When a teaching has no tags or detectable refs, offer these as a gentle default. */
export const TEACHING_SCRIPTURE_FALLBACK_TOPIC: TopicKey = "faith";

/** Ordered labels for the Bible page topic picker. */
export const STUDY_TOPIC_PICKER: { key: TopicKey; label: string }[] = [
  { key: "anxiety", label: "Anxiety" },
  { key: "faith", label: "Faith" },
  { key: "wisdom", label: "Wisdom" },
  { key: "fear", label: "Fear" },
  { key: "end_times", label: "End Times" },
  { key: "hope", label: "Hope" },
];

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
  return topicScriptureMap[key];
}
