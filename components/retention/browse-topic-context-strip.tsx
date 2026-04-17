"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { getFollowedTopicSlugs } from "@/lib/followed-topics-client";
import { getTopicDefinition, normalizeTopicSlug } from "@/lib/topics";
import { useEffect, useState } from "react";

/** When Explore is filtered by topic — plain context, not “personalization.” */
export function BrowseTopicContextStrip() {
  const sp = useSearchParams();
  const raw = sp.get("topic") ?? "";
  const slug = normalizeTopicSlug(raw);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    setFollowed(Boolean(slug && getFollowedTopicSlugs().includes(slug)));
    const onFollow = () => setFollowed(Boolean(slug && getFollowedTopicSlugs().includes(slug)));
    window.addEventListener("deepwell:followed-topics-changed", onFollow);
    return () => window.removeEventListener("deepwell:followed-topics-changed", onFollow);
  }, [slug]);

  if (!slug) return null;
  const meta = getTopicDefinition(slug);
  if (!meta) return null;

  return (
    <div className="mb-6 rounded-2xl border border-line/50 bg-[rgba(9,12,18,0.35)] px-4 py-3 sm:px-5">
      <p className="text-sm text-slate-200/95">
        {followed ? (
          <>
            You follow <span className="font-medium text-amber-100/90">{meta.label}</span>—here&apos;s what&apos;s tagged in the directory right now.{" "}
            <Link href={"/library" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              Saved teachings
            </Link>{" "}
            stay in Your Library.
          </>
        ) : (
          <>
            Exploring <span className="font-medium text-amber-100/90">{meta.label}</span>.{" "}
            <Link href={`/topics/${encodeURIComponent(slug)}` as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              Open the topic hub
            </Link>{" "}
            to follow it—then it stays easy to find from Browse.
          </>
        )}
      </p>
    </div>
  );
}
