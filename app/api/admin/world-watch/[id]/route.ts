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
import { slugifyWorldWatchTitle } from "@/lib/world-watch/slug";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_PATCH_KEYS = new Set([
  "title",
  "slug",
  "source_name",
  "source_url",
  "image_url",
  "summary",
  "reflection",
  "category",
  "is_published",
  "published_at",
]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

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

  for (const key of Object.keys(body)) {
    if (!ALLOWED_PATCH_KEYS.has(key)) {
      return NextResponse.json({ error: "Invalid fields in request." }, { status: 400 });
    }
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const patch: Record<string, string | boolean | null> = {};

  if (body.title !== undefined) {
    const title = sanitizeWorldWatchTitle(body.title);
    if (!title) return NextResponse.json({ error: "Invalid title." }, { status: 400 });
    patch.title = title;
  }

  if (body.summary !== undefined) {
    const summary = sanitizeWorldWatchSummary(body.summary);
    if (!summary) return NextResponse.json({ error: "Invalid summary." }, { status: 400 });
    patch.summary = summary;
  }

  if (body.source_name !== undefined) {
    patch.source_name = sanitizeWorldWatchOptionalLong(body.source_name, 200);
  }

  if (body.source_url !== undefined) {
    const u = sanitizeWorldWatchOptionalUrl(body.source_url, 2048);
    patch.source_url = u;
  }

  if (body.image_url !== undefined) {
    const u = sanitizeWorldWatchOptionalUrl(body.image_url, 2048);
    patch.image_url = u;
  }

  if (body.reflection !== undefined) {
    patch.reflection = sanitizeWorldWatchOptionalLong(body.reflection, 8000);
  }

  if (body.category !== undefined) {
    if (body.category === null || body.category === "") {
      patch.category = null;
    } else if (isWorldWatchCategory(body.category)) {
      patch.category = body.category;
    } else {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
  }

  if (body.is_published !== undefined) {
    patch.is_published = parseWorldWatchIsPublished(body.is_published, true);
  }

  if (body.published_at !== undefined) {
    const iso = parseWorldWatchPublishedAt(body.published_at);
    if (!iso) return NextResponse.json({ error: "Invalid published_at." }, { status: 400 });
    patch.published_at = iso;
  }

  if (body.slug !== undefined) {
    let s: string | null;
    if (body.slug === null || body.slug === "") {
      let titleForSlug = typeof patch.title === "string" ? patch.title : null;
      if (!titleForSlug) {
        const { data } = await admin.from("world_watch_items").select("title").eq("id", id).maybeSingle();
        titleForSlug = data && typeof data.title === "string" ? data.title : "item";
      }
      s = slugifyWorldWatchTitle(titleForSlug);
    } else {
      s = sanitizeWorldWatchSlugInput(body.slug);
    }
    if (!s) return NextResponse.json({ error: "Invalid slug." }, { status: 400 });

    const { data: clash } = await admin.from("world_watch_items").select("id").eq("slug", s).maybeSingle();
    const clashId = clash && typeof clash === "object" && "id" in clash ? String((clash as { id: string }).id) : null;
    if (clashId && clashId !== id) {
      return NextResponse.json({ error: "That slug is already in use." }, { status: 400 });
    }
    patch.slug = s;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await admin.from("world_watch_items").update(patch as never).eq("id", id);

  if (error) {
    console.error("[admin/world-watch:patch]", error.message);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug conflict. Try another slug." }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  console.info("[admin/world-watch:patch] ok", id.slice(0, 8));
  return NextResponse.json({ ok: true });
}
