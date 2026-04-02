import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: compact waveform (audio / well) — no wordmark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 4,
            height: 20,
          }}
        >
          <div style={{ width: 5, height: 8, background: "#a88a3a", borderRadius: 2 }} />
          <div style={{ width: 5, height: 17, background: "#c9a44a", borderRadius: 2 }} />
          <div style={{ width: 5, height: 12, background: "#d8b55c", borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
