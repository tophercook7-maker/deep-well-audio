import Link from "next/link";
import { InstallHint } from "@/components/pwa/install-hint";
import { FooterJoinLink } from "@/components/analytics/footer-join-link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line/40 bg-[rgba(11,18,32,0.5)]">
      <InstallHint />
      <div className="container-shell py-6 text-center text-xs text-slate-500">
        <p className="leading-relaxed">
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
        </p>
      </div>
    </footer>
  );
}
