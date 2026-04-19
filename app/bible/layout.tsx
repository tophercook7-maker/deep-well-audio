import type { ReactNode } from "react";

/**
 * Isolates Bible routes above the cinematic atmosphere so chrome + breadcrumbs
 * stay legible; reading shell inside pages remains warm paper + dark text.
 */
export default function BibleLayout({ children }: { children: ReactNode }) {
  return <div className="relative z-[1] isolate">{children}</div>;
}
