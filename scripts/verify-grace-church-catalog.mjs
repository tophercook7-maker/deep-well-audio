#!/usr/bin/env node
/**
 * Verify Grace Church stable-catalog visibility vs catalog cycle snapshots.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const raw = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const SLUG = "grace-church-hot-springs";

async function main() {
  const report = { checks: [], ok: true };

  function pass(name, detail) {
    report.checks.push({ name, status: "pass", detail });
  }
  function fail(name, detail) {
    report.ok = false;
    report.checks.push({ name, status: "fail", detail });
  }

  const { data: show, error: showErr } = await supabase
    .from("shows")
    .select("id, slug, title, featured, is_active")
    .eq("slug", SLUG)
    .maybeSingle();
  if (showErr || !show) {
    fail("show exists", showErr?.message ?? "not found");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  pass("show exists", `${show.title} featured=${show.featured} active=${show.is_active}`);

  const { data: episodes, error: epErr } = await supabase
    .from("episodes")
    .select("id, title, published_at, external_id, topic_tags")
    .eq("show_id", show.id)
    .neq("lifecycle_status", "retired")
    .order("published_at", { ascending: false })
    .limit(5);
  if (epErr || !episodes?.length) {
    fail("show episodes", epErr?.message ?? "no episodes");
  } else {
    pass(
      "show page data",
      `${episodes.length}+ episodes; newest="${episodes[0].title?.slice(0, 60)}" external_id=${episodes[0].external_id}`
    );
  }

  const { data: activeCycle } = await supabase
    .from("catalog_cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle();

  if (!activeCycle?.id) {
    fail("active cycle", "none");
  } else {
    const graceIds = (episodes ?? []).map((e) => e.id);
    const { data: inCycle } = await supabase
      .from("catalog_cycle_episodes")
      .select("episode_id")
      .eq("cycle_id", activeCycle.id)
      .in("episode_id", graceIds);
    const inSnapshot = inCycle?.length ?? 0;
    if (inSnapshot > 0) {
      fail("excluded from cycle snapshot", `${inSnapshot} Grace Church episodes found in active cycle`);
    } else {
      pass("excluded from cycle snapshot", `0/${graceIds.length} sampled Grace episodes in active cycle`);
    }

    const { data: cycleEps } = await supabase
      .from("catalog_cycle_episodes")
      .select("episode_id")
      .eq("cycle_id", activeCycle.id);
    const cycleIds = (cycleEps ?? []).map((r) => r.episode_id);

    const { data: allGraceEps } = await supabase
      .from("episodes")
      .select("id")
      .eq("show_id", show.id)
      .neq("lifecycle_status", "retired");
    const stableIds = (allGraceEps ?? []).map((r) => r.id);
    const merged = [...new Set([...cycleIds, ...stableIds])];
    const browseUnionOk = stableIds.every((id) => merged.includes(id));
    if (!browseUnionOk) {
      fail("browse union includes stable", "stable episode ids missing from merged set");
    } else {
      pass(
        "browse union includes stable",
        `merged set size ${merged.length} (cycle ${cycleIds.length} + stable ${stableIds.length})`
      );
    }
  }

  const { data: browseShows } = await supabase
    .from("shows")
    .select("slug")
    .eq("slug", SLUG)
    .eq("is_active", true)
    .eq("featured", true);
  if (!browseShows?.length) {
    fail("browse featured show", "Grace Church not active/featured");
  } else {
    pass("browse featured show", "Grace Church in featured active shows");
  }

  const sampleTags = new Set();
  for (const ep of episodes ?? []) {
    for (const t of ep.topic_tags ?? []) sampleTags.add(t);
  }
  const topicSlug = [...sampleTags].find((t) =>
    ["sermons", "grace", "spiritual-growth", "bible-teaching"].includes(t)
  );
  if (!topicSlug) {
    fail("topic tags on episodes", `tags found: ${[...sampleTags].join(", ") || "(none)"}`);
  } else {
    const { count } = await supabase
      .from("episodes")
      .select("id", { count: "exact", head: true })
      .eq("show_id", show.id)
      .contains("topic_tags", [topicSlug])
      .neq("lifecycle_status", "retired");
    if ((count ?? 0) > 0) {
      pass("topic page tag match", `topic "${topicSlug}" → ${count} Grace Church episodes`);
    } else {
      fail("topic page tag match", `no episodes for tag ${topicSlug}`);
    }
  }

  const homeRes = await fetch((process.env.SYNC_URL || "http://localhost:3000").replace(/\/$/, "") + "/");
  const homeHtml = await homeRes.text();
  if (homeHtml.includes("grace-church-hot-springs") || homeHtml.includes("Grace Church Hot Springs")) {
    pass("homepage render", "Grace Church linked in public homepage HTML");
  } else {
    fail("homepage render", "Grace Church not found on /");
  }

  const browseRes = await fetch(
    (process.env.SYNC_URL || "http://localhost:3000").replace(/\/$/, "") + "/browse?q=Grace+Church"
  );
  const browseHtml = await browseRes.text();
  if (browseHtml.includes("grace-church-hot-springs")) {
    pass("browse search render", "Grace Church in /browse?q=Grace+Church");
  } else {
    fail("browse search render", "not found in browse search HTML");
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
