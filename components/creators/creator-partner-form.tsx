"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CREATOR_PARTNER_TYPES,
  formatCreatorPartnerInquiryMessage,
  type CreatorPartnerTypeId,
} from "@/lib/creator-partners";

type Props = {
  signedIn: boolean;
  defaultEmail?: string | null;
};

export function CreatorPartnerForm({ signedIn, defaultEmail }: Props) {
  const [partnerType, setPartnerType] = useState<CreatorPartnerTypeId>("podcast");
  const [projectName, setProjectName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
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
        const body = formatCreatorPartnerInquiryMessage({
          partnerType,
          projectName,
          linkUrl,
          message,
        });

        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "content",
            message: body,
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
        setProjectName("");
        setLinkUrl("");
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [partnerType, projectName, linkUrl, message, email, pageUrl, userAgent, signedIn]
  );

  if (done) {
    return (
      <div className="rounded-[22px] border border-accent/25 bg-accent/[0.06] p-6 text-center sm:p-8">
        <p className="text-sm font-medium text-amber-100/95">Thanks—we got your note.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          I read every partnership inquiry personally. If it looks like a fit, I will reply with next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      id="partner-inquiry"
      onSubmit={(ev) => void onSubmit(ev)}
      className="rounded-[26px] border border-line/55 bg-[rgba(10,14,20,0.55)] p-6 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="cp-type" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
            What best describes you?
          </label>
          <select
            id="cp-type"
            name="partnerType"
            value={partnerType}
            onChange={(e) => setPartnerType(e.target.value as CreatorPartnerTypeId)}
            className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
            required
          >
            {CREATOR_PARTNER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cp-name" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
            Project or artist name
          </label>
          <input
            id="cp-name"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            maxLength={200}
            placeholder="Your show, band, channel, or studio name"
            className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
          />
        </div>

        <div>
          <label htmlFor="cp-link" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
            Link to your work
          </label>
          <input
            id="cp-link"
            name="linkUrl"
            type="url"
            inputMode="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            maxLength={2048}
            placeholder="Website, YouTube, Spotify, podcast feed…"
            className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
          />
        </div>

        <div>
          <label htmlFor="cp-msg" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
            Partnership pitch
          </label>
          <textarea
            id="cp-msg"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={8000}
            required
            placeholder="What do you create? How would you like to partner—and how could you help Deep Well grow?"
            className="mt-2 w-full resize-y rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
          />
          <p className="mt-1 text-xs text-slate-500">{message.length} / 8000</p>
        </div>

        {!signedIn ? (
          <div>
            <label htmlFor="cp-email" className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
              Email
            </label>
            <input
              id="cp-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
              placeholder="you@example.com"
            />
          </div>
        ) : (
          <p className="text-xs text-muted">
            Signed in as <span className="text-slate-300">{defaultEmail ?? "your account"}</span>.
          </p>
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-amber-200/90">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[14rem]"
      >
        {submitting ? "Sending…" : "Start a conversation"}
      </button>
    </form>
  );
}
