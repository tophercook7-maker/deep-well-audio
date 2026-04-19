"use client";

import type { UserPlan } from "@/lib/permissions";

export function recordCuratedVideoOpened(videoId: string, sourceId: string, plan: UserPlan) {
  if (plan === "guest") return;
  void fetch("/api/curated/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ video_id: videoId, source_id: sourceId, opened: true }),
  }).catch(() => {});
}

/**
 * YouTube watch link; records lightweight “opened” progress for signed-in library users.
 */
export function CuratedWatchLink({
  href,
  videoId,
  sourceId,
  plan,
  className,
  children,
}: {
  href: string;
  videoId: string;
  sourceId: string;
  plan: UserPlan;
  className?: string;
  children: React.ReactNode;
}) {
  if (plan === "guest") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => recordCuratedVideoOpened(videoId, sourceId, plan)}
    >
      {children}
    </a>
  );
}
