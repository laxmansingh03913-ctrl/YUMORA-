"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Filter, TrendingUp } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { NovelCard } from "@/components/ui/NovelCard";

export default function NovelsPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [search, setSearch] = useState("");

  const novels = dataStore.getNovels();
  const genres = ["All", "Sci-Fi", "Fantasy", "Cyberpunk", "Adventure", "Mystery", "Romance"];

  const filtered = novels.filter((novel) => {
    if (selectedGenre !== "All" && novel.genre !== selectedGenre && novel.secondaryGenre !== selectedGenre) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        novel.title.toLowerCase().includes(q) ||
        novel.creator.name.toLowerCase().includes(q) ||
        novel.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Serial Novels</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Original Serialized Fiction
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Dive into thousands of chapters written by visionary creators worldwide
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-rose-500 transition placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              selectedGenre === g
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Novels Found</h3>
            <p className="text-xs text-zinc-400">
              {search ? "No stories match your search criteria." : "No novels have been published yet. Be the first author!"}
            </p>
          </div>
          <Link
            href="/creator/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish a Novel</span>
          </Link>
        </div>
      )}
    </div>
  );
}
