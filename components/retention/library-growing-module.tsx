import type { UserLibraryGrowthStats } from "@/lib/queries";

type Props = {
  stats: UserLibraryGrowthStats;
  /** Show once the library has more than a single anchor (teaching, note, or passage). */
  minTotalItems?: number;
  className?: string;
};

export function LibraryGrowingModule({ stats, minTotalItems = 2, className = "" }: Props) {
  const totalNotes = stats.studyNotes + stats.episodeNotes;
  const total =
    stats.savedTeachings + stats.savedPassages + stats.studyNotes + stats.episodeNotes;
  if (total < minTotalItems) return null;

  return (
    <div
      className={`rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.5)] px-5 py-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 ${className}`.trim()}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Your library</p>
      <h2 className="mt-2 text-lg font-semibold text-white">Your library is growing</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
        <span className="font-medium text-slate-100">{stats.savedTeachings}</span> saved teaching
        {stats.savedTeachings === 1 ? "" : "s"}
        {totalNotes > 0 ? (
          <>
            {" · "}
            <span className="font-medium text-slate-100">{totalNotes}</span> note{totalNotes === 1 ? "" : "s"}
          </>
        ) : null}
        {stats.savedPassages > 0 ? (
          <>
            {" · "}
            <span className="font-medium text-slate-100">{stats.savedPassages}</span> saved passage
            {stats.savedPassages === 1 ? "" : "s"}
          </>
        ) : null}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">Everything you save here is something you can return to.</p>
    </div>
  );
}
