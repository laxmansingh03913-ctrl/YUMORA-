"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Sparkles, Star, Search, Flame, ArrowRight, PenTool } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { ComicCard } from "@/components/ui/ComicCard";
import { Comic } from "@/lib/types";

export default function ComicsPage() {
  const [search, setSearch] = useState("");
  const [comics, setComics] = useState<Comic[]>(() => dataStore.getComics());

  useEffect(() => {
    setComics(dataStore.getComics());
  }, []);

  const filtered = comics.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.genre.toLowerCase().includes(q) ||
      c.creator.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              MANGA & WEBTOONS • 連載マンガ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
            Visual Storytelling Universe
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 mt-1 font-medium">
            Read vertical scroll webtoons and manga serials crafted by international artists
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search comics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-700 text-[#111111] dark:text-white text-xs focus:outline-none focus:border-[#D91E18] transition placeholder-zinc-400"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Featured Banner */}
      {comics.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-[#111111] dark:border-zinc-700 text-[#111111] dark:text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-xl space-y-2.5">
            <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white uppercase tracking-wider">
              MANGA SPOTLIGHT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{comics[0]?.title}</h2>
            <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {comics[0]?.description}
            </p>
            <div className="pt-2">
              <Link
                href={`/comics/${comics[0]?.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs shadow-xs transition"
              >
                <span>Read Chapter 1 →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comics Grid or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
          <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
          <h3 className="text-base font-black text-[#111111] dark:text-white uppercase">
            All Serialized Manga & Comics ({filtered.length})
          </h3>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((comic, idx) => (
              <ComicCard key={comic.id} comic={comic} rank={idx + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#111111] dark:text-white">No Manga Found</h3>
              <p className="text-xs text-zinc-500">
                {search ? "No manga match your search query." : "No visual manga have been published yet. Be the first comic artist!"}
              </p>
            </div>
            <Link
              href="/creator/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs shadow-xs transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Upload First Manga</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
