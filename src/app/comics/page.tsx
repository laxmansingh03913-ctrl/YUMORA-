"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Sparkles, Star, Search, Flame, ArrowRight } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { ComicCard } from "@/components/ui/ComicCard";

export default function ComicsPage() {
  const [search, setSearch] = useState("");
  const comics = dataStore.getComics();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-200/50 dark:border-indigo-900/40 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Webtoons & Comics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Visual Storytelling Universe
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Read vertical scroll webtoons and graphic serials crafted by international artists
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search comics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Featured Banner */}
      {comics.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900 border border-indigo-500/30 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
              Webtoon Spotlight
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{comics[0]?.title}</h2>
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
              {comics[0]?.description}
            </p>
            <div className="pt-2">
              <Link
                href={`/comics/${comics[0]?.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Read Episode 1</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comics Grid or Empty State */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          All Serialized Webtoons ({filtered.length})
        </h3>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Webtoons Found</h3>
              <p className="text-xs text-zinc-400">
                {search ? "No webtoons match your search query." : "No visual webtoons have been published yet. Be the first comic artist!"}
              </p>
            </div>
            <Link
              href="/creator/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              <span>Publish Webtoon / Comic</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
