import type { ChapterGuidanceResult } from "@/lib/guidance/guided-next-step";
import { GuidedNextLinks } from "@/components/guidance/guided-next-links";
import { GuidedNextStepCard } from "@/components/guidance/guided-next-step-card";

type Props = {
  resolved: ChapterGuidanceResult;
  className?: string;
};

/** Shown after a chapter finishes in listen mode — calm, inline, no modal. */
export function ListenCompletionGuidance({ resolved, className }: Props) {
  if (!resolved.primary && resolved.supporting.length === 0) return null;

  return (
    <div className={className}>
      <GuidedNextStepCard>
        <GuidedNextLinks
          heading="When you’re ready"
          primary={resolved.primary}
          supporting={resolved.supporting}
          variant="bible"
        />
      </GuidedNextStepCard>
    </div>
  );
}
