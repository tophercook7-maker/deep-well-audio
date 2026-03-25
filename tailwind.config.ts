import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    // Exclude API routes: log strings like "[api:...]" were being scanned as Tailwind arbitrary syntax.
    "!./app/api/**",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        panel: "#111827",
        soft: "#1f2937",
        line: "#253247",
        accent: "#d4af37",
        text: "#f8fafc",
        muted: "#cbd5e1",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,175,55,0.18), 0 12px 30px rgba(0,0,0,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
