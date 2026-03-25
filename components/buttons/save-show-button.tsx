"use client";

import { Bookmark } from "lucide-react";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { hasPublicSupabaseEnv } from "@/lib/env";

type Props = {
  showId: string;
  initial: boolean;
  returnPath?: string;
};

export function SaveShowButton({ showId, initial, returnPath }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  const authConfigured = hasPublicSupabaseEnv();

  function loginUrl() {
    const path = returnPath ?? pathname ?? "/";
    const next = encodeURIComponent(path.startsWith("/") ? path : "/");
    return `/login?next=${next}&reason=save`;
  }

  function toggle() {
    if (!showId || !authConfigured) return;

    startTransition(async () => {
      setHint(null);
      try {
        const res = await fetch("/api/shows/toggle-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ show_id: showId }),
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
          setHint("Couldn’t update saved show. Try again.");
          return;
        }

        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
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
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted opacity-60"
        >
          <Bookmark className="h-4 w-4" />
          Save show
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
        disabled={pending || !showId}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-text disabled:opacity-50"
        aria-pressed={saved ? "true" : "false"}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`} />
        {saved ? "Saved show" : "Save show"}
      </button>
      {hint ? <span className="text-right text-[11px] text-amber-200/90">{hint}</span> : null}
    </div>
  );
}
