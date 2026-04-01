"use client";

import { createClient } from "@/lib/supabase/client";
import { getPublicSiteUrl, normalizeSiteUrlBase } from "@/lib/env";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function SignupFormFields({
  authAvailable,
  nextHref,
}: {
  authAvailable: boolean;
  nextHref: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authAvailable) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm leading-7 text-amber-100/90">
        <p className="font-medium text-white">Accounts not available yet</p>
        <p className="mt-2 text-muted">
          Configure <code className="rounded bg-soft px-1 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-soft px-1 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> first. You can still explore the public
          directory.
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

    const configuredSite = getPublicSiteUrl();
    const site =
      configuredSite ??
      (typeof window !== "undefined" ? normalizeSiteUrlBase(window.location.origin) : undefined);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: site ? `${site}/auth/callback?next=${encodeURIComponent(nextHref)}` : undefined,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      // Same pattern as password login: full navigation commits cookies before RSC reads session.
      window.location.assign(nextHref);
      return;
    }

    setMessage("If your project requires email confirmation, check your inbox. Otherwise you can sign in now.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm text-muted">
        Display name
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-2xl border border-line bg-soft/50 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          autoComplete="name"
        />
      </label>
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-line bg-soft/50 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          autoComplete="new-password"
        />
      </label>
      {message ? <p className="text-sm text-amber-100/90">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

export function SignupForm({
  authAvailable = true,
  nextHref = "/library",
}: {
  authAvailable?: boolean;
  /** Post-signup redirect when the project returns a session immediately (no email confirm gate). */
  nextHref?: string;
}) {
  return (
    <Suspense
      fallback={<div className="mt-8 h-56 animate-pulse rounded-2xl border border-line bg-soft/20" aria-hidden />}
    >
      <SignupFormFields authAvailable={authAvailable} nextHref={nextHref} />
    </Suspense>
  );
}
