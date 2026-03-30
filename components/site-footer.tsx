import Link from "next/link";
import { InstallHint } from "@/components/pwa/install-hint";
import { FooterJoinLink } from "@/components/analytics/footer-join-link";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line/40 bg-[rgba(11,18,32,0.5)]">
      <InstallHint />
      <div className="container-shell py-7 text-center text-[13px] leading-relaxed text-slate-400 sm:py-8">
        <div className="mb-6 flex justify-center">
          <DeepWellLogo variant="inline" className="mx-auto" />
        </div>
        <p>
          © {year}{" "}
          <span className="text-slate-400">Deep Well Audio</span>
          {" · "}
          <Link href="/explore" className="text-muted transition hover:text-amber-100/80">
            Explore
          </Link>
          {" · "}
          <Link href="/library" className="text-muted transition hover:text-amber-100/80">
            Library
          </Link>
          {" · "}
          <FooterJoinLink className="text-muted transition hover:text-amber-100/80">Join the Deep Well list</FooterJoinLink>
          {" · "}
          <Link href="/feedback" className="text-muted transition hover:text-amber-100/80">
            Send feedback
          </Link>
        </p>
      </div>
    </footer>
  );
}
