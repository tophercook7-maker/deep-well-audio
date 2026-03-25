import {
  hasPublicSupabaseEnv,
  hasServiceSupabaseEnv,
  hasSyncSecret,
  hasYoutubeKey,
  isNonProductionDeploy,
} from "@/lib/env";
import { probeCatalogBackend } from "@/lib/queries";

/**
 * Subtle diagnostic strip for local/preview or incomplete setup—not shown when prod is fully wired and has data.
 */
export async function HomeSetupStatusPanel({ showCount }: { showCount: number }) {
  const publicOk = hasPublicSupabaseEnv();
  const serviceOk = hasServiceSupabaseEnv();
  const syncOk = hasSyncSecret();
  const youtubeOk = hasYoutubeKey();
  const preview = isNonProductionDeploy();
  const probe = publicOk ? await probeCatalogBackend() : ("missing_env" as const);

  const fullyHealthy =
    publicOk && serviceOk && syncOk && probe === "ok" && showCount > 0;

  if (!preview && fullyHealthy && youtubeOk) {
    return null;
  }

  const items: { label: string; ok: boolean; hint?: string }[] = [
    { label: "Supabase (public URL + anon key)", ok: publicOk, hint: "Needed for pages and sign-in." },
    {
      label: "Database reachable",
      ok: probe === "ok",
      hint: probe === "error" ? "Check project URL, keys, and network." : undefined,
    },
    {
      label: "Service role + sync secret",
      ok: serviceOk && syncOk,
      hint: "Required for POST /api/ingest/* and /api/sync/all.",
    },
    {
      label: "Catalog has shows",
      ok: showCount > 0,
      hint: showCount === 0 ? "Run RSS sync after DB schema is applied." : undefined,
    },
    { label: "YouTube API (optional)", ok: youtubeOk, hint: !youtubeOk ? "RSS-only mode is fine without it." : undefined },
  ];

  return (
    <section className="container-shell pb-6" aria-label="Setup status">
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 px-4 py-3 text-sm">
        <p className="font-medium text-amber-100/95">
          {preview ? "Development / preview — setup status" : "Setup checklist"}
        </p>
        <ul className="mt-2 grid gap-1.5 text-slate-300 sm:grid-cols-2">
          {items.map((row) => (
            <li key={row.label} className="flex gap-2">
              <span className={row.ok ? "text-emerald-400" : "text-amber-200/80"}>{row.ok ? "✓" : "○"}</span>
              <span>
                {row.label}
                {row.hint ? <span className="block text-xs text-slate-500">{row.hint}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
