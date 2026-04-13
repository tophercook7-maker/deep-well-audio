"use client";

import { useEffect } from "react";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import type { UserPlan } from "@/lib/permissions";
import { CuratedStudyBatchProvider } from "@/components/curated-teachings/curated-study-batch-context";
import { CuratedVideoCard } from "@/components/curated-teachings/curated-video-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export function CuratedVideoGridWithStudy({
  items,
  plan,
  loginNext,
  premiumTeaser = false,
  thumbnailPriorityFirstN = 1,
  revealDelayMs = 0,
  /** When false, skip scroll/IO reveal so the grid is never gated on observers (World Watch on mobile). */
  scrollReveal = true,
  gridClassName = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
}: {
  items: CuratedVideoItem[];
  plan: UserPlan;
  loginNext: string;
  premiumTeaser?: boolean;
  thumbnailPriorityFirstN?: number;
  revealDelayMs?: number;
  scrollReveal?: boolean;
  gridClassName?: string;
}) {
  const videoIds = items.map((i) => i.videoId);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.info("[curated-video-grid]", { plan, itemCount: items.length, scrollReveal });
  }, [items.length, plan, scrollReveal]);

  const inner = (
    <CuratedStudyBatchProvider videoIds={videoIds} plan={plan}>
      <div className={gridClassName} data-ww-lens-grid={scrollReveal === false ? "1" : undefined}>
        {items.map((item, index) => (
          <CuratedVideoCard
            key={item.id}
            item={item}
            plan={plan}
            thumbnailPriority={index < thumbnailPriorityFirstN}
            loginNext={loginNext}
            premiumTeaser={premiumTeaser}
            studyGuestHint={index === 0}
          />
        ))}
      </div>
    </CuratedStudyBatchProvider>
  );

  if (!scrollReveal) {
    return inner;
  }

  return <RevealOnScroll delayMs={revealDelayMs}>{inner}</RevealOnScroll>;
}
