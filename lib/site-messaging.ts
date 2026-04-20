/**
 * Core positioning and CTA labels—keep sitewide copy coherent and conversion-focused.
 */

export const SITE_POSITIONING = {
  headline: "Keep the teaching that shapes you.",
  subhead:
    "Listen freely. Save sermons, notes, and Scripture worth returning to.",
  problem: "Most Christian content gets heard once and forgotten. Deep Well helps you keep what actually changed you.",
} as const;

/** Standard primary/secondary CTAs—use these labels consistently. */
export const CTA = {
  LISTEN_FREE: "Listen Free",
  /** Calm pricing entry — use instead of “See Premium” / hard upsell language */
  SEE_PREMIUM: "View plans",
  CREATE_FREE_ACCOUNT: "Create Free Account",
  UPGRADE_TO_PREMIUM: "Upgrade to Premium",
} as const;

export const PRODUCT_MODEL = {
  browse: "Browse helps you find trusted teaching.",
  bible: "Reading and listening help you keep Scripture beside the rest of life.",
  library: "Library helps you keep what mattered.",
  worldWatch: "World Watch helps you stay grounded in current events.",
  premium: "Premium makes the experience persistent and meaningful over time.",
} as const;
