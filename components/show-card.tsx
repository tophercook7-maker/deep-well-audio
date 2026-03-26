import Link from "next/link";
import type { ShowWithMeta } from "@/lib/types";
import { ArrowUpRight, Radio, Star } from "lucide-react";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { categoryLabel } from "@/lib/format";
import { getShowDisplayLabel } from "@/lib/display";
import { clampSummary } from "@/lib/present";
import { RemoteArtwork } from "@/components/artwork/remote-artwork";

export function ShowCard({
  show,
  highlightFeatured = false,
}: {
  show: ShowWithMeta;
  /** Stronger frame for hand-picked rows (e.g. explore featured strip). */
  highlightFeatured?: boolean;
}) {
  const count = show.episode_count ?? 0;
  const summary = clampSummary(show.summary, 200);
  const showTitle = getShowDisplayLabel(show.title, show.slug);

  return (
    <Link
      href={`/shows/${show.slug}`}
      className="group block rounded-2xl outline-none ring-accent/30 focus-visible:ring-2"
    >
      <article
        className={`card h-full overflow-hidden p-5 transition group-hover:-translate-y-1 group-hover:border-accent/30 ${
          highlightFeatured ? "border-accent/35 bg-gradient-to-b from-accent/[0.07] to-transparent shadow-glow" : ""
        }`}
      >
        <div className="-mx-5 -mt-5 mb-4 aspect-[16/10] overflow-hidden border-b border-line/80 bg-soft/50">
          <RemoteArtwork
            src={show.artwork_url}
            alt={`${showTitle} artwork`}
            className="h-full w-full min-h-[120px]"
            imgClassName="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        {highlightFeatured ? (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/95">
            <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
            Featured pick
          </p>
        ) : null}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">{categoryLabel(show.category)}</span>
              <SourceBadge source={show.source_type} />
              <MeatyPill score={show.meaty_score} />
            </div>
            <h3 className="text-xl font-semibold text-text group-hover:text-amber-100">{showTitle}</h3>
            <p className="text-sm text-muted">{show.host}</p>
          </div>
          <Radio className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        </div>

        {summary ? <p className="text-sm leading-6 text-muted">{summary}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {(show.tags ?? []).slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-100/70">
            {count} episode{count === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-200 group-hover:text-white">
            View show
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}
