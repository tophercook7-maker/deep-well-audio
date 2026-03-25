import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalNext } from "@/lib/nav-utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeInternalNext(url.searchParams.get("next"), "/library");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin).toString());
  }

  const supabase = await createClient();
  if (!supabase) {
    console.error("auth callback: Supabase client unavailable (check NEXT_PUBLIC_* env)");
    return NextResponse.redirect(new URL("/login?error=setup", url.origin).toString());
  }

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin).toString());
    }
    console.error("auth callback exchangeCodeForSession:", error.message);
  } catch (e) {
    console.error("auth callback:", e instanceof Error ? e.message : e);
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin).toString());
}
