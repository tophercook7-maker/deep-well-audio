import type { CSSProperties } from "react";
import Image from "next/image";

/**
 * Sitewide cinematic atmosphere: one shared `next/image` layer + gradients (no per-page duplicates).
 *
 * - **Fixed, not `background-attachment: fixed`** — avoids iOS Safari jitter with scrolling content.
 * - **Image:** `public/atmosphere/site-atmosphere.webp` (from `build:atmosphere`, optional source PNG) or `NEXT_PUBLIC_SITE_ATMOSPHERE_IMAGE`.
 *
 * Stacking: `z-0` under `app/layout`’s `relative z-10` shell. Parallax: `--dwa-atmosphere-parallax-y` on `.dwa-site-atmosphere`.
 */
const ATMOSPHERE_SRC =
  process.env.NEXT_PUBLIC_SITE_ATMOSPHERE_IMAGE?.trim() || "/atmosphere/site-atmosphere.webp";

/** Warmth + center lift — kept soft so the photo stays photographic, not a flat glow. */
const WARMTH_LAYERS = [
  "radial-gradient(circle at 50% 40%, rgba(255, 232, 200, 0.065), transparent 52%)",
  "radial-gradient(circle at 50% 44%, rgba(255, 220, 160, 0.042), transparent 58%)",
  "radial-gradient(ellipse 52% 44% at 50% 38%, rgba(212, 175, 55, 0.03), transparent 70%)",
  "radial-gradient(ellipse 125% 58% at 50% -18%, rgba(175, 130, 75, 0.024), transparent 50%)",
].join(",");

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

      {/* Photo layer: parallax wrapper; inner scale-110 + ~1px blur on md+ only */}
      <div
        className="absolute inset-0 will-change-auto motion-reduce:will-change-auto md:will-change-transform"
        style={{ transform: "translate3d(0, var(--dwa-atmosphere-parallax-y, 0px), 0)" }}
      >
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-full w-full origin-center scale-110 blur-none motion-reduce:blur-none md:blur-[1px]">
            <Image
              src={ATMOSPHERE_SRC}
              alt=""
              fill
              sizes="100vw"
              quality={82}
              priority
              fetchPriority="high"
              className="object-cover object-[center_40%]"
            />
          </div>
        </div>
      </div>

      {/* Readability wash — lighter mid band so subject stays literal, not abstract */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/07 to-black/36" />

      {/* Focal warmth + subtle center lift (one composited layer) */}
      <div className="absolute inset-0" style={{ background: WARMTH_LAYERS }} />

      {/* Depth at sides — minimal so hands at edges still read */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_78%_at_0%_48%,rgba(8,10,14,0.1),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_78%_at_100%_46%,rgba(8,10,14,0.11),transparent_62%)]" />

      {/* Vignette — soft edges only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(0,0,0,0.17)_100%)]" />

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
        className="absolute inset-0 opacity-[0.014] mix-blend-overlay motion-reduce:opacity-[0.01]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
