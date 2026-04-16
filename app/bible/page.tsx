import Link from "next/link";
import type { Route } from "next";
import { BibleLandingActions } from "@/components/bible/bible-landing-actions";
import { BackButton } from "@/components/buttons/back-button";
import { getSessionUser, getUserPlan } from "@/lib/auth";

export const metadata = {
  title: "Bible · Deep Well Audio",
  description: "Read Scripture, use study tools, and continue from saved passages—Deep Well Study in one calm entry point.",
};

export default async function BiblePage() {
  const user = await getSessionUser();
  const plan = await getUserPlan();
  const premium = plan === "premium";

  let savedPassagesHref = "/login?next=/library" as Route;
  let savedPassagesLabel = "Sign in to save passages";

  if (user) {
    if (premium) {
      savedPassagesHref = "/library#saved-passages" as Route;
      savedPassagesLabel = "Continue from saved passages";
    } else {
      savedPassagesHref = "/pricing" as Route;
      savedPassagesLabel = "Unlock saved passages (Premium)";
    }
  }

  return (
    <main className="container-shell space-y-12 py-12 sm:space-y-14 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Bible</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Scripture &amp; study</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          One calm place to read the Bible, open study tools, and pick up saved passages. Teaching with references still opens Study from episode
          pages—this hub is for when you want Scripture first.
        </p>
      </header>

      <BibleLandingActions savedPassagesHref={savedPassagesHref} savedPassagesLabel={savedPassagesLabel} />

      <section className="rounded-[22px] border border-line/50 bg-[rgba(8,11,17,0.35)] p-6 backdrop-blur-md sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Also in Deep Well</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="text-slate-300">Browse teaching</span> — scripture tags on episodes open the same verse tools in context.{" "}
            <Link href={"/browse" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              Open Browse
            </Link>
          </li>
          <li>
            <span className="text-slate-300">Dashboard</span> — saved episodes, listening progress, and your subscriber study hub stay in one
            account home.{" "}
            <Link href={"/dashboard" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              Open Dashboard
            </Link>
          </li>
          <li className="text-slate-500">
            Greek and Hebrew keyword senses are planned as a later layer on top of this reader—no change needed here when they ship.
          </li>
        </ul>
      </section>
    </main>
  );
}
