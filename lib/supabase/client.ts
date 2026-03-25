import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";

export function createClient(): SupabaseClient | null {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
