"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Route } from "next";
import { Pin, PinOff } from "lucide-react";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";
import { worldWatchCategoryLabel, worldWatchHeroImage } from "@/lib/world-watch/items";

const btn =
  "rounded-lg border border-line/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-accent/35 hover:text-white disabled:opacity-45";

const pinBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-amber-200/35 bg-amber-200/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-amber-200/90 transition hover:border-amber-200/55 hover:bg-amber-200/10 disabled:opacity-45";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

async function patchItem(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/world-watch/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Update failed");
}

type Props = { rows: WorldWatchItemAdminRow[] };

export function WorldWatchAdminTable({ rows }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => router.refresh(), [router]);

  const run = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      setBusyId(id);
      try {
        await patchItem(id, body);
        refresh();
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const thumb = worldWatchHeroImage(row);
        const cat = worldWatchCategoryLabel(row.category);
        const disabled = busyId === row.id;
        return (
          <li key={row.id} className="card border-line/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-line/50 bg-soft/20 sm:h-28 sm:w-40">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote operator URLs
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium text-slate-500">No image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{row.title}</p>
                <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <span className={row.is_published ? "text-emerald-400/90" : "text-amber-200/85"}>
                    {row.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>{row.source_type === "rss" ? "RSS" : "Manual"}</span>
                  {row.ingestion_status === "review" ? (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-amber-200/70">Review queue</span>
                    </>
                  ) : null}
                  {row.pinned ? (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Pinned {row.pinned_rank != null ? `(#${row.pinned_rank})` : ""}</span>
                    </>
                  ) : null}
                  <span className="text-slate-600">·</span>
                  <span>{fmt(row.created_at)}</span>
                  <span className="text-slate-600">·</span>
                  <span>Pub {fmt(row.published_at)}</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {row.source_name ? <span className="text-slate-400">{row.source_name}</span> : null}
                  {cat ? (
                    <span className="text-slate-600">
                      {" "}
                      · {cat}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 truncate font-mono text-[10px] text-slate-600">{row.slug}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/world-watch/${row.id}/edit` as Route}
                    className={`${btn} border-amber-200/30 text-amber-200/90`}
                  >
                    Edit
                  </Link>
                  {row.is_published ? (
                    <button type="button" disabled={disabled} className={btn} onClick={() => void run(row.id, { is_published: false })}>
                      Unpublish
                    </button>
                  ) : (
                    <button type="button" disabled={disabled} className={btn} onClick={() => void run(row.id, { is_published: true })}>
                      Publish
                    </button>
                  )}
                  {row.pinned ? (
                    <button type="button" disabled={disabled} className={pinBtn} onClick={() => void run(row.id, { pinned: false })}>
                      <PinOff className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                      Unpin
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      className={pinBtn}
                      onClick={() => void run(row.id, { pinned: true, pinned_rank: 0 })}
                    >
                      <Pin className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                      Pin to top
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
