"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen, Pencil, Trash2 } from "lucide-react";
import type { EpisodeNoteRow } from "@/lib/notes";

type Props = {
  episodeId: string;
  initialNotes: EpisodeNoteRow[];
};

export function NotesPanel({ episodeId, initialNotes }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const refresh = useCallback(() => router.refresh(), [router]);

  const addNote = useCallback(async () => {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/premium/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode_id: episodeId, body }),
      });
      const data = (await res.json().catch(() => ({}))) as { note?: EpisodeNoteRow; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not save note");
        return;
      }
      if (data.note) {
        setNotes((prev) => [data.note!, ...prev]);
        setDraft("");
        refresh();
      }
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }, [draft, episodeId, refresh]);

  const saveEdit = useCallback(
    async (id: string) => {
      const body = editBody.trim();
      if (!body) return;
      setBusy(true);
      setErr(null);
      try {
        const res = await fetch("/api/premium/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, body }),
        });
        const data = (await res.json().catch(() => ({}))) as { note?: EpisodeNoteRow; error?: string };
        if (!res.ok) {
          setErr(data.error ?? "Could not update");
          return;
        }
        if (data.note) {
          setNotes((prev) => prev.map((n) => (n.id === id ? data.note! : n)));
          setEditingId(null);
          refresh();
        }
      } catch {
        setErr("Network error");
      } finally {
        setBusy(false);
      }
    },
    [editBody, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setErr(null);
      try {
        const res = await fetch(`/api/premium/notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setErr(data.error ?? "Could not delete");
          return;
        }
        setNotes((prev) => prev.filter((n) => n.id !== id));
        refresh();
      } catch {
        setErr("Network error");
      }
    },
    [refresh]
  );

  return (
    <div className="rounded-2xl border border-line/75 bg-soft/15 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-accent" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Private notes</h3>
      </div>
      <p className="mt-1 text-xs text-muted">Only you can see these. Multiple notes per episode are supported.</p>
      {err ? <p className="mt-2 text-sm text-amber-200/90">{err}</p> : null}

      <div className="mt-4">
        <label htmlFor={`note-new-${episodeId}`} className="sr-only">
          New note
        </label>
        <textarea
          id={`note-new-${episodeId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Add a thought or takeaway…"
          className="w-full resize-y rounded-xl border border-line/80 bg-bg/50 px-3 py-2.5 text-sm text-slate-100 outline-none ring-accent/30 placeholder:text-slate-500 focus:ring-2"
        />
        <button
          type="button"
          onClick={() => void addNote()}
          disabled={busy || !draft.trim()}
          className="mt-2 inline-flex min-h-[44px] items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Add note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No notes yet for this episode.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl border border-line/60 bg-bg/40 p-3">
              {editingId === n.id ? (
                <>
                  <label htmlFor={`edit-${n.id}`} className="sr-only">
                    Edit note
                  </label>
                  <textarea
                    id={`edit-${n.id}`}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    className="w-full resize-y rounded-lg border border-line/80 bg-bg/60 px-2 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(n.id)}
                      disabled={busy || !editBody.trim()}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditBody("");
                      }}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <time dateTime={n.updated_at}>Updated {new Date(n.updated_at).toLocaleString()}</time>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(n.id);
                        setEditBody(n.body);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-line/80 px-2 py-1 text-xs text-amber-100/85 hover:border-accent/35"
                      aria-label="Edit note"
                    >
                      <Pencil className="h-3 w-3" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(n.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-line/80 px-2 py-1 text-xs text-slate-400 hover:border-amber-900/50 hover:text-amber-200"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
