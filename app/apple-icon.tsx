import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: same waveform mark at home-screen size. */
export default function AppleIcon() {
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
            gap: 18,
            height: 88,
          }}
        >
          <div style={{ width: 22, height: 38, background: "#a88a3a", borderRadius: 8 }} />
          <div style={{ width: 22, height: 78, background: "#c9a44a", borderRadius: 8 }} />
          <div style={{ width: 22, height: 56, background: "#d8b55c", borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
