import Link from "next/link";
import type { Route } from "next";
import { CTA } from "@/lib/site-messaging";

/**
 * Soft conversion prompt between topic hub sections (pillar upgrades).
 */
export function TopicMidAccountCta() {
  return (
    <section
      className="mt-10 rounded-2xl border border-line/55 bg-gradient-to-br from-soft/40 via-soft/25 to-transparent p-6 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.5)] sm:p-7"
      aria-labelledby="topic-mid-account-cta-heading"
    >
      <p id="topic-mid-account-cta-heading" className="max-w-2xl text-sm leading-relaxed text-slate-300/95">
        Create a free account to save teachings and return to them anytime.
      </p>
      <div className="mt-5">
        <Link
          href={"/signup" as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 bg-soft/30 px-6 py-2.5 text-sm font-semibold text-amber-50 transition hover:border-accent/40 hover:bg-accent/[0.08] hover:text-white"
        >
          {CTA.CREATE_FREE_ACCOUNT}
        </Link>
      </div>
    </section>
  );
}
