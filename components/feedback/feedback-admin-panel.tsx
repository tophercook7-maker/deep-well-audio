"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FeedbackStatus } from "@/lib/feedback-shared";
import { FEEDBACK_STATUSES } from "@/lib/feedback-shared";

export type FeedbackRow = {
  id: string;
  created_at: string;
  category: string;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  email: string | null;
  user_id: string | null;
  status: string;
  admin_note: string | null;
  reply_sent: boolean;
  replied_at: string | null;
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function FeedbackAdminPanel({ rows }: { rows: FeedbackRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [globalErr, setGlobalErr] = useState<string | null>(null);

  const saveRow = useCallback(
    async (id: string, status: FeedbackStatus, adminNote: string) => {
      setGlobalErr(null);
      setBusyId(id);
      try {
        const res = await fetch(`/api/feedback/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, admin_note: adminNote }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setGlobalErr(typeof data.error === "string" ? data.error : "Update failed.");
          return;
        }
        router.refresh();
      } catch {
        setGlobalErr("Network error.");
      } finally {
        setBusyId(null);
      }
    },
    [router]
  );

  const markReplySent = useCallback(
    async (id: string, status: FeedbackStatus, adminNote: string) => {
      setGlobalErr(null);
      setBusyId(id);
      try {
        const res = await fetch(`/api/feedback/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            admin_note: adminNote,
            reply_sent: true,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setGlobalErr(typeof data.error === "string" ? data.error : "Update failed.");
          return;
        }
        router.refresh();
      } catch {
        setGlobalErr("Network error.");
      } finally {
        setBusyId(null);
      }
    },
    [router]
  );

  const clearReplySent = useCallback(
    async (id: string) => {
      setGlobalErr(null);
      setBusyId(id);
      try {
        const res = await fetch(`/api/feedback/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply_sent: false }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setGlobalErr(typeof data.error === "string" ? data.error : "Update failed.");
          return;
        }
        router.refresh();
      } catch {
        setGlobalErr("Network error.");
      } finally {
        setBusyId(null);
      }
    },
    [router]
  );

  if (!rows.length) {
    return <p className="text-sm text-muted">No submissions yet.</p>;
  }

  return (
    <div className="space-y-6">
      {globalErr ? <p className="text-sm text-amber-200/90">{globalErr}</p> : null}
      <ul className="space-y-8">
        {rows.map((row) => (
          <FeedbackAdminRow
            key={`${row.id}-${row.admin_note ?? ""}-${row.status}-${row.reply_sent}-${row.replied_at ?? ""}`}
            row={row}
            onSave={saveRow}
            onMarkReplySent={markReplySent}
            onClearReplySent={clearReplySent}
            busy={busyId === row.id}
          />
        ))}
      </ul>
    </div>
  );
}

function FeedbackAdminRow({
  row,
  onSave,
  onMarkReplySent,
  onClearReplySent,
  busy,
}: {
  row: FeedbackRow;
  onSave: (id: string, status: FeedbackStatus, adminNote: string) => void;
  onMarkReplySent: (id: string, status: FeedbackStatus, adminNote: string) => void;
  onClearReplySent: (id: string) => void;
  busy: boolean;
}) {
  const [status, setStatus] = useState(row.status as FeedbackStatus);
  const [note, setNote] = useState(row.admin_note ?? "");
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const dirty = status !== row.status || note !== (row.admin_note ?? "");
  const noteTrim = note.trim();
  const replySent = row.reply_sent === true;

  const copyReply = useCallback(async () => {
    setCopyHint(null);
    if (!noteTrim) {
      setCopyHint("Write something to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(noteTrim);
      setCopyHint("Copied.");
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint("Could not copy — try selecting the text.");
    }
  }, [noteTrim]);

  return (
    <li className="card border-line/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/40 pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/70">{row.category}</span>
        <time className="text-xs text-slate-500" dateTime={row.created_at}>
          {fmtDate(row.created_at)}
        </time>
      </div>
      <p className="mt-3 text-xs text-muted">
        <span className="text-slate-400">From:</span>{" "}
        {row.email ?? <span className="italic text-slate-500">no email</span>}
        {row.user_id ? (
          <>
            {" "}
            · <span className="text-slate-400">user</span>{" "}
            <code className="text-[11px] text-slate-400">{row.user_id.slice(0, 8)}…</code>
          </>
        ) : null}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {replySent ? (
          <>
            <span className="text-emerald-400/90">Reply marked sent</span>
            {row.replied_at ? (
              <>
                {" "}
                · <span className="text-slate-500">{fmtDate(row.replied_at)}</span>
              </>
            ) : null}
          </>
        ) : (
          <span className="text-amber-200/75">Reply not marked sent yet — safe to draft here.</span>
        )}
      </p>
      {row.page_url ? (
        <p className="mt-1 break-all text-xs text-muted">
          <span className="text-slate-400">Page:</span>{" "}
          <a href={row.page_url} className="text-amber-200/80 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            {row.page_url}
          </a>
        </p>
      ) : null}
      <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-line/50 bg-soft/20 p-3 text-sm leading-relaxed text-slate-200">
        {row.message}
      </div>
      {row.user_agent ? (
        <p className="mt-2 line-clamp-2 text-[11px] text-slate-500" title={row.user_agent}>
          UA: {row.user_agent}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[10rem] flex-1">
          <label className="block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500" htmlFor={`st-${row.id}`}>
            Status
          </label>
          <select
            id={`st-${row.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
            className="mt-1 w-full rounded-lg border border-line/80 bg-soft/25 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 flex-[2]">
          <label className="block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500" htmlFor={`note-${row.id}`}>
            Reply / reassurance
          </label>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
            Draft the message you may send them later (email from the app is optional). Saving stores it; you can paste into Gmail anytime or mark sent
            when you&apos;re done.
          </p>
          <textarea
            id={`note-${row.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1 w-full resize-y rounded-lg border border-line/80 bg-soft/25 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            placeholder="e.g. Thanks for writing — here’s what I’m doing and when you can expect a fix…"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !noteTrim}
              onClick={() => void copyReply()}
              className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-line px-4 py-1.5 text-xs font-medium text-amber-200/90 transition hover:border-accent/40 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy reply
            </button>
            {copyHint ? <span className="text-xs text-slate-400">{copyHint}</span> : null}
            {!replySent ? (
              <button
                type="button"
                disabled={busy || !noteTrim}
                onClick={() => onMarkReplySent(row.id, status, note)}
                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save &amp; mark reply sent
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onClearReplySent(row.id)}
                className="text-xs text-slate-500 underline-offset-2 transition hover:text-slate-300 hover:underline"
              >
                Undo “sent” (for mistakes)
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => onSave(row.id, status, note)}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </li>
  );
}
