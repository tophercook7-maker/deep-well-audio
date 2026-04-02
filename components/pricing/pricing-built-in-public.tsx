import Link from "next/link";
import type { Route } from "next";

/**
 * Visual strip on /pricing; copy stays factual and calm.
 */
export function PricingBuiltInPublic() {
  return (
    <section
      className="mx-auto w-full max-w-2xl space-y-5 text-center"
      aria-labelledby="built-in-public-heading"
    >
      <div className="overflow-hidden rounded-2xl border border-line/50 bg-[rgba(10,14,22,0.38)] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.42)] backdrop-blur-md backdrop-saturate-125 supports-[backdrop-filter]:bg-[rgba(10,14,22,0.28)]">
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
          Still built in public
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          If something is confusing or broken, say so—we read{" "}
          <Link href={"/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline">
            feedback
          </Link>{" "}
          and use it to improve the site.
        </p>
      </div>
    </section>
  );
}
