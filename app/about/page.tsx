import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BackButton } from "@/components/buttons/back-button";
import { Check } from "lucide-react";

export const metadata = {
  title: "About · Deep Well Audio",
  description:
    "Deep Well is a calmer, trustworthy place to listen to Scripture-grounded teaching—and return to what matters.",
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
              Deep Well exists for people who want depth, not noise.
            </h1>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              <p>There is more Christian content available than ever, but that does not always make it easier to grow.</p>
              <p>
                Deep Well was built to create a calmer, more trustworthy place to listen, reflect, and stay with what matters.
              </p>
            </div>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="about-problem-heading">
        <h2 id="about-problem-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Too much content. Too little staying power.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300/95">
          Most people are not struggling because there is nothing to listen to.
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">They are struggling because there is too much:</p>
        <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-slate-400">
          <li>too many voices</li>
          <li>too many clips</li>
          <li>too many opinions</li>
          <li>too little clarity about what is worth returning to</li>
        </ul>
        <p className="mt-8 text-base leading-relaxed text-slate-300/95">
          The result is overload. You hear a lot, but keep very little.
        </p>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(8,11,17,0.35)] py-14 sm:py-16"
        aria-labelledby="about-mission-heading"
      >
        <div className="container-shell max-w-3xl">
          <h2 id="about-mission-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Our mission
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95">
            Deep Well exists to help people slow down, hear trustworthy teaching, and keep what matters close.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            We believe good teaching should not be buried under noise and distraction.
          </p>
          <p className="mt-6 text-base font-medium text-slate-200/95">We want to make it easier to:</p>
          <ul className="mt-4 space-y-3">
            <Bullet>find sound teaching</Bullet>
            <Bullet>stay with it longer</Bullet>
            <Bullet>return to it later</Bullet>
            <Bullet>grow over time</Bullet>
          </ul>
        </div>
      </section>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="about-difference-heading">
        <h2 id="about-difference-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          What makes Deep Well different
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300/95">Deep Well is not trying to be everything.</p>
        <p className="mt-4 text-base leading-relaxed text-slate-400">It is not built for trends or endless scrolling.</p>
        <p className="mt-6 text-base font-medium text-slate-200/95">It is built to be:</p>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300/95">
          <li>curated instead of chaotic</li>
          <li>grounded instead of scattered</li>
          <li>useful instead of noisy</li>
          <li>calm instead of addictive</li>
        </ul>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(7,10,16,0.4)] py-14 sm:py-16"
        aria-labelledby="about-trust-heading"
      >
        <div className="container-shell max-w-3xl">
          <h2 id="about-trust-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Built on trusted voices
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95">
            We focus on teaching worth staying with, not whatever is loud or trending.
          </p>
        </div>
      </section>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="about-ww-heading">
        <h2 id="about-ww-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Paying attention without being consumed
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300/95">
          World Watch helps you stay aware of public life without being pulled into constant noise.
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-400">It&apos;s about calm attention, not reaction.</p>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(8,11,17,0.35)] py-14 sm:py-16"
        aria-labelledby="about-name-heading"
      >
        <div className="container-shell max-w-3xl">
          <h2 id="about-name-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Why the name Deep Well
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300/95">
            <p>A deep well is not shallow or rushed.</p>
            <p>It is something you return to.</p>
            <p>
              That is the heart of Deep Well:
              <br />
              not more noise,
              <br />
              not more speed,
              <br />
              but something steady.
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-4xl pb-4 pt-4 sm:pt-6" aria-labelledby="about-final-heading">
        <div className="rounded-[26px] border border-line/45 bg-[rgba(10,14,20,0.5)] px-6 py-10 text-center shadow-[0_20px_50px_-36px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-10">
          <h2 id="about-final-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start building a library that helps you grow
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.45)] px-7 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              Explore Deep Well
            </Link>
            <Link
              href={"/signup?next=/library" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
