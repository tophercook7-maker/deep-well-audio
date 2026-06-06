/**
 * Core positioning and CTA labels--keep sitewide copy coherent and conversion-focused.
 */

export const SITE_POSITIONING = {
  /** Main message — use in heroes, metadata, and high-intent surfaces. */
  headline: "Stop losing the teaching that shaped you.",
  subhead:
    "Deep Well is a personal faith library for the sermons, Scripture, notes, and World Watch reflections you actually want to return to.",
  /** One-line product definition for footers, about, and SEO fallbacks. */
  productDefinition:
    "Deep Well is a personal faith library—not just another content feed. It helps you save, remember, revisit, and grow from the sermons, Scripture, notes, bookmarks, and reflections that shaped you.",
  problemTitle: "Most Christian content disappears right after it helps you.",
  problemBullets: [
    "You hear a sermon you need, then cannot find it later.",
    "Your notes live in one place while the teaching lives somewhere else.",
    "You want a steadier walk, but your spiritual inputs are scattered.",
  ] as const,
  problemClosing:
    "Deep Well fixes the part after listening: saving, returning, taking notes, following topics, and keeping Scripture beside what shaped you.",
  plansPositioning: "Listen for free.\nPay when you want Deep Well to remember for you.",
  /** @deprecated Prefer problemTitle + problemBullets */
  problem:
    "Most people do not need another pile of Christian content. They need one quiet place that remembers what helped, keeps it tied to Scripture, and makes it easy to come back when life gets loud.",
} as const;

/** Standard primary/secondary CTAs--use these labels consistently. */
export const CTA = {
  START_LISTENING_FREE: "Start Listening Free",
  SEE_WHAT_PREMIUM_KEEPS: "See What Premium Keeps",
  BUILD_MY_LIBRARY: "Build My Library",
  /** @deprecated Prefer START_LISTENING_FREE */
  LISTEN_FREE: "Start Listening Free",
  /** @deprecated Prefer SEE_WHAT_PREMIUM_KEEPS */
  SEE_PREMIUM: "See What Premium Keeps",
  /** @deprecated Prefer BUILD_MY_LIBRARY */
  JOIN_MEMBERSHIP: "Build My Library",
  /** @deprecated Prefer BUILD_MY_LIBRARY */
  UPGRADE_TO_PREMIUM: "Build My Library",
} as const;

export const PRODUCT_MODEL = {
  browse: "Browse helps people find trusted teaching without falling into endless scrolling.",
  bible: "Bible reading keeps Scripture beside the sermons, notes, and reflections that shaped the day.",
  library:
    "Your library keeps saved teachings, curated video, Scripture, notes, bookmarks, and listening progress in one study-ready place.",
  worldWatch:
    "World Watch turns current events into a calmer, Scripture-aware weekly reflection—complete digest and archive live in Premium.",
  premium: "Premium is the memory layer: it keeps what moved you so your spiritual growth does not drift away.",
} as const;

export const SOCIAL_PROOF_PLACEHOLDERS = [
  "I finally have one place for the teachings I keep wanting to revisit.",
  "The value isn't more noise. It's remembering what actually helped me.",
  "This feels less like another subscription and more like a study rhythm.",
] as const;
