"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Sliders,
  X,
  Mic,
  Zap,
  Music,
  User,
  Radio,
  Edit3,
  Plus,
  Trash2,
  Save,
  Check,
} from "lucide-react";

export interface MangaDialogueLine {
  panelIndex: number;
  speaker: string;
  role: "NARRATOR" | "HERO" | "HEROINE" | "VILLAIN" | "RIVAL" | "SYSTEM";
  avatar: string;
  dialogue: string;
  sfx?: "SWORD_CLASH" | "ENERGY_SURGE" | "EXPLOSION" | "RAIN_AMBIENT" | "THUNDER" | "WIND" | "SYSTEM_CHIME";
}

interface MangaDubbingPlayerProps {
  comicTitle: string;
  episodeTitle: string;
  episodeNumber: number;
  totalPages: number;
  activePanelIndex: number;
  onPanelChange: (panelIndex: number) => void;
  onClose: () => void;
}

export function MangaDubbingPlayer({
  comicTitle,
  episodeTitle,
  episodeNumber,
  totalPages,
  activePanelIndex,
  onPanelChange,
  onClose,
}: MangaDubbingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [enableSfx, setEnableSfx] = useState(true);
  const [isEditingScript, setIsEditingScript] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [maleVoice, setMaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [narratorVoice, setNarratorVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [systemVoice, setSystemVoice] = useState<SpeechSynthesisVoice | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const storageKey = `manga-dub-${comicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ep-${episodeNumber}-v3`;

  // Smart Initial Script generator tailored to the specific comic!
  const getInitialScript = (): MangaDialogueLine[] => {
    const titleLower = comicTitle.toLowerCase();
    const epTitleLower = episodeTitle.toLowerCase();

    // Exact word-for-word dialogue from "The RPG" Chapter 1 (Sunshine High School)
    if (titleLower.includes("rpg") || epTitleLower.includes("first day") || titleLower.includes("school")) {
      return [
        {
          panelIndex: 0,
          speaker: "Title",
          role: "NARRATOR",
          avatar: "🎙️",
          dialogue: "Chapter 1: My First Day, My First Humiliation!",
          sfx: "WIND",
        },
        {
          panelIndex: 0,
          speaker: "Narrator",
          role: "NARRATOR",
          avatar: "🏫",
          dialogue: "Sunshine High School. Where legends are born... or totally roasted.",
          sfx: "WIND",
        },
        {
          panelIndex: 0,
          speaker: "Protagonist",
          role: "HERO",
          avatar: "⚡",
          dialogue: "Today is...",
          sfx: "WIND",
        },
        {
          panelIndex: 0,
          speaker: "Protagonist",
          role: "HERO",
          avatar: "⚡",
          dialogue: "Heh... Everyone will be impressed by my confidence!",
          sfx: "ENERGY_SURGE",
        },
        {
          panelIndex: 0,
          speaker: "Students",
          role: "HEROINE",
          avatar: "👥",
          dialogue: "Overconfident alert!",
          sfx: "WIND",
        },
      ];
    }

    // Default Fallback Adventure Script
    return [
      {
        panelIndex: 0,
        speaker: "Narrator",
        role: "NARRATOR",
        avatar: "🎙️",
        dialogue: `${comicTitle} • Episode ${episodeNumber}: ${episodeTitle}. The journey begins as fate unfolds.`,
        sfx: "RAIN_AMBIENT",
      },
      {
        panelIndex: 0,
        speaker: "Hero",
        role: "HERO",
        avatar: "⚡",
        dialogue: "No matter what obstacles stand in my way, I will master this power and change my destiny.",
        sfx: "ENERGY_SURGE",
      },
    ];
  };

  const [scriptLines, setScriptLines] = useState<MangaDialogueLine[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasStale = parsed.some(
              (p: { dialogue?: string }) =>
                p.dialogue?.includes("Neo-Tokyo") && comicTitle.toLowerCase().includes("rpg")
            );
            if (!hasStale) return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return getInitialScript();
  });

  // Save custom script lines to localStorage
  const saveScript = (newLines: MangaDialogueLine[]) => {
    setScriptLines(newLines);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newLines));
    } catch {
      // ignore
    }
  };

  // Sync and ensure comic-specific dialogues on mount
  useEffect(() => {
    if (comicTitle.toLowerCase().includes("rpg")) {
      const initial = getInitialScript();
      setScriptLines(initial);
    }
  }, [comicTitle, episodeNumber]);

  // Initialize Web Speech API & Character Voice Mapping
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        if (!synthRef.current) return;
        const available = synthRef.current.getVoices();
        setVoices(available);

        // Male Voice
        const male =
          available.find(
            (v) =>
              (v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("guy") ||
                v.name.toLowerCase().includes("george")) &&
              v.lang.startsWith("en")
          ) || available[0];

        // Female Voice
        const female =
          available.find(
            (v) =>
              (v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("zira") ||
                v.name.toLowerCase().includes("aria") ||
                v.name.toLowerCase().includes("samantha")) &&
              v.lang.startsWith("en")
          ) ||
          available[1] ||
          available[0];

        setMaleVoice(male);
        setFemaleVoice(female);
        setNarratorVoice(male);
        setSystemVoice(female || male);
      };

      updateVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  // Web Audio Synthesizer for Free Instant Dynamic Sound FX
  const playSoundEffect = (type?: string) => {
    if (!enableSfx || !type) return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "SYSTEM_CHIME") {
        // High-tech Dual Resonance Crystal System Chime (Solo Leveling Ding-Ding!)
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now); // C6 note
        osc.frequency.setValueAtTime(2093.0, now + 0.08); // C7 high note
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "SWORD_CLASH") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "ENERGY_SURGE") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "EXPLOSION") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(540, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // ignore
    }
  };

  const speakLine = (idx: number) => {
    if (!synthRef.current || idx < 0 || idx >= scriptLines.length) {
      if (idx >= scriptLines.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
      return;
    }

    synthRef.current.cancel();
    const item = scriptLines[idx];

    // Auto-scroll comic reader to this panel!
    onPanelChange(item.panelIndex);
    playSoundEffect(item.sfx);

    const utterance = new SpeechSynthesisUtterance(item.dialogue);

    // Assign Character specific Voice & Pitch
    if (item.role === "SYSTEM") {
      if (systemVoice) utterance.voice = systemVoice;
      utterance.pitch = 1.38;
      utterance.rate = 1.12;
    } else if (item.role === "HEROINE") {
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.25;
      utterance.rate = 1.05;
    } else if (item.role === "VILLAIN") {
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.75;
      utterance.rate = 0.92;
    } else if (item.role === "HERO") {
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
    } else {
      if (narratorVoice) utterance.voice = narratorVoice;
      utterance.pitch = 0.95;
      utterance.rate = 0.98;
    }

    utterance.onend = () => {
      if (isPlayingRef.current && idx + 1 < scriptLines.length) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            setCurrentLineIdx(idx + 1);
            speakLine(idx + 1);
          }
        }, 600);
      } else if (idx + 1 >= scriptLines.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    synthRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (!synthRef.current) return;
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    speakLine(currentLineIdx);
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const handleNextLine = () => {
    if (currentLineIdx + 1 < scriptLines.length) {
      const next = currentLineIdx + 1;
      setCurrentLineIdx(next);
      if (isPlaying || isPaused) {
        setIsPlaying(true);
        setIsPaused(false);
        isPlayingRef.current = true;
        speakLine(next);
      }
    }
  };

  const handlePrevLine = () => {
    if (currentLineIdx > 0) {
      const prev = currentLineIdx - 1;
      setCurrentLineIdx(prev);
      if (isPlaying || isPaused) {
        setIsPlaying(true);
        setIsPaused(false);
        isPlayingRef.current = true;
        speakLine(prev);
      }
    }
  };

  const currentLine = scriptLines[currentLineIdx] || scriptLines[0];

  return (
    <>
      {/* 1. COMPACT SLIM SUBTITLE PILL (TOP) */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg animate-in slide-in-from-top duration-300 pointer-events-none">
        <div className="p-3 px-4 rounded-2xl bg-zinc-950/90 text-white backdrop-blur-xl border border-zinc-700/80 shadow-2xl space-y-1 ring-1 ring-white/10 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">{currentLine?.avatar || "💬"}</span>
            <span className="font-extrabold text-xs text-rose-400">
              {currentLine?.speaker || "Speaker"}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold leading-snug text-zinc-100 font-sans">
            &ldquo;{currentLine?.dialogue}&rdquo;
          </p>
        </div>
      </div>

      {/* 2. DUBBING AUDIO CONTROLLER DOCK (BOTTOM) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-bottom duration-300">
        <div className="bg-zinc-950/95 text-white backdrop-blur-2xl border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-rose-500/30">
          {/* Progress bar */}
          <div className="h-1 bg-zinc-800 w-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.round(((currentLineIdx + 1) / (scriptLines.length || 1)) * 100)}%`,
              }}
            />
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            {/* Meta Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
                  {isPlaying ? (
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <Headphones className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase">
                      AI Manga Dubbing
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      Ep. {episodeNumber}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate mt-0.5">
                    {comicTitle} • Panel {(currentLine?.panelIndex || 0) + 1}
                  </h4>
                </div>
              </div>

              {/* Action Buttons: Edit Script & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditingScript(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Customize & Edit Exact Speech Bubble Voice Lines"
                >
                  <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Edit Voice Script</span>
                </button>

                <button
                  onClick={() => {
                    if (synthRef.current) synthRef.current.cancel();
                    onClose();
                  }}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Exit Manga Dubbing Mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
              {/* Sound FX Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEnableSfx(!enableSfx)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    enableSfx
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                  title="Dynamic Action Sound FX (System Chime, Swords, Energy)"
                >
                  <Zap className="w-3 h-3" />
                  <span>SFX {enableSfx ? "ON" : "OFF"}</span>
                </button>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevLine}
                  disabled={currentLineIdx <= 0}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                  title="Previous Dialogue Line"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transform active:scale-95 transition cursor-pointer"
                  title={isPlaying ? "Pause Dubbing" : "Play Voice Narration"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextLine}
                  disabled={currentLineIdx + 1 >= scriptLines.length}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition cursor-pointer"
                  title="Next Dialogue Line"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Line indicator */}
              <div className="text-[11px] font-mono text-zinc-400 font-bold">
                {currentLineIdx + 1} / {scriptLines.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IN-READER VOICE SCRIPT CUSTOMIZER MODAL */}
      {isEditingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-base text-zinc-100 flex items-center gap-2">
                  <span>Manga Dialogue Script Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                    {scriptLines.length} Lines
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Add or edit exact character dialogues for each panel of &ldquo;{comicTitle}&rdquo;.
                </p>
              </div>

              <button
                onClick={() => setIsEditingScript(false)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lines List */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {scriptLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500 font-bold">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={line.speaker}
                        onChange={(e) => {
                          const updated = [...scriptLines];
                          updated[idx].speaker = e.target.value;
                          setScriptLines(updated);
                        }}
                        placeholder="Speaker (e.g. Hero, Akira)"
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500 w-36"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={line.role}
                        onChange={(e) => {
                          const updated = [...scriptLines];
                          const r = e.target.value as MangaDialogueLine["role"];
                          updated[idx].role = r;
                          updated[idx].avatar =
                            r === "SYSTEM"
                              ? "💠"
                              : r === "HERO"
                              ? "⚡"
                              : r === "HEROINE"
                              ? "🌸"
                              : r === "VILLAIN"
                              ? "👑"
                              : "🎙️";
                          setScriptLines(updated);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500"
                      >
                        <option value="HERO">HERO (Male Voice)</option>
                        <option value="HEROINE">HEROINE (Female Voice)</option>
                        <option value="SYSTEM">SYSTEM (AI Chime Voice)</option>
                        <option value="VILLAIN">VILLAIN (Deep Dark Voice)</option>
                        <option value="NARRATOR">NARRATOR</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          if (synthRef.current) {
                            synthRef.current.cancel();
                            const u = new SpeechSynthesisUtterance(line.dialogue || "Test Voice");
                            if (line.role === "HEROINE" && femaleVoice) u.voice = femaleVoice;
                            else if (maleVoice) u.voice = maleVoice;
                            synthRef.current.speak(u);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-rose-400 flex items-center gap-1 cursor-pointer"
                        title="Test how this line sounds"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Test</span>
                      </button>

                      <button
                        onClick={() => {
                          const updated = scriptLines.filter((_, i) => i !== idx);
                          setScriptLines(updated);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-500 transition cursor-pointer"
                        title="Delete Line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={line.dialogue}
                    onChange={(e) => {
                      const updated = [...scriptLines];
                      updated[idx].dialogue = e.target.value;
                      setScriptLines(updated);
                    }}
                    placeholder="Enter speech bubble dialogue..."
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setScriptLines([
                    ...scriptLines,
                    {
                      panelIndex: 0,
                      speaker: "Character",
                      role: "HERO",
                      avatar: "⚡",
                      dialogue: "New speech bubble line...",
                      sfx: "ENERGY_SURGE",
                    },
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Dialogue Line</span>
              </button>

              <button
                onClick={() => {
                  saveScript(scriptLines);
                  setIsEditingScript(false);
                  alert("Voice script saved successfully!");
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 font-black text-xs uppercase text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Voice Script</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
