import Link from "next/link";
import type { Route } from "next";
import { CTA } from "@/lib/site-messaging";

type Props = {
  align?: "left" | "right";
  className?: string;
};

export function PremiumSaveFollowUp({ align = "right", className = "" }: Props) {
  return (
    <p
      className={`text-[10px] leading-snug text-slate-500/75 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      Save notes and moments across teachings—Premium helps you keep what mattered{" "}
      <Link
        href={"/pricing" as Route}
        className="whitespace-nowrap text-slate-400/85 underline decoration-white/10 underline-offset-[3px] transition hover:text-slate-300 hover:decoration-white/20"
      >
        {CTA.SEE_PREMIUM} →
      </Link>
    </p>
  );
}
