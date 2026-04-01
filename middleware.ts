/**
 * Supabase Auth (SSR): refreshes short-lived access tokens on every matched request.
 *
 * The `setAll` handler must rebuild `NextResponse.next({ request })` before applying `Set-Cookie`
 * on the response; otherwise refreshed cookies never reach the browser and sessions appear to “vanish” on refresh.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export async function middleware(request: NextRequest) {
  const supabaseUrl = getPublicSupabaseUrl();
  const supabaseAnonKey = getPublicSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  /** Must be reassigned whenever cookies change so refreshed tokens are sent to the browser (Supabase SSR pattern). */
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: getSupabaseAuthCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          } catch (e) {
            console.error("[middleware] cookie update skipped", e instanceof Error ? e.message : e);
          }
        },
      },
    });

    await supabase.auth.getUser();
  } catch (e) {
    console.error("[middleware] auth refresh failed", e instanceof Error ? e.message : e);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
