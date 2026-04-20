"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { CTA } from "@/lib/site-messaging";
import { Headphones } from "lucide-react";

export type BiblePremiumAudioLockAudience = "guest" | "free";

type BiblePremiumAudioLockProps = {
  audience: BiblePremiumAudioLockAudience;
};

/**
 * Calm, high-trust gate for ElevenLabs Bible narration — not a generic SaaS paywall.
 */
export function BiblePremiumAudioLock({ audience }: BiblePremiumAudioLockProps) {
  useEffect(() => {
    trackFunnelEvent("premium_audio_locked_view", { audience });
  }, [audience]);

  return (
    <div
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-stone-900/90 to-stone-950/95 px-4 py-4 shadow-[inset_0_1px_0_rgba(251,191,36,0.06)] sm:px-5 sm:py-5"
      role="region"
      aria-label="Premium Bible audio"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-950/40 text-amber-200/90">
          <Headphones className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="font-serif text-base font-normal tracking-tight text-stone-100 sm:text-lg">Listening voices</h2>
          <p className="text-sm leading-relaxed text-stone-400">
            Premium adds natural narration—curated voices and full-chapter listening built for slow, attentive reading.
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="premium_audio_upgrade_click"
              funnelData={{ placement: "bible_listen_lock" }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-slate-950 transition hover:opacity-95"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
            {audience === "guest" ? (
              <FunnelLink
                href={"/login" as Route}
                funnelEvent="premium_audio_sign_in_click"
                funnelData={{ placement: "bible_listen_lock" }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-stone-600 bg-stone-900/80 px-4 text-sm font-medium text-stone-200 hover:border-stone-500 hover:bg-stone-800/80"
              >
                Already a member? Sign in
              </FunnelLink>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
