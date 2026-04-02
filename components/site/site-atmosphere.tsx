import Image from "next/image";

/**
 * Sitewide background: one full-viewport `next/image` layer (fixed; content scrolls above on z-10).
 *
 * - **Fixed** — not `background-attachment: fixed`, so iOS Safari avoids scroll jitter.
 * - **Image:** `public/atmosphere/bible-hands.png`
 */
const ATMOSPHERE_SRC = "/atmosphere/bible-hands.png";

/** Subtle warmth so UI chrome still feels on-brand without painting over the photograph. */
const WARMTH_LAYERS = [
  "radial-gradient(circle at 50% 42%, rgba(255, 232, 200, 0.045), transparent 55%)",
  "radial-gradient(ellipse 52% 44% at 50% 40%, rgba(212, 175, 55, 0.022), transparent 72%)",
].join(",");

export function SiteAtmosphere() {
  return (
    <div aria-hidden className="dwa-site-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0d10]" />

      <div className="absolute inset-0">
        <Image
          src={ATMOSPHERE_SRC}
          alt=""
          fill
          sizes="100vw"
          quality={90}
          priority
          fetchPriority="high"
          className="object-cover object-center"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Light readability wash — photo is already dark; keep mid band open so the book stays the focal read */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="absolute inset-0" style={{ background: WARMTH_LAYERS }} />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_78%_at_0%_48%,rgba(8,10,14,0.04),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_78%_at_100%_46%,rgba(8,10,14,0.04),transparent_62%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.08)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.012] mix-blend-overlay motion-reduce:opacity-[0.008]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
