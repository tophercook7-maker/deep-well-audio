"use client";

import { useCallback, useRef, useState } from "react";

type Interval = "monthly" | "yearly";

type Props = {
  interval: Interval;
  children: React.ReactNode;
  className?: string;
  /** Visually disabled when billing env is incomplete (avoid dead clicks in dev). */
  disabled?: boolean;
};

export function StartCheckoutButton({ interval, children, className, disabled = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const onClick = useCallback(async () => {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: interval }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [disabled, interval]);

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error ? <span className="text-xs text-amber-200/90">{error}</span> : null}
    </span>
  );
}
