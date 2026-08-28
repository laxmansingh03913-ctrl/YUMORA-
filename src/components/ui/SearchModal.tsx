"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  Image as ImageIcon,
  User,
  Flame,
  ArrowRight,
  Tag,
  Trophy,
  Star,
  Eye,
  Clock,
  CheckCircle2,
  Sparkles,
  Command,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { Novel, Comic, UserProfile, Contest, getStoryFormat } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = "all" | "novels" | "comics" | "creators" | "contests";

const POPULAR_SEARCH_TAGS = [
  "Fantasy",
  "Action",
  "Sci-Fi",
  "Cyberpunk",
  "Webtoon",
  "Romance",
  "Monarch",
  "Contests",
];

const RECENT_SEARCHES_KEY = "yumora_recent_searches";

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [results, setResults] = useState<{
    novels: Novel[];
    comics: Comic[];
    creators: UserProfile[];
    contests: Contest[];
  }>({
    novels: [],
    comics: [],
    creators: [],
    contests: [],
  });

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      } catch {
        // ignore fallback
      }
    }
  }, []);

  // Keyboard navigation & Focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Perform multi-source spotlight search
  useEffect(() => {
    const allNovels = dataStore.getNovels();
    const allComics = dataStore.getComics();
    const allUsers = dataStore.getUsers();
    const allContests = dataStore.getContests();

    if (!query.trim()) {
      setResults({
        novels: allNovels.slice(0, 4),
        comics: allComics.slice(0, 3),
        creators: allUsers.filter((u) => u.role === "CREATOR" || ((u as any).worksCount || 0) > 0).slice(0, 4),
        contests: allContests.slice(0, 2),
      });
      return;
    }

    const q = query.toLowerCase();

    // 1. Novels search
    const filteredNovels = allNovels.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.genre.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)) ||
        n.creator?.name?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
    );

    // 2. Comics / Webtoons search
    const filteredComics = allComics.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.genre.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q)) ||
        c.creator?.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );

    // 3. Creators search
    const filteredCreators = allUsers.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q)) ||
        u.primaryGenres?.some((g) => g.toLowerCase().includes(q))
    );

    // 4. Contests search
    const filteredContests = allContests.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        ((c as any).theme && (c as any).theme.toLowerCase().includes(q)) ||
        c.eligibleGenres?.some((g) => g.toLowerCase().includes(q))
    );

    setResults({
      novels: filteredNovels,
      comics: filteredComics,
      creators: filteredCreators,
      contests: filteredContests,
    });
  }, [query]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.novels.length +
    results.comics.length +
    results.creators.length +
    results.contests.length;

  const showNovels = activeCategory === "all" || activeCategory === "novels";
  const showComics = activeCategory === "all" || activeCategory === "comics";
  const showCreators = activeCategory === "all" || activeCategory === "creators";
  const showContests = activeCategory === "all" || activeCategory === "contests";

  const handleSelectLink = (href: string) => {
    saveRecentSearch(query);
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Top */}
        <div className="h-1 bg-gradient-to-r from-[#D91E18] via-rose-500 to-amber-500" />

        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-[#D91E18] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search novels, comics, authors, genres (e.g. Solo, Sci-Fi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                saveRecentSearch(query);
              }
            }}
            className="w-full bg-transparent border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none text-sm sm:text-base font-medium"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-500 border border-zinc-300 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Filter Pills Category Strip */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 overflow-x-auto no-scrollbar bg-white dark:bg-[#151518]">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#D91E18] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            All Results {query && `(${totalResultsCount})`}
          </button>

          <button
            onClick={() => setActiveCategory("novels")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "novels"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Novels ({results.novels.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("comics")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "comics"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Comics & Webtoons ({results.comics.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("creators")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "creators"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <User className="w-3 h-3" />
            <span>Creators ({results.creators.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("contests")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "contests"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Trophy className="w-3 h-3" />
            <span>Contests ({results.contests.length})</span>
          </button>
        </div>

        {/* Search Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Tags / Recent Searches (when query is empty) */}
          {!query && (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] text-zinc-400 hover:text-[#D91E18] transition font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D91E18]" /> Trending Tags & Genres
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 hover:text-[#D91E18] dark:hover:text-rose-400 border border-zinc-200/60 dark:border-zinc-700/60 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Tag className="w-3 h-3 text-zinc-400" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No results message */}
          {query && totalResultsCount === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                No matching stories found
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try searching for popular genres like Fantasy, Action, or Sci-Fi.
              </p>
            </div>
          )}

          {/* 1. NOVELS SECTION */}
          {showNovels && results.novels.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                  <span>Web Novels ({results.novels.length})</span>
                </p>
                <Link
                  href="/novels"
                  onClick={onClose}
                  className="text-[11px] font-bold text-[#D91E18] hover:underline"
                >
                  Browse all novels →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.novels.slice(0, 6).map((novel) => {
                  const formatInfo = getStoryFormat(novel);
                  return (
                    <button
                      key={novel.id}
                      onClick={() => handleSelectLink(`/novels/${novel.slug}`)}
                      className="w-full text-left p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition flex items-center gap-3 group cursor-pointer"
                    >
                      <img
                        src={novel.coverUrl || "/hero-character.png"}
                        alt={novel.title}
                        className="w-12 h-16 object-cover rounded-xl shadow-xs flex-shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${formatInfo.bgClass}`}>
                            {formatInfo.badge}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-semibold">
                            {novel.genre}
                          </span>
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {novel.rating}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#D91E18] transition mt-0.5">
                          {novel.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          by {novel.creator?.name || "Author"} • {formatNumber(novel.reads)} reads
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. COMICS & WEBTOONS SECTION */}
          {showComics && results.comics.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Comics & Manga ({results.comics.length})</span>
                </p>
                <Link
                  href="/comics"
                  onClick={onClose}
                  className="text-[11px] font-bold text-indigo-500 hover:underline"
                >
                  Browse all comics →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.comics.slice(0, 6).map((comic) => {
                  const formatInfo = getStoryFormat(comic);
                  return (
                    <button
                      key={comic.id}
                      onClick={() => handleSelectLink(`/comics/${comic.slug}`)}
                      className="w-full text-left p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition flex items-center gap-3 group cursor-pointer"
                    >
                      <img
                        src={comic.coverUrl || "/hero-character.png"}
                        alt={comic.title}
                        className="w-12 h-16 object-cover rounded-xl shadow-xs flex-shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${formatInfo.bgClass}`}>
                            {formatInfo.badge}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-semibold">
                            {comic.genre}
                          </span>
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {comic.rating}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-500 transition mt-0.5">
                          {comic.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          by {comic.creator?.name || "Artist"} • {comic.episodes?.length || 1} Episodes
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CREATORS & AUTHORS SECTION */}
          {showCreators && results.creators.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Creators & Authors ({results.creators.length})</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.creators.slice(0, 4).map((creator) => (
                  <button
                    key={creator.id}
                    onClick={() => handleSelectLink(`/creator/${creator.username}`)}
                    className="w-full text-left p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={creator.avatar || "/hero-character.png"}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D91E18]/30 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#D91E18] transition">
                            {creator.name}
                          </h4>
                          {creator.isVerified && (
                            <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">@{creator.username}</p>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                      {((creator as any).worksCount !== undefined ? `${(creator as any).worksCount} Works` : (creator.totalReads > 0 ? "Featured" : "Creator"))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. CONTESTS & AWARDS SECTION */}
          {showContests && results.contests.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Competitions & Contests ({results.contests.length})</span>
              </p>

              <div className="space-y-2">
                {results.contests.map((contest) => (
                  <button
                    key={contest.id}
                    onClick={() => handleSelectLink(`/contests/${contest.slug}`)}
                    className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 hover:from-amber-500/15 hover:to-rose-500/15 border border-amber-500/20 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-black uppercase">
                          ${(contest as any).prizePoolTotal || contest.prizePool || 500} Prize
                        </span>
                        <h4 className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#D91E18] transition">
                          {contest.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {contest.subtitle}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition transform flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Quick Shortcuts */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>Navigation:</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px] font-bold">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px] font-bold">esc</kbd>
              <span>to close</span>
            </span>
          </div>

          <span className="font-bold text-[#D91E18]">Yumora Spotlight Search</span>
        </div>
      </div>
    </div>
  );
}
