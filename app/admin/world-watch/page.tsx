import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchAdminTable } from "@/components/world-watch/world-watch-admin-table";
import { createServiceClient } from "@/lib/db";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";

export const metadata = {
  title: "World Watch · Admin",
  robots: { index: false, follow: false },
};

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
    <main className="container-shell max-w-3xl space-y-10 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
        <p className="mt-3 text-xs text-muted">
          <Link href={"/admin/metrics" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
            Conversion metrics
          </Link>
          <span className="text-slate-600"> · </span>
          <Link href={"/admin/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
            Feedback
          </Link>
        </p>
      </div>
      <header className="flex flex-col gap-5 rounded-2xl border border-line/60 bg-soft/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">World Watch</h1>
          <p className="mt-2 max-w-prose text-sm leading-[1.65] text-muted">
            Newest first. RSS feeds usually auto-publish; open an item to edit, or use quick actions below to publish/unpublish or pin. Manual
            entries cover one-off stories.
          </p>
        </div>
        <Link
          href={"/admin/world-watch/new" as Route}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          New manual item
        </Link>
      </header>

      {!admin ? (
        <p className="text-sm text-amber-200/90">Service role key missing — cannot load items.</p>
      ) : rows.length === 0 ? (
        <div className="card border-line/70 bg-soft/10 p-8 text-center sm:p-10">
          <p className="text-sm font-medium text-slate-300">No items yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Trigger the RSS ingest job from your scheduler (Bearer <span className="text-slate-500">CRON_SECRET</span>) or add a manual item.
          </p>
        </div>
      ) : (
        <WorldWatchAdminTable rows={rows} />
      )}
    </main>
  );
}
