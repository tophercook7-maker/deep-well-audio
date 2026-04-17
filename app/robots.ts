import type { MetadataRoute } from "next";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
