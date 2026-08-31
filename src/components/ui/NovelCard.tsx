"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, BookOpen, Bookmark, Heart, Sparkles, Eye, CheckCircle2 } from "lucide-react";
import { Novel, getStoryFormat } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";

interface NovelCardProps {
  novel: Novel;
  variant?: "standard" | "compact" | "horizontal" | "featured";
  rank?: number;
}

export function NovelCard({ novel, variant = "standard", rank }: NovelCardProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(() => dataStore.isBookmarked(novel.id));
  const [isLiked, setIsLiked] = useState(() => dataStore.isLiked(novel.id));
  const [likesCount, setLikesCount] = useState(novel.likesCount || 0);

  React.useEffect(() => {
    setIsBookmarked(dataStore.isBookmarked(novel.id));
    setIsLiked(dataStore.isLiked(novel.id));
  }, [user, novel.id]);

  const formatInfo = getStoryFormat(novel);

  const creator = novel.creator || {
    name: "Creator",
    username: "creator",
    isVerified: true,
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = dataStore.toggleBookmark(novel.id, user?.id, "NOVEL");
    setIsBookmarked(next);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = dataStore.toggleLike(novel.id, user?.id, "NOVEL");
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : prev - 1));
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={`/novels/${novel.slug}`}
        className="flex gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-200 group relative shadow-2xs"
      >
        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={novel.coverUrl}
            alt={novel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {rank !== undefined ? (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white">
              {String(rank).padStart(2, "0")}
            </span>
          ) : (
            <span
              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-xs text-[9px] font-black text-white ${
                formatInfo.key === "LIGHT_NOVEL" ? "bg-purple-600" : "bg-blue-600"
              }`}
            >
              {formatInfo.badge}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {novel.genre}
              </span>
              <span className="text-[10px] text-zinc-400">
                {novel.chaptersCount} Ch
              </span>
            </div>

            <h4 className="font-bold text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition line-clamp-1">
              {novel.title}
            </h4>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {novel.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate text-[11px]">
              {creator.name}
            </span>
            <div className="flex items-center gap-2.5 text-zinc-500 text-[11px]">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {novel.rating || 5.0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-zinc-400" />
                {formatNumber(novel.reads || 0)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-200 overflow-hidden shadow-2xs hover-lift">
      {/* Cover Artwork Container */}
      <Link href={`/novels/${novel.slug || novel.id}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-1">
            {rank !== undefined ? (
              <span className="px-2 py-0.5 rounded-xs text-xs font-black bg-[#D91E18] text-white shadow-xs">
                {String(rank).padStart(2, "0")}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
                  formatInfo.key === "LIGHT_NOVEL" ? "bg-purple-600" : "bg-blue-600"
                }`}
              >
                {formatInfo.badge}
              </span>
            )}
          </div>

          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full backdrop-blur-md transition ${
              isBookmarked
                ? "bg-[#D91E18] text-white shadow-xs"
                : "bg-black/50 text-white/80 hover:bg-black/80 hover:text-white"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Add to Library"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Genre & Rating overlay at bottom of image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-zinc-100 border border-white/20">
            {novel.genre}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-amber-400 font-bold text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{novel.rating || 5.0}</span>
          </div>
        </div>
      </Link>

      {/* Details Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <Link href={`/novels/${novel.slug || novel.id}`}>
            <h3 className="font-black text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition line-clamp-1">
              {novel.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Link
              href={`/creator/${creator.username}`}
              className="hover:text-black dark:hover:text-white transition flex items-center gap-1 truncate"
            >
              <span>{creator.name}</span>
              {creator.isVerified && (
                <CheckCircle2 className="w-3 h-3 text-[#D91E18] flex-shrink-0" />
              )}
            </Link>
            <span>{novel.chaptersCount || novel.chapters?.length || 1} Ch</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EAEAE5] dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-zinc-400" />
            {formatNumber(novel.reads)}
          </span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-[#D91E18] transition ${
              isLiked ? "text-[#D91E18] font-bold" : ""
            }`}
            title="Like Story"
          >
            <Heart className={`w-3 h-3 ${isLiked ? "fill-[#D91E18] text-[#D91E18]" : ""}`} />
            {formatNumber(likesCount)}
          </button>
        </div>
      </div>
    </div>
  );
}
