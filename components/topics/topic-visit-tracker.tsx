"use client";

import { useEffect } from "react";
import { setLastOpenedTopicSlug } from "@/lib/last-topic-client";
import { bumpTopicHubVisit } from "@/lib/topic-engagement-client";

export function TopicVisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    setLastOpenedTopicSlug(slug);
    bumpTopicHubVisit(slug);
  }, [slug]);
  return null;
}
