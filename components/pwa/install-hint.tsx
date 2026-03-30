"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

const STORAGE_KEY = "deep-well-audio-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallHint() {
  const [dismissed, setDismissed] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setDeferred(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user dismissed system UI */
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  if (!hydrated || dismissed || !deferred) return null;

  return (
    <div
      className="border-t border-line/60 bg-panel/95 px-4 py-2 text-center shadow-[0_-4px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm"
      role="region"
      aria-label="Install app"
    >
      <div className="container-shell mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row sm:items-center sm:gap-5">
        <DeepWellLogo variant="compact" className="shrink-0" />
        <p className="text-xs text-slate-400 sm:text-left">
          Install for a focused, app-like window on this device—same catalog, calmer chrome.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-amber-100 ring-1 ring-accent/30 transition hover:bg-accent/25"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            aria-label="Dismiss install suggestion"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
