/**
 * Curated “topic packs” — static paths until episode IDs are wired per deployment.
 * Premium: full ordered list (+ links when `episodeId` is set). Free/guest: preview only.
 */

export type TopicPackEntry = {
  title: string;
  /** Supabase episode UUID when known */
  episodeId?: string;
};

export type TopicPackDefinition = {
  topicSlug: string;
  label: string;
  description: string;
  teaserTitles: string[];
  curated: TopicPackEntry[];
};

export const TOPIC_PACKS: Partial<Record<string, TopicPackDefinition>> = {
  "end-times": {
    topicSlug: "end-times",
    label: "End Times study track",
    description:
      "A guided path through last-things teaching in your catalog—Christ’s return, judgment, restoration, and hope—meant to be heard in order.",
    teaserTitles: [
      "Orienting to biblical eschatology",
      "The return of Christ and the church’s hope",
      "Reading Revelation with patience",
    ],
    curated: [
      { title: "Opening: hope fixed on the risen Christ" },
      { title: "The sheep and the shepherd: judgment and mercy" },
      { title: "New creation: consummation, not escape" },
    ],
  },
  discernment: {
    topicSlug: "discernment",
    label: "Discernment study track",
    description: "Listen in order through testing spirits, love of truth, and charity toward the bride of Christ—without cynicism.",
    teaserTitles: ["Wisdom for a noisy internet", "Charity and clarity together", "When teaching doesn’t line up with Scripture"],
    curated: [
      { title: "Foundations: the good, the true, the beautiful" },
      { title: "Discerning without despising the church" },
      { title: "When to engage—and when to rest" },
    ],
  },
  suffering: {
    topicSlug: "suffering",
    label: "Suffering & providence track",
    description: "A gentle arc through grief, pain, and God’s nearness—sermons worth returning to when words are hard to find.",
    teaserTitles: ["God’s presence in the valley", "Prayer when answers don’t come", "The church bearing burdens"],
    curated: [
      { title: "Honest lament, grounded hope" },
      { title: "Proverbs, Job, and the limits of formulas" },
      { title: "Easter light on Friday pain" },
    ],
  },
  theology: {
    topicSlug: "theology",
    label: "Theology deep-dive track",
    description: "Doctrine that warms the heart: Trinity, Scripture, salvation, church—ordered for a slow, thoughtful listen.",
    teaserTitles: ["Who God is shapes how we live", "Creeds as companions", "Grace that trains, not excuses"],
    curated: [
      { title: "Glory: Father, Son, and Spirit" },
      { title: "The word that creates anew" },
      { title: "Union with Christ in ordinary life" },
    ],
  },
};

export function getTopicPack(slug: string): TopicPackDefinition | null {
  const key = slug.trim().toLowerCase();
  return TOPIC_PACKS[key] ?? null;
}
