"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus } from "lucide-react";
import { usePlayer } from "@/lib/player/context";
import { useAccountPlanOptional } from "@/components/plan/plan-context";

/**
 * Minimal “save this moment” control in the global player (Premium only).
 */
export function PlayerBookmarkControl() {
  const router = useRouter();
  const { state, currentTrack } = usePlayer();
  const planCtx = useAccountPlanOptional();
  const premium = planCtx?.plan === "premium";
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const canBookmark =
    premium &&
    currentTrack?.playbackUrl &&
    currentTrack.id &&
    !state.error &&
    Number.isFinite(state.currentTime) &&
    state.currentTime >= 0;

  const addBookmark = useCallback(async () => {
    if (!canBookmark || !currentTrack?.id) return;
    setBusy(true);
    setHint(null);
    try {
      const res = await fetch("/api/premium/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episode_id: currentTrack.id,
          seconds: Math.floor(state.currentTime),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setHint(data.error ?? "Could not save bookmark");
        return;
      }
      setHint("Saved");
      router.refresh();
      window.setTimeout(() => setHint(null), 2000);
    } catch {
      setHint("Network error");
    } finally {
      setBusy(false);
    }
  }, [canBookmark, currentTrack?.id, router, state.currentTime]);

  if (!premium) return null;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => void addBookmark()}
        disabled={!canBookmark || busy}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line/90 text-amber-200/90 transition hover:border-accent/40 hover:bg-accent/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
        aria-label="Save this moment — add bookmark at current time"
        title={canBookmark ? "Save this moment (bookmark)" : "Play this episode inline to bookmark a timestamp"}
      >
        <BookmarkPlus className="h-5 w-5" aria-hidden />
      </button>
      {hint ? (
        <span
          className={`text-[10px] font-medium leading-none ${
            hint === "Saved" ? "text-emerald-400/90" : "text-amber-200/85"
          }`}
          role="status"
          aria-live="polite"
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
