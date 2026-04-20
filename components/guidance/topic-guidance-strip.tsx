import { resolveTopicWhereNext } from "@/lib/guidance/guided-next-step";
import { GuidedNextLinks } from "@/components/guidance/guided-next-links";

type Props = {
  topicSlug: string;
  className?: string;
};

/**
 * Single calm “where next” block for study topic pages — not a carousel.
 */
export function TopicGuidanceStrip({ topicSlug, className }: Props) {
  const { primary, supporting } = resolveTopicWhereNext(topicSlug);
  if (!primary && supporting.length === 0) return null;

  return (
    <section className={className} aria-labelledby="topic-where-next-heading">
      <div className="rounded-2xl border border-line/45 bg-soft/[0.07] px-5 py-5 sm:px-6">
        <h2 id="topic-where-next-heading" className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Where to go next
        </h2>
        <div className="mt-4">
          <GuidedNextLinks heading="" primary={primary} supporting={supporting} variant="studies" />
        </div>
      </div>
    </section>
  );
}
