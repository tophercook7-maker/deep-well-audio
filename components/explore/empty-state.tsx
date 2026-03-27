import Link from "next/link";
import type { Route } from "next";
import { Home, SearchX } from "lucide-react";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

type Props = {
  message: string;
  detail?: string;
  variant?: "filters" | "empty-catalog";
  /** Optional topic chips linking into `/explore?topic=…`. */
  relatedTopics?: { slug: string; label: string }[];
};

export function ExploreEmptyState({
  message,
  detail,
  variant = "filters",
  relatedTopics,
}: Props) {
  return (
    <div className="card p-10 text-center">
      <div className="mb-5 flex justify-center">
        <DeepWellLogo variant="inline" className="mx-auto h-9 max-w-[240px] opacity-90 sm:h-10 sm:max-w-[260px]" />
      </div>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
        <SearchX className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-base font-medium text-text">{message}</p>
      {detail ? <p className="mx-auto mt-3 max-w-lg text-sm text-muted">{detail}</p> : null}
      {variant === "empty-catalog" ? (
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          After you run an RSS sync with your <code className="rounded bg-soft px-1 text-xs">SYNC_API_SECRET</code>, shows and
          episodes will populate automatically from{" "}
          <code className="rounded bg-soft px-1 text-xs">data/source-feeds.ts</code>.
        </p>
      ) : null}
      {relatedTopics && relatedTopics.length > 0 ? (
        <div className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/55">Try a nearby topic</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {relatedTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/explore?topic=${encodeURIComponent(t.slug)}&view=episodes` as Route}
                className="rounded-full border border-line/85 bg-soft/35 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.08] hover:text-white"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href={"/explore" as Route}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-text"
        >
          Clear all filters
        </Link>
      </div>
    </div>
  );
}
