"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { dbService } from "@/lib/supabase/db";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { Novel, Comic, LanguageCode } from "@/lib/types";

const ALL_GENRES = [
  "All Genres",
  "Sci-Fi",
  "Fantasy",
  "Cyberpunk",
  "Action",
  "Mystery",
  "Romance",
  "Adventure",
  "Steampunk",
  "Supernatural",
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

type ContentMedium = "all" | "novels" | "comics";

interface UnifiedWork {
  id: string;
  type: "NOVEL" | "COMIC";
  title: string;
  creatorName: string;
  creatorUsername: string;
  genre: string;
  secondaryGenre?: string;
  tags: string[];
  description: string;
  language: string;
  status: string;
  contentRating: string;
  isEditorPick?: boolean;
  reads: number;
  rating: number;
  likesCount: number;
  createdAt: string;
  novelData?: Novel;
  comicData?: Comic;
}

export default function DiscoverPage() {
  const [novels, setNovels] = useState<Novel[]>(() => dataStore.getNovels());
  const [comics, setComics] = useState<Comic[]>(() => dataStore.getComics());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedium, setSelectedMedium] = useState<ContentMedium>("all");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState<"trending" | "reads" | "rating" | "newest" | "likes">("trending");
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "editors" | "completed" | "gems">("all");

  // Sync latest from data store and Supabase Cloud
  useEffect(() => {
    setNovels(dataStore.getNovels());
    setComics(dataStore.getComics());

    // Fetch cloud novels
    dbService.getNovels().then((cloudNovels) => {
      if (cloudNovels && cloudNovels.length > 0) {
        cloudNovels.forEach((n) => dataStore.saveNovel(n));
        setNovels(dataStore.getNovels());
      }
    });

    // Fetch cloud comics
    dbService.getComics().then((cloudComics) => {
      if (cloudComics && cloudComics.length > 0) {
        cloudComics.forEach((c) => dataStore.saveComic(c));
        setComics(dataStore.getComics());
      }
    });
  }, []);

  // Combine novels and comics into unified searchable works
  const allWorks = useMemo<UnifiedWork[]>(() => {
    const novelItems: UnifiedWork[] = novels.map((n) => ({
      id: n.id,
      type: "NOVEL",
      title: n.title,
      creatorName: n.creator?.name || "Creator",
      creatorUsername: n.creator?.username || "creator",
      genre: n.genre,
      secondaryGenre: n.secondaryGenre,
      tags: n.tags || [],
      description: n.description,
      language: n.language,
      status: n.status,
      contentRating: n.contentRating,
      isEditorPick: n.isEditorPick,
      reads: n.reads || 0,
      rating: n.rating || 5.0,
      likesCount: n.likesCount || 0,
      createdAt: n.createdAt,
      novelData: n,
    }));

    const comicItems: UnifiedWork[] = comics.map((c) => ({
      id: c.id,
      type: "COMIC",
      title: c.title,
      creatorName: c.creator?.name || "Creator",
      creatorUsername: c.creator?.username || "creator",
      genre: c.genre,
      secondaryGenre: c.secondaryGenre,
      tags: c.tags || [],
      description: c.description,
      language: c.language,
      status: c.status,
      contentRating: c.contentRating,
      isEditorPick: c.isEditorPick,
      reads: c.reads || 0,
      rating: c.rating || 5.0,
      likesCount: c.likesCount || 0,
      createdAt: c.createdAt,
      comicData: c,
    }));

    return [...novelItems, ...comicItems];
  }, [novels, comics]);

  // Filter and sort all works
  const filteredWorks = useMemo(() => {
    return allWorks
      .filter((work) => {
        // Medium / Type filter
        if (selectedMedium === "novels" && work.type !== "NOVEL") return false;
        if (selectedMedium === "comics" && work.type !== "COMIC") return false;

        // Tab filtering
        if (activeTab === "trending" && work.reads < 500) return false;
        if (activeTab === "editors" && !work.isEditorPick) return false;
        if (activeTab === "completed" && work.status !== "COMPLETED") return false;
        if (activeTab === "gems" && (work.reads > 150000 || work.rating < 4.8)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = work.title.toLowerCase().includes(q);
          const matchAuthor = work.creatorName.toLowerCase().includes(q);
          const matchTag = work.tags.some((t) => t.toLowerCase().includes(q));
          const matchDesc = work.description.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchTag && !matchDesc) return false;
        }

        // Genre
        if (selectedGenre !== "All Genres") {
          const g = selectedGenre.toLowerCase();
          const matchGenre = work.genre.toLowerCase() === g;
          const matchSecGenre = work.secondaryGenre?.toLowerCase() === g;
          const matchTags = work.tags.some((t) => t.toLowerCase() === g);
          if (!matchGenre && !matchSecGenre && !matchTags) {
            return false;
          }
        }

        // Language
        if (selectedLanguage !== "all" && work.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
          return false;
        }

        // Status
        if (selectedStatus !== "all" && work.status !== selectedStatus) {
          return false;
        }

        // Content Rating
        if (selectedRating !== "all" && work.contentRating !== selectedRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "trending") return (b.reads + 1) * b.rating - (a.reads + 1) * a.rating;
        if (sortBy === "reads") return b.reads - a.reads;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "likes") return b.likesCount - a.likesCount;
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [
    allWorks,
    selectedMedium,
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
    setSelectedMedium("all");
    setSelectedGenre("All Genres");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSelectedRating("all");
    setSortBy("trending");
    setActiveTab("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedMedium !== "all" ||
    selectedGenre !== "All Genres" ||
    selectedLanguage !== "all" ||
    selectedStatus !== "all" ||
    selectedRating !== "all" ||
    activeTab !== "all";

  const novelCount = filteredWorks.filter((w) => w.type === "NOVEL").length;
  const comicCount = filteredWorks.filter((w) => w.type === "COMIC").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              DISCOVER UNIVERSE • 発見
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
            Explore Stories, Comics & Creators
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 mt-1 font-medium">
            Discover original novels, vertical webtoons, manga series, and independent creators
          </p>
        </div>

        {/* Search input bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search titles, authors, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-700 text-[#111111] dark:text-white text-xs focus:outline-none focus:border-[#D91E18] transition placeholder-zinc-400 shadow-2xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Content Medium Switcher & Curated Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Medium Selector (All, Novels, Comics) */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
          <button
            onClick={() => setSelectedMedium("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMedium === "all"
                ? "bg-white dark:bg-zinc-800 text-[#D91E18] shadow-xs font-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Content ({allWorks.length})</span>
          </button>

          <button
            onClick={() => setSelectedMedium("novels")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMedium === "novels"
                ? "bg-white dark:bg-zinc-800 text-[#D91E18] shadow-xs font-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Novels ({novels.length})</span>
          </button>

          <button
            onClick={() => setSelectedMedium("comics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMedium === "comics"
                ? "bg-white dark:bg-zinc-800 text-[#D91E18] shadow-xs font-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Comics & Manga ({comics.length})</span>
          </button>
        </div>

        {/* Curated Discovery Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "Featured" },
            { id: "trending", label: "🔥 Trending" },
            { id: "editors", label: "🏆 Editor's Picks" },
            { id: "gems", label: "💎 Hidden Gems" },
            { id: "completed", label: "✅ Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[#D91E18] text-white shadow-xs font-black"
                  : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D91E18]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#111111] dark:text-white">
              Filter Options
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#D91E18] hover:underline font-bold flex items-center gap-1 transition"
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
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
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
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
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
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
            >
              <option value="all">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Content Rating */}
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Rating</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
            >
              <option value="all">All Audiences</option>
              <option value="EVERYONE">Everyone</option>
              <option value="TEEN">Teen (13+)</option>
              <option value="MATURE">Mature (18+)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
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
        <span>
          Showing <strong>{filteredWorks.length}</strong> works
          {selectedMedium === "all" && filteredWorks.length > 0 && (
            <span className="text-zinc-400 ml-1">
              ({novelCount} novels, {comicCount} comics & manga)
            </span>
          )}
        </span>
        <span>
          Sorted by: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{sortBy}</strong>
        </span>
      </div>

      {/* Results Grid */}
      {filteredWorks.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No matching works found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search keywords, category or medium filters to discover other stories and comics.
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
          {filteredWorks.map((work) => {
            if (work.type === "COMIC" && work.comicData) {
              return <ComicCard key={work.id} comic={work.comicData} />;
            }
            if (work.type === "NOVEL" && work.novelData) {
              return <NovelCard key={work.id} novel={work.novelData} />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
