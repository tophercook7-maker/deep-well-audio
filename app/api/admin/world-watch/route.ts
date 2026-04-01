import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { isFeedbackAdminEmail } from "@/lib/env";
import {
  isWorldWatchCategory,
  parseWorldWatchIsPublished,
  parseWorldWatchPublishedAt,
  sanitizeWorldWatchOptionalLong,
  sanitizeWorldWatchOptionalUrl,
  sanitizeWorldWatchSlugInput,
  sanitizeWorldWatchSummary,
  sanitizeWorldWatchTitle,
} from "@/lib/world-watch/admin-shared";
import { ensureUniqueWorldWatchSlug } from "@/lib/world-watch/ensure-slug-unique";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let user;
  try {
    user = await getSessionUser();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    user = null;
  }

  const email = typeof user?.email === "string" ? user.email : null;
  if (!email || !isFeedbackAdminEmail(email)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = sanitizeWorldWatchTitle(body.title);
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const summary = sanitizeWorldWatchSummary(body.summary);
  if (!summary) {
    return NextResponse.json({ error: "Summary is required." }, { status: 400 });
  }

  const sourceName = sanitizeWorldWatchOptionalLong(body.source_name, 200);
  const sourceUrl = sanitizeWorldWatchOptionalUrl(body.source_url, 2048);
  const imageUrl = sanitizeWorldWatchOptionalUrl(body.image_url, 2048);
  const reflection = sanitizeWorldWatchOptionalLong(body.reflection, 8000);
  const publicTeaser = sanitizeWorldWatchOptionalLong(body.public_teaser, 8000);
  const memberCommentary = sanitizeWorldWatchOptionalLong(body.member_commentary, 12000);
  const scriptureRefs = sanitizeWorldWatchOptionalLong(body.scripture_refs, 8000);
  const discernmentNotes = sanitizeWorldWatchOptionalLong(body.discernment_notes, 12000);
  const keyTakeaways = sanitizeWorldWatchOptionalLong(body.key_takeaways, 8000);

  let category: string | null = null;
  if (body.category !== undefined && body.category !== null && body.category !== "") {
    if (!isWorldWatchCategory(body.category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    category = body.category;
  }

  const isPublished = parseWorldWatchIsPublished(body.is_published, true);
  const publishedAt = parseWorldWatchPublishedAt(body.published_at) ?? new Date().toISOString();
  const slugInput = sanitizeWorldWatchSlugInput(body.slug);

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const slug = await ensureUniqueWorldWatchSlug(admin, title, slugInput);

  const { data, error } = await admin
    .from("world_watch_items")
    .insert({
      title,
      slug,
      source_name: sourceName,
      source_url: sourceUrl,
      image_url: imageUrl,
      summary,
      reflection,
      public_teaser: publicTeaser,
      member_commentary: memberCommentary,
      scripture_refs: scriptureRefs,
      discernment_notes: discernmentNotes,
      key_takeaways: keyTakeaways,
      category,
      is_published: isPublished,
      published_at: publishedAt,
      source_type: "manual",
      source_feed: null,
      source_guid: null,
      canonical_url: sourceUrl,
      external_image_url: null,
      pinned: false,
      pinned_rank: null,
      ingestion_status: "ready",
    } as never)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[admin/world-watch:post]", error.message);
    return NextResponse.json({ error: "Could not create item." }, { status: 500 });
  }

  const id = data && typeof data === "object" && "id" in data && typeof (data as { id: unknown }).id === "string" ? (data as { id: string }).id : null;
  if (!id) {
    return NextResponse.json({ error: "Could not create item." }, { status: 500 });
  }

  console.info("[admin/world-watch:post] created", id.slice(0, 8));
  return NextResponse.json({ ok: true, id });
}
