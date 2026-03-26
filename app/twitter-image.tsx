import { ImageResponse } from "next/og";
import { OgBrandShareLayout } from "./og-brand";

export const runtime = "edge";

export const alt = "Deep Well Audio — curated Bible teaching";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgBrandShareLayout />, { ...size });
}
