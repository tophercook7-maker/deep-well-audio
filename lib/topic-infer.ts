/**
 * Episode topic_tags (not show categories): keyword hints for ingestion only.
 */

/** Slugs we recognize for display + inference (matches `lib/topics` + extended tags). */
export const EXTENDED_TOPIC_SLUGS = [
  "end-times",
  "revelation",
  "prophecy",
  "eschatology",
  "discernment",
  "false-teaching",
  "cults",
  "theology",
  "marriage",
  "suffering",
  "worldview",
  "church-history",
  "spiritual-growth",
] as const;

export type ExtendedTopicSlug = (typeof EXTENDED_TOPIC_SLUGS)[number];

/** Friendly labels for topic pills (ordered list for deterministic merge). */
export const TOPIC_TAG_LABELS: Record<string, string> = {
  "end-times": "End times",
  revelation: "Revelation",
  prophecy: "Prophecy",
  eschatology: "Eschatology",
  discernment: "Discernment",
  "false-teaching": "False teaching",
  cults: "Cults",
  theology: "Theology",
  marriage: "Marriage",
  suffering: "Suffering",
  worldview: "Worldview",
  "church-history": "Church history",
  "spiritual-growth": "Spiritual growth",
};

type KeywordRule = { slug: ExtendedTopicSlug; needles: string[] };

const RULES: KeywordRule[] = [
  {
    slug: "end-times",
    needles: [
      "end times",
      "endtimes",
      "last days",
      "great tribulation",
      "tribulation",
      "antichrist",
      "book of revelation",
      " revelation ",
      "second coming",
      "day of the lord",
      "rapture",
      "olivet discourse",
      "parousia",
      "premillennial",
      "amillennial",
    ],
  },
  {
    slug: "revelation",
    needles: [
      "book of revelation",
      "revelation chapter",
      "revelation:",
      "revelation —",
      " apocalypse",
      "patmos",
      "seven seals",
      "seven bowls",
    ],
  },
  {
    slug: "prophecy",
    needles: ["prophecy", "prophetic", " prophet ", "fulfillment of", "messianic prophecy"],
  },
  { slug: "eschatology", needles: ["eschatolog", "last things"] },
  {
    slug: "discernment",
    needles: [
      "discernment",
      "discern ",
      "test the spirits",
      "false teacher",
      "false teachers",
      "wolf in sheep",
      "prove all things",
    ],
  },
  {
    slug: "false-teaching",
    needles: ["false teaching", "false doctrine", "doctrinal error", "heresy", "heretic"],
  },
  {
    slug: "cults",
    needles: [
      "cults",
      "cultic",
      "jehovah's witness",
      "jw.org",
      "mormon",
      "mormonism",
      "latter-day saint",
    ],
  },
  {
    slug: "theology",
    needles: [
      "theology",
      "systematic theology",
      "dogma",
      "doctrine",
      "attributes of god",
      "trinity",
      "soteriology",
    ],
  },
  {
    slug: "marriage",
    needles: ["marriage", "husband", " wife", "biblical marriage", "covenant marriage", "family life", "parenting"],
  },
  {
    slug: "suffering",
    needles: [
      "suffering",
      "persecution",
      "grief",
      "lament",
      "trials",
      " pain ",
      "providence",
      "god's providence",
    ],
  },
  {
    slug: "worldview",
    needles: [
      "worldview",
      "culture war",
      "postmodern",
      "secular",
      "secularism",
      "ethics",
      "engaging culture",
    ],
  },
  {
    slug: "church-history",
    needles: [
      "church history",
      "early church",
      "church fathers",
      "reformation",
      "constantine",
      "council of",
      "nicea",
      "nicaea",
    ],
  },
  {
    slug: "spiritual-growth",
    needles: [
      "spiritual growth",
      "sanctification",
      "spiritual disciplines",
      "christian life",
      "walk with god",
      "abiding in",
    ],
  },
];

function normalizeExistingTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
}

/** Merge feed seed tags with inferred tags; stable order, lowercase kebab slugs, no duplicates. */
export function mergeTopicTagsFromSeedAndText(
  seedTags: string[] | undefined,
  title: string,
  description: string | null | undefined
): string[] {
  const inferred = inferTopicTagsFromText(title, description);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const t of [...(seedTags ?? []), ...inferred]) {
    const k = normalizeExistingTag(t);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

export function inferTopicTagsFromText(title: string, description: string | null | undefined): ExtendedTopicSlug[] {
  const blob = `\n${(title ?? "").toLowerCase()}\n${(description ?? "").toLowerCase()}\n`;
  const found = new Set<ExtendedTopicSlug>();

  for (const { slug, needles } of RULES) {
    for (const n of needles) {
      if (blob.includes(n)) {
        found.add(slug);
        break;
      }
    }
  }

  return EXTENDED_TOPIC_SLUGS.filter((s) => found.has(s));
}

/** Label for UI pills; falls back to title-casing the slug. */
export function formatTopicTagLabel(slug: string): string {
  const key = normalizeExistingTag(slug);
  if (TOPIC_TAG_LABELS[key]) return TOPIC_TAG_LABELS[key];
  if (!key) return slug;
  return key
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
