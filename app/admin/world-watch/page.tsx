import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { createServiceClient } from "@/lib/db";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default async function AdminWorldWatchPage() {
  const admin = createServiceClient();
  let rows: WorldWatchItemAdminRow[] = [];

  if (admin) {
    const { data, error } = await admin
      .from("world_watch_items")
      .select(
        "id, created_at, updated_at, published_at, title, slug, source_name, source_url, image_url, summary, reflection, category, is_published"
      )
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin/world-watch] select", error.message);
    } else {
      rows = (data ?? []) as WorldWatchItemAdminRow[];
    }
  }

  return (
    <main className="container-shell max-w-3xl space-y-8 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">World Watch items</h1>
          <p className="mt-2 text-sm text-muted">Create and edit curated entries for the Premium feed. Newest updates first.</p>
        </div>
        <Link
          href={"/admin/world-watch/new" as Route}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          New item
        </Link>
      </header>

      {!admin ? (
        <p className="text-sm text-amber-200/90">Service role key missing — cannot load items.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No items yet. Create one to populate the Premium feed.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="card border-line/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{row.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    <span className={row.is_published ? "text-emerald-400/90" : "text-amber-200/80"}>
                      {row.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="text-slate-600"> · </span>
                    <span>Updated {fmt(row.updated_at)}</span>
                    <span className="text-slate-600"> · </span>
                    <span>Pub {fmt(row.published_at)}</span>
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-slate-600">{row.slug}</p>
                </div>
                <Link
                  href={`/admin/world-watch/${row.id}/edit` as Route}
                  className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-medium text-amber-200/90 transition hover:border-accent/40 hover:text-amber-100"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
