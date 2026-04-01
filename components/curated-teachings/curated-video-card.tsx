import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, Lock, PlayCircle, Sparkles } from "lucide-react";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import { CURATED_CATEGORY_META } from "@/lib/curated-teachings/categories";
import type { UserPlan } from "@/lib/permissions";
import { CuratedWatchLink } from "@/components/curated-teachings/curated-watch-link";
import { CuratedVideoStudyToolbar } from "@/components/curated-teachings/curated-video-study-toolbar";

function formatPublished(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function CuratedVideoCard({
  item,
  plan,
  thumbnailPriority = false,
  loginNext = "/curated-teachings",
  showCategory = true,
  premiumTeaser = false,
}: {
  item: CuratedVideoItem;
  plan: UserPlan;
  thumbnailPriority?: boolean;
  loginNext?: string;
  showCategory?: boolean;
  premiumTeaser?: boolean;
}) {
  const dateLabel = item.publishedAt ? formatPublished(item.publishedAt) : "";
  const primaryCat = CURATED_CATEGORY_META[item.category];
  const categoryLine =
    item.categories.length <= 1
      ? primaryCat.shortLabel
      : `${CURATED_CATEGORY_META[item.categories[0]]?.shortLabel ?? primaryCat.shortLabel} · +${item.categories.length - 1}`;
  const guestGated = plan === "guest" && item.membersOnly;
  /** Guests hitting a Premium World Watch strip see sign-in / upgrade first; signed-in free users keep one-click Watch. */
  const premiumGated = premiumTeaser && plan === "guest";
  const premiumUpsell = premiumTeaser && plan === "free";

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line/55 bg-[rgba(11,14,18,0.58)] shadow-none backdrop-blur-md transition duration-300",
        item.featured ? "border-accent/28 shadow-[0_20px_48px_-32px_rgba(212,175,55,0.28)]" : "",
        "hover:border-line/80 hover:shadow-[0_24px_56px_-36px_rgba(0,0,0,0.72)]",
      ].join(" ")}
    >
      <div className="relative aspect-video w-full overflow-hidden border-b border-line/70 bg-gradient-to-br from-soft/50 to-bg/90">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            priority={thumbnailPriority}
          />
        ) : (
          <div
            className="flex h-full min-h-[9rem] items-center justify-center bg-soft/40 text-amber-200/40"
            aria-hidden
          >
            <PlayCircle className="h-12 w-12" strokeWidth={1.25} />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent"
          aria-hidden
        />
        {item.featured ? (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-accent/40 bg-bg/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-100/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            Featured
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4 sm:p-6 sm:pt-5">
        <h3 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-[1.02rem]">
          {item.title}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-amber-200/75">{item.sourceName}</p>
        {dateLabel ? (
          <p className="mt-1.5 text-[11px] tabular-nums text-slate-500">{dateLabel}</p>
        ) : null}
        {showCategory ? (
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500" title={item.categories.join(", ")}>
            {categoryLine}
          </p>
        ) : null}
        {item.excerpt ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-2">{item.excerpt}</p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-5 space-y-2 border-t border-line/45 pt-4">
          {guestGated ? (
            <Link
              href={`/login?next=${encodeURIComponent(loginNext)}` as Route}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent/45 bg-accent/[0.12] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/60 hover:bg-accent/[0.16] sm:min-h-0"
            >
              <Lock className="h-4 w-4 opacity-90" aria-hidden />
              Sign in to watch
            </Link>
          ) : premiumGated ? (
            <>
              <Link
                href={"/login?next=/world-watch" as Route}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent/45 bg-accent/[0.12] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/60 sm:min-h-0"
              >
                <Lock className="h-4 w-4 opacity-90" aria-hidden />
                Sign in for World Watch
              </Link>
              <Link
                href={"/signup?next=/world-watch" as Route}
                className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-line/80 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-accent/35 hover:text-white sm:min-h-0"
              >
                Join free
              </Link>
            </>
          ) : premiumUpsell ? (
            <>
              <CuratedWatchLink
                href={item.url}
                videoId={item.videoId}
                sourceId={item.sourceId}
                plan={plan}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent/35 bg-accent/[0.08] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/50 hover:bg-accent/[0.12] sm:min-h-0"
              >
                Watch
                <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
              </CuratedWatchLink>
              <Link
                href={"/pricing" as Route}
                className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-line/80 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-accent/35 hover:text-white sm:min-h-0"
              >
                Premium · full World Watch library
              </Link>
            </>
          ) : (
            <CuratedWatchLink
              href={item.url}
              videoId={item.videoId}
              sourceId={item.sourceId}
              plan={plan}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent/35 bg-accent/[0.08] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/50 hover:bg-accent/[0.12] sm:min-h-0"
            >
              Watch
              <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
              <span className="sr-only">(opens YouTube in a new tab)</span>
            </CuratedWatchLink>
          )}
          <CuratedVideoStudyToolbar
            videoId={item.videoId}
            sourceId={item.sourceId}
            title={item.title}
            plan={plan}
            loginNext={loginNext}
          />
        </div>
      </div>
    </article>
  );
}
