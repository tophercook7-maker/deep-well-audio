import Link from "next/link";
import type { Route } from "next";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { getTopicChapterTiers } from "@/lib/studies/topic-engine";
import type { TopicChapterCard } from "@/lib/studies/topic-types";

type Props = {
  topicSlug: string;
  translation?: StudyTranslationId;
};

function ChapterCard({ t, card }: { t: StudyTranslationId; card: TopicChapterCard }) {
  const base = bibleChapterPath(t, card.urlBook, card.chapter) as Route;
  const href = (card.verse != null ? `${base}#${card.verse}` : base) as Route;
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-line/55 bg-soft/15 px-4 py-3 transition hover:border-accent/35 hover:bg-soft/25"
    >
      <span className="font-medium text-amber-50/95">{card.label}</span>
      {card.note ? <span className="mt-1 block text-sm text-slate-500">{card.note}</span> : null}
    </Link>
  );
}

export function TopicRelatedChapters({ topicSlug, translation = "web" }: Props) {
  const tiers = getTopicChapterTiers(topicSlug);
  if (!tiers) return null;
  const hasAny = tiers.primary.length + tiers.supporting.length + tiers.relatedPassages.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mt-10" aria-labelledby="topic-related-chapters">
      <h2 id="topic-related-chapters" className="text-xl font-semibold text-white">
        Where to read in Scripture
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
        Primary places to start, then supporting context—each card opens the chapter (verse anchor when it helps).
      </p>

      {tiers.primary.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">Primary chapters</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {tiers.primary.map((c) => (
              <li key={`${c.urlBook}-${c.chapter}-${c.label}`}>
                <ChapterCard t={translation} card={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tiers.supporting.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Supporting chapters</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {tiers.supporting.map((c) => (
              <li key={`${c.urlBook}-${c.chapter}-${c.label}`}>
                <ChapterCard t={translation} card={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tiers.relatedPassages.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Related passages</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {tiers.relatedPassages.map((c) => (
              <li key={`${c.urlBook}-${c.chapter}-${c.label}`}>
                <ChapterCard t={translation} card={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
