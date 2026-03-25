import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Deep Well Audio",
  description: "Find rich, Bible-based teaching without the fluff.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" style={{ backgroundColor: "#0b1220", color: "#f8fafc" }}>
      <body
        className="min-h-full antialiased"
        style={{
          backgroundColor: "#0b1220",
          color: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
