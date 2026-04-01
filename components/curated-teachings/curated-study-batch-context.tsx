"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserPlan } from "@/lib/permissions";
import { canUseFeature } from "@/lib/permissions";

export type CuratedStudyVideoState = {
  saved: boolean;
  note: string;
  progress: { progress_percent: number; completed: boolean; last_watched_at: string } | null;
};

type BatchPayload = {
  saved: string[];
  notes: Record<string, string>;
  progress: Record<string, { progress_percent: number; completed: boolean; last_watched_at: string }>;
};

const defaultRow: CuratedStudyVideoState = {
  saved: false,
  note: "",
  progress: null,
};

const CuratedStudyBatchContext = createContext<{
  byId: Record<string, CuratedStudyVideoState>;
  loaded: boolean;
  refresh: () => void;
} | null>(null);

export function useCuratedStudyRow(videoId: string): CuratedStudyVideoState {
  const ctx = useContext(CuratedStudyBatchContext);
  if (!ctx) return defaultRow;
  return ctx.byId[videoId] ?? defaultRow;
}

export function useCuratedStudyBatchMeta(): { loaded: boolean; refresh: () => void } | null {
  const ctx = useContext(CuratedStudyBatchContext);
  if (!ctx) return null;
  return { loaded: ctx.loaded, refresh: ctx.refresh };
}

export function CuratedStudyBatchProvider({
  videoIds,
  plan,
  children,
}: {
  videoIds: string[];
  plan: UserPlan;
  children: ReactNode;
}) {
  const [byId, setById] = useState<Record<string, CuratedStudyVideoState>>({});
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);

  const enabled = plan !== "guest" && canUseFeature("curated_library", plan);
  const uniqueSorted = useMemo(
    () => [...new Set(videoIds.filter((id) => id.length === 11))].sort(),
    [videoIds]
  );
  const fetchKey = useMemo(() => uniqueSorted.join(","), [uniqueSorted]);

  useEffect(() => {
    if (!enabled || uniqueSorted.length === 0) {
      queueMicrotask(() => {
        setById({});
        setLoaded(false);
      });
      return;
    }

    queueMicrotask(() => setLoaded(false));
    let cancelled = false;
    const CHUNK = 80;

    const load = async () => {
      const chunks: string[][] = [];
      for (let i = 0; i < uniqueSorted.length; i += CHUNK) {
        chunks.push(uniqueSorted.slice(i, i + CHUNK));
      }
      const merged: Record<string, CuratedStudyVideoState> = {};
      const results = await Promise.all(
        chunks.map((ids) =>
          fetch(`/api/curated/batch-state?ids=${encodeURIComponent(ids.join(","))}`, { credentials: "include" }).then((r) =>
            r.ok ? r.json() : null
          )
        )
      );
      if (cancelled) return;
      for (const raw of results) {
        if (!raw) continue;
        const data = raw as BatchPayload;
        for (const id of data.saved ?? []) {
          if (!merged[id]) merged[id] = { saved: false, note: "", progress: null };
          merged[id].saved = true;
        }
        for (const [id, note] of Object.entries(data.notes ?? {})) {
          if (!merged[id]) merged[id] = { saved: false, note: "", progress: null };
          merged[id].note = note;
        }
        for (const [id, prog] of Object.entries(data.progress ?? {})) {
          if (!merged[id]) merged[id] = { saved: false, note: "", progress: null };
          merged[id].progress = prog;
        }
      }
      for (const id of uniqueSorted) {
        if (!merged[id]) merged[id] = { saved: false, note: "", progress: null };
      }
      if (!cancelled) {
        setById(merged);
        setLoaded(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchKey, uniqueSorted, tick]);

  const value = useMemo(
    () => ({
      byId,
      loaded,
      refresh: () => setTick((t) => t + 1),
    }),
    [byId, loaded]
  );

  return <CuratedStudyBatchContext.Provider value={value}>{children}</CuratedStudyBatchContext.Provider>;
}
