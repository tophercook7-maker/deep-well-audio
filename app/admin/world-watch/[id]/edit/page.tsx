import { notFound } from "next/navigation";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchAdminEditor } from "@/components/world-watch/world-watch-admin-editor";
import { createServiceClient } from "@/lib/db";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminWorldWatchEditPage(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) notFound();

  const admin = createServiceClient();
  if (!admin) notFound();

  const { data, error } = await admin
    .from("world_watch_items")
    .select(
      "id, created_at, updated_at, published_at, title, slug, source_name, source_url, image_url, summary, reflection, category, is_published"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin/world-watch/edit] select", error.message);
    notFound();
  }
  if (!data) notFound();

  const item = data as WorldWatchItemAdminRow;

  return (
    <main className="container-shell max-w-2xl space-y-8 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/admin/world-watch" label="World Watch admin" />
      </div>
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Edit</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">World Watch item</h1>
        <p className="mt-2 text-sm text-muted">Changes apply immediately for Premium readers when published.</p>
      </header>
      <WorldWatchAdminEditor mode="edit" item={item} listHref="/admin/world-watch" />
    </main>
  );
}
