import { createClient } from "@/lib/supabase/server";
import type { EpisodeRow, EpisodeWithShow, ShowRow, ShowWithMeta } from "@/lib/types";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isCategoryKey } from "@/lib/normalizers";
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
};

export async function exploreShows(filters: ExploreFilters): Promise<ShowWithMeta[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
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

    const term = filters.q?.trim();
    if (term) {
      const cleaned = term.replace(/[%_,]/g, " ").trim();
      if (cleaned) {
        const p = `%${cleaned}%`;
        q = q.or(`title.ilike.${p},summary.ilike.${p},host.ilike.${p}`);
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

export async function exploreEpisodes(filters: ExploreFilters): Promise<EpisodeWithShow[]> {
  if (!hasPublicSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
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

    let q = supabase
      .from("episodes")
      .select("*, show:shows!inner(slug,title,host,artwork_url,category,official_url)")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(120);

    if (showIds) {
      q = q.in("show_id", showIds);
    }

    const meatyMin = filters.meatyMin;
    if (typeof meatyMin === "number" && !Number.isNaN(meatyMin)) {
      q = q.gte("meaty_score", meatyMin);
    }

    if (filters.sourceType && filters.sourceType !== "all") {
      q = q.eq("source_type", filters.sourceType);
    }

    const term = filters.q?.trim();
    if (term) {
      const cleaned = term.replace(/[%_,]/g, " ").trim();
      if (cleaned) {
        const p = `%${cleaned}%`;
        q = q.or(`title.ilike.${p},description.ilike.${p}`);
      }
    }

    const { data, error } = await q;
    if (error) {
      logQueryError("exploreEpisodes", error);
      return [];
    }
    if (!data) return [];
    return (data as EpisodeWithShow[]).slice(0, 80);
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

export async function getLibraryFavorites(userId: string) {
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
    return data ?? [];
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
