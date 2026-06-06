import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveCatalogCycleForViewer } from "@/lib/catalog-cycles";
import { getEpisodesByTopicTag } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { normalizeTopicSlug } from "@/lib/topics";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("slug") ?? "";
  const slug = normalizeTopicSlug(raw);
  const limit = Math.min(12, Math.max(1, parseInt(searchParams.get("limit") ?? "4", 10) || 4));

  if (!slug) {
    return NextResponse.json({ episodes: [], dataOk: true });
  }

  const user = await getSessionUser();
  const supabase = await createClient();
  let cycleId: string | null = null;
  if (supabase) {
    const ctx = await resolveCatalogCycleForViewer(supabase, user?.id ?? null);
    cycleId = ctx.visibleCycleId;
  }

  const { episodes, dataOk } = await getEpisodesByTopicTag(slug, limit, cycleId);
  const slim = episodes.map((e) => ({
    id: e.id,
    title: e.title,
    published_at: e.published_at,
    showSlug: e.show?.slug ?? null,
    showTitle: e.show?.title ?? null,
  }));

  return NextResponse.json({ episodes: slim, dataOk });
}
