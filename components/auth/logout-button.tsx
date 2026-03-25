"use client";

import { createClient } from "@/lib/supabase/client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function logout() {
    setHint(null);
    const supabase = createClient();
    if (!supabase) {
      setHint("Sign-in isn’t configured.");
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/" as Route);
      router.refresh();
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Could not sign out.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 sm:items-center">
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text disabled:opacity-50"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
      {hint ? <span className="text-[11px] text-amber-200/90">{hint}</span> : null}
    </div>
  );
}
