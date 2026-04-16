"use client";

import { useRouter } from "next/navigation";

export function StudyDebugRefreshButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-lg border border-line/55 bg-soft/15 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-line/80 hover:text-white"
    >
      Refresh
    </button>
  );
}
