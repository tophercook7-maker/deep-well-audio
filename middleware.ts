import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const supabaseUrl = getPublicSupabaseUrl();
  const supabaseAnonKey = getPublicSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
