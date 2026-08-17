"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, BookOpen, User, Flame, ArrowRight, Tag } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { Novel, UserProfile } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    novels: Novel[];
    creators: UserProfile[];
  }>({ novels: [], creators: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        novels: dataStore.getNovels().slice(0, 4),
        creators: dataStore.getUsers().filter((u) => u.role === "CREATOR").slice(0, 3),
      });
      return;
    }

    const q = query.toLowerCase();
    const novels = dataStore.getNovels().filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.genre.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.creator.name.toLowerCase().includes(q)
    );

    const creators = dataStore.getUsers().filter(
      (u) =>
        u.role === "CREATOR" &&
        (u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.bio.toLowerCase().includes(q))
    );

    setResults({ novels, creators });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search novels, comics, creators, genres (e.g. Sci-Fi, Dark Fantasy)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-500 focus:outline-none text-base"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          {/* Quick tags */}
          {!query && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {["Sci-Fi", "Dark Fantasy", "Cyberpunk", "Romance", "Mystery", "Webtoon"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 transition flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-zinc-400" /> {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Novels section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />{" "}
              {query ? `Stories (${results.novels.length})` : "Trending Stories"}
            </p>
            {results.novels.length === 0 ? (
              <p className="text-sm text-zinc-500 py-2">No stories found matching &ldquo;{query}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                {results.novels.map((novel) => (
                  <Link
                    key={novel.id}
                    href={`/novels/${novel.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 transition group"
                  >
                    <img
                      src={novel.coverUrl}
                      alt={novel.title}
                      className="w-12 h-16 object-cover rounded-md shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-rose-400 transition truncate">
                          {novel.title}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-800 text-zinc-400">
                          {novel.genre}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        by {novel.creator.name} • {novel.reads.toLocaleString()} reads • ★ {novel.rating}
                      </p>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {novel.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Creators section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />{" "}
              {query ? `Creators (${results.creators.length})` : "Featured Creators"}
            </p>
            {results.creators.length === 0 ? (
              <p className="text-sm text-zinc-500 py-2">No creators found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.creators.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/creator/${creator.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 transition group"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-zinc-100 group-hover:text-rose-400 transition truncate">
                        {creator.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">@{creator.username}</p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {creator.followersCount.toLocaleString()} followers
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>Press ESC or click outside to exit</span>
          <span className="flex items-center gap-1">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">⌘K</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
