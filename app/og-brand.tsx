/** Shared JSX for Open Graph / Twitter ImageResponse routes */
export function OgBrandShareLayout() {
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
            background: "#0c1424",
            border: "4px solid #d4af37",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 28,
              background: "#d4af37",
              borderRadius: 3,
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
          <span
            style={{
              fontSize: 26,
              fontWeight: 500,
              color: "rgba(212, 175, 55, 0.95)",
              marginTop: 8,
              letterSpacing: "0.02em",
            }}
          >
            Bible teaching worth hearing
          </span>
        </div>
      </div>
      <span style={{ fontSize: 22, color: "#94a3b8", maxWidth: 720, textAlign: "center", lineHeight: 1.45 }}>
        Find rich Bible teaching without digging through fluff.
      </span>
    </div>
  );
}
