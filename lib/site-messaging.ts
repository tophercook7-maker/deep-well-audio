/**
 * Core positioning and CTA labels—keep sitewide copy coherent and conversion-focused.
 */

export const SITE_POSITIONING = {
  headline: "Keep the teaching that shapes you.",
  subhead:
    "Listen and watch for free anytime. Become a member to keep sermons, video, Scripture, notes, and progress together—organized so nothing that shaped you scatters.",
  problem:
    "Most teaching dissipates unless it lives in one home. When you're logged in as a member, whatever you hear, watch, highlight, or write stays threaded together—a study-ready library you can revisit.",
} as const;

/** Standard primary/secondary CTAs—use these labels consistently. */
export const CTA = {
  /** Exploration entry — Browse is free audio + video teaching (account not required). */
  LISTEN_FREE: "Listen & watch free",
  /** Calm pricing entry — use instead of “See Premium” / hard upsell language */
  SEE_PREMIUM: "View plans",
  /** Paid membership checkout — `/signup` forwards to `/pricing`. Listening and watching stay free without it; membership pulls saves into one study-ready library. */
  JOIN_MEMBERSHIP: "Become a member",
  UPGRADE_TO_PREMIUM: "Upgrade to Premium",
} as const;

export const PRODUCT_MODEL = {
  browse: "Browse helps you discover trusted teaching to hear and watch.",
  bible: "Reading and listening help you keep Scripture beside the rest of life.",
  library:
    "Your library pulls saved teaching, video, Scripture, notes, and listening into one place you can study and return to.",
  worldWatch: "World Watch helps you stay grounded in current events.",
  premium: "Premium connects what you listen to, watch, and write so your growth compounds instead of drifting.",
} as const;
