import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { fetchAdminMetrics } from "@/lib/queries/admin-metrics";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number | "—" }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-soft/15 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

export default async function AdminMetricsPage() {
  const m = await fetchAdminMetrics();

  return (
    <main className="container-shell max-w-3xl space-y-10 py-10 sm:space-y-12 sm:py-14">
      <div className="border-b border-line/50 pb-4">
        <BackButton fallbackHref="/admin/world-watch" label="Admin" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Conversion metrics</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          Snapshot from your database plus first-party page beacons.           Funnel <span className="font-medium text-slate-300">clicks</span> and{" "}
          <span className="font-medium text-slate-300">auth completions</span> live in{" "}
          <a
            href="https://vercel.com/docs/analytics/custom-events"
            className="font-medium text-amber-200/90 underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel Analytics → Events
          </a>
          (requires Analytics enabled on the project).
        </p>
      </div>

      {!m.configured ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-5 text-sm text-amber-100/90">
          <p className="font-medium text-white">Service role not configured</p>
          <p className="mt-2 text-muted">
            Set <code className="rounded bg-soft px-1 text-xs text-slate-300">SUPABASE_SERVICE_ROLE_KEY</code> so counts and beacons can be read and
            stored.
          </p>
        </div>
      ) : null}

      <section aria-labelledby="accounts-heading">
        <h2 id="accounts-heading" className="text-sm font-semibold text-white">
          Accounts &amp; Premium
        </h2>
        <p className="mt-1 text-xs text-muted">Profiles mirror signups when your Supabase trigger is active.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Stat label="Total accounts (profiles)" value={m.profilesTotal ?? "—"} />
          <Stat label="New accounts (last 7 days)" value={m.profilesNew7d ?? "—"} />
          <Stat label="Premium (plan = premium)" value={m.premiumTotal ?? "—"} />
          <Stat label="Waitlist emails (all time)" value={m.waitlistTotal ?? "—"} />
          <Stat label="Waitlist signups (last 7 days)" value={m.waitlistNew7d ?? "—"} />
        </div>
      </section>

      <section aria-labelledby="beacon-heading">
        <h2 id="beacon-heading" className="text-sm font-semibold text-white">
          Key page beacons
        </h2>
        <p className="mt-1 text-xs text-muted">
          One anonymous ping per page load (pricing, join, world watch, login, signup). Apply migration{" "}
          <code className="rounded bg-soft px-1 text-[0.7rem] text-slate-400">20260401120000_conversion_beacon</code> if this stays empty.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line/70 bg-soft/10 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/60">Last 7 days</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {m.beaconByPage7d.length === 0 ? (
                <li className="text-muted">No rows yet.</li>
              ) : (
                m.beaconByPage7d.map((row) => (
                  <li key={row.page} className="flex justify-between gap-3 border-b border-line/30 pb-2 last:border-0">
                    <span className="font-medium text-slate-200">{row.page}</span>
                    <span className="tabular-nums text-slate-400">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-line/70 bg-soft/10 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/60">All time</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {m.beaconByPageAll.length === 0 ? (
                <li className="text-muted">No rows yet.</li>
              ) : (
                m.beaconByPageAll.map((row) => (
                  <li key={`${row.page}-all`} className="flex justify-between gap-3 border-b border-line/30 pb-2 last:border-0">
                    <span className="font-medium text-slate-200">{row.page}</span>
                    <span className="tabular-nums text-slate-400">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-muted">
        <Link href={"/admin/world-watch" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
          World Watch admin
        </Link>
        <span className="mx-2 text-slate-600">·</span>
        <Link href={"/admin/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
          Feedback admin
        </Link>
      </p>
    </main>
  );
}
