import type { ReactNode } from "react";
import { BibleNarrationProvider } from "@/components/bible/bible-narration-context";
import { BibleRouteAudioDock } from "@/components/bible/bible-route-audio-dock";

/**
 * Isolates Bible routes above the cinematic atmosphere so chrome + breadcrumbs
 * stay legible; reading shell inside pages remains warm paper + dark text.
 * Bible narration audio is mounted once here so it survives navigations within `/bible/*`.
 */
export default function BibleLayout({ children }: { children: ReactNode }) {
  return (
    <BibleNarrationProvider>
      <div className="relative z-[1] isolate">{children}</div>
      <BibleRouteAudioDock />
    </BibleNarrationProvider>
  );
}
