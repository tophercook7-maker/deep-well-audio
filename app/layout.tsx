import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@vercel/analytics/react";
import { SiteAtmosphere } from "@/components/site/site-atmosphere";
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

const defaultDescription = "Trusted Christian teaching without the noise. Listen freely—subscribe for your personal library, notes, and full World Watch.";

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
  /**
   * Do not set `metadata.icons` here — it overrides `app/icon.tsx` / `app/apple-icon.tsx`.
   * Install / Add-to-home icons: `app/manifest.ts` → `public/icons/*` (from `npm run build:icons`).
   */
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
    { media: "(prefers-color-scheme: dark)", color: "#0a0d10" },
    { color: "#0a0d10" },
  ],
  colorScheme: "dark",
};

/** Fresh session + `profiles.plan` on every request (Premium after checkout / webhook). */
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, plan] = await Promise.all([getSessionUser(), getUserPlan()]);

  return (
    <html lang="en" className="h-full bg-transparent text-text" style={{ color: "#f8fafc" }}>
      <body
        className="flex min-h-full flex-col antialiased"
        style={{
          backgroundColor: "transparent",
          color: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <SiteAtmosphere />
        <PlayerProvider>
          <AccountPlanProvider initialPlan={plan}>
            {/* Single stacking layer above the fixed atmosphere so all pages scroll over the Bible backdrop */}
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
              <SiteHeader user={user} plan={plan} />
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              <SiteFooter />
              <Analytics />
            </div>
          </AccountPlanProvider>
        </PlayerProvider>
        <Script id="clarity" strategy="afterInteractive">
          {`
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "w5fs4tn2ns");
`}
        </Script>
      </body>
    </html>
  );
}
