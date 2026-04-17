"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { EpisodeRow } from "@/components/episode-row";
import { getTopicHubVisitCount } from "@/lib/topic-engagement-client";
import type { EpisodeWithShow } from "@/lib/types";

type Props = {
  slug: string;
  label: string;
  /** Same-topic episodes already on this page — show a short, manual slice. */
  previewEpisodes: EpisodeWithShow[];
  favoritedEpisodeIds: Set<string>;
};

export function TopicReturnRhythm({ slug, label, previewEpisodes, favoritedEpisodeIds }: Props) {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    setVisits(getTopicHubVisitCount(slug));
  }, [slug]);

  if (visits < 2 || previewEpisodes.length === 0) return null;

  const slice = previewEpisodes.slice(0, 3);

  return (
    <div className="mb-8 rounded-[22px] border border-accent/20 bg-[rgba(12,18,28,0.4)] px-5 py-5 backdrop-blur-sm sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Rhythm</p>
      <p className="mt-2 text-sm font-medium text-white">
        You&apos;ve been spending time on <span className="text-amber-100/95">{label}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Here are a few teachings tagged here—nothing automated, just the same topic you chose.
      </p>
      <div className="mt-4 space-y-3">
        {slice.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            showSlug={episode.show?.slug}
            showOfficialUrl={episode.show?.official_url}
            favorited={favoritedEpisodeIds.has(episode.id)}
            showPremiumSaveFollowUp={false}
          />
        ))}
      </div>
      <Link
        href={`/browse?topic=${encodeURIComponent(slug)}&view=episodes` as Route}
        className="mt-4 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
      >
        See all in Explore
      </Link>
    </div>
  );
}
