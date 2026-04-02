"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "ok" | "error";

const REDIRECT_MS = 3200;

export function JoinListForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectRef.current) clearTimeout(redirectRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const scheduleRedirect = useCallback(() => {
    if (redirectRef.current) clearTimeout(redirectRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    const end = Date.now() + REDIRECT_MS;
    setCountdown(Math.ceil(REDIRECT_MS / 1000));
    tickRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setCountdown(left || null);
      if (left <= 0 && tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }, 400);
    redirectRef.current = setTimeout(() => {
      router.push("/" as Route);
    }, REDIRECT_MS);
  }, [router]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      const trimmed = email.trim();
      if (!trimmed || !EMAIL_RE.test(trimmed)) {
        setStatus("error");
        setMessage("Please enter a valid email address.");
        return;
      }
      setStatus("loading");
      const source = "join_page";
      try {
        const res = await fetch("/api/premium-waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, source }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };
        if (!res.ok) {
          setStatus("error");
          setMessage(body.error ?? "Something went wrong. Try again later.");
          return;
        }
        trackFunnelEvent("waitlist_submit", { source });
        setStatus("ok");
        setMessage(null);
        setEmail("");
        scheduleRedirect();
      } catch {
        setStatus("error");
        setMessage("Network error. Check your connection and try again.");
      }
    },
    [email, scheduleRedirect]
  );

  if (status === "ok") {
    return (
      <div className="space-y-5 transition-opacity duration-500" role="status" aria-live="polite">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/35 bg-accent/[0.08] text-accent">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-base font-medium leading-relaxed text-white">You&apos;re on the list.</p>
          <p className="text-sm text-slate-300/95">Short updates only, when it matters.</p>
          <p className="text-xs text-amber-200/75">
            Back home{countdown != null && countdown > 0 ? ` in ${countdown}s` : "…"}
          </p>
        </div>
        <div className="flex justify-center pt-1">
          <Link
            href={"/" as Route}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <label className="grid gap-2 text-left">
        <span className="text-xs font-medium text-slate-300/95">Your email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-line/75 bg-soft/20 px-4 py-3.5 text-sm text-white outline-none ring-accent/20 placeholder:text-slate-400/90 focus:border-accent/35 focus:ring-2"
        />
      </label>
      {message ? (
        <p className="text-sm text-amber-200/90" role="alert">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Adding you…
          </>
        ) : (
          "Join the list"
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-slate-400/95">
        One field. No spam. You can leave at any time.
      </p>
    </form>
  );
}
