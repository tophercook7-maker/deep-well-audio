"use client";

import { useEffect, useState } from "react";
import type { UserPlan } from "@/lib/permissions";
import { LISTENING_PROGRESS_EVENT } from "@/lib/listening-progress";
import { formatWeeklyListeningLine, getWeeklyListeningSummary } from "@/lib/weekly-listening";

function buildWeekLine(listenLine: string, notesThisWeek: number | null, plan: UserPlan): string {
  if (plan !== "premium" || notesThisWeek === null || notesThisWeek <= 0) return listenLine;
  const noteBit =
    notesThisWeek === 1
      ? "You added 1 new note this week"
      : `You added ${notesThisWeek} new notes this week`;
  if (!listenLine || listenLine.startsWith("Listen this week")) {
    return noteBit;
  }
  return `${listenLine} · ${noteBit}`;
}

export function WeeklyMomentumLine({ plan = "guest" }: { plan?: UserPlan }) {
  const [line, setLine] = useState<string>("");
  const [hasActivity, setHasActivity] = useState(false);
  const [notesWeek, setNotesWeek] = useState<number | null>(null);

  useEffect(() => {
    if (plan !== "premium") {
      setNotesWeek(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/week-activity", { credentials: "include" });
        if (!res.ok) return;
        const j = (await res.json()) as { notesCreatedThisWeek?: number };
        if (!cancelled) setNotesWeek(typeof j.notesCreatedThisWeek === "number" ? j.notesCreatedThisWeek : 0);
      } catch {
        if (!cancelled) setNotesWeek(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan]);

  useEffect(() => {
    const sync = () => {
      const summary = getWeeklyListeningSummary();
      const listenLine = formatWeeklyListeningLine(summary);
      setLine(buildWeekLine(listenLine, notesWeek, plan));
      setHasActivity(summary.hasActivity || (plan === "premium" && (notesWeek ?? 0) > 0));
    };
    sync();
    window.addEventListener(LISTENING_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, sync);
  }, [plan, notesWeek]);

  return (
    <div className="rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.35)] px-4 py-3 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">This week</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-200/95">
        {line || "Listen this week and a gentle summary will appear here."}
      </p>
      {hasActivity ? <p className="mt-1 text-xs text-slate-500">Keep going. Come back when you&apos;re ready.</p> : null}
    </div>
  );
}
