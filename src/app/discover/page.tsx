"use client";

import React, { useState, useMemo } from "react";
import {
  Compass,
  Search,
  SlidersHorizontal,
  Star,
  BookOpen,
  RotateCcw,
  Sparkles,
  Filter,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { NovelCard } from "@/components/ui/NovelCard";
import { Novel, LanguageCode } from "@/lib/types";

const ALL_GENRES = [
  "All Genres",
  "Sci-Fi",
  "Fantasy",
  "Cyberpunk",
  "Mystery",
  "Romance",
  "Adventure",
  "Steampunk",
  "Slice of Life",
];

const LANGUAGES: { code: string; label: string }[] = [
  { code: "all", label: "All Languages" },
  { code: "en", label: "English (EN)" },
  { code: "es", label: "Español (ES)" },
  { code: "fr", label: "Français (FR)" },
  { code: "de", label: "Deutsch (DE)" },
  { code: "ja", label: "日本語 (JA)" },
  { code: "ko", label: "한국어 (KO)" },
  { code: "hi", label: "हिन्दी (HI)" },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState<"trending" | "reads" | "rating" | "newest" | "likes">("trending");
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "editors" | "completed" | "gems">("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allNovels = dataStore.getNovels();

  const filteredNovels = useMemo(() => {
    return allNovels
      .filter((novel) => {
        // Tab filtering
        if (activeTab === "trending" && novel.reads < 100000) return false;
        if (activeTab === "editors" && !novel.isEditorPick) return false;
        if (activeTab === "completed" && novel.status !== "COMPLETED") return false;
        if (activeTab === "gems" && (novel.reads > 150000 || novel.rating < 4.8)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = novel.title.toLowerCase().includes(q);
          const matchAuthor = novel.creator.name.toLowerCase().includes(q);
          const matchTag = novel.tags.some((t) => t.toLowerCase().includes(q));
          const matchDesc = novel.description.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchTag && !matchDesc) return false;
        }

        // Genre
        if (selectedGenre !== "All Genres") {
          if (novel.genre !== selectedGenre && novel.secondaryGenre !== selectedGenre) {
            return false;
          }
        }

        // Language
        if (selectedLanguage !== "all" && novel.language !== selectedLanguage) {
          return false;
        }

        // Status
        if (selectedStatus !== "all" && novel.status !== selectedStatus) {
          return false;
        }

        // Content Rating
        if (selectedRating !== "all" && novel.contentRating !== selectedRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "trending") return b.reads * b.rating - a.reads * a.rating;
        if (sortBy === "reads") return b.reads - a.reads;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "likes") return b.likesCount - a.likesCount;
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [
    allNovels,
    searchQuery,
    selectedGenre,
    selectedLanguage,
    selectedStatus,
    selectedRating,
    sortBy,
    activeTab,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All Genres");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSelectedRating("all");
    setSortBy("trending");
    setActiveTab("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedGenre !== "All Genres" ||
    selectedLanguage !== "all" ||
    selectedStatus !== "all" ||
    selectedRating !== "all" ||
    activeTab !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Universe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Explore Stories & Creators
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Filter by genre, language, length, status, and community acclaim
          </p>
        </div>

        {/* Search input bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-rose-500 transition placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Curated Discovery Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
        {[
          { id: "all", label: "All Works" },
          { id: "trending", label: "🔥 Trending" },
          { id: "editors", label: "🏆 Editor's Picks" },
          { id: "gems", label: "💎 Hidden Gems" },
          { id: "completed", label: "✅ Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Filter Options
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              {ALL_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Content Rating */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Rating</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Audiences</option>
              <option value="EVERYONE">Everyone</option>
              <option value="TEEN">Teen (13+)</option>
              <option value="MATURE">Mature (18+)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="trending">🔥 Trending</option>
              <option value="reads">📖 Most Read</option>
              <option value="rating">★ Highest Rated</option>
              <option value="likes">💖 Most Liked</option>
              <option value="newest">✨ Newest Releases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Showing {filteredNovels.length} stories</span>
        <span>
          Sorted by: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{sortBy}</strong>
        </span>
      </div>

      {/* Results Grid */}
      {filteredNovels.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No matching stories found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search keywords, genre filter, or reset your filters to discover other tales.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
}
