"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Bookmark,
  Layers,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { ReadingProgress } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ContinueReadingWidget() {
  const [mounted, setMounted] = useState(false);
  const [progressList, setProgressList] = useState<ReadingProgress[]>([]);

  useEffect(() => {
    setMounted(true);
    setProgressList(dataStore.getRecentReadingProgressList());
  }, []);

  if (!mounted || progressList.length === 0) {
    return null;
  }

  const handleDismiss = (contentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dataStore.removeReadingProgress(contentId);
    setProgressList(dataStore.getRecentReadingProgressList());
  };

  return (
    <section className="space-y-4">
      {/* Header with Title & Library Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-xs">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Continue Reading</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Pick up exactly where you left off
            </p>
          </div>
        </div>

        <Link
          href="/library"
          className="text-xs font-bold text-[#D91E18] hover:text-[#B71813] transition flex items-center gap-1 group"
        >
          <span>View Library</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition transform" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {progressList.slice(0, 2).map((item) => {
          const isNovel = item.contentType === "NOVEL";
          const targetUrl = isNovel
            ? `/novels/${item.contentSlug || item.contentId}/chapter/${item.chapterNumber || 1}`
            : `/comics/${item.contentSlug || item.contentId}`;

          const progressPercent = Math.min(100, Math.max(5, item.progressPercentage || 50));

          return (
            <div
              key={item.contentId}
              className="group relative p-3 sm:p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex items-center gap-3.5 sm:gap-4 overflow-hidden"
            >
              {/* Dismiss X button on hover */}
              <button
                onClick={(e) => handleDismiss(item.contentId, e)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition z-10 cursor-pointer"
                title="Remove from Continue Reading"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Story Poster Thumbnail with medium tag */}
              <Link href={targetUrl} className="relative flex-shrink-0 cursor-pointer">
                <img
                  src={item.coverUrl || "/hero-character.png"}
                  alt={item.contentTitle || "Story Cover"}
                  className="w-18 sm:w-20 h-24 sm:h-26 rounded-2xl object-cover shadow-md group-hover:scale-105 transition transform duration-300 border border-zinc-200/60 dark:border-zinc-800"
                />
                <span
                  className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white shadow-xs ${
                    isNovel ? "bg-rose-600" : "bg-indigo-600"
                  }`}
                >
                  {isNovel ? "Novel" : "Webtoon"}
                </span>
              </Link>

              {/* Story Info & Progress Bar */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span>By {item.creatorName || "Creator"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatDate(item.lastReadAt)}</span>
                    </span>
                  </div>

                  <Link href={targetUrl} className="block group-hover:text-[#D91E18] transition">
                    <h3 className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {item.contentTitle || "Untitled Story"}
                    </h3>
                  </Link>

                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                    {item.episodeTitle || `${isNovel ? "Chapter" : "Episode"} ${item.chapterNumber}`}
                  </p>
                </div>

                {/* Progress Bar Strip */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-zinc-400">
                      {item.totalUnits
                        ? `${isNovel ? "Ch." : "Ep."} ${item.chapterNumber} of ${item.totalUnits}`
                        : `${progressPercent}% completed`}
                    </span>
                    <span className="text-rose-500 font-mono">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Resume Action Button */}
                <div className="pt-1">
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:bg-[#D91E18] dark:hover:bg-[#D91E18] dark:hover:text-white transition shadow-xs cursor-pointer transform active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume {isNovel ? `Ch. ${item.chapterNumber}` : `Ep. ${item.chapterNumber}`}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
