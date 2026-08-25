"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Headphones,
  Sliders,
  ChevronUp,
  ChevronDown,
  X,
  Mic,
} from "lucide-react";

interface AudiobookPlayerProps {
  paragraphs: string[];
  chapterTitle: string;
  chapterNumber: number;
  authorName: string;
  currentParagraphIdx: number;
  onParagraphChange: (idx: number) => void;
  onClose: () => void;
  onChapterComplete?: () => void;
}

export function AudiobookPlayer({
  paragraphs,
  chapterTitle,
  chapterNumber,
  authorName,
  currentParagraphIdx,
  onParagraphChange,
  onClose,
  onChapterComplete,
}: AudiobookPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoiceList = () => {
        if (!synthRef.current) return;
        const available = synthRef.current.getVoices();
        // Prioritize English & natural sounding voices
        const filtered = available.filter((v) => v.lang.startsWith("en") || v.lang.startsWith("hi") || v.lang.startsWith("ja"));
        const finalList = filtered.length > 0 ? filtered : available;
        setVoices(finalList);

        // Pick preferred natural sounding voice
        const preferredIdx = finalList.findIndex(
          (v) =>
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("george")
        );
        if (preferredIdx !== -1) {
          setSelectedVoiceIdx(preferredIdx);
        }
      };

      updateVoiceList();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoiceList;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sleep Timer countdown loop
  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) {
      if (sleepTimerRemaining === 0) {
        handlePause();
        setSleepTimerRemaining(null);
        setSleepTimerMinutes(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerRemaining]);

  const speakParagraph = (idx: number) => {
    if (!synthRef.current || idx < 0 || idx >= paragraphs.length) {
      if (idx >= paragraphs.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (onChapterComplete) onChapterComplete();
      }
      return;
    }

    synthRef.current.cancel();

    const textToSpeak = paragraphs[idx].trim();
    if (!textToSpeak) {
      // skip empty
      onParagraphChange(idx + 1);
      speakParagraph(idx + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utterance.pitch = pitch;
    utterance.volume = isMuted ? 0 : 1;

    if (voices[selectedVoiceIdx]) {
      utterance.voice = voices[selectedVoiceIdx];
    }

    utterance.onend = () => {
      if (isPlayingRef.current && idx + 1 < paragraphs.length) {
        onParagraphChange(idx + 1);
        speakParagraph(idx + 1);
      } else if (idx + 1 >= paragraphs.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (onChapterComplete) onChapterComplete();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      speakParagraph(currentParagraphIdx);
    }
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSkipNext = () => {
    if (currentParagraphIdx + 1 < paragraphs.length) {
      const nextIdx = currentParagraphIdx + 1;
      onParagraphChange(nextIdx);
      if (isPlaying || isPaused) {
        setIsPaused(false);
        setIsPlaying(true);
        isPlayingRef.current = true;
        speakParagraph(nextIdx);
      }
    }
  };

  const handleSkipPrev = () => {
    if (currentParagraphIdx > 0) {
      const prevIdx = currentParagraphIdx - 1;
      onParagraphChange(prevIdx);
      if (isPlaying || isPaused) {
        setIsPaused(false);
        setIsPlaying(true);
        isPlayingRef.current = true;
        speakParagraph(prevIdx);
      }
    }
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (isPlaying) {
      speakParagraph(currentParagraphIdx);
    }
  };

  const handleVoiceChange = (idx: number) => {
    setSelectedVoiceIdx(idx);
    if (isPlaying) {
      speakParagraph(currentParagraphIdx);
    }
  };

  const handleSetSleepTimer = (mins: number | null) => {
    setSleepTimerMinutes(mins);
    if (mins === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(mins * 60);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((currentParagraphIdx + 1) / Math.max(1, paragraphs.length)) * 100)
  );

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-bottom duration-300">
      <div className="bg-zinc-950/95 dark:bg-zinc-900/95 text-white backdrop-blur-2xl border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-rose-500/20">
        {/* Glow Accent Progress Line */}
        <div className="h-1 bg-zinc-800 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Audio Player Bar */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Top Row: Track Meta & Controls */}
          <div className="flex items-center justify-between gap-3">
            {/* Story & Chapter Info with Live Soundwave */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 bg-white rounded-full animate-bounce h-2" />
                    <span className="w-1 bg-white rounded-full animate-bounce h-4 delay-75" />
                    <span className="w-1 bg-white rounded-full animate-bounce h-3 delay-150" />
                  </div>
                ) : (
                  <Headphones className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase">
                    AI Narrator
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium truncate">
                    Ch. {chapterNumber}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate mt-0.5">
                  {chapterTitle}
                </h4>
                <p className="text-[10px] text-zinc-400 truncate">
                  Paragraph {currentParagraphIdx + 1} of {paragraphs.length} ({progressPercent}%)
                </p>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Voice & Speed Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Close Audiobook Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Controls Row: Prev, Play/Pause, Next, Speed, Sleep */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Speed Quick Selector */}
            <div className="flex items-center gap-1">
              {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    playbackRate === rate
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Center Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipPrev}
                disabled={currentParagraphIdx <= 0}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                title="Previous Paragraph"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transform active:scale-95 transition cursor-pointer"
                title={isPlaying ? "Pause Narration" : "Play Narration"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleSkipNext}
                disabled={currentParagraphIdx + 1 >= paragraphs.length}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                title="Next Paragraph"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Sleep Timer Indicator & Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const nextMins =
                    sleepTimerMinutes === null
                      ? 15
                      : sleepTimerMinutes === 15
                      ? 30
                      : sleepTimerMinutes === 30
                      ? 45
                      : null;
                  handleSetSleepTimer(nextMins);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  sleepTimerRemaining !== null
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-white"
                }`}
                title="Sleep Timer (Click to set 15m / 30m / 45m / Off)"
              >
                <Clock className="w-3 h-3" />
                <span>
                  {sleepTimerRemaining !== null ? formatTimer(sleepTimerRemaining) : "Timer"}
                </span>
              </button>
            </div>
          </div>

          {/* Expanded Settings Drawer (Voice Selector & Pitch) */}
          {isExpanded && (
            <div className="pt-3 border-t border-zinc-800 space-y-3 animate-in fade-in">
              {/* Voice Selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Mic className="w-3 h-3 text-rose-500" />
                  <span>Narrator Voice</span>
                </label>
                <select
                  value={selectedVoiceIdx}
                  onChange={(e) => handleVoiceChange(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {voices.map((v, i) => (
                    <option key={`${v.name}-${i}`} value={i}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pitch Slider */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
                  <span>Narrator Pitch / Tone</span>
                  <span className="text-amber-400">{pitch.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.4}
                  step={0.1}
                  value={pitch}
                  onChange={(e) => {
                    const newPitch = parseFloat(e.target.value);
                    setPitch(newPitch);
                    if (isPlaying) speakParagraph(currentParagraphIdx);
                  }}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
