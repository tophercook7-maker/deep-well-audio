import Link from "next/link";
import type { ShowRow } from "@/lib/types";
import { SaveShowButton } from "@/components/buttons/save-show-button";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { categoryLabel, formatDate } from "@/lib/format";

type Row = {
  created_at: string;
  show: ShowRow | null;
};

export function SavedShowsList({ rows }: { rows: Row[] }) {
  const valid = rows.filter((r) => r.show);

  if (!valid.length) {
    return (
      <div className="card p-8 text-sm text-muted">
        No saved programs yet. Open any show and use <strong className="font-medium text-slate-200">Save show</strong> to pin it to this
        list.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {valid.map(({ created_at, show }) => {
        if (!show) return null;
        return (
          <div key={show.id} className="card flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">{categoryLabel(show.category)}</span>
              <SourceBadge source={show.source_type} />
              <MeatyPill score={show.meaty_score} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                <Link href={`/shows/${show.slug}`} className="hover:text-amber-100">
                  {show.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">{show.host}</p>
              <p className="mt-1 text-xs text-slate-500">Saved {formatDate(created_at)}</p>
            </div>
            <SaveShowButton showId={show.id} initial returnPath="/library" />
          </div>
        );
      })}
    </div>
  );
}
