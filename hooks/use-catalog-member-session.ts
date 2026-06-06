"use client";

import { useCallback, useEffect, useRef } from "react";
import { NEAR_END_RATIO } from "@/lib/listening-progress";
import { useAccountPlanOptional } from "@/components/plan/plan-context";

type SessionAction = "start" | "heartbeat" | "finish";

export async function postCatalogMemberSession(action: SessionAction, episodeId?: string): Promise<void> {
  try {
    await fetch("/api/catalog/member-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        episode_id: episodeId,
      }),
      credentials: "same-origin",
    });
  } catch {
    /* non-blocking */
  }
}

/**
 * Keeps server-side member listening sessions in sync while catalog audio plays.
 * Signed-in free/premium users stay pinned to their catalog cycle until finish or timeout.
 */
export function useCatalogMemberSession(opts: {
  episodeId: string | null | undefined;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}) {
  const plan = useAccountPlanOptional()?.plan ?? "guest";
  const signedIn = plan !== "guest";
  const finishedRef = useRef(false);
  const startedRef = useRef(false);

  const send = useCallback(
    (action: SessionAction) => {
      if (!signedIn || !opts.episodeId) return;
      void postCatalogMemberSession(action, opts.episodeId);
    },
    [signedIn, opts.episodeId]
  );

  useEffect(() => {
    finishedRef.current = false;
    startedRef.current = false;
  }, [opts.episodeId]);

  useEffect(() => {
    if (!signedIn || !opts.episodeId || !opts.isPlaying) return;
    if (!startedRef.current) {
      startedRef.current = true;
      send("start");
    }
  }, [signedIn, opts.episodeId, opts.isPlaying, send]);

  useEffect(() => {
    if (!signedIn || !opts.episodeId || !opts.isPlaying) return;
    const id = window.setInterval(() => send("heartbeat"), 30_000);
    return () => window.clearInterval(id);
  }, [signedIn, opts.episodeId, opts.isPlaying, send]);

  useEffect(() => {
    if (!signedIn || !opts.episodeId || finishedRef.current) return;
    const dur = opts.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    if (opts.currentTime / dur >= NEAR_END_RATIO) {
      finishedRef.current = true;
      send("finish");
    }
  }, [signedIn, opts.episodeId, opts.currentTime, opts.duration, send]);
}
