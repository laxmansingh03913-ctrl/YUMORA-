"use client";

import React from "react";
import Link from "next/link";
import { Star, Image as ImageIcon, Sparkles, Eye, CheckCircle2 } from "lucide-react";
import { Comic, getStoryFormat } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface ComicCardProps {
  comic: Comic;
  rank?: number;
}

export function ComicCard({ comic, rank }: ComicCardProps) {
  const formatInfo = getStoryFormat(comic);

  const creator = comic.creator || {
    name: "Creator",
    username: "creator",
    isVerified: true,
  };

  return (
    <div className="group relative flex flex-col rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-200 overflow-hidden shadow-2xs hover-lift">
      <Link href={`/comics/${comic.slug}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={comic.coverUrl}
          alt={comic.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition" />

        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          {rank !== undefined ? (
            <span className="px-2 py-0.5 rounded-xs text-xs font-black bg-[#D91E18] text-white shadow-xs">
              {String(rank).padStart(2, "0")}
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-xs text-[10px] font-black uppercase shadow-xs flex items-center gap-0.5 text-white ${
                formatInfo.key === "MANGA"
                  ? "bg-[#D91E18]"
                  : formatInfo.key === "WEBTOON"
                  ? "bg-emerald-600"
                  : "bg-amber-600"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" /> {formatInfo.badge}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-zinc-100 backdrop-blur-xs">
            {comic.status}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-zinc-100 border border-white/20">
            {comic.genre}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-amber-400 font-bold text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{comic.rating}</span>
          </div>
        </div>
      </Link>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <Link href={`/comics/${comic.slug}`}>
            <h3 className="font-black text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition line-clamp-1">
              {comic.title}
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
            <span>{comic.episodesCount ?? comic.episodes?.length ?? 1} Ep</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {comic.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EAEAE5] dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            {comic.episodesCount || comic.episodes?.length || 1} Episodes
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-zinc-400" />
            {formatNumber(comic.reads)}
          </span>
        </div>
      </div>
    </div>
  );
}
