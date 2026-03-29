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
  const [reflection, setReflection] = useState(initial?.reflection ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
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
          const res = await fetch(`/api/admin/world-watch/${editItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              slug: slug.trim(),
              source_name: sourceName.trim() || null,
              source_url: sourceUrl.trim() || null,
              image_url: imageUrl.trim() || null,
              summary: summary.trim(),
              reflection: reflection.trim() || null,
              category: category || null,
              is_published: isPublished,
              published_at: publishedIso,
            }),
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
            reflection: reflection.trim() || null,
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
    [category, editItemId, imageUrl, isEdit, isPublished, listHref, publishedAtLocal, reflection, router, slug, sourceName, sourceUrl, summary, title]
  );

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="card border-line/80 p-6 sm:p-8">
      <div className="space-y-5">
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
          <textarea
            id="ww-sum"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            required
            maxLength={12000}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div>
          <label htmlFor="ww-ref" className={fieldLabel}>
            Reflection (optional)
          </label>
          <textarea
            id="ww-ref"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={5}
            maxLength={8000}
            className={`${inputClass} resize-y`}
          />
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
          <div className="flex flex-col justify-end pb-1">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent/50"
              />
              Published (visible to Premium)
            </label>
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
