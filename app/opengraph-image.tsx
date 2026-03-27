import { ImageResponse } from "next/og";
import { OgBrandShareLayout } from "./og-brand";
import { getOgLogoDataUrl } from "@/lib/og-logo-data-url";

export const runtime = "nodejs";

export const alt = "Deep Well Audio — curated Bible teaching";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoDataUrl = await getOgLogoDataUrl();
  return new ImageResponse(<OgBrandShareLayout logoDataUrl={logoDataUrl} />, { ...size });
}
