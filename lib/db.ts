import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseUrl, getServiceRoleKey } from "@/lib/env";

/**
 * Service-role client for ingestion and server-only operations. Bypasses RLS.
 * Returns null when URL or service key is missing (never throws).
 */
export function createServiceClient(): SupabaseClient | null {
  const url = getPublicSupabaseUrl();
  const key = getServiceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
