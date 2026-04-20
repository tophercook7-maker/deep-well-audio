import Link from "next/link";
import type { Route } from "next";
import type { GuidedNextStep } from "@/lib/guidance/guided-next-step";

type Variant = "bible" | "studies";

const styles: Record<
  Variant,
  {
    primary: string;
    supporting: string;
    desc: string;
    label: string;
  }
> = {
  bible: {
    label: "text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500",
    primary:
      "inline-flex w-full justify-center rounded-2xl border border-stone-400/55 bg-white/55 px-4 py-3 text-center text-sm font-medium text-stone-800 shadow-sm transition hover:border-amber-800/25 hover:bg-amber-50/40 sm:w-auto sm:min-w-[200px]",
    supporting: "text-sm font-medium text-stone-600 underline-offset-[0.2em] transition hover:text-stone-900 hover:underline",
    desc: "text-xs text-stone-500",
  },
  studies: {
    label: "text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500",
    primary:
      "inline-flex w-full justify-center rounded-2xl border border-line/55 bg-soft/20 px-4 py-3 text-center text-sm font-medium text-amber-50/95 transition hover:border-accent/35 hover:bg-soft/35 sm:w-auto sm:min-w-[200px]",
    supporting: "text-sm font-medium text-slate-300/95 underline-offset-[0.2em] transition hover:text-white hover:underline",
    desc: "text-xs text-slate-500",
  },
};

type Props = {
  /** Shown above links */
  heading?: string;
  primary: GuidedNextStep | null;
  supporting: GuidedNextStep[];
  variant?: Variant;
  className?: string;
};

export function GuidedNextLinks({ heading = "Continue here", primary, supporting, variant = "bible", className = "" }: Props) {
  if (!primary && supporting.length === 0) return null;
  const s = styles[variant];

  return (
    <div className={["text-left", className].filter(Boolean).join(" ")}>
      {heading ? <p className={s.label}>{heading}</p> : null}
      <div
        className={[
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4",
          heading ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {primary ? (
          <div className="flex min-w-0 flex-col gap-1">
            <Link href={primary.href as Route} className={s.primary}>
              {primary.title}
            </Link>
            {primary.description ? <p className={s.desc}>{primary.description}</p> : null}
          </div>
        ) : null}
        {supporting.length > 0 ? (
          <ul className="flex min-w-0 flex-col gap-2 sm:pt-1">
            {supporting.map((step) => (
              <li key={step.href}>
                <Link href={step.href as Route} className={s.supporting}>
                  {step.title}
                  {step.description ? <span className={["block font-normal", s.desc].join(" ")}>{step.description}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
