"use client";

import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FastForward,
  Pause,
  Play,
  Rewind,
  RotateCcw,
} from "lucide-react";
import type { BibleSleepTimer } from "@/components/bible/bible-listen-sleep";

type Props = {
  showPremiumLock: boolean;
  premiumLockSlot: ReactNode;
  ttsLoading: boolean;
  ttsError: string | null;
  onRetryError: () => void;
  currentTime: number;
  progressMax: number;
  onSeek: (t: number) => void;
  seekByDelta: (d: number) => void;
  ttsReady: boolean;
  canOperate: boolean;
  playing: boolean;
  onTogglePause: () => void;
  bookLabel: string;
  chapter: number;
  displayVerseLine: ReactNode;
  voiceLabel: string;
  translationShort: string;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  loading: boolean;
  rate: number;
  onRateChange: (r: number) => void;
  voiceKey: string;
  onVoiceChange: (key: string) => void;
  voiceOptions: { id: string; label: string }[];
  continueBook: boolean;
  onContinueBookChange: (v: boolean) => void;
  followAlong: boolean;
  onFollowAlongChange: (v: boolean) => void;
  sleepTimer: BibleSleepTimer;
  onSleepTimerChange: (v: BibleSleepTimer) => void;
};

const RATES = [
  [0.75, "0.75×"],
  [0.85, "0.85×"],
  [1, "1×"],
  [1.1, "1.1×"],
  [1.25, "1.25×"],
  [1.4, "1.4×"],
] as const;

const SLEEP_LABELS: Record<BibleSleepTimer, string> = {
  off: "Sleep: Off",
  "10": "Sleep: 10m",
  "15": "Sleep: 15m",
  "30": "Sleep: 30m",
  chapter: "Sleep: End of chapter",
};

export function BibleListenControls(props: Props) {
  const {
    showPremiumLock,
    premiumLockSlot,
    ttsLoading,
    ttsError,
    onRetryError,
    currentTime,
    progressMax,
    onSeek,
    seekByDelta,
    ttsReady,
    canOperate,
    playing,
    onTogglePause,
    bookLabel,
    chapter,
    displayVerseLine,
    voiceLabel,
    translationShort,
    onPrevChapter,
    onNextChapter,
    loading,
    rate,
    onRateChange,
    voiceKey,
    onVoiceChange,
    voiceOptions,
    continueBook,
    onContinueBookChange,
    followAlong,
    onFollowAlongChange,
    sleepTimer,
    onSleepTimerChange,
  } = props;

  const formatClock = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {showPremiumLock ? premiumLockSlot : null}
      {!showPremiumLock && ttsLoading ? (
        <p className="text-center text-xs text-stone-500">Preparing narration…</p>
      ) : !showPremiumLock && ttsError ? (
        <div className="flex items-center justify-center gap-2 text-xs text-amber-200">
          <span className="truncate">{ttsError}</span>
          <button
            type="button"
            onClick={onRetryError}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-600 px-2 py-1 text-stone-200 hover:border-stone-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : null}

      <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
        <span className="w-10 shrink-0 tabular-nums text-[11px] text-stone-500">{formatClock(currentTime)}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => seekByDelta(-15)}
            disabled={!progressMax || !ttsReady || !canOperate}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-200 disabled:opacity-40"
            aria-label="Back 15 seconds"
          >
            <Rewind className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => seekByDelta(15)}
            disabled={!progressMax || !ttsReady || !canOperate}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-200 disabled:opacity-40"
            aria-label="Forward 15 seconds"
          >
            <FastForward className="h-4 w-4" />
          </button>
        </div>
        <label htmlFor="bible-listen-progress" className="sr-only">
          Playback position
        </label>
        <input
          id="bible-listen-progress"
          type="range"
          min={0}
          max={progressMax || 1}
          step={0.1}
          value={Math.min(currentTime, progressMax || 0)}
          disabled={!progressMax || !ttsReady || !canOperate}
          onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
          className="h-1.5 min-w-[100px] flex-1 cursor-pointer appearance-none rounded-full bg-stone-800 accent-amber-500 disabled:opacity-40"
        />
        <span className="w-10 shrink-0 text-right tabular-nums text-[11px] text-stone-500">{formatClock(progressMax)}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onTogglePause}
            disabled={!ttsReady || ttsLoading || !canOperate}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-slate-950 disabled:opacity-40"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-5 w-5" strokeWidth={2} /> : <Play className="h-5 w-5 pl-0.5" strokeWidth={2} />}
          </button>
          <div className="min-w-0 text-sm text-stone-300">
            <p className="truncate font-medium text-stone-100">
              {bookLabel} {chapter}
              {displayVerseLine}
            </p>
            <p className="truncate text-xs text-stone-500">
              {voiceLabel} · {translationShort}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-[min(100%,380px)] sm:items-end">
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onPrevChapter}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-2.5 text-xs font-medium text-stone-200 hover:border-stone-500 disabled:opacity-40"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={onNextChapter}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-2.5 text-xs font-medium text-stone-200 hover:border-stone-500 disabled:opacity-40"
              aria-label="Next chapter"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
            <label className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span className="hidden sm:inline">Speed</span>
              <select
                value={rate}
                onChange={(e) => onRateChange(Number.parseFloat(e.target.value))}
                className="h-9 rounded-lg border border-stone-600 bg-stone-950 px-1.5 text-stone-100"
              >
                {RATES.map(([r, label]) => (
                  <option key={r} value={r}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-stone-400 sm:max-w-[200px]">
              <span className="hidden sm:inline">Voice</span>
              <select
                value={voiceKey}
                onChange={(e) => onVoiceChange(e.target.value)}
                disabled={!ttsReady || !canOperate}
                className="h-9 min-w-0 flex-1 truncate rounded-lg border border-stone-600 bg-stone-950 px-1.5 text-stone-100 disabled:opacity-50"
              >
                {voiceOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-stone-800/80 pt-2 sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <Clock className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden />
              <select
                value={sleepTimer}
                onChange={(e) => onSleepTimerChange(e.target.value as BibleSleepTimer)}
                className="h-9 max-w-[200px] rounded-lg border border-stone-600 bg-stone-950 px-2 text-stone-100"
                aria-label="Sleep timer"
              >
                {(Object.keys(SLEEP_LABELS) as BibleSleepTimer[]).map((k) => (
                  <option key={k} value={k}>
                    {SLEEP_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-stone-400">
              <input
                type="checkbox"
                checked={followAlong}
                onChange={(e) => onFollowAlongChange(e.target.checked)}
                className="rounded border-stone-600 bg-stone-900"
              />
              <span className="hidden sm:inline">Follow along</span>
              <span className="sm:hidden">Follow</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-stone-400">
              <input
                type="checkbox"
                checked={continueBook}
                onChange={(e) => onContinueBookChange(e.target.checked)}
                className="rounded border-stone-600 bg-stone-900"
              />
              <span className="hidden sm:inline">Autoplay chapter</span>
              <span className="sm:hidden">Autoplay</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
