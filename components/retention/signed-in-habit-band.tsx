"use client";

import type { UserPlan } from "@/lib/permissions";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { WeeklyMomentumLine } from "@/components/retention/weekly-momentum";
import { RecentActivityStrip } from "@/components/retention/recent-activity-strip";
import { PickUpTodayCard } from "@/components/retention/pick-up-today-card";
import { WorldWatchReturnNudge, type WorldWatchTeaser } from "@/components/retention/world-watch-return-nudge";
import { FollowedTopicsShelf } from "@/components/retention/followed-topics-shelf";

type Props = {
  plan: UserPlan;
  worldWatchLatest: WorldWatchTeaser | null;
  /** Show the large Continue module (hide on dashboard where it already exists above). */
  showContinueModule?: boolean;
  /** When the Continue module is shown, omit the duplicate row inside Pick up. */
  hidePickUpContinueRow?: boolean;
  /** Dashboard already lists recent plays separately. */
  omitActivityStrip?: boolean;
  /** Dashboard has a full World Watch section below. */
  omitWorldWatchNudge?: boolean;
};

export function SignedInHabitBand({
  plan,
  worldWatchLatest,
  showContinueModule = true,
  hidePickUpContinueRow = false,
  omitActivityStrip = false,
  omitWorldWatchNudge = false,
}: Props) {
  return (
    <div className="space-y-6">
      {showContinueModule ? (
        <ContinueListeningSection enabled={plan === "free" || plan === "premium"} />
      ) : null}

      <div className={`grid gap-4 ${omitActivityStrip ? "" : "lg:grid-cols-2"}`}>
        <WeeklyMomentumLine plan={plan} />
        {omitActivityStrip ? null : <RecentActivityStrip plan={plan} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PickUpTodayCard plan={plan} hideContinueRow={hidePickUpContinueRow} />
        <div className="space-y-4">
          {omitWorldWatchNudge ? null : <WorldWatchReturnNudge latest={worldWatchLatest} />}
          <FollowedTopicsShelf />
        </div>
      </div>
    </div>
  );
}
