"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Flame,
  Send,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Zap,
  Smile,
  X,
  ChevronUp,
  Volume2,
} from "lucide-react";

export interface DanmakuComment {
  id: string;
  text: string;
  user: string;
  avatar?: string;
  color?: "gold" | "cyan" | "pink" | "purple" | "white" | "emerald";
  timestamp: number;
  leftPercent?: number; // Side margin track position
  topPercent?: number;
  speedSeconds: number;
  badge?: string;
}

const SIDE_TRACKS = [3, 7, 12, 78, 84, 90];

interface DanmakuOverlayProps {
  storyId: string;
  episodeNumber: number;
  storyTitle?: string;
  className?: string;
  isVisible?: boolean;
}

const DEFAULT_DANMAKU_REACTIONS = [
  { text: "PEAK FICTION! 🔥", color: "gold", badge: "VIP" },
  { text: "Bro did NOT just say that 💀💀", color: "white", badge: "Reader" },
  { text: "THE SYSTEM CHIME GIVES ME CHILLS 💠", color: "cyan", badge: "Hunter" },
  { text: "This art quality is illegal wtfff 😱", color: "pink", badge: "Artist" },
  { text: "Sunshine High School is wilding lmao 😂", color: "purple", badge: "Student" },
  { text: "GOAT MOMENT RIGHT HERE 🐐🐐", color: "gold", badge: "Top 1%" },
  { text: "Overconfident alert for real haha 🤣", color: "emerald", badge: "Classmate" },
  { text: "Chapter 2 when?! I need it NOW! ⚡", color: "cyan", badge: "FastPass" },
];

const COLOR_MAP: Record<string, string> = {
  gold: "bg-amber-950/80 border-amber-400/70 text-amber-300 shadow-amber-500/20",
  cyan: "bg-cyan-950/80 border-cyan-400/70 text-cyan-200 shadow-cyan-500/20",
  pink: "bg-rose-950/80 border-rose-400/70 text-rose-200 shadow-rose-500/20",
  purple: "bg-purple-950/80 border-purple-400/70 text-purple-200 shadow-purple-500/20",
  emerald: "bg-emerald-950/80 border-emerald-400/70 text-emerald-200 shadow-emerald-500/20",
  white: "bg-zinc-900/80 border-zinc-500/60 text-white shadow-black/30",
};

export default function DanmakuOverlay({
  storyId,
  episodeNumber,
  storyTitle = "Story",
  className = "",
  isVisible = true,
}: DanmakuOverlayProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [opacity, setOpacity] = useState(0.85);
  const [activeBullets, setActiveBullets] = useState<DanmakuComment[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedColor, setSelectedColor] = useState<DanmakuComment["color"]>("gold");
  const [isReactionDrawerOpen, setIsReactionDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const storageKey = `danmaku-${storyId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ep-${episodeNumber}`;

  // 1. Load or initialize comments stream
  useEffect(() => {
    let initialList: DanmakuComment[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          initialList = JSON.parse(saved);
        }
      } catch {
        // ignore
      }
    }

    if (initialList.length === 0) {
      initialList = DEFAULT_DANMAKU_REACTIONS.map((r, i) => ({
        id: `bullet-init-${i}-${Date.now()}`,
        text: r.text,
        user: `Reader_${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: ["⚡", "🌸", "👑", "🔥", "💠", "🍿", "🚀"][i % 7],
        color: r.color as any,
        badge: r.badge,
        timestamp: Date.now(),
        leftPercent: SIDE_TRACKS[i % SIDE_TRACKS.length],
        speedSeconds: 10 + (i % 4) * 2,
      }));
    }

    // Interval to spawn bullet comments vertically on side margins
    let bulletIndex = 0;
    const interval = setInterval(() => {
      if (!isEnabled) return;
      const seed = initialList[bulletIndex % initialList.length];
      bulletIndex++;

      const newBullet: DanmakuComment = {
        ...seed,
        id: `bullet-${Date.now()}-${Math.random()}`,
        leftPercent: SIDE_TRACKS[bulletIndex % SIDE_TRACKS.length],
        speedSeconds: 10 + Math.random() * 4,
      };

      setActiveBullets((prev) => [...prev.slice(-12), newBullet]);
    }, 3200);

    return () => clearInterval(interval);
  }, [isEnabled, storageKey]);

  // Clean up bullets that have flown off screen
  const removeBullet = (id: string) => {
    setActiveBullets((prev) => prev.filter((b) => b.id !== id));
  };

  // Send a new live Bullet Comment
  const handleSendBullet = (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    const newBullet: DanmakuComment = {
      id: `bullet-user-${Date.now()}`,
      text: textToSend,
      user: "You",
      avatar: "🔥",
      color: selectedColor,
      badge: "LIVE",
      timestamp: Date.now(),
      leftPercent: 84,
      speedSeconds: 9.5,
    };

    setActiveBullets((prev) => [...prev, newBullet]);

    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        const list = saved ? JSON.parse(saved) : [];
        list.push(newBullet);
        localStorage.setItem(storageKey, JSON.stringify(list.slice(-30)));
      } catch {}
    }

    setInputText("");
  };

  return (
    <>
      {/* 1. FLOATING DANMAKU BULLET STREAM CANVAS */}
      {isEnabled && (
        <div
          className={`fixed inset-0 pointer-events-none z-30 overflow-hidden ${className}`}
          style={{ opacity }}
        >
          {activeBullets.map((bullet) => (
            <div
              key={bullet.id}
              onAnimationEnd={() => removeBullet(bullet.id)}
              className="absolute bottom-0 flex items-center pointer-events-none select-none z-30"
              style={{
                left: `${bullet.leftPercent ?? 84}%`,
                animation: `danmakuVerticalFly ${bullet.speedSeconds}s linear forwards`,
              }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs ${
                  COLOR_MAP[bullet.color || "gold"]
                }`}
              >
                <span className="text-[10px] leading-none">{bullet.avatar || "💬"}</span>
                {bullet.badge && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-black/40 font-mono uppercase tracking-wider font-extrabold leading-tight">
                    {bullet.badge}
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-tight truncate max-w-[140px] sm:max-w-[200px] leading-tight drop-shadow-xs">
                  {bullet.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. FLOATING LIVE REACTION CONTROLLER BAR (BOTTOM RIGHT) */}
      <div
        className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 max-w-sm w-full pointer-events-auto transition-all duration-300 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        {/* Expanded Quick-Reaction Drawer */}
        {isReactionDrawerOpen && (
          <div className="w-full bg-zinc-950/95 border border-zinc-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-white space-y-3 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-extrabold text-xs tracking-wide">
                  Live Danmaku Reaction
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  title="Danmaku Settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsReactionDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Settings Sub-drawer */}
            {isSettingsOpen && (
              <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold text-[11px]">Bullet Stream</span>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      isEnabled ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isEnabled ? "ON" : "OFF"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold text-[11px]">Opacity</span>
                  <div className="flex items-center gap-1">
                    {[0.5, 0.75, 1.0].map((op) => (
                      <button
                        key={op}
                        onClick={() => setOpacity(op)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          opacity === op ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {op * 100}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1-Tap Instant Quick-Fire Reaction Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {DEFAULT_DANMAKU_REACTIONS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSendBullet(r.text)}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-200 transition active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>{r.text}</span>
                </button>
              ))}
            </div>

            {/* Custom Input & Color Palette */}
            <div className="space-y-2 pt-1 border-t border-zinc-800">
              <div className="flex items-center gap-1">
                {(["gold", "cyan", "pink", "purple", "emerald", "white"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-4 h-4 rounded-full border transition ${
                      c === "gold"
                        ? "bg-amber-400 border-amber-300"
                        : c === "cyan"
                        ? "bg-cyan-400 border-cyan-300"
                        : c === "pink"
                        ? "bg-rose-400 border-rose-300"
                        : c === "purple"
                        ? "bg-purple-400 border-purple-300"
                        : c === "emerald"
                        ? "bg-emerald-400 border-emerald-300"
                        : "bg-white border-zinc-400"
                    } ${selectedColor === c ? "ring-2 ring-white scale-110" : "opacity-60"}`}
                    title={`Color: ${c}`}
                  />
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendBullet();
                }}
                className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 pr-1.5 focus-within:border-indigo-500 transition"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Send live bullet reaction..."
                  maxLength={60}
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 disabled:opacity-30 text-white transition cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Trigger Pill (Compact Size) */}
        <button
          onClick={() => setIsReactionDrawerOpen(!isReactionDrawerOpen)}
          className={`px-2.5 py-1.5 rounded-xl backdrop-blur-xl border font-bold text-[11px] transition-all duration-300 flex items-center gap-1.5 shadow-lg cursor-pointer ${
            isReactionDrawerOpen
              ? "bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 text-white border-white/20 shadow-rose-500/20 scale-102"
              : isEnabled
              ? "bg-zinc-950/85 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
              : "bg-zinc-950/50 text-zinc-500 border-zinc-800"
          }`}
          title="Toggle Live Danmaku Bullet Comments"
        >
          <div className="relative">
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
            {isEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span>Danmaku {isEnabled ? "ON" : "OFF"}</span>
          <ChevronUp
            className={`w-3 h-3 transition-transform ${
              isReactionDrawerOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Global CSS Animation for Danmaku Vertical Floating Flight */}
      <style jsx global>{`
        @keyframes danmakuVerticalFly {
          0% {
            transform: translateY(102vh);
            opacity: 0;
          }
          6% {
            opacity: 0.88;
          }
          90% {
            opacity: 0.88;
          }
          100% {
            transform: translateY(-15vh);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
