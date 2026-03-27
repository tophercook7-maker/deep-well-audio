/** Shared JSX for Open Graph / Twitter ImageResponse routes */

const TAGLINE_STYLE = {
  fontSize: 26,
  fontWeight: 500,
  color: "#22d3ee",
  marginTop: 28,
  letterSpacing: "0.02em",
} as const;

const SUB_STYLE = {
  fontSize: 22,
  color: "#94a3b8",
  maxWidth: 780,
  textAlign: "center" as const,
  lineHeight: 1.45,
  marginTop: 20,
};

export function OgBrandShareLayout({ logoDataUrl }: { logoDataUrl?: string | null }) {
  if (logoDataUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse 80% 70% at 50% 40%, #111a2e 0%, #0b1220 55%, #070b12 100%)",
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          padding: 48,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse runtime */}
        <img
          src={logoDataUrl}
          alt=""
          height={150}
          width={520}
          style={{ height: 150, width: "auto", maxWidth: 520, objectFit: "contain" }}
        />
        <span style={TAGLINE_STYLE}>Bible teaching worth hearing</span>
        <span style={SUB_STYLE}>Find rich Bible teaching without digging through fluff.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(165deg, #0b1220 0%, #0f172a 45%, #0b1220 100%)",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            background: "#0c1524",
            border: "3px solid #22d3ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(34, 211, 238, 0.35)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 10,
              background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
              borderRadius: 4,
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: "-0.02em",
            }}
          >
            Deep Well Audio
          </span>
          <span style={{ ...TAGLINE_STYLE, marginTop: 8 }}>Bible teaching worth hearing</span>
        </div>
      </div>
      <span style={SUB_STYLE}>Find rich Bible teaching without digging through fluff.</span>
    </div>
  );
}
