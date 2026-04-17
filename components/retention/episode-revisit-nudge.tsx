"use client";

import { useEffect, useState } from "react";
import { bumpEpisodePageVisit } from "@/lib/episode-visit-client";

export function EpisodeRevisitNudge({ episodeId }: { episodeId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const n = bumpEpisodePageVisit(episodeId);
    setShow(n > 1);
  }, [episodeId]);

  if (!show) return null;

  return (
    <p className="text-sm text-slate-500">
      You&apos;ve come back to this before—stay with what matters for you.
    </p>
  );
}
