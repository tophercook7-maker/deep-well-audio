/**
 * Core positioning and CTA labels--keep sitewide copy coherent and conversion-focused.
 */

export const SITE_POSITIONING = {
  headline: "Stop losing the teaching that shaped you.",
  subhead:
    "Deep Well is a personal faith library for the sermons, Scripture, notes, and World Watch reflections you actually want to return to.",
  problem:
    "Most people do not need another pile of Christian content. They need one quiet place that remembers what helped, keeps it tied to Scripture, and makes it easy to come back when life gets loud.",
} as const;

/** Standard primary/secondary CTAs--use these labels consistently. */
export const CTA = {
  /** Exploration entry -- Browse is free audio + video teaching (account not required). */
  LISTEN_FREE: "Start listening free",
  /** Calm pricing entry -- use instead of vague plan language */
  SEE_PREMIUM: "See what Premium keeps",
  /** Paid membership checkout -- `/signup` forwards to `/pricing`. */
  JOIN_MEMBERSHIP: "Build my library",
  UPGRADE_TO_PREMIUM: "Upgrade to Premium",
} as const;

export const PRODUCT_MODEL = {
  browse: "Browse helps people find trusted teaching without falling into endless scrolling.",
  bible: "Bible reading keeps Scripture beside the sermons, notes, and reflections that shaped the day.",
  library:
    "Your library keeps saved teachings, curated video, Scripture, notes, bookmarks, and listening progress in one study-ready place.",
  worldWatch: "World Watch turns current events into a calmer, Scripture-aware weekly reflection.",
  premium: "Premium is the memory layer: it keeps what moved you so your spiritual growth does not drift away.",
} as const;
