/**
 * Fixed atmospheric layer: warm desert / ancient-land tone behind scrolling content.
 * Content uses semi-opaque surfaces (cards, sections) for readability.
 */
export function SiteAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0d10]" />
      {/* Warm sky glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_140%_70%_at_50%_-25%,rgba(190,140,80,0.14),transparent_52%)]" />
      {/* Distant hills / warmth bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_108%,rgba(58,42,28,0.42),transparent_48%)]" />
      {/* Side depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(30,38,52,0.35),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_40%,rgba(24,30,44,0.38),transparent_60%)]" />
      {/* Soft vignette for focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_22%,rgba(5,8,12,0.72)_100%)]" />
      {/* Granular calm (CSS noise) */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
