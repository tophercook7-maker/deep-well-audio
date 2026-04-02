"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { usePlayer } from "@/lib/player/context";
import { PremiumSaveFollowUp } from "@/components/premium/premium-save-follow-up";

type Props = {
  episodeId: string;
  initialFavorited: boolean;
  returnPath?: string;
  hasDescription: boolean;
  showPremiumSaveFollowUp?: boolean;
};

function loginUrl(returnPath: string | undefined, pathname: string) {
  const path = returnPath ?? pathname ?? "/";
  const next = encodeURIComponent(path.startsWith("/") ? path : "/");
  return `/login?next=${next}&reason=save`;
}

export function EpisodeListenSaveHint({
  episodeId,
  initialFavorited,
  returnPath,
  hasDescription,
  showPremiumSaveFollowUp = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { state, currentTrack } = usePlayer();

  const thresholdSecRef = useRef<number | null>(null);
  if (thresholdSecRef.current == null) {
    thresholdSecRef.current = 30 + Math.floor(Math.random() * 31);
  }

  const [favorited, setFavorited] = useState(initialFavorited);
  const [scrolledPastDesc, setScrolledPastDesc] = useState(false);
  const [playedAccumSec, setPlayedAccumSec] = useState(0);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [premiumNudge, setPremiumNudge] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  useEffect(() => {
    if (!premiumNudge) return;
    const t = window.setTimeout(() => setPremiumNudge(false), 4200);
    return () => window.clearTimeout(t);
  }, [premiumNudge]);

  const isCurrent = currentTrack?.id === episodeId;
  const playingThis = isCurrent && state.isPlaying;

  useEffect(() => {
    if (!isCurrent) setPlayedAccumSec(0);
  }, [isCurrent]);

  useEffect(() => {
    if (!playingThis) return;
    const t = window.setInterval(() => setPlayedAccumSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [playingThis]);

  useEffect(() => {
    if (!hasDescription) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (!e.isIntersecting && e.boundingClientRect.bottom < 0) {
          setScrolledPastDesc(true);
        }
      },
      { threshold: 0, root: null },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasDescription]);

  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  const threshold = thresholdSecRef.current ?? 45;
  const metPlayback = playedAccumSec >= threshold;
  const metScroll = hasDescription && scrolledPastDesc;
  const triggered = metPlayback || metScroll;
  const visible = !favorited && triggered;

  async function onSave() {
    setPending(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode_id: episodeId }),
      });

      if (res.status === 401) {
        router.push(loginUrl(returnPath, pathname) as Route);
        return;
      }

      if (res.status === 503) {
        setSaveError("Saving isn’t available — sign-in isn’t fully configured.");
        return;
      }

      if (!res.ok) {
        setSaveError("Couldn’t save. Try again.");
        return;
      }

      const data = (await res.json()) as { favorited: boolean };
      if (data.favorited) {
        setFavorited(true);
        if (showPremiumSaveFollowUp) setPremiumNudge(true);
        router.refresh();
      }
    } catch {
      setSaveError("Network error. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {hasDescription ? (
        <div ref={sentinelRef} className="pointer-events-none h-px w-full shrink-0 scroll-mt-0" aria-hidden />
      ) : null}
      {premiumNudge ? (
        <div className="mt-3 max-w-md animate-dwa-hint-reveal">
          <PremiumSaveFollowUp align="left" />
        </div>
      ) : null}
      {visible ? (
        <div
          className="mt-4 w-full rounded-lg border border-line/70 bg-soft/25 px-4 py-3 sm:px-5 sm:py-3.5 animate-dwa-hint-reveal"
          role="region"
          aria-label="Save to library"
        >
          <p className="text-sm font-medium text-slate-100">Want to come back to this?</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">Save it to your library</p>
          <div className="mt-3">
            <button
              type="button"
              disabled={pending}
              onClick={onSave}
              className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-accent/50 bg-accent/15 px-4 py-2 text-xs font-semibold text-amber-100/95 transition hover:border-accent/70 hover:bg-accent/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            {saveError ? (
              <p className="mt-2 text-[11px] leading-snug text-amber-200/90">{saveError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
