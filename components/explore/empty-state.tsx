import Link from "next/link";
import { Home, SearchX } from "lucide-react";

type Props = {
  message: string;
  detail?: string;
  variant?: "filters" | "empty-catalog";
};

export function ExploreEmptyState({ message, detail, variant = "filters" }: Props) {
  return (
    <div className="card p-10 text-center">
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
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-text"
        >
          Reset filters
        </Link>
      </div>
    </div>
  );
}
