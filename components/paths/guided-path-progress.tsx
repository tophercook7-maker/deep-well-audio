"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player/context";

function storageKeyForPath(pathSlug: string) {
  return `dwa_guided_path_step_${pathSlug}`;
}

type Props = {
  pathSlug: string;
  totalSteps: number;
  /** Parallel to path rows; empty string when no episode resolved for that step. */
  episodeIds: string[];
};

export function GuidedPathProgress({ pathSlug, totalSteps, episodeIds }: Props) {
  const { currentTrack } = usePlayer();
  const [rememberedStep, setRememberedStep] = useState(1);

  useEffect(() => {
    if (totalSteps < 1) return;
    try {
      const raw = localStorage.getItem(storageKeyForPath(pathSlug));
      if (!raw) return;
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 1 && n <= totalSteps) {
        queueMicrotask(() => setRememberedStep(n));
      }
    } catch {
      /* ignore */
    }
  }, [pathSlug, totalSteps]);

  useEffect(() => {
    const id = currentTrack?.id;
    if (!id || totalSteps < 1) return;
    const idx = episodeIds.findIndex((epId) => epId === id);
    if (idx < 0) return;
    const step = idx + 1;
    queueMicrotask(() => setRememberedStep(step));
    try {
      localStorage.setItem(storageKeyForPath(pathSlug), String(step));
    } catch {
      /* ignore */
    }
  }, [currentTrack?.id, episodeIds, pathSlug, totalSteps]);

  if (totalSteps < 1) return null;

  const activeIdx = currentTrack?.id ? episodeIds.indexOf(currentTrack.id) : -1;
  const displayStep =
    activeIdx >= 0
      ? activeIdx + 1
      : Math.min(Math.max(rememberedStep, 1), totalSteps);

  return (
    <p className="mt-3 text-xs tabular-nums text-slate-500/90">
      Step {displayStep} of {totalSteps}
    </p>
  );
}
