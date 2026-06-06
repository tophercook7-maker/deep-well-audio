import type { SupabaseClient } from "@supabase/supabase-js";
import {
  filterEpisodesExcludingRetired,
  sortEpisodesForFeaturedPool,
} from "@/lib/content-lifecycle";
import { getCatalogSessionTimeoutHours } from "@/lib/env";
import { isStableCatalogShowSlug } from "@/lib/stable-catalog-shows";
import type { EpisodeWithShow } from "@/lib/types";

export type CatalogCycleStatus = "active" | "staged" | "superseded";

export type CatalogCycleRow = {
  id: string;
  status: CatalogCycleStatus;
  created_at: string;
  promoted_at: string | null;
  last_synced_at: string | null;
  last_cycled_at: string | null;
};

export type MemberListeningSessionRow = {
  id: string;
  user_id: string;
  cycle_id: string;
  status: "active" | "finished" | "expired";
  started_at: string;
  last_active_at: string;
  finished_at: string | null;
  last_episode_id: string | null;
};

export type CatalogCyclePromotionResult = {
  stagedCycleId: string | null;
  activeCycleId: string | null;
  promoted: boolean;
  promotionBlockedBySessions: number;
  expiredSessions: number;
  snapshotEpisodeCount: number;
  reason?: string;
};

export type CatalogCycleViewerContext = {
  visibleCycleId: string | null;
  activeCycleId: string | null;
  pinnedToOlderCycle: boolean;
};

/** Episodes in the featured/home rotation snapshot for a staged rebuild. */
export const CATALOG_CYCLE_SNAPSHOT_POOL = 500;
export const CATALOG_CYCLE_SNAPSHOT_SIZE = 120;

export type MemberSessionAction = "start" | "heartbeat" | "finish";

function nowIso(): string {
  return new Date().toISOString();
}

export function getCatalogSessionTimeoutMs(): number {
  const hours = getCatalogSessionTimeoutHours();
  return hours * 60 * 60 * 1000;
}

export async function getActiveCycle(
  supabase: SupabaseClient
): Promise<CatalogCycleRow | null> {
  const { data, error } = await supabase
    .from("catalog_cycles")
    .select("id, status, created_at, promoted_at, last_synced_at, last_cycled_at")
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("catalog-cycles:getActiveCycle", error.message);
    return null;
  }
  return (data as CatalogCycleRow | null) ?? null;
}

export async function getStagedCycle(
  supabase: SupabaseClient
): Promise<CatalogCycleRow | null> {
  const { data, error } = await supabase
    .from("catalog_cycles")
    .select("id, status, created_at, promoted_at, last_synced_at, last_cycled_at")
    .eq("status", "staged")
    .maybeSingle();
  if (error) {
    console.error("catalog-cycles:getStagedCycle", error.message);
    return null;
  }
  return (data as CatalogCycleRow | null) ?? null;
}

export async function ensureStagedCycle(supabase: SupabaseClient): Promise<string> {
  const existing = await getStagedCycle(supabase);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("catalog_cycles")
    .insert({ status: "staged" })
    .select("id")
    .single();

  if (error || !data?.id) {
    const retry = await getStagedCycle(supabase);
    if (retry) return retry.id;
    throw new Error(error?.message ?? "Could not create staged catalog cycle");
  }

  return data.id as string;
}

export async function loadCycleEpisodeIds(
  supabase: SupabaseClient,
  cycleId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalog_cycle_episodes")
    .select("episode_id")
    .eq("cycle_id", cycleId)
    .order("position", { ascending: true });

  if (error) {
    console.error("catalog-cycles:loadCycleEpisodeIds", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.episode_id as string);
}

export async function countBlockingSessionsForCycle(
  supabase: SupabaseClient,
  cycleId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("member_listening_sessions")
    .select("*", { count: "exact", head: true })
    .eq("cycle_id", cycleId)
    .eq("status", "active");

  if (error) {
    console.error("catalog-cycles:countBlockingSessionsForCycle", error.message);
    return 0;
  }

  return count ?? 0;
}

/** Mark abandoned active sessions past the configured timeout as expired. */
export async function expireStaleMemberSessions(supabase: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - getCatalogSessionTimeoutMs()).toISOString();
  const { data, error } = await supabase
    .from("member_listening_sessions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("last_active_at", cutoff)
    .select("id");

  if (error) {
    console.error("catalog-cycles:expireStaleMemberSessions", error.message);
    return 0;
  }

  return data?.length ?? 0;
}

async function fetchFeaturedPoolCandidates(
  supabase: SupabaseClient
): Promise<EpisodeWithShow[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select(
      "*, show:shows!inner(slug,title,host,summary,description,artwork_url,category,official_url,tags,is_active)"
    )
    .neq("lifecycle_status", "retired")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(CATALOG_CYCLE_SNAPSHOT_POOL);

  if (error) {
    console.error("catalog-cycles:fetchFeaturedPoolCandidates", error.message);
    return [];
  }

  const rows = filterEpisodesExcludingRetired((data ?? []) as EpisodeWithShow[]).filter(
    (ep) => !isStableCatalogShowSlug(ep.show?.slug)
  );
  return sortEpisodesForFeaturedPool(rows).slice(0, CATALOG_CYCLE_SNAPSHOT_SIZE);
}

/** Rebuild the staged cycle snapshot from the current catalog (post-sync). */
export async function rebuildStagedCycleSnapshot(supabase: SupabaseClient): Promise<{
  stagedCycleId: string;
  snapshotEpisodeCount: number;
}> {
  const stagedCycleId = await ensureStagedCycle(supabase);
  const episodes = await fetchFeaturedPoolCandidates(supabase);

  const { error: delErr } = await supabase
    .from("catalog_cycle_episodes")
    .delete()
    .eq("cycle_id", stagedCycleId);

  if (delErr) {
    console.error("catalog-cycles:rebuildStagedCycleSnapshot:delete", delErr.message);
    throw new Error(`Could not clear staged cycle episodes: ${delErr.message}`);
  }

  if (episodes.length > 0) {
    const rows = episodes.map((ep, index) => ({
      cycle_id: stagedCycleId,
      episode_id: ep.id,
      position: index,
    }));

    const { error: insErr } = await supabase.from("catalog_cycle_episodes").insert(rows);
    if (insErr) {
      console.error("catalog-cycles:rebuildStagedCycleSnapshot:insert", insErr.message);
      throw new Error(`Could not write staged cycle episodes: ${insErr.message}`);
    }
  }

  const syncedAt = nowIso();
  await supabase
    .from("catalog_cycles")
    .update({ last_synced_at: syncedAt })
    .eq("id", stagedCycleId);

  return { stagedCycleId, snapshotEpisodeCount: episodes.length };
}

async function promoteStagedToActive(supabase: SupabaseClient, stagedId: string): Promise<string> {
  const active = await getActiveCycle(supabase);
  const promotedAt = nowIso();

  if (active) {
    const { error } = await supabase
      .from("catalog_cycles")
      .update({ status: "superseded" })
      .eq("id", active.id);
    if (error) throw new Error(`Could not supersede active cycle: ${error.message}`);
  }

  const { error: promoteErr } = await supabase
    .from("catalog_cycles")
    .update({
      status: "active",
      promoted_at: promotedAt,
      last_cycled_at: promotedAt,
    })
    .eq("id", stagedId);

  if (promoteErr) throw new Error(`Could not promote staged cycle: ${promoteErr.message}`);

  const { error: newStagedErr } = await supabase.from("catalog_cycles").insert({ status: "staged" });
  if (newStagedErr) {
    console.warn("catalog-cycles:promoteStagedToActive:newStaged", newStagedErr.message);
  }

  return stagedId;
}

/**
 * Promote staged → active when no signed-in member has an unfinished session on the current active cycle.
 * First-ever sync promotes immediately when no active cycle exists.
 */
export async function tryPromoteStagedCycle(supabase: SupabaseClient): Promise<{
  promoted: boolean;
  activeCycleId: string | null;
  promotionBlockedBySessions: number;
  reason?: string;
}> {
  const staged = await getStagedCycle(supabase);
  if (!staged) {
    return {
      promoted: false,
      activeCycleId: (await getActiveCycle(supabase))?.id ?? null,
      promotionBlockedBySessions: 0,
      reason: "no_staged_cycle",
    };
  }

  const { count: snapshotCount } = await supabase
    .from("catalog_cycle_episodes")
    .select("*", { count: "exact", head: true })
    .eq("cycle_id", staged.id);

  if (!snapshotCount) {
    return {
      promoted: false,
      activeCycleId: (await getActiveCycle(supabase))?.id ?? null,
      promotionBlockedBySessions: 0,
      reason: "staged_snapshot_empty",
    };
  }

  const active = await getActiveCycle(supabase);
  if (active) {
    const blocking = await countBlockingSessionsForCycle(supabase, active.id);
    if (blocking > 0) {
      return {
        promoted: false,
        activeCycleId: active.id,
        promotionBlockedBySessions: blocking,
        reason: "active_member_sessions",
      };
    }
  }

  const newActiveId = await promoteStagedToActive(supabase, staged.id);
  return {
    promoted: true,
    activeCycleId: newActiveId,
    promotionBlockedBySessions: 0,
  };
}

/** Expire stale sessions, rebuild staged snapshot, attempt promotion. */
export async function runPostSyncCyclePipeline(
  supabase: SupabaseClient
): Promise<CatalogCyclePromotionResult> {
  const expiredSessions = await expireStaleMemberSessions(supabase);
  const { stagedCycleId, snapshotEpisodeCount } = await rebuildStagedCycleSnapshot(supabase);
  const promotion = await tryPromoteStagedCycle(supabase);

  return {
    stagedCycleId,
    activeCycleId: promotion.activeCycleId,
    promoted: promotion.promoted,
    promotionBlockedBySessions: promotion.promotionBlockedBySessions,
    expiredSessions,
    snapshotEpisodeCount,
    reason: promotion.reason,
  };
}

export async function getActiveMemberSession(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberListeningSessionRow | null> {
  const { data, error } = await supabase
    .from("member_listening_sessions")
    .select(
      "id, user_id, cycle_id, status, started_at, last_active_at, finished_at, last_episode_id"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("catalog-cycles:getActiveMemberSession", error.message);
    return null;
  }

  return (data as MemberListeningSessionRow | null) ?? null;
}

/** Which catalog cycle browse/home surfaces should use for this viewer. */
export async function resolveCatalogCycleForViewer(
  supabase: SupabaseClient,
  userId: string | null
): Promise<CatalogCycleViewerContext> {
  const active = await getActiveCycle(supabase);
  const activeCycleId = active?.id ?? null;

  if (!userId) {
    return { visibleCycleId: activeCycleId, activeCycleId, pinnedToOlderCycle: false };
  }

  const session = await getActiveMemberSession(supabase, userId);
  if (session) {
    return {
      visibleCycleId: session.cycle_id,
      activeCycleId,
      pinnedToOlderCycle: Boolean(activeCycleId && session.cycle_id !== activeCycleId),
    };
  }

  return { visibleCycleId: activeCycleId, activeCycleId, pinnedToOlderCycle: false };
}

export async function touchMemberListeningSession(
  supabase: SupabaseClient,
  userId: string,
  action: MemberSessionAction,
  episodeId?: string | null
): Promise<{ ok: boolean; cycleId: string | null; error?: string }> {
  const activeCycle = await getActiveCycle(supabase);
  const activeCycleId = activeCycle?.id ?? null;

  if (action === "finish") {
    const session = await getActiveMemberSession(supabase, userId);
    if (!session) return { ok: true, cycleId: null };
    const { error } = await supabase
      .from("member_listening_sessions")
      .update({ status: "finished", finished_at: nowIso(), last_active_at: nowIso() })
      .eq("id", session.id);
    if (error) return { ok: false, cycleId: session.cycle_id, error: error.message };
    return { ok: true, cycleId: session.cycle_id };
  }

  const existing = await getActiveMemberSession(supabase, userId);
  const ts = nowIso();

  if (existing) {
    const patch: Record<string, unknown> = { last_active_at: ts };
    if (episodeId) patch.last_episode_id = episodeId;
    const { error } = await supabase
      .from("member_listening_sessions")
      .update(patch)
      .eq("id", existing.id);
    if (error) return { ok: false, cycleId: existing.cycle_id, error: error.message };
    return { ok: true, cycleId: existing.cycle_id };
  }

  if (action === "heartbeat") {
    return { ok: true, cycleId: activeCycleId };
  }

  if (!activeCycleId) {
    return { ok: true, cycleId: null };
  }

  const { error } = await supabase.from("member_listening_sessions").insert({
    user_id: userId,
    cycle_id: activeCycleId,
    status: "active",
    started_at: ts,
    last_active_at: ts,
    last_episode_id: episodeId ?? null,
  });

  if (error) {
    const raced = await getActiveMemberSession(supabase, userId);
    if (raced) {
      const patch: Record<string, unknown> = { last_active_at: ts };
      if (episodeId) patch.last_episode_id = episodeId;
      const { error: updateErr } = await supabase
        .from("member_listening_sessions")
        .update(patch)
        .eq("id", raced.id);
      if (updateErr) return { ok: false, cycleId: raced.cycle_id, error: updateErr.message };
      return { ok: true, cycleId: raced.cycle_id };
    }
    return { ok: false, cycleId: null, error: error.message };
  }

  return { ok: true, cycleId: activeCycleId };
}
