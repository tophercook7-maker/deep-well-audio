"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { PremiumSaveFollowUp } from "@/components/premium/premium-save-follow-up";
import { ContextualPremiumPrompt } from "@/components/monetization/contextual-premium-prompt";
import { incrementSaveAttemptCount } from "@/lib/save-attempt-tracking";

type Props = {
  episodeId: string;
  initial: boolean;
  /** After a successful save, show a quiet Premium upsell (non-premium users only; set from server). */
  showPremiumSaveFollowUp?: boolean;
};

export function FavoriteButton({ episodeId, initial, showPremiumSaveFollowUp = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);
  const [saveAck, setSaveAck] = useState(false);
  const [saveGate, setSaveGate] = useState(false);

  useEffect(() => {
    if (!saveAck) return;
    const t = window.setTimeout(() => setSaveAck(false), 3200);
    return () => window.clearTimeout(t);
  }, [saveAck]);

  const authConfigured = hasPublicSupabaseEnv();

  function toggle() {
    if (!episodeId || !authConfigured) return;

    startTransition(async () => {
      setHint(null);
      setSaveAck(false);
      const wasFavorited = favorited;
      try {
        const res = await fetch("/api/favorites/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episode_id: episodeId }),
        });

        if (res.status === 401) {
          const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
          router.push(`/login${next}` as Route);
          return;
        }
        if (res.status === 403) {
          incrementSaveAttemptCount();
          setSaveGate(true);
          return;
        }

        if (res.status === 503) {
          setHint("Saving isn’t available — sign-in isn’t fully configured.");
          return;
        }

        if (!res.ok) {
          setHint("Couldn’t update favorite. Try again.");
          return;
        }

        const data = (await res.json()) as { favorited: boolean };
        setFavorited(data.favorited);
        if (data.favorited && !wasFavorited) {
          setSaveAck(true);
        }
        router.refresh();
      } catch {
        setHint("Network error. Check your connection.");
      }
    });
  }

  if (!authConfigured) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          title="Sign-in isn’t configured yet"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted opacity-60"
        >
          <Heart className="h-4 w-4" />
          Favorite
        </button>
        <span className="text-right text-[11px] text-slate-500">Sign-in unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending || !episodeId}
        className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-text disabled:opacity-50"
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`h-4 w-4 ${favorited ? "fill-accent text-accent" : ""}`} />
        {favorited ? "Saved" : "Favorite"}
      </button>
      {saveAck ? (
        <div
          role="status"
          aria-live="polite"
          className="max-w-[15rem] animate-dwa-save-ack text-right"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && e.animationName.includes("dwa-save-ack")) setSaveAck(false);
          }}
        >
          <p className="pointer-events-none text-xs font-medium text-slate-200">Saved to your library</p>
          <p className="pointer-events-none mt-0.5 text-[11px] leading-snug text-slate-500">
            You can come back to this anytime.
          </p>
          <Link
            href={"/library" as Route}
            className="pointer-events-auto mt-2 inline-block text-[11px] font-medium text-amber-200/85 underline-offset-2 hover:underline"
          >
            View your library
          </Link>
          {showPremiumSaveFollowUp ? (
            <div className="pointer-events-auto mt-2">
              <PremiumSaveFollowUp />
            </div>
          ) : null}
        </div>
      ) : null}
      {saveGate ? (
        <ContextualPremiumPrompt
          variant="save"
          intent="save"
          onDismiss={() => setSaveGate(false)}
          className="max-w-[18rem] text-left"
        />
      ) : null}
      {hint ? <span className="text-right text-[11px] text-amber-200/90">{hint}</span> : null}
    </div>
  );
}
