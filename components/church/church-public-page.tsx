import Link from "next/link";
import type { Route } from "next";

type ChurchPublicCard = {
  title: string;
  body: string;
};

type ChurchPublicAction = {
  label: string;
  href: string;
  external?: boolean;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  cards: ChurchPublicCard[];
  actions?: ChurchPublicAction[];
};

export function ChurchPublicPage({ eyebrow, title, description, cards, actions = [] }: Props) {
  return (
    <main className="container-shell py-12 sm:py-14">
      <section className="rounded-[2rem] border border-line/50 bg-[rgba(10,14,20,0.56)] p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.72)] backdrop-blur-md sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/85">{eyebrow}</p>
        <div className="mt-4 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-[1.75] text-slate-300/95 sm:text-lg">{description}</p>
        </div>
        {actions.length > 0 ? (
          <div className="mt-7 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.external ? (
                <a
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-amber-300/35 bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_36px_-26px_rgba(251,191,36,0.9)] transition hover:bg-amber-200"
                >
                  {action.label}
                </a>
              ) : (
                <Link
                  key={`${action.label}-${action.href}`}
                  href={action.href as Route}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/70 bg-soft/55 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-amber-200/45 hover:text-amber-100"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.35rem] border border-line/55 bg-[rgba(15,20,30,0.62)] p-5 shadow-[0_20px_52px_-42px_rgba(0,0,0,0.75)] backdrop-blur-sm"
          >
            <h2 className="text-base font-semibold tracking-tight text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-[1.7] text-slate-300/95">{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
