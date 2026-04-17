"use client";

import { ContextualPremiumPrompt } from "@/components/monetization/contextual-premium-prompt";

export function TopicPackPremiumFallback() {
  return <ContextualPremiumPrompt variant="topic" intent="topic_pack" className="mt-2" />;
}
