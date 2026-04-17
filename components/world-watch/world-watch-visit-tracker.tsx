"use client";

import { useEffect } from "react";
import { markWorldWatchVisitedNow } from "@/lib/world-watch-visit-client";

export function WorldWatchVisitTracker() {
  useEffect(() => {
    markWorldWatchVisitedNow();
  }, []);
  return null;
}
