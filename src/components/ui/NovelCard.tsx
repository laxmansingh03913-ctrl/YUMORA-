"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, BookOpen, Bookmark, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { Novel } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { dataStore } from "@/lib/data/store";

interface NovelCardProps {
  novel: Novel;
  variant?: "standard" | "compact" | "horizontal" | "featured";
}

export function NovelCard({ novel, variant = "standard" }: NovelCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(() => dataStore.isBookmarked(novel.id));
  const [isLiked, setIsLiked] = useState(() => dataStore.isLiked(novel.id));
  const [likesCount, setLikesCount] = useState(novel.likesCount);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = dataStore.toggleBookmark(novel.id);
    setIsBookmarked(next);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = dataStore.toggleLike(novel.id);
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : prev - 1));
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={`/novels/${novel.slug}`}
        className="flex gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-rose-500/50 hover:shadow-lg transition group relative"
      >
        <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
          <img
            src={novel.coverUrl}
            alt={novel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {novel.isFeatured && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
              HOT
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/30">
                {novel.genre}
              </span>
              <span className="text-[10px] text-zinc-400">
                {novel.chaptersCount} Chapters
              </span>
            </div>

            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition line-clamp-1">
              {novel.title}
            </h4>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {novel.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate">
              {novel.creator.name}
            </span>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {novel.rating}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {formatNumber(novel.reads)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-rose-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Cover Artwork Container */}
      <Link href={`/novels/${novel.slug}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {novel.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
            {novel.isEditorPick && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-xs">
                PICK
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-zinc-200 backdrop-blur-xs">
              {novel.status}
            </span>
          </div>

          {/* Quick Bookmark Action */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full backdrop-blur-md transition ${
              isBookmarked
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-black/50 text-white/80 hover:bg-black/80 hover:text-white"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Add to Library"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Bottom Cover Metrics */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-medium text-zinc-200">
            {novel.genre}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-amber-400 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{novel.rating}</span>
          </div>
        </div>
      </Link>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/novels/${novel.slug}`}>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition line-clamp-1">
              {novel.title}
            </h3>
          </Link>

          {/* Author */}
          <Link
            href={`/creator/${novel.creator.username}`}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <img
              src={novel.creator.avatar}
              alt={novel.creator.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="truncate">{novel.creator.name}</span>
            {novel.creator.isVerified && (
              <CheckCircle2 className="w-3 h-3 text-rose-500 flex-shrink-0" />
            )}
          </Link>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {novel.description}
          </p>
        </div>

        {/* Footer info: reads, likes, chapters */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Total Reads">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              {formatNumber(novel.reads)}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-rose-500 transition ${
                isLiked ? "text-rose-500 font-bold" : ""
              }`}
              title="Like Story"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              {formatNumber(likesCount)}
            </button>
          </div>
          <span className="font-medium text-zinc-400">
            {novel.chaptersCount} Ch.
          </span>
        </div>
      </div>
    </div>
  );
}
