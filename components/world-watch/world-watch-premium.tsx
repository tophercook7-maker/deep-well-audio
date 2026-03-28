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
        <p className="text-xs font-medium text-amber-100/90">This week</p>
        <p className="mt-1 text-sm text-muted">
          Week of <span className="text-slate-200">{weekKey}</span> (Monday, UTC). Below is your on-site World Watch—same shape each week, new
          substance as we publish. Read slowly; there is no scorecard for being &ldquo;caught up.&rdquo;
        </p>
      </div>

      <Section icon={Globe} kicker="Landscape" title="What we’re watching">
        <p>
          Public life outruns any single feed. World Watch exists to ask a quieter question:{" "}
          <span className="text-slate-200">what matters for faithfulness in this moment</span>—especially where culture, institutions, and
          neighbors meet.
        </p>
        <p>
          Over time, this space fills with dated, verified threads—election and court timelines, church news abroad, pressures on families—with
          sober sourcing and calm framing. The layout stays familiar so you always know where you are.
        </p>
      </Section>

      <Section icon={BookOpen} kicker="Discernment" title="How to read the headlines">
        <p>
          We keep <span className="text-slate-200">reporting</span>, <span className="text-slate-200">interpretation</span>, and{" "}
          <span className="text-slate-200">application</span> distinct: what happened, what serious voices agree on, and what Christians might do
          in prayer and conversation.
        </p>
        <p>What we sidestep: panic, partisan cheerleading, and treating “staying informed” as its own virtue.</p>
      </Section>

      <Section icon={Church} kicker="Together" title="The local church first">
        <p>
          World Watch ends where Deep Well always ends: <span className="text-slate-200">ordinary means of grace</span>—Lord&apos;s Day
          gathering, singing, the table, elders who know your name. Anything that quietly pulls you away from that without a true outward call
          earns a second look here.
        </p>
      </Section>

      <Section icon={HeartHandshake} kicker="Carry it" title="Prompt for the week">
        <p>
          Name one concern this edition surfaces—a school board, a sister church far away, a debate that drains you—and bring it to the Lord with
          one concrete passage. If you left notes on a Deep Well episode this week, let the headline and the sermon speak to each other: same
          King, same patience.
        </p>
        <Link href={"/explore" as Route} className="inline-block pt-1 text-sm font-medium text-amber-200/90 hover:underline">
          Browse the catalog →
        </Link>
      </Section>
    </div>
  );
}
