import { NextResponse } from "next/server";
import { getEpisodesByTopicTag } from "@/lib/queries";
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

  const { episodes, dataOk } = await getEpisodesByTopicTag(slug, limit);
  const slim = episodes.map((e) => ({
    id: e.id,
    title: e.title,
    published_at: e.published_at,
    showSlug: e.show?.slug ?? null,
    showTitle: e.show?.title ?? null,
  }));

  return NextResponse.json({ episodes: slim, dataOk });
}
