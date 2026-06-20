import type { Route } from "next";
import Link from "next/link";
import { BackButton } from "@/components/buttons/back-button";
import { CreatorPartnerForm } from "@/components/creators/creator-partner-form";
import { getSessionUser } from "@/lib/auth";
import {
  CREATOR_PARTNERSHIP_HEADLINE,
  CREATOR_PARTNERSHIP_LOOKING_FOR,
  CREATOR_PARTNERSHIP_OFFERS,
  CREATOR_PARTNERSHIP_SUBHEAD,
  CREATOR_PARTNER_TYPES,
} from "@/lib/creator-partners";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { Check, Mic, Music, Palette, Radio, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Creators · Partner with Deep Well Audio",
  description:
    "Bible artists, podcasters, musicians, and teaching ministries—partner with Deep Well to reach listeners who save, return, and grow.",
};

const TYPE_ICONS: Record<(typeof CREATOR_PARTNER_TYPES)[number]["id"], LucideIcon> = {
  "bible-art": Palette,
  podcast: Mic,
  music: Music,
  teaching: Radio,
  other: Sparkles,
};

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  let user = null;
  try {
    user = await getSessionUser();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const signedIn = Boolean(user);
  const email = typeof user?.email === "string" ? user.email : null;

  return (
    <main className="pb-20">
      <div className="relative overflow-hidden border-b border-line/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.07),transparent_50%)]">
        <div className="container-shell max-w-5xl py-10 sm:py-12">
          <div className="border-b border-line/40 pb-6">
            <BackButton fallbackHref="/" label="Back" />
          </div>
          <header className="mx-auto max-w-3xl pt-8 text-center sm:pt-10">
            <p className="mx-auto mb-4 inline-flex rounded-full border border-accent/25 bg-accent/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/85">
              Creators & partners
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              {CREATOR_PARTNERSHIP_HEADLINE}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              {CREATOR_PARTNERSHIP_SUBHEAD}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#partner-inquiry"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                Pitch a partnership
              </a>
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                See who is already here
              </Link>
            </div>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-5xl py-12 sm:py-14" aria-labelledby="creator-types-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="creator-types-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Who we are looking for
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400/95 sm:text-base">
            Not sure which bucket fits? Pick the closest one in the form—we can refine together.
          </p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREATOR_PARTNER_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type.id];
            return (
              <article
                key={type.id}
                className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-5 backdrop-blur-md sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/[0.08]">
                  <Icon className="h-5 w-5 text-amber-100/85" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{type.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400/95">{type.blurb}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">Examples: {type.examples}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(8,11,17,0.35)] py-12 sm:py-14"
        aria-labelledby="creator-offer-heading"
      >
        <div className="container-shell max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <h2 id="creator-offer-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                What Deep Well offers partners
              </h2>
              <ul className="mt-6 space-y-4">
                {CREATOR_PARTNERSHIP_OFFERS.map((item) => (
                  <li key={item.title} className="rounded-[20px] border border-line/50 bg-[rgba(10,14,20,0.4)] p-5">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400/95">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">What we ask in return</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400/95">
                This is not a rigid contract—it is the spirit of early partnerships while Deep Well is still growing.
              </p>
              <ul className="mt-6 space-y-3">
                {CREATOR_PARTNERSHIP_LOOKING_FOR.map((text) => (
                  <li key={text} className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-[20px] border border-amber-200/15 bg-amber-200/[0.06] p-5">
                <p className="text-sm font-semibold text-white">Revenue and terms</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
                  Founding partners get flexible terms—featured placement, cross-promotion, and optional revenue ideas we can
                  shape together once we know your catalog and audience. Nothing one-size-fits-all yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-3xl py-12 sm:py-14" aria-labelledby="creator-form-heading">
        <div className="mx-auto max-w-xl text-center">
          <h2 id="creator-form-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Tell us about your work
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400/95 sm:text-base">
            A short pitch is enough. Include links so we can listen, watch, or read before we reply.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <CreatorPartnerForm signedIn={signedIn} defaultEmail={email} />
        </div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-slate-500">
          Not ready to partner?{" "}
          <Link href={"/feedback" as Route} className="font-medium text-amber-200/80 underline-offset-2 hover:underline">
            Send general feedback
          </Link>{" "}
          or{" "}
          <Link href={"/about" as Route} className="font-medium text-amber-200/80 underline-offset-2 hover:underline">
            read about Deep Well
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
