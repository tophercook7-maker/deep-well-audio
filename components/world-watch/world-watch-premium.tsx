import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Church, Globe, HeartHandshake } from "lucide-react";
import type { ReactNode } from "react";
import { digestWeekCampaignKeyUTC } from "@/lib/world-watch/iso-week";

function Section({
  icon: Icon,
  title,
  kicker,
  children,
}: {
  icon: LucideIcon;
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="card border-line/70 p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/[0.07] text-accent">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">{kicker}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export function WorldWatchPremium() {
  const weekKey = digestWeekCampaignKeyUTC();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] px-5 py-4 sm:px-6">
        <p className="text-xs font-medium text-amber-100/90">This edition</p>
        <p className="mt-1 text-sm text-muted">
          Week of <span className="text-slate-200">{weekKey}</span> (UTC Monday). The live briefing below is what Premium members see on site; the
          weekly email mirrors this structure.
        </p>
      </div>

      <Section icon={Globe} kicker="Landscape" title="What we’re watching">
        <p>
          Public life keeps moving faster than any one feed. World Watch is edited to answer a quieter question:{" "}
          <span className="text-slate-200">what matters for faithfulness this week</span>, especially where culture, institutions, and neighbors
          overlap.
        </p>
        <p>
          When editorial is live, this block becomes dated notes on verified developments—election timelines, court actions, overseas church news,
          pressures on families—with sober sourcing. The layout you see here stays put; only the substance under each heading changes week to week.
        </p>
      </Section>

      <Section icon={BookOpen} kicker="Discernment" title="How to read the headlines">
        <p>
          We distinguish <span className="text-slate-200">reporting</span> from <span className="text-slate-200">interpretation</span> from{" "}
          <span className="text-slate-200">application</span>: what happened, what sober analysts agree on, and what Christians might do with that
          in prayer and conversation.
        </p>
        <p>Angles we avoid: panic, partisan cheerleading, and treating “being informed” as a moral act on its own.</p>
      </Section>

      <Section icon={Church} kicker="Together" title="The local church first">
        <p>
          World Watch ends where Deep Well always ends: <span className="text-slate-200">ordinary means of grace</span>—Lord’s Day gathering,
          singing, supper, elders who know your name. Anything that pulls you away from that without a missional reason earns a second look from
          the editors.
        </p>
      </Section>

      <Section icon={HeartHandshake} kicker="Carry it" title="Prompt for the week">
        <p>
          Pick one burden named in this edition—your school board, a sister church abroad, a policy fight that exhausts you—and bring it to prayer
          with a concrete scripture. If you use Deep Well’s notes on an episode this week, tie the headline to what you heard: same King, same
          patience.
        </p>
        <Link href={"/explore" as Route} className="inline-block pt-1 text-sm font-medium text-amber-200/90 hover:underline">
          Go to Explore →
        </Link>
      </Section>
    </div>
  );
}
