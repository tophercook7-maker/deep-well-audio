/**
 * Modular aliases for contextual Premium prompts (Phase 4 naming).
 */

import { ContextualPremiumPrompt } from "@/components/monetization/contextual-premium-prompt";
import type { ComponentProps } from "react";

type PromptProps = Omit<ComponentProps<typeof ContextualPremiumPrompt>, "variant">;

export function SavePrompt(props: PromptProps) {
  return <ContextualPremiumPrompt {...props} variant="save" />;
}

export function NotePrompt(props: PromptProps) {
  return <ContextualPremiumPrompt {...props} variant="note" />;
}

export function TopicPrompt(props: PromptProps) {
  return <ContextualPremiumPrompt {...props} variant="topic" />;
}
