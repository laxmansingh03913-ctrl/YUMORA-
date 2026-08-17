"use client";

import React from "react";
import Link from "next/link";
import { Star, Image as ImageIcon, Sparkles } from "lucide-react";
import { Comic } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link href={`/comics/${comic.slug}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <img
          src={comic.coverUrl}
          alt={comic.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> WEBTOON
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-zinc-200 backdrop-blur-xs">
            {comic.status}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-medium text-zinc-200">
            {comic.genre}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-amber-400 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{comic.rating}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/comics/${comic.slug}`}>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition line-clamp-1">
              {comic.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {comic.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            {comic.episodesCount} Episodes
          </span>
          <span>{formatNumber(comic.reads)} reads</span>
        </div>
      </div>
    </div>
  );
}
