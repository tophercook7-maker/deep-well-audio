import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteOriginFromRequest } from "@/lib/http/site-origin";
import { safeInternalNext } from "@/lib/nav-utils";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeInternalNext(url.searchParams.get("next"), "/library");
  const origin = getSiteOriginFromRequest(request);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", origin).toString());
  }

  const supabaseUrl = getPublicSupabaseUrl();
  const supabaseAnonKey = getPublicSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("auth callback: Supabase client unavailable (check NEXT_PUBLIC_* env)");
    return NextResponse.redirect(new URL("/login?error=setup", origin).toString());
  }

  const cookieStore = await cookies();
  /** Redirect response created first so `setAll` can mirror cookies onto it (Next.js merges Set-Cookie reliably). */
  const response = NextResponse.redirect(new URL(nextPath, origin).toString());

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getSupabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        } catch (e) {
          console.error("auth callback setAll:", e instanceof Error ? e.message : e);
        }
      },
    },
  });

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("auth callback exchangeCodeForSession:", error.message);
  } catch (e) {
    console.error("auth callback:", e instanceof Error ? e.message : e);
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin).toString());
}
