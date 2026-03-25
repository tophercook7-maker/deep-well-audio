import Link from "next/link";
import type { EpisodeWithShow } from "@/lib/types";
import { FavoriteButton } from "@/components/buttons/favorite-button";
import { formatDate, formatDuration } from "@/lib/format";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";

type Row = {
  created_at: string;
  episode: EpisodeWithShow | null;
};

export function FavoritesList({ rows }: { rows: Row[] }) {
  const valid = rows.filter((r) => r.episode);

  if (!valid.length) {
    return (
      <div className="card p-8 text-sm text-muted">
        Nothing saved yet. Browse the directory and tap <strong className="font-medium text-slate-200">Favorite</strong> on any episode
        you want to find again— it will land here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {valid.map(({ created_at, episode }) => {
        if (!episode) return null;
        const show = episode.show;
        return (
          <div key={episode.id} className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={episode.source_type} />
                <MeatyPill score={episode.meaty_score} />
              </div>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/episodes/${episode.id}`} className="hover:text-amber-100">
                  {episode.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">
                {show?.title} · {formatDuration(episode.duration_seconds)} · {formatDate(episode.published_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Saved {formatDate(created_at)}</p>
            </div>
            <FavoriteButton episodeId={episode.id} initial returnPath="/library" />
          </div>
        );
      })}
    </div>
  );
}
