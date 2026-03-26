import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Deep Well Audio",
    short_name: "Deep Well",
    description: "Find rich Bible teaching without digging through fluff.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    orientation: "portrait-primary",
    categories: ["music", "education", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
