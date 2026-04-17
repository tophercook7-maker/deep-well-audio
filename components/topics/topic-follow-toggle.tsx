"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getFollowedTopicSlugs, toggleFollowedTopic } from "@/lib/followed-topics-client";

export function TopicFollowToggle({ slug, label }: { slug: string; label: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(getFollowedTopicSlugs().includes(slug));
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => setOn(toggleFollowedTopic(slug))}
      className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-accent/40 hover:text-white"
      aria-pressed={on}
    >
      {on ? <Bell className="h-4 w-4 text-accent" aria-hidden /> : <BellOff className="h-4 w-4 opacity-80" aria-hidden />}
      {on ? `Following ${label}` : `Follow ${label}`}
    </button>
  );
}
