/**
 * Maps platform taxonomy (aligned with DB `study_categories`) to topic slugs in the content catalog.
 * Only includes topics that exist in `STUDY_TOPIC_SLUGS`.
 */
export const STUDIES_HUB_CATEGORY_ORDER = [
  "spiritual-growth",
  "emotional-mental-struggles",
  "relationships",
  "purpose-direction",
  "hard-seasons",
  "freedom-battle",
  "gospel-foundations",
] as const;

export const STUDIES_HUB_CATEGORY_LABELS: Record<(typeof STUDIES_HUB_CATEGORY_ORDER)[number], string> = {
  "spiritual-growth": "Spiritual Growth",
  "emotional-mental-struggles": "Emotional and Mental Struggles",
  relationships: "Relationships",
  "purpose-direction": "Purpose and Direction",
  "hard-seasons": "Hard Seasons",
  "freedom-battle": "Freedom and Battle",
  "gospel-foundations": "Gospel Foundations",
};

/** Topic slugs per hub category (topics may appear in more than one bucket when useful for discovery). */
export const STUDIES_HUB_CATEGORY_TOPICS: Record<(typeof STUDIES_HUB_CATEGORY_ORDER)[number], string[]> = {
  "spiritual-growth": ["prayer", "peace", "forgiveness", "wisdom", "sanctification", "grace"],
  "emotional-mental-struggles": ["anxiety", "fear", "suffering", "grief", "suffering-and-loss", "assurance"],
  relationships: ["marriage", "parenting", "money", "work"],
  "purpose-direction": ["purpose", "identity-in-christ"],
  "hard-seasons": ["suffering", "grief", "suffering-and-loss", "eternal-life"],
  "freedom-battle": ["temptation", "repentance", "discernment", "obedience", "holiness"],
  "gospel-foundations": ["faith", "salvation", "gospel", "peace", "identity-in-christ"],
};
