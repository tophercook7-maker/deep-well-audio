/**
 * Curated “topic packs” — structured study paths. Episode rows use `matchTerms` to bind to
 * real catalog titles in the topic pool at runtime (see `lib/topic-pack-resolve.ts`), or optional `episodeId` overrides.
 */

export type TopicPackEpisodeSlot = {
  title: string;
  /** Substrings matched against episode title (lowercase). First unused catalog hit wins. */
  matchTerms?: string[];
  /** Optional manual UUID when you want a fixed row regardless matching. */
  episodeId?: string;
};

export type TopicPackSectionDef = {
  id: string;
  title: string;
  description: string;
  episodes: TopicPackEpisodeSlot[];
};

/** @deprecated Use TopicPackEpisodeSlot; kept as alias for legacy rows. */
export type TopicPackEntry = TopicPackEpisodeSlot;

export type TopicPackDefinition = {
  /** Stable id for the pack (e.g. end-times-pack). */
  packSlug: string;
  topicSlug: string;
  label: string;
  description: string;
  /** Short line under the title (structured packs). */
  pathIntro?: string;
  /** Free-tier bullets when `sections` is absent (legacy). */
  teaserTitles?: string[];
  /** Ordered study sections (premium path). */
  sections?: TopicPackSectionDef[];
  /** Legacy flat list when `sections` is absent. */
  curated?: TopicPackEpisodeSlot[];
};

export const TOPIC_PACKS: Partial<Record<string, TopicPackDefinition>> = {
  "end-times": {
    packSlug: "end-times-pack",
    topicSlug: "end-times",
    label: "End Times — A Clear Path Through the Confusion",
    pathIntro: "Follow a clear path · Built to be understood step by step · Curated for clarity, not confusion",
    description:
      "End-times talk can feel like noise—charts, theories, and endless debate. This path is different: trusted teaching from your directory, ordered so you can listen in sequence and actually think straight. We stay close to Scripture, slow down on key passages, name common mix-ups, and land in hope that shapes your week—not speculation that drains it.",
    sections: [
      {
        id: "foundations",
        title: "Foundations",
        description:
          "What the Bible really says before the imagination runs ahead—patient exegesis, hope fixed on Christ, and a refusal to treat prophecy like a puzzle contest.",
        episodes: [
          { title: "Last things without the hype", matchTerms: ["last days"] },
          { title: "The return of Christ as centerpiece", matchTerms: ["second coming"] },
          { title: "Reading prophecy on Scripture’s terms", matchTerms: ["eschatolog"] },
        ],
      },
      {
        id: "key-passages",
        title: "Key Passages",
        description:
          "Daniel, Revelation, and the Thessalonian letters—anchors people return to again and again. These episodes slow down so you can hear the text, not the culture war around it.",
        episodes: [
          { title: "Daniel: exile faith and future hope", matchTerms: ["daniel"] },
          { title: "Daniel: visions and the kingdom of God", matchTerms: ["seventy", "week"] },
          { title: "Revelation: the Lamb who wins", matchTerms: ["revelation"] },
          { title: "Revelation: seals, judgment, worship", matchTerms: ["seven seal", "seven seals"] },
          { title: "Thessalonians: the Day of the Lord", matchTerms: ["thessalonian"] },
          { title: "Thessalonians: comfort until Christ appears", matchTerms: ["thessalonians"] },
        ],
      },
      {
        id: "misunderstandings",
        title: "Common Misunderstandings",
        description:
          "Where popular teaching drifts from the text—naming confusion without whipping up fear, and choosing clarity without cynicism.",
        episodes: [
          { title: "Rapture debates: what’s actually in the text?", matchTerms: ["rapture"] },
          { title: "Millennium and timing: reading with humility", matchTerms: ["millennial", "millennium"] },
          { title: "Antichrist chatter vs. sober Scripture", matchTerms: ["antichrist"] },
        ],
      },
      {
        id: "living",
        title: "Living With Clarity",
        description:
          "Eschatology isn’t escapism—it’s hope that steadies prayer, endurance, and love for the church today.",
        episodes: [
          { title: "Hope that holds when the news is loud", matchTerms: ["hope"] },
          { title: "Faithful today while we wait", matchTerms: ["persever"] },
        ],
      },
    ],
  },
  discernment: {
    packSlug: "discernment-pack",
    topicSlug: "discernment",
    label: "Discernment study track",
    description:
      "Listen in order through testing spirits, love of truth, and charity toward the bride of Christ—without cynicism.",
    teaserTitles: ["Wisdom for a noisy internet", "Charity and clarity together", "When teaching doesn’t line up with Scripture"],
    curated: [
      { title: "Foundations: the good, the true, the beautiful" },
      { title: "Discerning without despising the church" },
      { title: "When to engage—and when to rest" },
    ],
  },
  suffering: {
    packSlug: "suffering-pack",
    topicSlug: "suffering",
    label: "Suffering & providence track",
    description:
      "A gentle arc through grief, pain, and God’s nearness—sermons worth returning to when words are hard to find.",
    teaserTitles: ["God’s presence in the valley", "Prayer when answers don’t come", "The church bearing burdens"],
    curated: [
      { title: "Honest lament, grounded hope" },
      { title: "Proverbs, Job, and the limits of formulas" },
      { title: "Easter light on Friday pain" },
    ],
  },
  theology: {
    packSlug: "theology-pack",
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
