import { getSessionUser } from "@/lib/auth";
import { resolveCatalogCycleForViewer, type CatalogCycleViewerContext } from "@/lib/catalog-cycles";
import { createClient } from "@/lib/supabase/server";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

const EMPTY_CONTEXT: CatalogCycleViewerContext = {
  visibleCycleId: null,
  activeCycleId: null,
  pinnedToOlderCycle: false,
};

/** Server-side catalog cycle for the current request (guests → active cycle). */
export async function getCatalogCycleContextForRequest(): Promise<CatalogCycleViewerContext> {
  try {
    const [user, supabase] = await Promise.all([getSessionUser(), createClient()]);
    if (!supabase) return EMPTY_CONTEXT;
    return resolveCatalogCycleForViewer(supabase, user?.id ?? null);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("catalog-cycle-context:", e instanceof Error ? e.message : e);
    return EMPTY_CONTEXT;
  }
}
