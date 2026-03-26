"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

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
      try {
        const res = await fetch("/api/premium-waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, source: "join_page" }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };
        if (!res.ok) {
          setStatus("error");
          setMessage(body.error ?? "Something went wrong. Try again later.");
          return;
        }
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
      <div className="space-y-6 transition-opacity duration-500" role="status" aria-live="polite">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent shadow-[0_0_40px_-12px_rgba(212,175,55,0.45)]">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold text-white">You&apos;re on the list.</p>
          <p className="text-sm leading-relaxed text-muted">
            We&apos;ll email you when Premium news, new study tools, or a meaningful library update is ready—nothing filler.
          </p>
          <p className="text-sm text-amber-200/85">
            Taking you home{countdown != null && countdown > 0 ? ` in ${countdown}s…` : "…"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={"/" as Route}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-5">
      <label className="block">
        <span className="sr-only">Email address</span>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/45"
            aria-hidden
          />
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-line/85 bg-soft/25 py-3.5 pl-11 pr-4 text-sm text-white outline-none ring-accent/25 placeholder:text-slate-500 focus:border-accent/35 focus:ring-2"
          />
        </div>
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
            Saving…
          </>
        ) : (
          "Keep me posted"
        )}
      </button>
    </form>
  );
}
