"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Filter, TrendingUp, PenTool } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { NovelCard } from "@/components/ui/NovelCard";
import { Novel } from "@/lib/types";

export default function NovelsPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [novels, setNovels] = useState<Novel[]>(() => dataStore.getNovels());

  useEffect(() => {
    setNovels(dataStore.getNovels());
  }, []);
  const genres = ["All", "Sci-Fi", "Fantasy", "Cyberpunk", "Adventure", "Mystery", "Romance"];

  const filtered = novels.filter((novel) => {
    if (selectedGenre !== "All" && novel.genre !== selectedGenre && novel.secondaryGenre !== selectedGenre) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (novel.title || "").toLowerCase().includes(q) ||
        (novel.creator?.name || "").toLowerCase().includes(q) ||
        (novel.tags || []).some((t) => (t || "").toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              SERIAL NOVELS • 連載小説
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
            Original Serialized Fiction
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 mt-1 font-medium">
            Dive into thousands of chapters written by visionary creators worldwide
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-700 text-[#111111] dark:text-white text-xs focus:outline-none focus:border-[#D91E18] transition placeholder-zinc-400"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap ${
              selectedGenre === g
                ? "bg-[#D91E18] text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((novel, idx) => (
            <NovelCard key={novel.id} novel={novel} rank={idx + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 max-w-md mx-auto shadow-2xs">
          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#111111] dark:text-white">No Novels Found</h3>
            <p className="text-xs text-zinc-500">
              {search ? "No stories match your search criteria." : "No novels have been published yet. Be the first author!"}
            </p>
          </div>
          <Link
            href="/creator/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs shadow-xs transition"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Publish First Novel</span>
          </Link>
        </div>
      )}
    </div>
  );
}
