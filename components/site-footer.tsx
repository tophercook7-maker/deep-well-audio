import Link from "next/link";
import { InstallHint } from "@/components/pwa/install-hint";
import { FooterJoinLink } from "@/components/analytics/footer-join-link";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line/40 bg-[rgba(11,18,32,0.52)]">
      <InstallHint />
      <div className="container-shell py-8 text-center sm:py-9">
        <div className="mb-7 flex justify-center sm:mb-8">
          <DeepWellLogo variant="inline" brandClassName="items-center mx-auto" />
        </div>
        <p className="text-[13px] leading-relaxed text-slate-500">
          © {year}
        </p>
        <nav
          className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-slate-300/95"
          aria-label="Footer"
        >
          <Link href="/explore" className="transition hover:text-amber-100/85">
            Explore
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <Link href="/library" className="transition hover:text-amber-100/85">
            Library
          </Link>
          <span className="select-none text-slate-600" aria-hidden>
            ·
          </span>
          <FooterJoinLink className="transition hover:text-amber-100/85">Join the Deep Well list</FooterJoinLink>
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
