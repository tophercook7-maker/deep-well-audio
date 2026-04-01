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
  gridClassName = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
}: {
  items: CuratedVideoItem[];
  plan: UserPlan;
  loginNext: string;
  premiumTeaser?: boolean;
  thumbnailPriorityFirstN?: number;
  revealDelayMs?: number;
  gridClassName?: string;
}) {
  const videoIds = items.map((i) => i.videoId);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.info("[world-watch] video lens (client mount)", { plan, itemCount: items.length });
  }, [items.length, plan]);

  return (
    <RevealOnScroll delayMs={revealDelayMs}>
      <CuratedStudyBatchProvider videoIds={videoIds} plan={plan}>
        <div className={gridClassName}>
          {items.map((item, index) => (
            <CuratedVideoCard
              key={item.id}
              item={item}
              plan={plan}
              thumbnailPriority={index < thumbnailPriorityFirstN}
              loginNext={loginNext}
              premiumTeaser={premiumTeaser}
            />
          ))}
        </div>
      </CuratedStudyBatchProvider>
    </RevealOnScroll>
  );
}
