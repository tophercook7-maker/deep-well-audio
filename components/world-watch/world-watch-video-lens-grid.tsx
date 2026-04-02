"use client";

/* eslint-disable react-hooks/set-state-in-effect -- layout: derive responsive clip count before paint */
import { useCallback, useLayoutEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import type { UserPlan } from "@/lib/permissions";
import { CuratedStudyBatchProvider } from "@/components/curated-teachings/curated-study-batch-context";
import { CuratedVideoCard } from "@/components/curated-teachings/curated-video-card";

/** Full list at lg+; 3-card preview at md–lg; 2-card preview below md (phones). */
function lensCapForWidth(w: number, total: number): number {
  if (w >= 1024) return total;
  if (w >= 768) return Math.min(3, total);
  return Math.min(2, total);
}

type Props = {
  items: CuratedVideoItem[];
  plan: UserPlan;
  loginNext: string;
  premiumTeaser: boolean;
  thumbnailPriorityFirstN?: number;
};

/**
 * World Watch only: fewer cards on narrow viewports + “See more clips” (desktop/tablet keeps full band).
 */
export function WorldWatchVideoLensGrid({
  items,
  plan,
  loginNext,
  premiumTeaser,
  thumbnailPriorityFirstN = 1,
}: Props) {
  const total = items.length;
  const videoIds = items.map((i) => i.videoId);
  const [expanded, setExpanded] = useState(false);
  /** null until layout knows width — assume smallest cap for SSR/first paint alignment */
  const [cap, setCap] = useState<number | null>(null);

  const applyCap = useCallback(() => {
    setCap(lensCapForWidth(window.innerWidth, total));
  }, [total]);

  useLayoutEffect(() => {
    applyCap();
  }, [applyCap]);

  useLayoutEffect(() => {
    const onResize = () => applyCap();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [applyCap]);

  const effectiveCap = expanded ? total : cap ?? Math.min(2, total);
  const visible = items.slice(0, effectiveCap);
  const showMoreControl = !expanded && cap !== null && cap < total;

  return (
    <CuratedStudyBatchProvider videoIds={videoIds} plan={plan}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-3 lg:gap-5" data-ww-lens-grid="1">
        {visible.map((item, index) => (
          <CuratedVideoCard
            key={item.id}
            item={item}
            plan={plan}
            density="compact"
            thumbnailPriority={index < thumbnailPriorityFirstN}
            loginNext={loginNext}
            premiumTeaser={premiumTeaser}
          />
        ))}
      </div>
      {showMoreControl ? (
        <div className="mt-2.5 flex justify-center sm:mt-4 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-soft/20 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 transition hover:border-rose-400/35 hover:text-rose-100/90 sm:px-4 sm:py-2.5 sm:text-xs"
            onClick={() => setExpanded(true)}
          >
            See more clips
            <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
          </button>
        </div>
      ) : null}
    </CuratedStudyBatchProvider>
  );
}
