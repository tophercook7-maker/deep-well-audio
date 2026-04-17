import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BackButton } from "@/components/buttons/back-button";
import { Check } from "lucide-react";
import { CTA } from "@/lib/site-messaging";

export const metadata = {
  title: "About · Deep Well Audio",
  description:
    "Deep Well helps Christians keep the teaching that shapes them—curated audio, Scripture, and a calm place to return.",
};

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export default function AboutPage() {
  return (
    <main className="pb-20">
      <div className="relative overflow-hidden border-b border-line/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.07),transparent_50%)]">
        <div className="container-shell max-w-3xl py-10 sm:py-12">
          <div className="border-b border-line/40 pb-6">
            <BackButton fallbackHref="/" label="Back" />
          </div>
          <header className="pt-8 sm:pt-10">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              You hear a lot. You keep very little.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Deep Well was built to change that.
            </p>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="about-problem-heading">
        <h2 id="about-problem-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          The problem
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300/95">
          There is more Christian content than ever, but more content has not made spiritual growth easier. Most people hear something
          meaningful, intend to come back to it, and then lose it—notes, passages, and sermons scattered across apps and feeds.
        </p>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(8,11,17,0.35)] py-14 sm:py-16"
        aria-labelledby="about-mission-heading"
      >
        <div className="container-shell max-w-3xl">
          <h2 id="about-mission-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Deep Well exists to help you keep what matters.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95">
            It is built not just for listening, but for returning—to teaching, notes, and Scripture in one calm place.
          </p>
        </div>
      </section>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="about-difference-heading">
        <h2 id="about-difference-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          What makes it different
        </h2>
        <ul className="mt-6 space-y-3">
          <Bullet>Curated teaching you can trust</Bullet>
          <Bullet>A place to keep what impacted you</Bullet>
          <Bullet>Scripture connected to what you hear</Bullet>
          <Bullet>A calm experience that respects your attention</Bullet>
        </ul>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(7,10,16,0.4)] py-14 sm:py-16"
        aria-labelledby="about-name-heading"
      >
        <div className="container-shell max-w-3xl">
          <h2 id="about-name-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            The name
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95">
            A deep well is something you return to. That&apos;s what this is meant to be.
          </p>
        </div>
      </section>

      <section className="container-shell max-w-4xl pb-4 pt-4 sm:pt-6" aria-labelledby="about-final-heading">
        <div className="rounded-[26px] border border-line/45 bg-[rgba(10,14,20,0.5)] px-6 py-10 text-center shadow-[0_20px_50px_-36px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-10">
          <h2 id="about-final-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start listening. Keep what mattered when you&apos;re ready.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.45)] px-7 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              {CTA.LISTEN_FREE}
            </Link>
            <Link
              href={"/signup?next=/library" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              {CTA.CREATE_FREE_ACCOUNT}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
