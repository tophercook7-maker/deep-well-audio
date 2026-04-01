"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Route } from "next";
import type { WorldWatchItemAdminRow } from "@/lib/world-watch/items";
import { WORLD_WATCH_CATEGORY_OPTIONS } from "@/lib/world-watch/items";

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function datetimeLocalToIso(v: string): string | null {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const fieldLabel = "block text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70";
const fieldHint = "mt-1.5 text-xs leading-relaxed text-slate-500";
const inputClass =
  "mt-2 w-full rounded-xl border border-line/80 bg-soft/25 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/45";

type Props =
  | { mode: "create"; listHref: string }
  | { mode: "edit"; item: WorldWatchItemAdminRow; listHref: string };

export function WorldWatchAdminEditor(props: Props) {
  const router = useRouter();
  const listHref = props.listHref;
  const isEdit = props.mode === "edit";
  const editItemId = isEdit ? props.item.id : null;
  const initial = isEdit ? props.item : null;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sourceName, setSourceName] = useState(initial?.source_name ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [publicTeaser, setPublicTeaser] = useState(initial?.public_teaser ?? "");
  const [reflection, setReflection] = useState(initial?.reflection ?? "");
  const [memberCommentary, setMemberCommentary] = useState(initial?.member_commentary ?? "");
  const [scriptureRefs, setScriptureRefs] = useState(initial?.scripture_refs ?? "");
  const [discernmentNotes, setDiscernmentNotes] = useState(initial?.discernment_notes ?? "");
  const [keyTakeaways, setKeyTakeaways] = useState(initial?.key_takeaways ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [pinnedRank, setPinnedRank] = useState(
    initial?.pinned ? (initial.pinned_rank != null ? String(initial.pinned_rank) : "0") : ""
  );
  const [publishedAtLocal, setPublishedAtLocal] = useState(
    initial ? isoToDatetimeLocalValue(initial.published_at) : isoToDatetimeLocalValue(new Date().toISOString())
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const publishedIso = datetimeLocalToIso(publishedAtLocal);
        if (!publishedIso) {
          setError("Invalid publish date.");
          return;
        }

        if (isEdit && editItemId) {
          const patchBody: Record<string, unknown> = {
            title: title.trim(),
            slug: slug.trim(),
            source_name: sourceName.trim() || null,
            source_url: sourceUrl.trim() || null,
            image_url: imageUrl.trim() || null,
            summary: summary.trim(),
            public_teaser: publicTeaser.trim() || null,
            reflection: reflection.trim() || null,
            member_commentary: memberCommentary.trim() || null,
            scripture_refs: scriptureRefs.trim() || null,
            discernment_notes: discernmentNotes.trim() || null,
            key_takeaways: keyTakeaways.trim() || null,
            category: category || null,
            is_published: isPublished,
            published_at: publishedIso,
            pinned,
          };
          if (pinned) {
            const n = pinnedRank.trim() === "" ? 0 : Number.parseInt(pinnedRank, 10);
            if (!Number.isInteger(n) || n < 0 || n > 999) {
              setError("Pin rank must be a whole number from 0 to 999 (lower shows earlier).");
              setBusy(false);
              return;
            }
            patchBody.pinned_rank = n;
          }

          const res = await fetch(`/api/admin/world-watch/${editItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            setError(typeof data.error === "string" ? data.error : "Save failed.");
            return;
          }
          router.refresh();
          router.push(listHref as Route);
          return;
        }

        const res = await fetch("/api/admin/world-watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim() || null,
            source_name: sourceName.trim() || null,
            source_url: sourceUrl.trim() || null,
            image_url: imageUrl.trim() || null,
            summary: summary.trim(),
            public_teaser: publicTeaser.trim() || null,
            reflection: reflection.trim() || null,
            member_commentary: memberCommentary.trim() || null,
            scripture_refs: scriptureRefs.trim() || null,
            discernment_notes: discernmentNotes.trim() || null,
            key_takeaways: keyTakeaways.trim() || null,
            category: category || null,
            is_published: isPublished,
            published_at: publishedIso,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not create.");
          return;
        }
        if (data.id) {
          router.push(`${listHref.replace(/\/$/, "")}/${data.id}/edit` as Route);
        } else {
          router.push(listHref as Route);
        }
      } catch {
        setError("Network error.");
      } finally {
        setBusy(false);
      }
    },
    [
      category,
      editItemId,
      imageUrl,
      isEdit,
      isPublished,
      listHref,
      pinned,
      pinnedRank,
      publishedAtLocal,
      reflection,
      publicTeaser,
      memberCommentary,
      scriptureRefs,
      discernmentNotes,
      keyTakeaways,
      router,
      slug,
      sourceName,
      sourceUrl,
      summary,
      title,
    ]
  );

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="card border-line/80 p-6 sm:p-8">
      <div
        className="mb-7 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.07] via-soft/[0.08] to-transparent px-4 py-4 sm:px-5 sm:py-5"
        role="region"
        aria-label="Editorial workflow"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/75">Recommended workflow</p>
        <ul className="mt-3 list-none space-y-2.5 text-xs leading-[1.65] text-slate-400">
          <li>
            <span className="font-semibold text-slate-300">Always fill:</span> title, summary (the canonical read), category, published date.
            Add source name/URL when you have a primary link.
          </li>
          <li>
            <span className="font-semibold text-slate-300">Strongly recommended:</span> reflection on the Premium digest—short “how we&apos;re
            reading this” voice. <span className="font-semibold text-slate-300">Public teaser</span> when the full summary is long or you want a
            gentler line on the homepage.
          </li>
          <li>
            <span className="font-semibold text-slate-300">Optional:</span> hero image URL. Premium depth blocks below—use when the story merits
            extra study value (see hints per field).
          </li>
          <li>
            <span className="font-semibold text-slate-300">Worth premium depth when:</span> the headline will lodge emotionally, tempt cynicism or
            panic, or touches institutions, neighbors, or conscience in ways your members will carry into prayer and conversation—not every RSS line
            needs all four blocks.
          </li>
          <li>
            <span className="font-semibold text-slate-300">Cadence:</span> aim for a calm weekly edition (Monday anchor is fine)—quality over
            volume. Pin only 1–2 leads; let the rest breathe.
          </li>
        </ul>
      </div>

      <div className="space-y-5">
        {isEdit && initial?.source_type === "rss" ? (
          <div className="rounded-xl border border-line/60 bg-soft/15 px-4 py-3 text-xs text-slate-400">
            <p className="font-semibold uppercase tracking-[0.14em] text-amber-200/60">Ingested (RSS)</p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed">
              feed <span className="text-slate-300">{initial.source_feed ?? "—"}</span>
              <br />
              guid <span className="text-slate-300">{initial.source_guid ?? "—"}</span>
              <br />
              canonical <span className="break-all text-slate-300">{initial.canonical_url ?? "—"}</span>
              <br />
              feed image <span className="break-all text-slate-300">{initial.external_image_url ?? "—"}</span>
              <br />
              queue <span className="text-slate-300">{initial.ingestion_status}</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Use <span className="text-slate-400">Image URL</span> above to override the feed thumbnail. Display prefers your manual image, then the
              feed image.
            </p>
          </div>
        ) : null}
        <div>
          <label htmlFor="ww-title" className={fieldLabel}>
            Title
          </label>
          <input id="ww-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required maxLength={500} />
        </div>
        <div>
          <label htmlFor="ww-slug" className={fieldLabel}>
            Slug
          </label>
          <input
            id="ww-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClass}
            placeholder={isEdit ? "" : "leave blank to auto-generate from title"}
            maxLength={120}
          />
          <p className="mt-1 text-xs text-muted">Lowercase letters, numbers, and hyphens only (or blank on create).</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ww-src-name" className={fieldLabel}>
              Source name
            </label>
            <input id="ww-src-name" value={sourceName} onChange={(e) => setSourceName(e.target.value)} className={inputClass} maxLength={200} />
          </div>
          <div>
            <label htmlFor="ww-src-url" className={fieldLabel}>
              Source URL
            </label>
            <input id="ww-src-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="ww-img" className={fieldLabel}>
            Image URL (optional)
          </label>
          <input id="ww-img" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ww-cat" className={fieldLabel}>
            Category
          </label>
          <select
            id="ww-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {WORLD_WATCH_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value || "none"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ww-sum" className={fieldLabel}>
            Summary
          </label>
          <p className={fieldHint}>
            The full digest read for members: what happened, tight context, why it&apos;s in World Watch. Neutral-to-warm tone; save hot takes for
            reflection or member commentary. Use blank lines between paragraphs.
          </p>
          <textarea
            id="ww-sum"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            required
            maxLength={12000}
            placeholder="Paragraph 1: lead with facts and charity…&#10;&#10;Paragraph 2: wider context Christians might need…"
            className={`${inputClass} resize-y`}
          />
        </div>
        <div>
          <label htmlFor="ww-teaser" className={fieldLabel}>
            Public teaser (optional)
          </label>
          <p className={fieldHint}>
            <strong className="font-medium text-slate-400">Homepage &amp; public previews only.</strong> When set, replaces the summary there so
            you don&apos;t leak length or tone. Aim for 2–4 short sentences: what happened + why a believer might pause—no member-only jargon, no
            “inside baseball.” If blank, the full summary is shown on previews.
          </p>
          <textarea
            id="ww-teaser"
            value={publicTeaser}
            onChange={(e) => setPublicTeaser(e.target.value)}
            rows={4}
            maxLength={8000}
            placeholder="e.g. Courts ruled X this week. For churches and parents, the real question is how we speak about truth and patience in public without losing neighbor-love."
            className={`${inputClass} resize-y`}
          />
        </div>
        <div>
          <label htmlFor="ww-ref" className={fieldLabel}>
            Reflection (optional)
          </label>
          <p className={fieldHint}>
            Shown on the <strong className="font-medium text-slate-400">Premium</strong> digest as “Reflection”—your editorial voice alongside the
            summary. Short is fine. Separate reporting (summary) from interpretation (here).
          </p>
          <textarea
            id="ww-ref"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={5}
            maxLength={8000}
            placeholder={`How we're sitting with this story—hope, caution, prayer, without claiming more certainty than the facts allow.`}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="rounded-2xl border border-line/55 bg-soft/10 p-4 sm:p-5">
          <p className={fieldLabel}>Premium depth (optional)</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Shown only on the <span className="text-slate-400">member World Watch</span> page in the “Member study” panel. Fill any subset; leave
            whole section empty for lightweight items. Scripture: one reference per line. Discernment &amp; takeaways: start lines with{" "}
            <code className="rounded bg-bg/80 px-1 text-[11px] text-slate-300">- </code> for bullets in the app.
          </p>
          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="ww-mc" className={fieldLabel}>
                Member commentary
              </label>
              <p className={fieldHint}>
                Pastoral / editorial depth for <strong className="font-medium text-slate-400">subscribers only</strong>. 1–3 paragraphs: tie the
                headline to patience, truth, love of neighbor, prayer—no partisan rallying, no predicting outcomes God hasn&apos;t revealed. This is
                “reading the news beside your people.”
              </p>
              <textarea
                id="ww-mc"
                value={memberCommentary}
                onChange={(e) => setMemberCommentary(e.target.value)}
                rows={5}
                maxLength={12000}
                placeholder={`We're not here to score political points. We're here to name what this moment asks of faithfulness—where fear tempts us, where hope is disciplined…`}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label htmlFor="ww-sr" className={fieldLabel}>
                Scripture references
              </label>
              <p className={fieldHint}>
                <strong className="font-medium text-slate-400">One line per reference</strong> (e.g. Psalm 46:1–3). Passages members can open or
                memorize—no long pasted quotes unless essential. These render as a calm list in the study panel.
              </p>
              <textarea
                id="ww-sr"
                value={scriptureRefs}
                onChange={(e) => setScriptureRefs(e.target.value)}
                rows={4}
                maxLength={8000}
                placeholder={"Romans 12:15\n1 Timothy 2:1–2\nPsalm 2:10–12"}
                className={`${inputClass} resize-y font-mono text-[13px]`}
              />
            </div>
            <div>
              <label htmlFor="ww-dn" className={fieldLabel}>
                Discernment notes
              </label>
              <p className={fieldHint}>
                Short bullets that help readers <strong className="font-medium text-slate-400">think clearly</strong>: separate fact vs narrative,
                spot fear/cynicism, notice who’s being dehumanized, questions worth taking to prayer. Prefix each line with{" "}
                <code className="rounded bg-bg/80 px-1 text-[11px] text-slate-300">-</code>.
              </p>
              <textarea
                id="ww-dn"
                value={discernmentNotes}
                onChange={(e) => setDiscernmentNotes(e.target.value)}
                rows={4}
                maxLength={12000}
                placeholder={"- What is actually documented vs. assumed?\n- Where might fear be doing our thinking for us?\n- Who is most vulnerable if we spread cynicism about everyone?"}
                className={`${inputClass} resize-y font-mono text-[13px]`}
              />
            </div>
            <div>
              <label htmlFor="ww-kt" className={fieldLabel}>
                Key takeaways
              </label>
              <p className={fieldHint}>
                <strong className="font-medium text-slate-400">3–5 concrete carry-outs</strong> for the week: prayers, habits, conversations—not
                generic virtues. Prefix with <code className="rounded bg-bg/80 px-1 text-[11px] text-slate-300">-</code>. These appear as a checklist
                for members.
              </p>
              <textarea
                id="ww-kt"
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                rows={4}
                maxLength={8000}
                placeholder={"- Pray for [specific office or place].\n- Name one neighbor to encourage this week.\n- Silence news for one hour; read one psalm slowly."}
                className={`${inputClass} resize-y font-mono text-[13px]`}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ww-pub-at" className={fieldLabel}>
              Published at
            </label>
            <input
              id="ww-pub-at"
              type="datetime-local"
              value={publishedAtLocal}
              onChange={(e) => setPublishedAtLocal(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent/50"
              />
              Published (visible to Premium)
            </label>
            {isEdit ? (
              <>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => {
                      setPinned(e.target.checked);
                      if (!e.target.checked) setPinnedRank("");
                    }}
                    className="h-4 w-4 rounded border-line text-accent focus:ring-accent/50"
                  />
                  Pin to top of World Watch
                </label>
                {pinned ? (
                  <div>
                    <label htmlFor="ww-pin-rank" className={fieldLabel}>
                      Pin rank (lower first)
                    </label>
                    <input
                      id="ww-pin-rank"
                      inputMode="numeric"
                      value={pinnedRank}
                      onChange={(e) => setPinnedRank(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-amber-200/90">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-45"
        >
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>
        <Link
          href={listHref as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-6 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
