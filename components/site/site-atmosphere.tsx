import type { CSSProperties } from "react";
import Image from "next/image";

/**
 * Sitewide cinematic atmosphere: one shared `next/image` layer + gradients (no per-page duplicates).
 *
 * - **Fixed, not `background-attachment: fixed`** — avoids iOS Safari jitter with scrolling content.
 * - **Image:** `public/atmosphere/site-cinematic-bg.webp` (prebuild) or `NEXT_PUBLIC_SITE_ATMOSPHERE_IMAGE`.
 *
 * Stacking: `z-0` under `app/layout`’s `relative z-10` shell. Parallax: `--dwa-atmosphere-parallax-y` on `.dwa-site-atmosphere`.
 */
const ATMOSPHERE_SRC =
  process.env.NEXT_PUBLIC_SITE_ATMOSPHERE_IMAGE?.trim() || "/atmosphere/site-cinematic-bg.webp";

export function SiteAtmosphere() {
  return (
    <div
      aria-hidden
      className="dwa-site-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={
        {
          ["--dwa-atmosphere-parallax-y"]: "0px",
        } as CSSProperties
      }
    >
      {/* Fallback base (covers load / 404) */}
      <div className="absolute inset-0 bg-[#0a0d10]" />

      {/* Photo layer: slight overscan + light blur (lighter on mobile for perf) */}
      <div
        className="absolute inset-0 will-change-auto motion-reduce:will-change-auto md:will-change-transform"
        style={{ transform: "translate3d(0, var(--dwa-atmosphere-parallax-y, 0px), 0)" }}
      >
        <div className="absolute left-1/2 top-1/2 h-[108%] w-[108%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-full w-full blur-[1.5px] motion-reduce:blur-none sm:blur-[2.5px] md:blur-[4px]">
            <Image
              src={ATMOSPHERE_SRC}
              alt=""
              fill
              sizes="100vw"
              quality={62}
              priority={false}
              className="object-cover object-[center_32%]"
            />
          </div>
        </div>
      </div>

      {/* Readability wash — lighter than before so the photo stays felt, not buried */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d10]/72 via-[#0a0d10]/38 to-[#0a0d10]/82" />

      {/* Soft radial glow — focal warmth without flattening the scene */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_50%_36%,rgba(212,175,55,0.09),transparent_72%)]" />

      {/* Residual warmth from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_125%_58%_at_50%-20%,rgba(175,130,75,0.06),transparent_52%)]" />

      {/* Depth at sides — subtle; heavy sides read as a “solid wall” */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_75%_at_0%_45%,rgba(12,14,20,0.22),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_75%_at_100%_40%,rgba(10,12,18,0.24),transparent_58%)]" />

      {/* Vignette — frames content without eating the Bible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(4,6,9,0.52)_100%)]" />

      {/* Very subtle dust — hidden for reduced motion */}
      <div className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        <span
          className="absolute left-[10%] top-[26%] h-1 w-1 rounded-full bg-amber-100/20 blur-[0.5px] motion-safe:animate-dwa-drift"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute left-[78%] top-[32%] h-0.5 w-0.5 rounded-full bg-amber-50/25 blur-[0.5px] motion-safe:animate-dwa-drift-slow"
          style={{ animationDelay: "-4s" }}
        />
        <span
          className="absolute left-[56%] top-[18%] h-0.5 w-0.5 rounded-full bg-white/15 blur-[0.5px] motion-safe:animate-dwa-drift"
          style={{ animationDelay: "-9s" }}
        />
        <span
          className="absolute left-[34%] top-[44%] h-1 w-1 rounded-full bg-amber-200/15 blur-[1.5px] motion-safe:animate-dwa-drift-slow"
          style={{ animationDelay: "-2s" }}
        />
      </div>

      {/* Granular calm (CSS noise) — toned down vs. busy UI */}
      <div
        className="absolute inset-0 opacity-[0.028] mix-blend-overlay motion-reduce:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
