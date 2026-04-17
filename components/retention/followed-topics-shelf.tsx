"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";
import { FOLLOWED_TOPICS_KEY, getFollowedTopicSlugs } from "@/lib/followed-topics-client";
import { getTopicDefinition } from "@/lib/topics";

type SlimEp = {
  id: string;
  title: string;
  showTitle: string | null;
};

export function FollowedTopicsShelf() {
  const [slug, setSlug] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<SlimEp[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const slugs = getFollowedTopicSlugs();
    const first = slugs[0] ?? null;
    setSlug(first);
    if (!first) {
      setEpisodes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/topic-episodes?slug=${encodeURIComponent(first)}&limit=4`);
      const data = (await res.json()) as { episodes?: SlimEp[] };
      setEpisodes(data.episodes ?? []);
    } catch {
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === FOLLOWED_TOPICS_KEY || e.key === null) void load();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("deepwell:followed-topics-changed", load);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("deepwell:followed-topics-changed", load);
    };
  }, [load]);

  if (!slug) {
    return (
      <div className="rounded-2xl border border-dashed border-line/50 bg-[rgba(8,11,16,0.35)] px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Topics</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Follow topics on any topic page to shape a small shelf here—2–4 teachings pulled from what you care about.
        </p>
        <Link href={"/browse" as Route} className="mt-3 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline">
          Browse topics
        </Link>
      </div>
    );
  }

  const meta = getTopicDefinition(slug);
  const label = meta?.label ?? slug;

  return (
    <div className="rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.4)] px-4 py-4 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Because you follow</p>
      <h3 className="mt-2 text-base font-semibold text-white">{label}</h3>
      <p className="mt-1 text-xs text-muted">A few recent teachings tagged with this theme.</p>
      {loading ? (
        <p className="mt-3 text-sm text-muted">Loading…</p>
      ) : episodes.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing surfaced yet—try again after the next catalog sync.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {episodes.map((e) => (
            <li key={e.id}>
              <Link
                href={`/episodes/${e.id}` as Route}
                className="block rounded-xl border border-transparent px-1 py-1.5 transition hover:border-line/40 hover:bg-white/[0.03]"
              >
                <span className="line-clamp-2 text-sm font-medium text-slate-100">{e.title}</span>
                {e.showTitle ? <span className="mt-0.5 block text-xs text-slate-500">{e.showTitle}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/topics/${encodeURIComponent(slug)}` as Route}
        className="mt-3 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
      >
        Open topic hub
      </Link>
    </div>
  );
}
