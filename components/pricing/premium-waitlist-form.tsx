"use client";

import { useCallback, useState } from "react";

export function PremiumWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      setStatus("loading");
      try {
        const res = await fetch("/api/premium-waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };
        if (!res.ok) {
          setStatus("error");
          setMessage(body.error ?? "Something went wrong. Try again later.");
          return;
        }
        setStatus("ok");
        setMessage(
          body.duplicate
            ? "You're already on the list — we'll keep you in mind."
            : "Thanks — we'll email you when Premium enrollment opens."
        );
        setEmail("");
      } catch {
        setStatus("error");
        setMessage("Network error. Check your connection and try again.");
      }
    },
    [email]
  );

  if (status === "ok" && message) {
    return (
      <p className="rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm text-slate-200" role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3">
      <label className="block text-sm text-slate-300">
        <span className="sr-only">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-line/80 bg-soft/30 px-4 py-3 text-sm text-white outline-none ring-accent/30 placeholder:text-slate-500 focus:ring-2"
        />
      </label>
      {message ? <p className="text-sm text-amber-200/90">{message}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? "Saving…" : "Notify me"}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        No spam — one-way interest for Premium. Billing is not active; this is not a purchase.
      </p>
    </form>
  );
}
