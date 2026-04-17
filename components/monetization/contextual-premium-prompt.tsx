"use client";

import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import {
  CONTEXTUAL_PREMIUM,
  contextualCtaLabel,
  PREMIUM_REINFORCEMENT_LINE,
  type ContextualPremiumVariant,
} from "@/lib/monetization-messaging";

type Props = {
  variant: ContextualPremiumVariant;
  className?: string;
  onDismiss?: () => void;
  /** Link search params e.g. ?intent=save */
  intent?: string;
};

export function ContextualPremiumPrompt({ variant, className = "", onDismiss, intent }: Props) {
  const copy = CONTEXTUAL_PREMIUM[variant];
  const href = (intent ? `/pricing?intent=${encodeURIComponent(intent)}` : "/pricing") as Route;

  return (
    <div
      className={`relative rounded-2xl border border-accent/25 bg-[rgba(12,18,28,0.65)] p-4 text-left shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm ${className}`.trim()}
      role="region"
      aria-label="Premium"
    >
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      <p className="pr-8 text-sm font-medium leading-snug text-slate-100">{copy.headline}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400/95">{copy.body}</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{PREMIUM_REINFORCEMENT_LINE}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          {contextualCtaLabel()}
        </Link>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-line/80 px-4 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-white"
          >
            Not now
          </button>
        ) : null}
      </div>
    </div>
  );
}
