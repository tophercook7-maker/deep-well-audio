"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { useBibleNarration } from "@/components/bible/bible-narration-context";

/**
 * Slim persistent chrome when Bible narration is active and the user navigates away from `/bible/listen`.
 * The audio element lives in `BibleNarrationProvider` and is not destroyed on route change.
 */
export function BibleRouteAudioDock() {
  const pathname = usePathname();
  const { player, nowPlaying } = useBibleNarration();

  if (pathname === "/bible/listen") return null;
  if (!nowPlaying || !player.isSourceLoaded) return null;

  const href =
    `/bible/listen?book=${encodeURIComponent(nowPlaying.bookId)}&chapter=${nowPlaying.chapter}` as Route;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-amber-900/40 bg-[#07090e]/95 px-4 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          type="button"
          onClick={() => (player.playing ? player.pause() : player.play())}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-slate-950"
          aria-label={player.playing ? "Pause Bible audio" : "Play Bible audio"}
        >
          {player.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-100">
            {nowPlaying.bookLabel} {nowPlaying.chapter}
          </p>
          <p className="truncate text-xs text-stone-500">
            Listening · {nowPlaying.translationLabel}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-lg border border-stone-600 px-3 py-2 text-xs font-medium text-amber-100 hover:border-stone-500"
        >
          Open player
        </Link>
      </div>
    </div>
  );
}
