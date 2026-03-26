"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

type Props = {
  fallbackHref: string;
  label?: string;
  className?: string;
};

const shell =
  "group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line/80 bg-soft/30 px-4 py-2 text-sm font-medium text-amber-100/90 shadow-[0_1px_0_rgba(255,255,255,0.04)] transition hover:border-accent/35 hover:bg-accent/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0";

/**
 * Uses `router.back()` when the history stack has a prior entry; otherwise `fallbackHref`.
 */
export function BackButton({ fallbackHref, label = "Back", className }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className ? `${shell} ${className}` : shell}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref as Route);
        }
      }}
    >
      <ArrowLeft
        className="h-4 w-4 shrink-0 transition group-hover:-translate-x-0.5"
        aria-hidden
      />
      {label}
    </button>
  );
}
