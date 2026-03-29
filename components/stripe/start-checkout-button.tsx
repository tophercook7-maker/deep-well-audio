"use client";

import { useCallback, useRef, useState } from "react";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

type Interval = "monthly" | "yearly";

type Props = {
  interval: Interval;
  children: React.ReactNode;
  className?: string;
  /** Parent-controlled only (e.g. pricing gate). No env checks inside this component. */
  disabled?: boolean;
};

const USER_CHECKOUT_GENERIC =
  "We couldn't open secure checkout right now. Please try again in a moment.";

const USER_CHECKOUT_CONFIG_HINT =
  "If this keeps happening, Stripe may not be fully configured yet—try again later or contact us.";

export function StartCheckoutButton({ interval, children, className, disabled = false }: Props) {
  const isDisabled = disabled;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const busyRef = useRef(false);

  const onClick = useCallback(async () => {
    if (isDisabled || busyRef.current) return;
    trackFunnelEvent("premium_feature_click", { intent: "checkout", interval });
    busyRef.current = true;
    setError(null);
    setErrorHint(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: interval }),
      });
      let data: { url?: string; error?: string } = {};
      try {
        data = (await res.json()) as { url?: string; error?: string };
      } catch {
        data = {};
      }

      if (process.env.NODE_ENV === "development") {
        console.warn("[deep-well:checkout]", { status: res.status, error: data.error ?? null, ok: res.ok });
      }

      if (!res.ok) {
        const serverMsg = typeof data.error === "string" && data.error.length ? data.error : null;
        setError(serverMsg ?? USER_CHECKOUT_GENERIC);
        if (res.status >= 500 || res.status === 502) {
          setErrorHint(USER_CHECKOUT_CONFIG_HINT);
        } else if (res.status === 503) {
          setErrorHint(USER_CHECKOUT_CONFIG_HINT);
        }
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(USER_CHECKOUT_GENERIC);
      setErrorHint(USER_CHECKOUT_CONFIG_HINT);
    } catch {
      setError(USER_CHECKOUT_GENERIC);
      setErrorHint(USER_CHECKOUT_CONFIG_HINT);
      if (process.env.NODE_ENV === "development") {
        console.warn("[deep-well:checkout] network or parse error");
      }
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [isDisabled, interval]);

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={isDisabled}
        className={className}
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error ? (
        <>
          <span className="max-w-md text-xs leading-relaxed text-amber-200/95">{error}</span>
          {errorHint ? <span className="max-w-md text-xs leading-relaxed text-slate-500">{errorHint}</span> : null}
        </>
      ) : null}
    </span>
  );
}
