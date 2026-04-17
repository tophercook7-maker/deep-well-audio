/**
 * Contextual Premium copy — calm, benefit-first. Reuse across gates and passive modules.
 */

import { CTA } from "@/lib/site-messaging";

export const PREMIUM_REINFORCEMENT_LINE = "Premium helps you keep what mattered." as const;

export type ContextualPremiumVariant = "save" | "note" | "topic" | "library" | "generic";

export const CONTEXTUAL_PREMIUM = {
  save: {
    headline: "Save this and come back to it anytime",
    body: "Keep teachings in one library you can return to—on any device when you’re signed in.",
  },
  note: {
    headline: "Keep your notes in one place",
    body: "Private notes stay with the episodes and passages you care about—easy to find later.",
  },
  topic: {
    headline: "Stay connected to what matters to you",
    body: "Follow themes and build a feed that matches your walk—not an endless scroll.",
  },
  library: {
    headline: "Continue building your library with Premium",
    body: "Everything you save stays organized—sermons, notes, and Scripture in one calm hub.",
  },
  generic: {
    headline: "Go deeper with Premium",
    body: "A steadier way to listen, save, and return to what shaped you.",
  },
} as const;

export function contextualCtaLabel(): string {
  return CTA.SEE_PREMIUM;
}
