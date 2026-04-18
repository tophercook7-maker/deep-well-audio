"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BibleApiVerse } from "@/lib/study/bible-api";

export type SpeechPlaybackOptions = {
  rate: number;
  voice: SpeechSynthesisVoice | null;
  /** Fires when a new verse starts (follow-along). */
  onVerseStart?: (verseNumber: number) => void;
  /** Last verse of the range finished (chapter or selection complete). */
  onRangeComplete?: () => void;
};

/**
 * Verse-level playback using the Web Speech API (no external audio URLs).
 * Suitable for calm read-along; quality depends on browser / OS voices.
 */
export function useBibleSpeechPlayback() {
  const [playing, setPlaying] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const versesRef = useRef<BibleApiVerse[]>([]);
  const idxRef = useRef(0);
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setActiveVerse(null);
  }, []);

  const playVerseRange = useCallback(
    (verses: BibleApiVerse[], startIndex: number, opts: SpeechPlaybackOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      cancelledRef.current = false;
      versesRef.current = verses;
      const maxStart = Math.max(0, verses.length - 1);
      idxRef.current = Math.min(Math.max(0, startIndex), maxStart);
      setPlaying(true);

      const step = () => {
        if (cancelledRef.current) return;
        const list = versesRef.current;
        const i = idxRef.current;
        if (i >= list.length) {
          setPlaying(false);
          setActiveVerse(null);
          opts.onRangeComplete?.();
          return;
        }
        const verse = list[i]!;
        setActiveVerse(verse.verse);
        opts.onVerseStart?.(verse.verse);
        const text = verse.text.replace(/\s+/g, " ").trim();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = opts.rate;
        if (opts.voice) u.voice = opts.voice;
        u.onend = () => {
          if (cancelledRef.current) return;
          idxRef.current = i + 1;
          step();
        };
        u.onerror = () => {
          setPlaying(false);
          setActiveVerse(null);
        };
        window.speechSynthesis.speak(u);
      };

      step();
    },
    []
  );

  return { playing, activeVerse, playVerseRange, stop };
}

/** English-first voice list; falls back to all voices if none match. */
export function useEnglishSpeechVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const refresh = () => {
      const all = window.speechSynthesis.getVoices();
      const en = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
      setVoices(en.length > 0 ? en : all);
    };

    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  return voices;
}

export function voiceStorageKey(v: SpeechSynthesisVoice): string {
  return v.voiceURI || `${v.name}|${v.lang}`;
}

export function resolveVoiceFromKey(voices: SpeechSynthesisVoice[], key: string | null): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  if (!key) return voices.find((v) => v.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
  const byUri = voices.find((v) => v.voiceURI === key);
  if (byUri) return byUri;
  const pipe = key.indexOf("|");
  if (pipe > 0) {
    const name = key.slice(0, pipe);
    const lang = key.slice(pipe + 1);
    return voices.find((v) => v.name === name && v.lang === lang) ?? null;
  }
  return voices.find((v) => v.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
}
