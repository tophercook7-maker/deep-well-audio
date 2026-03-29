import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@vercel/analytics/react";
import { PlayerProvider } from "@/components/player/player-provider";
import { AccountPlanProvider } from "@/components/plan/plan-context";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";

function metadataBaseUrl(): string {
  try {
    return getSafeAbsoluteSiteUrl();
  } catch {
    return "http://localhost:3000";
  }
}

const siteUrl = metadataBaseUrl();

const metadataBase: URL = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

const defaultDescription = "Find rich Bible teaching without digging through fluff.";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Deep Well Audio",
    template: "%s | Deep Well Audio",
  },
  description: defaultDescription,
  applicationName: "Deep Well Audio",
  authors: [{ name: "Deep Well Audio" }],
  keywords: [
    "Christian audio",
    "Bible teaching",
    "sermons",
    "podcasts",
    "spiritual growth",
    "Deep Well Audio",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Deep Well Audio",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Deep Well Audio",
    title: "Deep Well Audio",
    description: defaultDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Well Audio",
    description: defaultDescription,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
    { color: "#0b1220" },
  ],
  colorScheme: "dark",
};

/** Fresh session + `profiles.plan` on every request (Premium after checkout / webhook). */
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, plan] = await Promise.all([getSessionUser(), getUserPlan()]);

  return (
    <html lang="en" className="h-full" style={{ backgroundColor: "#0b1220", color: "#f8fafc" }}>
      <body
        className="flex min-h-full flex-col antialiased"
        style={{
          backgroundColor: "#0b1220",
          color: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <PlayerProvider>
          <AccountPlanProvider initialPlan={plan}>
            <SiteHeader user={user} plan={plan} />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <SiteFooter />
            <Analytics />
          </AccountPlanProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
