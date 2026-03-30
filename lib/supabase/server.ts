import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export async function createClient(): Promise<SupabaseClient | null> {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookieOptions: getSupabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* ignore when called from Server Component without mutable cookies */
        }
      },
    },
  });
}
