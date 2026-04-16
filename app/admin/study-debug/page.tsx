import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { StudyDebugRefreshButton } from "@/components/admin/study-debug-refresh";
import { createServiceClient } from "@/lib/db";
import {
  entryKindFriendly,
  fetchStudyDebugSnapshot,
  formatStudyDebugTimestamp,
  historySurfaceHint,
  noteKindFriendly,
  noteTargetDisplay,
  shortUserId,
  type StudyDebugSnapshot,
} from "@/lib/admin/study-debug-data";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";

export const dynamic = "force-dynamic";

const th = "border-b border-line/50 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500";
const td = "border-b border-line/35 px-3 py-2 align-top text-sm text-slate-300";
const mono = "font-mono text-[11px] text-slate-500/95";

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line/50 bg-soft/20 px-2.5 py-0.5 text-[11px] tabular-nums text-slate-400">
      {children}
    </span>
  );
}

function SanityRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/30 py-2 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-sm tabular-nums text-slate-200">{value}</span>
    </div>
  );
}

export default async function AdminStudyDebugPage() {
  const admin = createServiceClient();
  let snapshot: StudyDebugSnapshot | null = null;
  let loadError: string | null = null;

  if (admin) {
    const result = await fetchStudyDebugSnapshot(admin);
    if (!result.ok) {
      loadError = result.error;
    } else {
      snapshot = result.data;
    }
  } else {
    loadError = "Service role key missing";
  }

  return (
    <main className="container-shell max-w-6xl space-y-8 py-10 sm:space-y-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/50 pb-5">
        <div>
          <BackButton fallbackHref="/admin/metrics" label="Admin" />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/65">Internal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Study Debug</h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
            Internal view for saved passages, notes, and study history. Not linked from the public site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StudyDebugRefreshButton />
        </div>
      </div>

      {snapshot ? (
        <div className="flex flex-wrap gap-2">
          <Chip>
            Saved passages: <span className="text-slate-200">{snapshot.counts.savedTotal}</span>
          </Chip>
          <Chip>
            Notes: <span className="text-slate-200">{snapshot.counts.notesTotal}</span>
          </Chip>
          <Chip>
            History rows: <span className="text-slate-200">{snapshot.counts.historyTotal}</span>
          </Chip>
        </div>
      ) : null}

      {!admin ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-4 text-sm text-amber-100/90">
          Configure <code className="rounded bg-soft px-1 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to read study tables.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200/90">Error: {loadError}</p>
      ) : null}

      {snapshot ? (
        <>
          <section aria-labelledby="saved-heading" className="rounded-2xl border border-line/55 bg-soft/10 p-4 sm:p-5">
            <h2 id="saved-heading" className="text-sm font-semibold text-white">
              Saved passages
            </h2>
            <p className="mt-1 text-xs text-muted">Newest first · up to 50 rows</p>
            <div className="mt-4 overflow-x-auto">
              {snapshot.savedPassages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No saved passages yet.</p>
              ) : (
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={th}>Created</th>
                      <th className={th}>Label</th>
                      <th className={th}>Kind</th>
                      <th className={th}>book_id</th>
                      <th className={th}>ch</th>
                      <th className={th}>v–v</th>
                      <th className={th}>trans</th>
                      <th className={th}>user</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.savedPassages.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className={td}>{formatStudyDebugTimestamp(row.created_at)}</td>
                        <td className={td}>
                          <span className="text-slate-200">{row.passage_label?.trim() || "—"}</span>
                          {row.book_name ? (
                            <span className={`mt-0.5 block text-[11px] text-slate-500`}>{row.book_name}</span>
                          ) : null}
                        </td>
                        <td className={td}>
                          <span className="text-slate-200">{entryKindFriendly(row.entry_kind)}</span>
                          <span className={`mt-0.5 block ${mono}`}>{row.entry_kind ?? "null"}</span>
                        </td>
                        <td className={td}>
                          <span className="font-mono text-xs text-slate-400">{row.book_id}</span>
                        </td>
                        <td className={`${td} tabular-nums`}>{row.chapter}</td>
                        <td className={`${td} tabular-nums`}>
                          {row.verse_from}
                          {row.verse_to !== row.verse_from ? `–${row.verse_to}` : ""}
                        </td>
                        <td className={td}>
                          <span className="text-slate-300">{studyTranslationShortLabel(row.translation_id)}</span>
                          <span className={`mt-0.5 block ${mono}`}>{row.translation_id}</span>
                        </td>
                        <td className={td}>
                          <span className={mono} title={row.user_id}>
                            {shortUserId(row.user_id)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section aria-labelledby="notes-heading" className="rounded-2xl border border-line/55 bg-soft/10 p-4 sm:p-5">
            <h2 id="notes-heading" className="text-sm font-semibold text-white">
              Notes
            </h2>
            <p className="mt-1 text-xs text-muted">Newest first · up to 50 rows</p>
            <div className="mt-4 overflow-x-auto">
              {snapshot.notes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No study notes yet.</p>
              ) : (
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={th}>Created</th>
                      <th className={th}>Type</th>
                      <th className={th}>Target</th>
                      <th className={th}>Preview</th>
                      <th className={th}>content_key</th>
                      <th className={th}>user</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.notes.map((row) => {
                      const verseLinked = row.content_type === "verse" || row.content_key.startsWith("verse:");
                      return (
                        <tr key={row.id} className="hover:bg-white/[0.02]">
                          <td className={td}>{formatStudyDebugTimestamp(row.created_at)}</td>
                          <td className={td}>
                            <span className={verseLinked ? "text-amber-200/85" : "text-slate-400"}>
                              {noteKindFriendly(row.content_type)}
                            </span>
                            <span className={`mt-0.5 block ${mono}`}>{row.content_type}</span>
                          </td>
                          <td className={td}>
                            <span className="text-slate-200">{noteTargetDisplay(row.content_key, row.content_type)}</span>
                          </td>
                          <td className={`${td} max-w-[280px]`}>
                            <span className="line-clamp-2 text-slate-300">{row.body || "—"}</span>
                          </td>
                          <td className={`${td} max-w-[200px]`}>
                            <span className="line-clamp-2 break-all font-mono text-[11px] text-slate-500">{row.content_key}</span>
                          </td>
                          <td className={td}>
                            <span className={mono} title={row.user_id}>
                              {shortUserId(row.user_id)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section aria-labelledby="hist-heading" className="rounded-2xl border border-line/55 bg-soft/10 p-4 sm:p-5">
            <h2 id="hist-heading" className="text-sm font-semibold text-white">
              Study history
            </h2>
            <p className="mt-1 text-xs text-muted">Newest first · up to 50 rows · inferred surface from stored ref</p>
            <div className="mt-4 overflow-x-auto">
              {snapshot.history.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No recent study activity yet.</p>
              ) : (
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={th}>Opened</th>
                      <th className={th}>Reference</th>
                      <th className={th}>Translation</th>
                      <th className={th}>Inferred surface</th>
                      <th className={th}>user</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.history.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className={td}>{formatStudyDebugTimestamp(row.opened_at)}</td>
                        <td className={td}>
                          <span className="font-mono text-sm text-slate-200">{row.passage_ref}</span>
                        </td>
                        <td className={td}>
                          <span className="text-slate-300">{studyTranslationShortLabel(row.translation_id)}</span>
                          <span className={`mt-0.5 block ${mono}`}>{row.translation_id}</span>
                        </td>
                        <td className={td}>
                          <span className="text-slate-300">{historySurfaceHint(row.passage_ref)}</span>
                        </td>
                        <td className={td}>
                          <span className={mono} title={row.user_id}>
                            {shortUserId(row.user_id)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section aria-labelledby="sanity-heading" className="rounded-2xl border border-line/50 bg-[rgba(8,11,16,0.4)] p-5">
            <h2 id="sanity-heading" className="text-sm font-semibold text-white">
              Quick sanity checks
            </h2>
            <p className="mt-1 text-xs text-muted">Counts across all rows (not just this page).</p>
            <div className="mt-4 max-w-md space-y-0">
              <SanityRow label="Saved with entry_kind = verse (verse drawer saves)" value={snapshot.counts.savedVerseKind} />
              <SanityRow label="Saved with entry_kind = reader (chapter saves)" value={snapshot.counts.savedReaderKind} />
              <SanityRow label="Saved with entry_kind missing (null)" value={snapshot.counts.savedMissingKind} />
              <SanityRow label="Total notes" value={snapshot.counts.notesTotal} />
              <SanityRow label="Total history rows" value={snapshot.counts.historyTotal} />
            </div>
          </section>
        </>
      ) : null}

      <p className="text-xs leading-relaxed text-muted">
        <Link href={"/admin/metrics" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
          Conversion metrics
        </Link>
        <span className="mx-2 text-slate-600">·</span>
        <Link href={"/admin/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
          Feedback admin
        </Link>
      </p>
    </main>
  );
}
