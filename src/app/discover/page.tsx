"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Smartphone,
  BookMarked,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { dbService } from "@/lib/supabase/db";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { Novel, Comic, LanguageCode, StoryFormat, StoryFormatInfo, getStoryFormat } from "@/lib/types";

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

export type DiscoverFormat =
  | "all"
  | "web_novels"
  | "light_novels"
  | "manga"
  | "webtoons"
  | "comics";

const FORMAT_FILTERS: {
  id: DiscoverFormat;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge: string;
}[] = [
  { id: "all", label: "All Formats", shortLabel: "All", icon: Layers, badge: "ALL" },
  { id: "web_novels", label: "Web Novels", shortLabel: "Web Novels", icon: BookOpen, badge: "WEB NOVEL" },
  { id: "light_novels", label: "Light Novels", shortLabel: "Light Novels", icon: Sparkles, badge: "LIGHT NOVEL" },
  { id: "manga", label: "Manga", shortLabel: "Manga", icon: Flame, badge: "MANGA" },
  { id: "webtoons", label: "Webtoons", shortLabel: "Webtoons", icon: Smartphone, badge: "WEBTOON" },
  { id: "comics", label: "Comics / Graphic Novels", shortLabel: "Comics", icon: ImageIcon, badge: "COMIC" },
];

interface UnifiedWork {
  id: string;
  type: "NOVEL" | "COMIC";
  storyFormat: StoryFormat;
  storyFormatInfo: StoryFormatInfo;
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

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [novels, setNovels] = useState<Novel[]>(() => dataStore.getNovels());
  const [comics, setComics] = useState<Comic[]>(() => dataStore.getComics());
  const [searchQuery, setSearchQuery] = useState("");

  const urlFormat = (searchParams?.get("format") || searchParams?.get("medium") || "").toLowerCase();
  const getInitialFormat = (): DiscoverFormat => {
    if (urlFormat === "manga") return "manga";
    if (urlFormat === "webtoon" || urlFormat === "webtoons") return "webtoons";
    if (urlFormat === "comic" || urlFormat === "comics" || urlFormat === "graphic_novel") return "comics";
    if (urlFormat === "light_novel" || urlFormat === "light_novels" || urlFormat === "light-novels") return "light_novels";
    if (urlFormat === "web_novel" || urlFormat === "web_novels" || urlFormat === "web-novels" || urlFormat === "novels") return "web_novels";
    return "all";
  };

  const [selectedFormat, setSelectedFormat] = useState<DiscoverFormat>(getInitialFormat);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState<"trending" | "reads" | "rating" | "newest" | "likes">("trending");
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "editors" | "completed" | "gems">("all");

  // Sync format filter from URL when changed externally
  useEffect(() => {
    if (urlFormat) {
      if (urlFormat === "manga") setSelectedFormat("manga");
      else if (urlFormat === "webtoon" || urlFormat === "webtoons") setSelectedFormat("webtoons");
      else if (urlFormat === "comic" || urlFormat === "comics" || urlFormat === "graphic_novel") setSelectedFormat("comics");
      else if (urlFormat === "light_novel" || urlFormat === "light_novels" || urlFormat === "light-novels") setSelectedFormat("light_novels");
      else if (urlFormat === "web_novel" || urlFormat === "web_novels" || urlFormat === "web-novels" || urlFormat === "novels") setSelectedFormat("web_novels");
      else if (urlFormat === "all") setSelectedFormat("all");
    }
  }, [urlFormat]);

  // Sync latest from data store and Supabase Cloud
  useEffect(() => {
    setNovels(dataStore.getNovels());
    setComics(dataStore.getComics());

    dbService.getNovels().then((cloudNovels) => {
      if (cloudNovels && cloudNovels.length > 0) {
        cloudNovels.forEach((n) => dataStore.saveNovel(n));
        setNovels(dataStore.getNovels());
      }
    });

    dbService.getComics().then((cloudComics) => {
      if (cloudComics && cloudComics.length > 0) {
        cloudComics.forEach((c) => dataStore.saveComic(c));
        setComics(dataStore.getComics());
      }
    });
  }, []);

  // Combine novels and comics into unified searchable works with precise format taxonomy
  const allWorks = useMemo<UnifiedWork[]>(() => {
    const novelItems: UnifiedWork[] = (novels || []).map((n) => {
      const formatInfo = getStoryFormat(n);
      return {
        id: n?.id || `novel-${Math.random()}`,
        type: "NOVEL",
        storyFormat: formatInfo.key,
        storyFormatInfo: formatInfo,
        title: n?.title || "Untitled Novel",
        creatorName: n?.creator?.name || "Creator",
        creatorUsername: n?.creator?.username || "creator",
        genre: n?.genre || "Fantasy",
        secondaryGenre: n?.secondaryGenre || "",
        tags: Array.isArray(n?.tags) ? n.tags : [],
        description: n?.description || "",
        language: n?.language || "en",
        status: n?.status || "ONGOING",
        contentRating: n?.contentRating || "TEEN",
        isEditorPick: !!n?.isEditorPick,
        reads: n?.reads || 0,
        rating: n?.rating || 5.0,
        likesCount: n?.likesCount || 0,
        createdAt: n?.createdAt || new Date().toISOString(),
        novelData: n,
      };
    });

    const comicItems: UnifiedWork[] = (comics || []).map((c) => {
      const formatInfo = getStoryFormat(c);
      return {
        id: c?.id || `comic-${Math.random()}`,
        type: "COMIC",
        storyFormat: formatInfo.key,
        storyFormatInfo: formatInfo,
        title: c?.title || "Untitled Comic",
        creatorName: c?.creator?.name || "Creator",
        creatorUsername: c?.creator?.username || "creator",
        genre: c?.genre || "Action",
        secondaryGenre: c?.secondaryGenre || "",
        tags: Array.isArray(c?.tags) ? c.tags : [],
        description: c?.description || "",
        language: c?.language || "en",
        status: c?.status || "ONGOING",
        contentRating: c?.contentRating || "TEEN",
        isEditorPick: !!c?.isEditorPick,
        reads: c?.reads || 0,
        rating: c?.rating || 5.0,
        likesCount: c?.likesCount || 0,
        createdAt: c?.createdAt || new Date().toISOString(),
        comicData: c,
      };
    });

    return [...novelItems, ...comicItems];
  }, [novels, comics]);

  // Real-time counts for each format category
  const formatCounts = useMemo(() => {
    return {
      all: allWorks.length,
      web_novels: allWorks.filter((w) => w.storyFormat === "WEB_NOVEL").length,
      light_novels: allWorks.filter((w) => w.storyFormat === "LIGHT_NOVEL").length,
      manga: allWorks.filter((w) => w.storyFormat === "MANGA").length,
      webtoons: allWorks.filter((w) => w.storyFormat === "WEBTOON").length,
      comics: allWorks.filter((w) => w.storyFormat === "COMIC").length,
    };
  }, [allWorks]);

  // Filter and sort all works
  const filteredWorks = useMemo(() => {
    return allWorks
      .filter((work) => {
        // Story Format filter
        if (selectedFormat === "web_novels" && work.storyFormat !== "WEB_NOVEL") return false;
        if (selectedFormat === "light_novels" && work.storyFormat !== "LIGHT_NOVEL") return false;
        if (selectedFormat === "manga" && work.storyFormat !== "MANGA") return false;
        if (selectedFormat === "webtoons" && work.storyFormat !== "WEBTOON") return false;
        if (selectedFormat === "comics" && work.storyFormat !== "COMIC") return false;

        // Tab filtering
        if (activeTab === "trending" && (work.reads || 0) < 500) return false;
        if (activeTab === "editors" && !work.isEditorPick) return false;
        if (activeTab === "completed" && work.status !== "COMPLETED") return false;
        if (activeTab === "gems" && ((work.reads || 0) > 150000 || (work.rating || 5.0) < 4.8)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (work.title || "").toLowerCase().includes(q);
          const matchAuthor = (work.creatorName || "").toLowerCase().includes(q);
          const matchTag = (work.tags || []).some((t) => (t || "").toLowerCase().includes(q));
          const matchDesc = (work.description || "").toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchTag && !matchDesc) return false;
        }

        // Genre
        if (selectedGenre !== "All Genres") {
          const g = selectedGenre.toLowerCase();
          const matchGenre = (work.genre || "").toLowerCase() === g;
          const matchSecGenre = (work.secondaryGenre || "").toLowerCase() === g;
          const matchTags = (work.tags || []).some((t) => (t || "").toLowerCase() === g);
          if (!matchGenre && !matchSecGenre && !matchTags) {
            return false;
          }
        }

        // Language
        if (
          selectedLanguage !== "all" &&
          (work.language || "").toLowerCase() !== selectedLanguage.toLowerCase()
        ) {
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
        if (sortBy === "trending") return ((b.reads || 0) + 1) * (b.rating || 5) - ((a.reads || 0) + 1) * (a.rating || 5);
        if (sortBy === "reads") return (b.reads || 0) - (a.reads || 0);
        if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
        if (sortBy === "likes") return (b.likesCount || 0) - (a.likesCount || 0);
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [
    allWorks,
    selectedFormat,
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
    setSelectedFormat("all");
    setSelectedGenre("All Genres");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSelectedRating("all");
    setSortBy("trending");
    setActiveTab("all");
  };

  const handleFormatChange = (fmt: DiscoverFormat) => {
    setSelectedFormat(fmt);
    const params = new URLSearchParams(window.location.search);
    if (fmt === "all") {
      params.delete("format");
      params.delete("medium");
    } else {
      params.set("format", fmt);
    }
    const newUrl = params.toString() ? `/discover?${params.toString()}` : "/discover";
    window.history.replaceState({}, "", newUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              EXPLORE THE YOUMIKA UNIVERSE • 探索
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white tracking-tight">
            Discover Stories Across All Formats
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 mt-1 font-medium">
            Explore original Web Novels, Illustrated Light Novels, Japanese Manga, Vertical Webtoons, and Graphic Novels.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-700 text-[#111111] dark:text-white text-xs focus:outline-none focus:border-[#D91E18] transition placeholder-zinc-400 shadow-2xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Story Format Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D91E18]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#111111] dark:text-white">
              Story Formats
            </span>
          </div>
          <span className="text-[11px] font-bold text-zinc-400">
            {filteredWorks.length} {filteredWorks.length === 1 ? "work" : "works"} available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {FORMAT_FILTERS.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            const count = formatCounts[fmt.id];

            return (
              <button
                key={fmt.id}
                onClick={() => handleFormatChange(fmt.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 select-none ${
                  isSelected
                    ? "bg-[#D91E18] border-[#D91E18] text-white shadow-md shadow-rose-600/20"
                    : "bg-white dark:bg-zinc-900 border-[#EAEAE5] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-zinc-500 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white text-[#D91E18]"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black tracking-tight leading-snug truncate">
                    {fmt.label}
                  </div>
                  <div
                    className={`text-[10px] font-medium tracking-wide uppercase mt-0.5 ${
                      isSelected ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {fmt.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Curated Discovery Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
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

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-[#D91E18] transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
        </div>

        {/* Sort & Order Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-[11px] text-zinc-500 font-medium">
            Category active:{" "}
            <span className="font-bold text-[#111111] dark:text-white capitalize">
              {FORMAT_FILTERS.find((f) => f.id === selectedFormat)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D91E18]"
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
          Showing <strong>{filteredWorks.length}</strong> works in{" "}
          <strong className="text-[#111111] dark:text-white">
            {FORMAT_FILTERS.find((f) => f.id === selectedFormat)?.label}
          </strong>
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
            Try adjusting your search keywords, category or format filters to discover other stories, comics, and manga.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-semibold text-xs shadow-md transition"
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

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-400 text-xs font-bold">
          Loading Youmika Universe...
        </div>
      }
    >
      <DiscoverPageContent />
    </Suspense>
  );
}
