export default function Loading() {
  return (
    <main className="container-shell py-24">
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true" aria-label="Loading">
        <div className="h-10 w-40 animate-pulse rounded-full bg-soft/40" />
        <div className="h-28 animate-pulse rounded-2xl border border-line/60 bg-soft/20" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl border border-line/60 bg-soft/20" />
          <div className="h-40 animate-pulse rounded-2xl border border-line/60 bg-soft/20" />
        </div>
      </div>
    </main>
  );
}
