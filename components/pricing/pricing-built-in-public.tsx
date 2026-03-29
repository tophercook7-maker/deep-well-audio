import Link from "next/link";
import type { Route } from "next";

/**
 * Hero-style strip above the Premium card.
 * Swap `/public/pricing/built-in-public.svg` for a photo or custom graphic (same path or change `src`).
 */
export function PricingBuiltInPublic() {
  return (
    <section
      className="mx-auto w-full max-w-2xl space-y-5 text-center"
      aria-labelledby="built-in-public-heading"
    >
      <div className="overflow-hidden rounded-2xl border border-line/55 bg-[#0b1220]/50 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG; use next/image if you replace with PNG/WebP */}
        <img
          src="/pricing/built-in-public.svg"
          alt=""
          width={1200}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="space-y-3 px-1 sm:px-2">
        <h2
          id="built-in-public-heading"
          className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl"
        >
          Built in real time—getting better every day.
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          If something feels off, use{" "}
          <Link href={"/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline">
            feedback
          </Link>{" "}
          and I&apos;ll fix it fast.
        </p>
        <p className="mx-auto max-w-md pt-1 text-xs leading-relaxed text-slate-500">
          I&apos;m on this as fast as lightning—if anything feels broken, confusing, or missing,{" "}
          <Link href={"/feedback" as Route} className="text-amber-200/80 underline-offset-2 transition hover:text-amber-100 hover:underline">
            tell me
          </Link>{" "}
          and I&apos;ll fix it.
        </p>
      </div>
    </section>
  );
}
