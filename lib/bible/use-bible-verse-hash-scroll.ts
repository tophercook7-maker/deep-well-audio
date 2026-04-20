"use client";

import { useEffect } from "react";

const FLASH_CLASS = "dw-bible-verse--hash-flash";

/**
 * When the URL fragment is a verse number (e.g. `#16`), scroll to `#verse-16`, then briefly highlight the row.
 */
export function useBibleVerseHashScroll(deps: { ready: boolean; chapterKey: string }) {
  useEffect(() => {
    if (!deps.ready || typeof window === "undefined") return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return;
    const id = `verse-${n}`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
        el?.classList.add(FLASH_CLASS);
        window.setTimeout(() => el?.classList.remove(FLASH_CLASS), 2600);
      });
    });
  }, [deps.ready, deps.chapterKey]);
}
