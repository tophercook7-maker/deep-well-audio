import { KeyScriptureRefLine } from "@/components/study/key-scripture-ref-line";
import type { StudyTopic } from "@/lib/study/types";
import { getKeyRefSnippet } from "@/lib/studies/topic-engine";

type Props = {
  topic: StudyTopic;
  translation?: string;
};

export function TopicKeyScriptures({ topic, translation = "web" }: Props) {
  return (
    <section aria-labelledby="topic-key-passages">
      <h2 id="topic-key-passages" className="text-xl font-semibold text-white">
        Key Scriptures
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
        Start with these passages—each opens in the Bible reader when the reference can be anchored cleanly.
      </p>
      <ul className="mt-4 list-inside list-disc space-y-3 text-base leading-relaxed marker:text-amber-200/65 sm:list-outside sm:pl-5">
        {topic.keyScriptureRefs.map((r, i) => (
          <KeyScriptureRefLine
            key={`${i}-${r}`}
            refText={r}
            translation={translation}
            snippet={getKeyRefSnippet(topic.slug, r)}
          />
        ))}
      </ul>
    </section>
  );
}
