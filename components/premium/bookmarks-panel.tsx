"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MapPin } from "lucide-react";
import { usePlayer } from "@/lib/player/context";
import { formatPlaybackTimestamp } from "@/lib/format-time";
import type { EpisodeBookmarkRow } from "@/lib/bookmarks";

type Props = {
  episodeId: string;
  initialBookmarks: EpisodeBookmarkRow[];
};

export function BookmarksPanel({ episodeId, initialBookmarks }: Props) {
  const router = useRouter();
  const { currentTrack, seekTo } = usePlayer();
  const [items, setItems] = useState(initialBookmarks);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialBookmarks);
  }, [initialBookmarks]);

  const sameEpisode = currentTrack?.id === episodeId;

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const remove = useCallback(
    async (id: string) => {
      setErr(null);
      try {
        const res = await fetch(`/api/premium/bookmarks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setErr(data.error ?? "Could not delete");
          return;
        }
        setItems((prev) => prev.filter((b) => b.id !== id));
        refresh();
      } catch {
        setErr("Network error");
      }
    },
    [refresh]
  );

  const jump = useCallback(
    (seconds: number) => {
      if (!sameEpisode) return;
      seekTo(seconds);
    },
    [sameEpisode, seekTo]
  );

  return (
    <div className="rounded-2xl border border-line/75 bg-soft/15 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-accent" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Bookmarks</h3>
      </div>
      <p className="mt-1 text-xs text-muted">
        {sameEpisode
          ? "Jump returns you to this episode in the player below."
          : "Play this episode in the site player to jump to a saved time."}
      </p>
      {err ? <p className="mt-2 text-sm text-amber-200/90">{err}</p> : null}
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No bookmarks yet. Use “Save this moment” in the player while this episode is playing.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/60 bg-bg/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="font-mono text-sm tabular-nums text-amber-100/90">{formatPlaybackTimestamp(b.seconds)}</span>
                {b.label ? <span className="ml-2 text-sm text-slate-300">{b.label}</span> : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => jump(b.seconds)}
                  disabled={!sameEpisode}
                  className="rounded-full border border-line/80 px-3 py-1.5 text-xs font-medium text-amber-100/90 transition hover:border-accent/35 hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  Jump
                </button>
                <button
                  type="button"
                  onClick={() => void remove(b.id)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label={`Delete bookmark at ${formatPlaybackTimestamp(b.seconds)}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
