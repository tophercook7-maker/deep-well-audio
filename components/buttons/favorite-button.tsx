"use client";

import { Heart } from "lucide-react";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { hasPublicSupabaseEnv } from "@/lib/env";

type Props = {
  episodeId: string;
  initial: boolean;
  /** Optional full path for ?next= (e.g. include querystring if you pass it from server). */
  returnPath?: string;
};

export function FavoriteButton({ episodeId, initial, returnPath }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [favorited, setFavorited] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  const authConfigured = hasPublicSupabaseEnv();

  function loginUrl() {
    const path = returnPath ?? pathname ?? "/";
    const next = encodeURIComponent(path.startsWith("/") ? path : "/");
    return `/login?next=${next}&reason=save`;
  }

  function toggle() {
    if (!episodeId || !authConfigured) return;

    startTransition(async () => {
      setHint(null);
      try {
        const res = await fetch("/api/favorites/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episode_id: episodeId }),
        });

        if (res.status === 401) {
          router.push(loginUrl() as Route);
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
        aria-pressed={favorited ? "true" : "false"}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`h-4 w-4 ${favorited ? "fill-accent text-accent" : ""}`} />
        {favorited ? "Saved" : "Favorite"}
      </button>
      {hint ? <span className="text-right text-[11px] text-amber-200/90">{hint}</span> : null}
    </div>
  );
}
