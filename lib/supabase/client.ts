import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient(): SupabaseClient | null {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) return null;
  return createBrowserClient(url, anon, {
    cookieOptions: getSupabaseAuthCookieOptions(),
  });
}
