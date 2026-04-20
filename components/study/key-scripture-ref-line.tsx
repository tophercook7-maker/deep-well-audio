import Link from "next/link";
import type { Route } from "next";
import { parseScriptureRefToBibleHref } from "@/lib/bible/scripture-ref-to-url";

type Props = {
  refText: string;
  /** Bible reader translation for links (study catalog defaults to web). */
  translation?: string;
  /** Optional one-line context under the reference */
  snippet?: string;
};

/** Renders a key passage line; links to `/bible/...` when the ref parses cleanly. */
export function KeyScriptureRefLine({ refText, translation = "web", snippet }: Props) {
  const href = parseScriptureRefToBibleHref(refText, translation);
  if (!href) {
    return (
      <li className="text-slate-300/95">
        <span>{refText}</span>
        {snippet ? <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{snippet}</p> : null}
      </li>
    );
  }
  return (
    <li className="text-slate-300/95">
      <Link href={href as Route} className="text-amber-100/90 underline-offset-2 transition hover:text-amber-50 hover:underline">
        {refText}
      </Link>
      {snippet ? <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{snippet}</p> : null}
    </li>
  );
}
