"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { UserPlan } from "@/lib/permissions";

type Props = {
  serverPool: number;
  serverShown: number;
  plan: UserPlan;
  children: ReactNode;
};

/**
 * World Watch Video Lens: stable wrapper for inspection. Adds `data-*` hooks for “Safari Web
 * Inspector → Elements” and logs when `?ww_lens_debug=1` is present (no env var required).
 */
export function WorldWatchVideoLensShell({ serverPool, serverShown, plan, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const debug =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("ww_lens_debug") === "1";

    const sample = () => {
      const rect = el.getBoundingClientRect();
      const articles = el.querySelectorAll("article");
      const first = articles[0] ?? null;
      const cs = first ? window.getComputedStyle(first) : null;
      el.setAttribute("data-ww-lens-client-articles", String(articles.length));
      el.setAttribute("data-ww-lens-shell-height", String(Math.round(rect.height)));

      if (debug) {
        console.info("[ww-lens debug]", {
          plan,
          serverPool,
          serverShown,
          clientArticleCount: articles.length,
          shellHeightPx: Math.round(rect.height),
          shellTopPx: Math.round(rect.top),
          firstOpacity: cs?.opacity ?? null,
          firstVisibility: cs?.visibility ?? null,
          firstDisplay: cs?.display ?? null,
        });
      }
    };

    sample();
    const t = window.setTimeout(sample, 320);
    return () => clearTimeout(t);
  }, [plan, serverPool, serverShown]);

  return (
    <div
      ref={ref}
      className="min-w-0"
      data-ww-lens-shell
      data-ww-lens-plan={plan}
      data-ww-lens-server-pool={String(serverPool)}
      data-ww-lens-server-shown={String(serverShown)}
    >
      {children}
    </div>
  );
}
