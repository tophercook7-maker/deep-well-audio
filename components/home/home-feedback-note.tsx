import Link from "next/link";
import type { Route } from "next";

/**
 * Calm “built in public” trust line—confident, not apologetic.
 */
export function HomeFeedbackNote() {
  return (
    <div className="rounded-2xl border border-line/55 bg-soft/[0.08] px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-sm leading-[1.65] text-slate-400">
        We build carefully and in public—small, steady steps—and read every note. If something could serve you better,{" "}
        <Link href={"/feedback" as Route} className="font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline">
          send feedback
        </Link>
        .
      </p>
    </div>
  );
}
