/**
 * First-class topic landing pages (topic_tags), separate from show categories.
 */

export type TopicDefinition = {
  slug: string;
  label: string;
  /** Short hero intro (always shown). */
  description: string;
  /** Optional extra copy for flagship topics (e.g. End times). */
  spotlight?: string;
  /** Other topic slugs to surface as related links. */
  relatedSlugs: string[];
};

/** All topic routes we support under /topics/[slug]. */
export const TOPIC_DEFINITIONS: Record<string, TopicDefinition> = {
  "end-times": {
    slug: "end-times",
    label: "End Times",
    description:
      "Sermons, podcasts, and verse-by-verse teaching on Christ’s return, the last days, judgment, restoration, and the hope of the new creation—content-first Bible audio from your curated directory.",
    spotlight:
      "Use this hub when you want sober, Scripture-grounded perspective on eschatology: pastoral sermons, conference messages, and deep dives on Revelation and the Olivet Discourse. You’ll see natural overlap with prophecy and discernment when teachers weigh competing views. Everything listed is tagged from real episode metadata (plus light keyword hints at sync time)—hand-curated sources, not scraped noise.",
    relatedSlugs: ["prophecy", "eschatology", "revelation", "discernment"],
  },
  prophecy: {
    slug: "prophecy",
    label: "Prophecy",
    description: "Messages on prophetic Scripture, fulfillment, and how the church reads God’s word about the future with humility and hope.",
    relatedSlugs: ["end-times", "eschatology", "revelation"],
  },
  eschatology: {
    slug: "eschatology",
    label: "Eschatology",
    description: "Teaching on last things: Christ’s return, resurrection, judgment, and the restoration of all things—grounded in exegesis, not speculation.",
    relatedSlugs: ["end-times", "prophecy", "revelation"],
  },
  revelation: {
    slug: "revelation",
    label: "Revelation",
    description:
      "Expositions and studies anchored in John’s Apocalypse: the victory of the Lamb, letters to the churches, and the grand vision of God’s throne room to the new heavens and earth.",
    relatedSlugs: ["end-times", "prophecy", "eschatology"],
  },
  discernment: {
    slug: "discernment",
    label: "Discernment",
    description:
      "Episodes on testing teaching, loving the truth, and recognizing error—without cynicism or fear. Helpful when you’re weighing what you hear online.",
    relatedSlugs: ["false-teaching", "theology", "worldview"],
  },
  "false-teaching": {
    slug: "false-teaching",
    label: "False teaching",
    description: "Messages that name and answer distortions of the gospel and Scripture, with clarity and charity.",
    relatedSlugs: ["discernment", "theology", "cults"],
  },
  cults: {
    slug: "cults",
    label: "Cults & counterfeits",
    description: "Teaching that compares sects and unbiblical movements to the historic Christian faith—useful for honest apologetics and evangelism.",
    relatedSlugs: ["discernment", "theology", "worldview"],
  },
  theology: {
    slug: "theology",
    label: "Theology",
    description: "Doctrine done devotionally: Trinity, Scripture, salvation, and the church—sermons and series that connect head and heart.",
    relatedSlugs: ["worldview", "suffering", "marriage"],
  },
  marriage: {
    slug: "marriage",
    label: "Marriage",
    description: "Biblical vision for covenant marriage, family, and fidelity in a culture that often misunderstands both freedom and commitment.",
    relatedSlugs: ["theology", "worldview", "suffering"],
  },
  suffering: {
    slug: "suffering",
    label: "Suffering",
    description:
      "Sermons and teaching on grief, pain, persecution, and providence—how God meets his people in the hardest chapters of life.",
    relatedSlugs: ["theology", "worldview", "eschatology"],
  },
  worldview: {
    slug: "worldview",
    label: "Worldview",
    description: "Connecting Scripture to culture, ideas, and the stories we live by—faithful engagement without losing the gospel center.",
    relatedSlugs: ["theology", "discernment", "prophecy"],
  },
  "church-history": {
    slug: "church-history",
    label: "Church history",
    description:
      "Teaching that situates the church in time: creeds, councils, reformation, missions, and the faith once delivered—helpful for grounding today’s questions in yesterday’s witnesses.",
    relatedSlugs: ["theology", "worldview", "spiritual-growth"],
  },
  "spiritual-growth": {
    slug: "spiritual-growth",
    label: "Spiritual growth",
    description:
      "Messages on prayer, holiness, humility, and following Jesus in ordinary life—edification that aims at love, not guilt-driven performance.",
    relatedSlugs: ["theology", "suffering", "marriage"],
  },
  "anxiety-and-trust": {
    slug: "anxiety-and-trust",
    label: "Anxiety and trust",
    description:
      "Pastoral teaching that keeps fear and faith in view together—honest about worry while grounding hope in God’s care and promises.",
    relatedSlugs: ["suffering", "spiritual-growth", "theology"],
  },
  forgiveness: {
    slug: "forgiveness",
    label: "Forgiveness",
    description:
      "Messages on God’s pardon in Christ and the slow work of extending grace to others—with clarity on repentance, boundaries, and peace.",
    relatedSlugs: ["marriage", "spiritual-growth", "theology"],
  },
  "identity-in-christ": {
    slug: "identity-in-christ",
    label: "Identity in Christ",
    description:
      "Who you are in the gospel: chosen, loved, and being renewed—teaching that sets identity on Christ, not credentials or comparison.",
    relatedSlugs: ["theology", "spiritual-growth", "worldview"],
  },
  "knowing-god": {
    slug: "knowing-god",
    label: "Knowing God",
    description:
      "Teaching on the character and nearness of God—Scripture, prayer, and doctrine that aim at affectionate knowledge, not mere information.",
    relatedSlugs: ["theology", "spiritual-growth", "church-history"],
  },
};

/**
 * Homepage / Explore chips (user-facing order).
 * End Times is first for prominence.
 */
export const DISCOVER_TOPIC_SLUGS = [
  "end-times",
  "prophecy",
  "discernment",
  "theology",
  "worldview",
  "marriage",
  "suffering",
  "church-history",
  "spiritual-growth",
] as const;

export type DiscoverTopicSlug = (typeof DISCOVER_TOPIC_SLUGS)[number];

export function normalizeTopicSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
}

export function getTopicDefinition(slug: string): TopicDefinition | null {
  const key = normalizeTopicSlug(slug);
  return TOPIC_DEFINITIONS[key] ?? null;
}

export function isKnownTopicSlug(slug: string): boolean {
  return Boolean(getTopicDefinition(slug));
}

export function getDiscoverTopicCards(): TopicDefinition[] {
  return DISCOVER_TOPIC_SLUGS.map((s) => TOPIC_DEFINITIONS[s]!).filter(Boolean);
}

/** Related topics that have a landing page, in stable order. */
export function getRelatedTopicCards(relatedSlugs: string[]): TopicDefinition[] {
  const out: TopicDefinition[] = [];
  const seen = new Set<string>();
  for (const raw of relatedSlugs) {
    const def = getTopicDefinition(raw);
    if (!def || seen.has(def.slug)) continue;
    seen.add(def.slug);
    out.push(def);
  }
  return out;
}
