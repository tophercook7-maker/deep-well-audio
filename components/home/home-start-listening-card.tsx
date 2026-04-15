"use client";

import Link from "next/link";
import type { EpisodeWithShow } from "@/lib/types";
import { getEpisodeDisplayTitle, getShowDisplayLabel } from "@/lib/display";
import { RemoteArtwork } from "@/components/artwork/remote-artwork";
import { EpisodePlayActions } from "@/components/player/episode-play-actions";

export function HomeStartListeningCard({ episode }: { episode: EpisodeWithShow }) {
  const show = episode.show;
  const slug = show?.slug;
  const showTitle = getShowDisplayLabel(show?.title, slug);
  const title = getEpisodeDisplayTitle(episode, showTitle);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-[rgba(9,12,18,0.55)]">
      <div className="relative aspect-[16/10] w-full bg-soft/30">
        <RemoteArtwork
          src={episode.artwork_url ?? show?.artwork_url}
          alt=""
          className="absolute inset-0"
          imgClassName="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 flex-1">
          {slug ? (
            <p className="text-xs font-medium text-amber-100/85">
              <Link href={`/shows/${slug}`} className="hover:underline">
                {showTitle}
              </Link>
            </p>
          ) : (
            <p className="text-xs font-medium text-amber-100/85">{showTitle}</p>
          )}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
            <Link href={`/episodes/${episode.id}`} className="hover:text-amber-50">
              {title}
            </Link>
          </h3>
        </div>
        <EpisodePlayActions
          episode={episode}
          showTitle={showTitle}
          showSlug={slug}
          showOfficialUrl={show?.official_url}
          showArtworkUrl={show?.artwork_url}
        />
      </div>
    </div>
  );
}
