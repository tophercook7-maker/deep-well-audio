import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorldWatchCategory } from "@/lib/world-watch/category";
import { getFeedOrderingPriority } from "@/lib/world-watch/sources";

/**
 * World Watch — hybrid feed (`world_watch_items`): manual curation plus syndicated RSS (mostly auto-published).
 * Premium page uses service role reads only after `canUseFeature("world_watch", plan)`.
 * Teaser audience: strip premium-only columns before props reach the client.
 */

export type WorldWatchSourceType = "manual" | "rss";

export type WorldWatchIngestionStatus = "review" | "ready";

export type WorldWatchPremiumDepth = {
  member_commentary: string | null;
  scripture_refs: string | null;
  discernment_notes: string | null;
  key_takeaways: string | null;
};

/** Rows safe to render (premium depth only set for premium pages). */
export type WorldWatchItemPublic = {
  id: string;
  published_at: string;
  title: string;
  slug: string;
  source_name: string | null;
  source_url: string | null;
  /** Manual override image; takes precedence over `external_image_url` when rendering. */
  image_url: string | null;
  external_image_url: string | null;
  summary: string;
  reflection: string | null;
  category: string | null;
  pinned: boolean;
  pinned_rank: number | null;
  /** RSS source id when `source_type` is rss; null for manual items. Used for feed ordering tie-breaks only. */
  source_feed: string | null;
  /** Deeper fields for Premium World Watch page only. */
  premium_depth?: WorldWatchPremiumDepth | null;
};

/** Full row for admin list / edit (includes draft fields + flat premium columns for forms). */
export type WorldWatchItemAdminRow = Omit<WorldWatchItemPublic, "premium_depth"> & {
  created_at: string;
  updated_at: string;
  is_published: boolean;
  source_type: WorldWatchSourceType;
  source_guid: string | null;
  canonical_url: string | null;
  ingestion_status: WorldWatchIngestionStatus;
  public_teaser: string | null;
  member_commentary: string | null;
  scripture_refs: string | null;
  discernment_notes: string | null;
  key_takeaways: string | null;
};

const SELECT_CORE =
  "id, published_at, title, slug, source_name, source_url, image_url, external_image_url, summary, reflection, category, pinned, pinned_rank, source_feed, public_teaser, member_commentary, scripture_refs, discernment_notes, key_takeaways, featured_until, archived_at, retired_at";

type RawWorldWatchRow = Record<string, unknown>;

export function worldWatchHeroImage(item: {
  image_url?: string | null;
  external_image_url?: string | null;
}): string | null {
  const manual = typeof item.image_url === "string" ? item.image_url.trim() : "";
  if (manual) return manual;
  const ext = typeof item.external_image_url === "string" ? item.external_image_url.trim() : "";
  return ext.length ? ext : null;
}

function trimStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function shapeWorldWatchItem(raw: RawWorldWatchRow, audience: "teaser" | "premium"): WorldWatchItemPublic {
  const summaryFull = typeof raw.summary === "string" ? raw.summary : "";
  const publicTeaser = trimStr(raw.public_teaser);
  const summary =
    audience === "teaser" ? (publicTeaser && publicTeaser.length > 0 ? publicTeaser : summaryFull) : summaryFull;

  const base: WorldWatchItemPublic = {
    id: String(raw.id ?? ""),
    published_at: String(raw.published_at ?? ""),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    source_name: trimStr(raw.source_name),
    source_url: trimStr(raw.source_url),
    image_url: trimStr(raw.image_url),
    external_image_url: trimStr(raw.external_image_url),
    summary,
    reflection: audience === "teaser" ? null : trimStr(raw.reflection),
    category: trimStr(raw.category),
    pinned: raw.pinned === true,
    pinned_rank: typeof raw.pinned_rank === "number" ? raw.pinned_rank : null,
    source_feed: trimStr(raw.source_feed),
    premium_depth: null,
  };

  if (audience === "premium") {
    base.reflection = trimStr(raw.reflection);
    const mc = trimStr(raw.member_commentary);
    const sr = trimStr(raw.scripture_refs);
    const dn = trimStr(raw.discernment_notes);
    const kt = trimStr(raw.key_takeaways);
    if (mc || sr || dn || kt) {
      base.premium_depth = {
        member_commentary: mc,
        scripture_refs: sr,
        discernment_notes: dn,
        key_takeaways: kt,
      };
    }
  }

  return base;
}

function wwFeaturedBoost(raw: RawWorldWatchRow): number {
  const fu = raw.featured_until;
  if (typeof fu !== "string" || !fu.trim()) return 0;
  const t = Date.parse(fu);
  return Number.isFinite(t) && t > Date.now() ? 1 : 0;
}

/** Pinned first; active featured window; non-archived before archived; then recency. */
function sortRawWorldWatchRows(rows: RawWorldWatchRow[]): RawWorldWatchRow[] {
  return [...rows].sort((a, b) => {
    const ap = a.pinned === true;
    const bp = b.pinned === true;
    if (ap !== bp) return ap ? -1 : 1;
    if (ap && bp) {
      const ar = typeof a.pinned_rank === "number" ? a.pinned_rank : 10_000;
      const br = typeof b.pinned_rank === "number" ? b.pinned_rank : 10_000;
      if (ar !== br) return ar - br;
    }
    const af = wwFeaturedBoost(a);
    const bf = wwFeaturedBoost(b);
    if (af !== bf) return bf - af;
    const aa = typeof a.archived_at === "string" && a.archived_at.length > 0 ? 1 : 0;
    const ba = typeof b.archived_at === "string" && b.archived_at.length > 0 ? 1 : 0;
    if (aa !== ba) return aa - ba;
    const ta = new Date(String(a.published_at ?? 0)).getTime();
    const tb = new Date(String(b.published_at ?? 0)).getTime();
    if (ta !== tb) return tb - ta;
    const pa = getFeedOrderingPriority(typeof a.source_feed === "string" ? a.source_feed : null);
    const pb = getFeedOrderingPriority(typeof b.source_feed === "string" ? b.source_feed : null);
    if (pa !== pb) return pa - pb;
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}

export type FetchWorldWatchAudience = "teaser" | "premium";

/**
 * Load published items. Use `audience: 'teaser'` for homepage / any non-premium surfacing (strips premium depth).
 * Use `audience: 'premium'` on the Premium World Watch page.
 */
export async function fetchPublishedWorldWatchItems(
  admin: SupabaseClient,
  limit = 50,
  options?: { audience?: FetchWorldWatchAudience }
): Promise<WorldWatchItemPublic[]> {
  const audience = options?.audience ?? "teaser";
  let q = admin.from("world_watch_items").select(SELECT_CORE).eq("is_published", true).is("retired_at", null);

  if (audience === "teaser") {
    q = q.is("archived_at", null);
  }

  const { data, error } = await q.order("published_at", { ascending: false }).limit(Math.min(limit * 3, 150));

  if (error) {
    console.error("[world-watch] fetchPublishedWorldWatchItems", error.message);
    return [];
  }

  const rows = sortRawWorldWatchRows((data ?? []) as RawWorldWatchRow[]);
  const shaped = rows.map((r) => shapeWorldWatchItem(r, audience));
  return shaped.slice(0, limit);
}

export type { WorldWatchCategory };

export const WORLD_WATCH_CATEGORY_OPTIONS: { value: WorldWatchCategory | ""; label: string }[] = [
  { value: "", label: "— None —" },
  { value: "global", label: "Global" },
  { value: "faith_public_life", label: "Faith & public life" },
  { value: "culture", label: "Culture" },
  { value: "prayer_watch", label: "Prayer watch" },
  { value: "other", label: "Other" },
];

export function worldWatchCategoryLabel(category: string | null | undefined): string | null {
  if (!category) return null;
  const row = WORLD_WATCH_CATEGORY_OPTIONS.find((o) => o.value === category);
  return row?.label ?? null;
}
