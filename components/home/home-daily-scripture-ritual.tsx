"use client";

import { ContinueListeningCard } from "@/components/bible/continue-listening-card";
import { BibleTodaysReadingCard } from "@/components/bible/bible-todays-reading-card";
import { BibleDailyQuickActions } from "@/components/bible/bible-daily-quick-actions";
import { HomeRitualReturnLine } from "@/components/home/home-ritual-return-line";

/**
 * Bible-first daily ritual block for the home screen: audio resume, today’s chapter, fast actions.
 */
export function HomeDailyScriptureRitual() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <HomeRitualReturnLine />
      <ContinueListeningCard />

      <BibleTodaysReadingCard showActionButtons={false} />

      <BibleDailyQuickActions variant="home" />
    </div>
  );
}
