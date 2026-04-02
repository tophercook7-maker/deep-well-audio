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
        muted: "#d2dbe8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,175,55,0.18), 0 12px 30px rgba(0,0,0,0.28)",
      },
      keyframes: {
        "dwa-drift": {
          "0%, 100%": { opacity: "0.05", transform: "translate3d(0, 0, 0)" },
          "50%": { opacity: "0.12", transform: "translate3d(0, -8px, 0)" },
        },
        "dwa-drift-slow": {
          "0%, 100%": { opacity: "0.04", transform: "translate3d(0, 0, 0)" },
          "50%": { opacity: "0.1", transform: "translate3d(0, -6px, 0)" },
        },
        "dwa-save-ack": {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "dwa-hint-reveal": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "dwa-drift": "dwa-drift 16s ease-in-out infinite",
        "dwa-drift-slow": "dwa-drift-slow 24s ease-in-out infinite",
        "dwa-save-ack": "dwa-save-ack 3s ease-in-out forwards",
        "dwa-hint-reveal": "dwa-hint-reveal 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
