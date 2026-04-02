import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EpisodeRow, EpisodeWithShow, ShowRow, ShowWithMeta } from "@/lib/types";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isCategoryKey } from "@/lib/normalizers";
import { getTopicDefinition, normalizeTopicSlug } from "@/lib/topics";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

function logQueryError(scope: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("queries:" + scope, msg);
}

function rethrowIfDynamic(e: unknown) {
  if (isNextDynamicUsageError(e)) throw e;
}

function mapShowWithCount(raw: ShowRow & { episodes?: { count: number }[] }): ShowWithMeta {
  const { episodes, ...rest } = raw;
  const count = episodes?.[0]?.count;
  return { ...rest, episode_count: count };
}

/** Lightweight health check for UI status (not for strict uptime monitoring). */
export async function probeCatalogBackend(): Promise<"ok" | "missing_env" | "error"> {
  if (!hasPublicSupabaseEnv()) return "missing_env";
  const supabase = await createClient();
  if (!supabase) return "missing_env";
  try {
    const { error } = await supabase.from("shows").select("id").limit(1);
    if (error) {
      logQueryError("probeCatalogBackend", error);
      return "error";
    }
    return "ok";
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("probeCatalogBackend", e);
    return "error";
  }
}

export async function getActiveShowCount(): Promise<number> {
  if (!hasPublicSupabaseEnv()) return 0;
  const supabase = await createClient();
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase.from("shows").select("*", { count: "exact", head: true }).eq("is_active", true);
    if (error) {
      logQueryError("getActiveShowCount", error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getActiveShowCount", e);
    return 0;
  }
}

/** Episodes visible under RLS (typically those tied to active shows). */
export async function getPublicEpisodeCount(): Promise<number> {
  if (!hasPublicSupabaseEnv()) return 0;
  const supabase = await createClient();
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase.from("episodes").select("*", { count: "exact", head: true });
    if (error) {
      logQueryError("getPublicEpisodeCount", error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getPublicEpisodeCount", e);
    return 0;
  }
}

export async function getFeaturedShows(limit = 9): Promise<ShowWithMeta[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("shows")
      .select("*, episodes(count)")
      .eq("is_active", true)
      .eq("featured", true)
      .order("title")
      .limit(limit);

    if (error) {
      logQueryError("getFeaturedShows", error);
      return [];
    }
    if (!data) return [];
    return data.map((row) => mapShowWithCount(row as ShowRow & { episodes?: { count: number }[] }));
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getFeaturedShows", e);
    return [];
  }
}

export async function getHomeRecentEpisodes(limit = 8): Promise<EpisodeWithShow[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episodes")
      .select("*, show:shows!inner(slug,title,host,artwork_url,category,official_url)")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      logQueryError("getHomeRecentEpisodes", error);
      return [];
    }
    if (!data) return [];
    return data as EpisodeWithShow[];
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getHomeRecentEpisodes", e);
    return [];
  }
}

export type ExploreFilters = {
  q?: string;
  category?: string;
  sourceType?: string;
  meatyMin?: number;
  /** Episode `topic_tags` slug when `getTopicDefinition(slug)` exists (e.g. end-times). */
  topic?: string;
};

/** Resolve a catalog topic slug from filters, or "" if absent/invalid. */
export function resolveExploreTopicSlug(filters: Pick<ExploreFilters, "topic">): string {
  const raw = filters.topic?.trim() ?? "";
  if (!raw) return "";
  const slug = normalizeTopicSlug(raw);
  return getTopicDefinition(slug) ? slug : "";
}

function cleanSearchTerm(term: string): string {
  return term.replace(/[%_,]/g, " ").trim();
}

/** Show IDs that have at least one episode matching the topic tag (and optional episode-level filters). */
async function fetchShowIdsWithTopicEpisodes(
  supabase: SupabaseClient,
  topicSlug: string,
  filters: ExploreFilters
): Promise<string[]> {
  const category = filters.category && isCategoryKey(filters.category) ? filters.category : null;
  const meatyMin = filters.meatyMin;
  const sourceType = filters.sourceType;

  let q = supabase
    .from("episodes")
    .select("show_id, show!inner(is_active)")
    .contains("topic_tags", [topicSlug])
    .eq("show.is_active", true);

  if (category) {
    q = q.eq("show.category", category);
  }
  if (typeof meatyMin === "number" && !Number.isNaN(meatyMin)) {
    q = q.gte("meaty_score", meatyMin);
  }
  if (sourceType && sourceType !== "all") {
    q = q.eq("source_type", sourceType);
  }

  const { data, error } = await q.limit(4000);
  if (error) {
    logQueryError("fetchShowIdsWithTopicEpisodes", error);
    return [];
  }
  return [...new Set((data ?? []).map((r: { show_id: string }) => r.show_id))];
}

/** Show IDs where an episode (or embedded show fields) matches the ILIKE pattern. */
async function fetchShowIdsFromEpisodeOrShowText(
  supabase: SupabaseClient,
  pattern: string,
  filters: ExploreFilters,
  topicSlug: string
): Promise<string[]> {
  const category = filters.category && isCategoryKey(filters.category) ? filters.category : null;
  const meatyMin = filters.meatyMin;
  const sourceType = filters.sourceType;

  let q = supabase
    .from("episodes")
    .select("show_id, show!inner(is_active,title,host,summary,description)")
    .eq("show.is_active", true)
    .or(
      `title.ilike.${pattern},description.ilike.${pattern},show.title.ilike.${pattern},show.host.ilike.${pattern},show.summary.ilike.${pattern},show.description.ilike.${pattern}`
    );

  if (category) {
    q = q.eq("show.category", category);
  }
  if (topicSlug) {
    q = q.contains("topic_tags", [topicSlug]);
  }
  if (typeof meatyMin === "number" && !Number.isNaN(meatyMin)) {
    q = q.gte("meaty_score", meatyMin);
  }
  if (sourceType && sourceType !== "all") {
    q = q.eq("source_type", sourceType);
  }

  const { data, error } = await q.limit(4000);
  if (error) {
    logQueryError("fetchShowIdsFromEpisodeOrShowText", error);
    return [];
  }
  return [...new Set((data ?? []).map((r: { show_id: string }) => r.show_id))];
}

export async function exploreShows(filters: ExploreFilters): Promise<ShowWithMeta[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const topicSlug = resolveExploreTopicSlug(filters);

    let topicShowIds: string[] | null = null;
    if (topicSlug) {
      topicShowIds = await fetchShowIdsWithTopicEpisodes(supabase, topicSlug, filters);
      if (!topicShowIds.length) return [];
    }

    let q = supabase
      .from("shows")
      .select("*, episodes(count)")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("title", { ascending: true });

    const meatyMin = filters.meatyMin;
    if (typeof meatyMin === "number" && !Number.isNaN(meatyMin)) {
      q = q.gte("meaty_score", meatyMin);
    }

    if (filters.category && isCategoryKey(filters.category)) {
      q = q.eq("category", filters.category);
    }

    if (filters.sourceType && filters.sourceType !== "all") {
      q = q.eq("source_type", filters.sourceType);
    }

    if (topicShowIds) {
      q = q.in("id", topicShowIds);
    }

    const term = filters.q?.trim();
    if (term) {
      const cleaned = cleanSearchTerm(term);
      if (cleaned) {
        const p = `%${cleaned}%`;
        const epIds = await fetchShowIdsFromEpisodeOrShowText(supabase, p, filters, topicSlug);
        const cap = epIds.slice(0, 400);
        if (cap.length) {
          q = q.or(`title.ilike.${p},summary.ilike.${p},host.ilike.${p},description.ilike.${p},id.in.(${cap.join(",")})`);
        } else {
          q = q.or(`title.ilike.${p},summary.ilike.${p},host.ilike.${p},description.ilike.${p}`);
        }
      }
    }

    const { data, error } = await q;
    if (error) {
      logQueryError("exploreShows", error);
      return [];
    }
    if (!data) return [];

    let rows = data as (ShowRow & { episodes?: { count: number }[] })[];
    if (!term && !filters.category && (!filters.sourceType || filters.sourceType === "all") && meatyMin == null) {
      rows = [...rows].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return rows.map(mapShowWithCount);
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("exploreShows", e);
    return [];
  }
}

/** Episodes whose `topic_tags` array contains the slug (e.g. end-times). Newest first. */
export async function getEpisodesByTopicTag(
  tagSlug: string,
  limit = 80
): Promise<{ episodes: EpisodeWithShow[]; dataOk: boolean }> {
  const clean = normalizeTopicSlug(tagSlug);
  if (!clean) return { episodes: [], dataOk: true };

  if (!hasPublicSupabaseEnv()) return { episodes: [], dataOk: false };

  const supabase = await createClient();
  if (!supabase) return { episodes: [], dataOk: false };

  try {
    const { data, error } = await supabase
      .from("episodes")
      .select("*, show:shows!inner(slug,title,host,artwork_url,category,official_url)")
      .contains("topic_tags", [clean])
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      logQueryError(`getEpisodesByTopicTag:${clean}`, error);
      return { episodes: [], dataOk: false };
    }
    if (!data) return { episodes: [], dataOk: true };
    return { episodes: data as EpisodeWithShow[], dataOk: true };
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError(`getEpisodesByTopicTag:${clean}`, e);
    return { episodes: [], dataOk: false };
  }
}

export async function countEpisodesByTopicTag(tagSlug: string): Promise<number> {
  const clean = normalizeTopicSlug(tagSlug);
  if (!clean) return 0;

  if (!hasPublicSupabaseEnv()) return 0;

  const supabase = await createClient();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from("episodes")
      .select("id", { count: "exact", head: true })
      .contains("topic_tags", [clean]);

    if (error) {
      logQueryError(`countEpisodesByTopicTag:${clean}`, error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError(`countEpisodesByTopicTag:${clean}`, e);
    return 0;
  }
}

export async function exploreEpisodes(filters: ExploreFilters): Promise<EpisodeWithShow[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const topicSlug = resolveExploreTopicSlug(filters);

    let showIds: string[] | null = null;
    if (filters.category && isCategoryKey(filters.category)) {
      const { data: showsInCat, error: catErr } = await supabase.from("shows").select("id").eq("category", filters.category);
      if (catErr) {
        logQueryError("exploreEpisodes:categoryShows", catErr);
        return [];
      }
      showIds = (showsInCat ?? []).map((s) => s.id as string);
      if (!showIds.length) return [];
    }

    const meatyMin = filters.meatyMin;
    const sourceType = filters.sourceType;

    const episodeSelect =
      "*, show:shows!inner(slug,title,host,artwork_url,category,official_url,summary,description,tags)";

    /* Supabase builder type changes after each filter; keep this helper local. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST chain is too polymorphic to name here.
    function applyEpisodeFilters(base: any): any {
      let q = base;
      if (showIds) q = q.in("show_id", showIds);
      if (typeof meatyMin === "number" && !Number.isNaN(meatyMin)) {
        q = q.gte("meaty_score", meatyMin);
      }
      if (sourceType && sourceType !== "all") {
        q = q.eq("source_type", sourceType);
      }
      if (topicSlug) {
        q = q.contains("topic_tags", [topicSlug]);
      }
      return q;
    }

    const term = filters.q?.trim();
    if (!term) {
      const q = applyEpisodeFilters(
        supabase.from("episodes").select(episodeSelect).order("published_at", { ascending: false, nullsFirst: false })
      ).limit(120);
      const { data, error } = await q;
      if (error) {
        logQueryError("exploreEpisodes", error);
        return [];
      }
      if (!data) return [];
      return (data as EpisodeWithShow[]).slice(0, 80);
    }

    const cleaned = cleanSearchTerm(term);
    if (!cleaned) {
      const q = applyEpisodeFilters(
        supabase.from("episodes").select(episodeSelect).order("published_at", { ascending: false, nullsFirst: false })
      ).limit(120);
      const { data, error } = await q;
      if (error) {
        logQueryError("exploreEpisodes", error);
        return [];
      }
      if (!data) return [];
      return (data as EpisodeWithShow[]).slice(0, 80);
    }

    const p = `%${cleaned}%`;
    const merged = new Map<string, EpisodeWithShow>();

    const qText = applyEpisodeFilters(
      supabase.from("episodes").select(episodeSelect).order("published_at", { ascending: false, nullsFirst: false })
    ).or(
      `title.ilike.${p},description.ilike.${p},show.title.ilike.${p},show.host.ilike.${p},show.summary.ilike.${p},show.description.ilike.${p}`
    );

    const { data: d1, error: e1 } = await qText.limit(120);
    if (e1) {
      logQueryError("exploreEpisodes:text", e1);
      return [];
    }
    for (const row of d1 ?? []) merged.set(row.id, row as EpisodeWithShow);

    if (!topicSlug) {
      const dictSlug =
        getTopicDefinition(normalizeTopicSlug(cleaned))?.slug ??
        getTopicDefinition(normalizeTopicSlug(cleaned.replace(/\s+/g, "-")))?.slug;
      if (dictSlug) {
        const qTag = applyEpisodeFilters(
          supabase.from("episodes").select(episodeSelect).order("published_at", { ascending: false, nullsFirst: false })
        ).contains("topic_tags", [dictSlug]);
        const { data: d2, error: e2 } = await qTag.limit(120);
        if (e2) logQueryError("exploreEpisodes:topicTag", e2);
        else for (const row of d2 ?? []) merged.set(row.id, row as EpisodeWithShow);
      }
    }

    const firstWord = cleaned.split(/\s+/).find((w) => w.length >= 3);
    if (firstWord) {
      const token = firstWord.toLowerCase();
      const tryTags = async (tagVal: string) => {
        const qt = applyEpisodeFilters(
          supabase.from("episodes").select(episodeSelect).order("published_at", { ascending: false, nullsFirst: false })
        ).contains("show.tags", [tagVal]);
        const { data: dT, error: eT } = await qt.limit(80);
        if (eT) logQueryError("exploreEpisodes:tags", eT);
        else for (const row of dT ?? []) merged.set(row.id, row as EpisodeWithShow);
      };
      await tryTags(token);
      const cap = token.charAt(0).toUpperCase() + token.slice(1);
      if (cap !== token) await tryTags(cap);
    }

    return Array.from(merged.values())
      .sort((a, b) => {
        const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
        const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 80);
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("exploreEpisodes", e);
    return [];
  }
}

/** dataOk: false means DB/network error — show “temporarily unavailable”, not 404. */
export async function getShowBySlug(slug: string): Promise<{
  show: ShowRow | null;
  episodes: EpisodeRow[];
  dataOk: boolean;
}> {
  const clean = typeof slug === "string" ? slug.trim() : "";
  if (!clean) return { show: null, episodes: [], dataOk: true };

  if (!hasPublicSupabaseEnv()) return { show: null, episodes: [], dataOk: false };

  const supabase = await createClient();
  if (!supabase) return { show: null, episodes: [], dataOk: false };

  try {
    const { data: show, error } = await supabase.from("shows").select("*").eq("slug", clean).maybeSingle();

    if (error) {
      logQueryError(`getShowBySlug:${clean}`, error);
      return { show: null, episodes: [], dataOk: false };
    }

    if (!show) return { show: null, episodes: [], dataOk: true };

    const { data: episodes, error: epErr } = await supabase
      .from("episodes")
      .select("*")
      .eq("show_id", show.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(120);

    if (epErr) {
      logQueryError(`getShowBySlug:episodes:${clean}`, epErr);
      return { show: show as ShowRow, episodes: [], dataOk: true };
    }

    return { show: show as ShowRow, episodes: (episodes ?? []) as EpisodeRow[], dataOk: true };
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError(`getShowBySlug:${clean}`, e);
    return { show: null, episodes: [], dataOk: false };
  }
}

export async function getEpisodeById(id: string): Promise<{
  episode: EpisodeWithShow | null;
  dataOk: boolean;
}> {
  const clean = typeof id === "string" ? id.trim() : "";
  if (!clean) return { episode: null, dataOk: true };

  if (!hasPublicSupabaseEnv()) return { episode: null, dataOk: false };

  const supabase = await createClient();
  if (!supabase) return { episode: null, dataOk: false };

  try {
    const { data, error } = await supabase
      .from("episodes")
      .select("*, show:shows(slug,title,host,artwork_url,category,official_url)")
      .eq("id", clean)
      .maybeSingle();

    if (error) {
      logQueryError(`getEpisodeById:${clean}`, error);
      return { episode: null, dataOk: false };
    }

    if (!data) return { episode: null, dataOk: true };

    return { episode: data as EpisodeWithShow, dataOk: true };
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError(`getEpisodeById:${clean}`, e);
    return { episode: null, dataOk: false };
  }
}

export async function getFavoriteEpisodeIds(userId: string): Promise<string[]> {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("favorites").select("episode_id").eq("user_id", userId);
    if (error) {
      logQueryError("getFavoriteEpisodeIds", error);
      return [];
    }
    return (data ?? []).map((r) => r.episode_id as string);
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getFavoriteEpisodeIds", e);
    return [];
  }
}

export async function getSavedShowIds(userId: string): Promise<string[]> {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("saved_shows").select("show_id").eq("user_id", userId);
    if (error) {
      logQueryError("getSavedShowIds", error);
      return [];
    }
    return (data ?? []).map((r) => r.show_id as string);
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getSavedShowIds", e);
    return [];
  }
}

export type LibraryFavoriteRow = {
  created_at: string;
  episode: EpisodeWithShow | null;
};

export async function getLibraryFavorites(userId: string): Promise<LibraryFavoriteRow[]> {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("created_at, episode:episodes(*, show:shows(slug,title,host,artwork_url,category,official_url))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logQueryError("getLibraryFavorites", error);
      return [];
    }
    return (data ?? []) as unknown as LibraryFavoriteRow[];
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getLibraryFavorites", e);
    return [];
  }
}

export async function getLibrarySavedShows(userId: string) {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("saved_shows")
      .select("created_at, show:shows(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logQueryError("getLibrarySavedShows", error);
      return [];
    }
    return data ?? [];
  } catch (e) {
    rethrowIfDynamic(e);
    logQueryError("getLibrarySavedShows", e);
    return [];
  }
}
