"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedbackCategory } from "@/lib/feedback-shared";

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "bug", label: "Something broke" },
  { value: "suggestion", label: "Suggestion" },
  { value: "billing", label: "Billing or subscription" },
  { value: "content", label: "Content or catalog" },
  { value: "other", label: "Other" },
];

type Props = {
  /** When signed in, email is optional in the form but API uses account email. */
  signedIn: boolean;
  defaultEmail?: string | null;
};

export function FeedbackForm({ signedIn, defaultEmail }: Props) {
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [pageUrl, setPageUrl] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPageUrl(window.location.href);
    setUserAgent(navigator.userAgent || "");
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            message,
            page_url: pageUrl || null,
            user_agent: userAgent || null,
            ...(signedIn ? {} : { email: email.trim() || null }),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
          return;
        }
        setDone(true);
        setMessage("");
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [category, message, email, pageUrl, userAgent, signedIn]
  );

  if (done) {
    return (
      <div className="card border-accent/25 bg-accent/[0.06] p-6 text-center sm:p-8">
        <p className="text-sm font-medium text-amber-100/95">Thanks — I got your note.</p>
        <p className="mt-2 text-xs text-muted">I read every submission—thank you for taking the time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          I&apos;m on this as fast as lightning—if anything feels broken, confusing, or missing, tell me and I&apos;ll fix it.
        </p>
        <p>You can also tell me what you&apos;d like to see added next.</p>
      </div>
      <form onSubmit={(ev) => void onSubmit(ev)} className="card border-line/80 p-6 sm:p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="fb-cat" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
              Category
            </label>
            <select
              id="fb-cat"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
              required
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fb-msg" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
              Message
            </label>
            <textarea
              id="fb-msg"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={8000}
              required
              placeholder="What happened? What would help?"
              className="mt-2 w-full resize-y rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
            />
            <p className="mt-1 text-xs text-slate-500">{message.length} / 8000</p>
          </div>
          {!signedIn ? (
            <div>
              <label htmlFor="fb-email" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
                Email
              </label>
              <input
                id="fb-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
                placeholder="you@example.com"
              />
              <p className="mt-1 text-xs text-muted">So I can reply if I need to.</p>
            </div>
          ) : (
            <p className="text-xs text-muted">
              Signed in as <span className="text-slate-300">{defaultEmail ?? "your account"}</span> — I&apos;ll use that if I need to follow up.
            </p>
          )}
        </div>
        {error ? <p className="mt-4 text-sm text-amber-200/90">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
