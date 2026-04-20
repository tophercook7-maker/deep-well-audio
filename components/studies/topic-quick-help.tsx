import Link from "next/link";
import type { Route } from "next";
import { KeyScriptureRefLine } from "@/components/study/key-scripture-ref-line";
import { getTopicQuickHelp } from "@/lib/studies/topic-engine";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  topicSlug: string;
  routes: StudyRouteHelpers;
};

export function TopicQuickHelp({ topicSlug, routes }: Props) {
  const qh = getTopicQuickHelp(topicSlug);
  if (!qh) return null;

  const [a, b, c] = qh.verseRefs;

  const lineBlocks = qh.lines;

  return (
    <section className="rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-5 sm:px-6" aria-labelledby="topic-quick-help-block">
      <h2 id="topic-quick-help-block" className="text-sm font-semibold text-white">
        {qh.lead}
      </h2>
      {lineBlocks ? (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300/95">
          {lineBlocks.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
      <p className={`text-sm font-medium text-slate-400 ${lineBlocks ? "mt-5" : "mt-3"}`}>Key verses</p>
      <ul className="mt-2 list-inside list-disc space-y-2 marker:text-amber-200/65 sm:list-outside sm:pl-5">
        <KeyScriptureRefLine refText={a} />
        <KeyScriptureRefLine refText={b} />
        <KeyScriptureRefLine refText={c} />
      </ul>
      {qh.encouragement ? <p className="mt-4 text-sm leading-relaxed text-slate-300/95">{qh.encouragement}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line/40 pt-4">
        <Link href={`/topics/${topicSlug}` as Route} className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35">
          Topic audio hub
        </Link>
        <Link href={routes.search() as Route} className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35">
          Search studies
        </Link>
        <Link href={"/bible" as Route} className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35">
          Open Bible reader
        </Link>
        <Link href={"/bible/listen" as Route} className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35">
          Listen to Scripture
        </Link>
      </div>
    </section>
  );
}
