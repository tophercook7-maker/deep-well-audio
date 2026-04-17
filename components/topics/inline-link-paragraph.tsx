import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/**
 * Renders a paragraph that may contain `[label](/path)` links (internal routes only).
 */
export function InlineLinkParagraph({ text }: { text: string }) {
  const re = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(text.slice(last, m.index));
    }
    out.push(
      <Link
        key={k++}
        href={m[2] as Route}
        className="font-medium text-amber-200/90 underline decoration-amber-200/35 underline-offset-2 transition hover:text-white hover:decoration-amber-200/60"
      >
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(text.slice(last));
  }
  if (out.length === 0) {
    return <>{text}</>;
  }
  return <>{out}</>;
}
