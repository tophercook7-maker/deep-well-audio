import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchAdminTable } from "@/components/world-watch/world-watch-admin-table";
import { createServiceClient } from "@/lib/db";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";

export default async function AdminWorldWatchPage() {
  const admin = createServiceClient();
  let rows: WorldWatchItemAdminRow[] = [];

  if (admin) {
    const { data, error } = await admin
      .from("world_watch_items")
      .select(
        "id, created_at, updated_at, published_at, title, slug, source_name, source_url, image_url, external_image_url, summary, reflection, category, is_published, source_type, source_feed, source_guid, canonical_url, pinned, pinned_rank, ingestion_status"
      )
      .order("created_at", { ascending: false })
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
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">World Watch · Review desk</h1>
          <p className="mt-2 text-sm text-muted">
            Newest first. Trusted RSS sources publish automatically; use this desk to fix a headline, pin something urgent, unpublish a weak item, or
            add a manual story. Pins still jump to the top of the Premium feed.
          </p>
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
        <p className="text-sm text-muted">No items yet. Run RSS ingest (cron) or create a manual entry.</p>
      ) : (
        <WorldWatchAdminTable rows={rows} />
      )}
    </main>
  );
}
