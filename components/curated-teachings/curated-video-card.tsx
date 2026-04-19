"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ExternalLink, Lock, PlayCircle, Sparkles } from "lucide-react";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import { CURATED_CATEGORY_META } from "@/lib/curated-teachings/categories";
import { formatVideoDuration } from "@/lib/curated-teachings/format-video-duration";
import type { UserPlan } from "@/lib/permissions";
import { CuratedWatchLink, recordCuratedVideoOpened } from "@/components/curated-teachings/curated-watch-link";
import { CuratedYoutubeEmbedModal } from "@/components/curated-teachings/curated-youtube-embed-modal";
import { CuratedVideoStudyToolbar } from "@/components/curated-teachings/curated-video-study-toolbar";
import { ScriptureLinkedText } from "@/components/study/scripture-linked-text";
import { CuratedStudyLaunch } from "@/components/study/curated-study-launch";
import { TeachingScriptureBehind } from "@/components/study/teaching-scripture-behind";
import { teachingContentKey } from "@/lib/study/refs";
import { CTA } from "@/lib/site-messaging";

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
  /** Tighter thumbnail + copy on narrow screens (World Watch lens). */
  density = "default",
  /** Hide description excerpt (e.g. homepage “one thing” spotlight). */
  hideExcerpt = false,
  /** Guest sign-in hint: set false on all but one card in a grid to avoid repeating the same line. */
  studyGuestHint = true,
}: {
  item: CuratedVideoItem;
  plan: UserPlan;
  thumbnailPriority?: boolean;
  loginNext?: string;
  showCategory?: boolean;
  premiumTeaser?: boolean;
  density?: "default" | "compact";
  hideExcerpt?: boolean;
  studyGuestHint?: boolean;
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
  const compact = density === "compact";
  const canInlinePlay = !guestGated && !premiumGated;
  const [embedOpen, setEmbedOpen] = useState(false);
  const durationLabel = formatVideoDuration(item.durationSec);

  const openEmbed = () => {
    recordCuratedVideoOpened(item.videoId, item.sourceId, plan);
    setEmbedOpen(true);
  };

  const watchBtnClass =
    "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-accent/35 bg-accent/[0.08] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/50 hover:bg-accent/[0.12] sm:min-h-0";

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line/55 bg-[rgba(11,14,18,0.58)] shadow-none backdrop-blur-md transition duration-300",
        compact ? "max-md:rounded-[1.15rem]" : "",
        item.featured ? "border-accent/28 shadow-[0_20px_48px_-32px_rgba(212,175,55,0.28)]" : "",
        "hover:border-line/80 hover:shadow-[0_24px_56px_-36px_rgba(0,0,0,0.72)]",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full overflow-hidden border-b border-line/70 bg-gradient-to-br from-soft/50 to-bg/90",
          compact
            ? "h-[5.5rem] max-[389px]:h-[5.25rem] shrink-0 sm:aspect-video sm:h-auto lg:aspect-video"
            : "aspect-video",
        ].join(" ")}
      >
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
            className={[
              "flex h-full items-center justify-center bg-soft/40 text-amber-200/40",
              compact ? "min-h-0 sm:min-h-[9rem]" : "min-h-[9rem]",
            ].join(" ")}
            aria-hidden
          >
            <PlayCircle className={compact ? "h-9 w-9 sm:h-12 sm:w-12" : "h-12 w-12"} strokeWidth={1.25} />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent"
          aria-hidden
        />
        {item.featured ? (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-accent/40 bg-bg/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-100/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            Featured
          </div>
        ) : null}
        {durationLabel ? (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white">
            {durationLabel}
          </div>
        ) : null}
        {canInlinePlay ? (
          <div className="absolute bottom-3 left-3 z-10">
            <button
              type="button"
              onClick={openEmbed}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm transition hover:border-accent/45 hover:bg-black/75"
            >
              <PlayCircle className="h-4 w-4 text-amber-200/95" aria-hidden />
              Play
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={[
          "flex flex-1 flex-col",
          compact ? "p-3 pt-2.5 sm:p-5 sm:pt-4 lg:p-6 lg:pt-5" : "p-5 pt-4 sm:p-6 sm:pt-5",
        ].join(" ")}
      >
        <h3
          className={[
            "font-semibold leading-snug tracking-tight text-white",
            compact
              ? "line-clamp-2 text-sm sm:line-clamp-none sm:text-base lg:text-[1.02rem]"
              : "text-base sm:text-[1.02rem]",
          ].join(" ")}
        >
          {item.title}
        </h3>
        <p className={compact ? "mt-1 text-[11px] font-medium text-amber-200/75 sm:mt-1.5 sm:text-xs" : "mt-1.5 text-xs font-medium text-amber-200/75"}>
          {item.sourceName}
        </p>
        {dateLabel ? (
          <p className={compact ? "mt-1 text-[10px] tabular-nums text-slate-500 sm:mt-1.5 sm:text-[11px]" : "mt-1.5 text-[11px] tabular-nums text-slate-500"}>
            {dateLabel}
          </p>
        ) : null}
        {showCategory ? (
          <p
            className={[
              "text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500",
              compact ? "mt-1.5 max-md:hidden sm:mt-2" : "mt-2",
            ].join(" ")}
            title={item.categories.join(", ")}
          >
            {categoryLine}
          </p>
        ) : null}
        {!hideExcerpt && item.excerpt ? (
          <p
            className={[
              "mt-1.5 flex-1 leading-relaxed text-muted sm:mt-2",
              compact
                ? "hidden text-xs line-clamp-2 sm:block sm:text-sm"
                : "text-sm line-clamp-2",
            ].join(" ")}
          >
            <ScriptureLinkedText text={item.excerpt} teachingKey={teachingContentKey("youtube", item.videoId)} />
          </p>
        ) : (
          <div className="flex-1" />
        )}
        {!hideExcerpt && item.excerpt ? (
          <TeachingScriptureBehind scriptureTags={[]} descriptionPlain={item.excerpt} variant="compact" />
        ) : null}
        <CuratedStudyLaunch excerpt={item.excerpt ?? null} />

        <div className={compact ? "mt-2.5 space-y-1.5 border-t border-line/45 pt-2.5 sm:mt-5 sm:space-y-2 sm:pt-4" : "mt-5 space-y-2 border-t border-line/45 pt-4"}>
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
                Create account
              </Link>
            </>
          ) : premiumUpsell ? (
            <>
              <button type="button" onClick={openEmbed} className={watchBtnClass}>
                Watch
                <PlayCircle className="h-4 w-4 opacity-90" aria-hidden />
              </button>
              <Link
                href={"/pricing" as Route}
                className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-line/80 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-accent/35 hover:text-white sm:min-h-0"
              >
                {CTA.SEE_PREMIUM}
              </Link>
            </>
          ) : (
            <button type="button" onClick={openEmbed} className={watchBtnClass}>
              Watch
              <PlayCircle className="h-4 w-4 opacity-90" aria-hidden />
            </button>
          )}
          <CuratedVideoStudyToolbar
            videoId={item.videoId}
            sourceId={item.sourceId}
            title={item.title}
            plan={plan}
            loginNext={loginNext}
            showGuestLoginHint={studyGuestHint}
          />
        </div>
      </div>

      {canInlinePlay ? (
        <CuratedYoutubeEmbedModal
          videoId={item.videoId}
          title={item.title}
          isOpen={embedOpen}
          onClose={() => setEmbedOpen(false)}
          footer={
            <CuratedWatchLink
              href={item.url}
              videoId={item.videoId}
              sourceId={item.sourceId}
              plan={plan}
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/90 underline-offset-2 hover:text-amber-100 hover:underline"
            >
              Open in YouTube
              <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
            </CuratedWatchLink>
          }
        />
      ) : null}
    </article>
  );
}
