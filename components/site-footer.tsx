import Link from "next/link";
import type { Route } from "next";
import { InstallHint } from "@/components/pwa/install-hint";
import { FooterJoinLink } from "@/components/analytics/footer-join-link";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line/35 bg-[rgba(8,11,18,0.22)] backdrop-blur-md backdrop-saturate-120 supports-[backdrop-filter]:bg-[rgba(8,11,18,0.18)]">
      <InstallHint />
      <div className="container-shell py-8 text-center sm:py-9">
        <div className="mb-7 flex justify-center sm:mb-8">
          <DeepWellLogo variant="inline" brandClassName="items-center mx-auto" />
        </div>
        <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-slate-500">
          Listen freely. No account needed.{" "}
          <Link href={"/pricing" as Route} className="text-slate-400 underline-offset-2 transition hover:text-amber-100/90 hover:underline">
            Subscribe
          </Link>{" "}
          to save teachings, keep notes, follow topics, and unlock full World Watch.
        </p>
        <p className="mt-5 text-[13px] leading-relaxed text-slate-600">
          © {year}
        </p>
        <nav
          className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-slate-300/95"
          aria-label="Footer"
        >
          <Link href="/browse" className="transition hover:text-amber-100/85">
            Browse
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <Link href={"/world-watch" as Route} className="transition hover:text-amber-100/85">
            World Watch
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <Link href={"/pricing" as Route} className="transition hover:text-amber-100/85">
            Pricing
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <Link href="/login" className="transition hover:text-amber-100/85">
            Sign in
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <FooterJoinLink className="transition hover:text-amber-100/85">Short updates. No noise.</FooterJoinLink>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <Link href="/feedback" className="transition hover:text-amber-100/85">
            Send feedback
          </Link>
        </nav>
      </div>
    </footer>
  );
}
