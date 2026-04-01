"use client";

import { createClient } from "@/lib/supabase/client";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { safeInternalNext } from "@/lib/nav-utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginFormFields({ authAvailable }: { authAvailable: boolean }) {
  const searchParams = useSearchParams();
  const next = safeInternalNext(searchParams.get("next"), "/library");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [localReason] = useState(() => searchParams.get("reason"));
  const [loading, setLoading] = useState(false);

  if (!authAvailable) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm leading-7 text-amber-100/90">
        <p className="font-medium text-white">Sign-in temporarily unavailable</p>
        <p className="mt-2 text-muted">
          Add <code className="rounded bg-soft px-1 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-soft px-1 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment, then restart the dev
          server. The rest of the site stays readable without them.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setMessage("Auth client could not start. Check Supabase environment variables.");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.session) {
      setMessage("Sign-in succeeded but no session was stored. Check that cookies are enabled for this site.");
      return;
    }

    trackFunnelEvent("auth_login_complete");
    // Full navigation commits auth cookies before RSC runs (avoids "signed in but header still guest" races).
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      {localReason === "save" ? (
        <p className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-amber-100/90">
          Sign in to save favorites and shows. We&apos;ll bring you right back.
        </p>
      ) : null}
      <label className="grid gap-2 text-sm text-muted">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-line bg-soft/50 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          autoComplete="email"
        />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-line bg-soft/50 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          autoComplete="current-password"
        />
      </label>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function LoginForm({ authAvailable = true }: { authAvailable?: boolean }) {
  return (
    <Suspense
      fallback={<div className="mt-8 h-48 animate-pulse rounded-2xl border border-line bg-soft/20" aria-hidden />}
    >
      <LoginFormFields authAvailable={authAvailable} />
    </Suspense>
  );
}
