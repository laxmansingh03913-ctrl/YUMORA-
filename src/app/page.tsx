"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  PenTool,
  TrendingUp,
  Award,
  ArrowRight,
  Flame,
  Star,
  Users,
  Compass,
  CheckCircle2,
  ChevronRight,
  Layers,
  Zap,
  UserCheck,
  Bell,
  Clock,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { formatNumber, formatDate } from "@/lib/utils";

const GENRES = [
  { name: "Fantasy", icon: "✨", count: "480+ Novels", color: "from-purple-600 to-indigo-600" },
  { name: "Sci-Fi", icon: "🚀", count: "320+ Novels", color: "from-cyan-600 to-blue-600" },
  { name: "Cyberpunk", icon: "⚡", count: "190+ Novels", color: "from-rose-600 to-pink-600" },
  { name: "Romance", icon: "💖", count: "510+ Novels", color: "from-pink-600 to-rose-500" },
  { name: "Mystery", icon: "🔍", count: "210+ Novels", color: "from-emerald-600 to-teal-600" },
  { name: "Adventure", icon: "🧭", count: "290+ Novels", color: "from-amber-600 to-orange-600" },
  { name: "Steampunk", icon: "⚙️", count: "140+ Novels", color: "from-yellow-600 to-amber-700" },
  { name: "Slice of Life", icon: "☕", count: "180+ Novels", color: "from-teal-600 to-emerald-700" },
];

export default function HomePage() {
  const { requireAuth } = useAuth();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const novels = dataStore.getNovels();
  const comics = dataStore.getComics();
  const creators = dataStore.getUsers().filter((u) => u.role === "CREATOR");
  const contests = dataStore.getContests();
  const activeContest = contests[0];

  const featuredNovels = novels.filter((n) => n.isFeatured);
  const trendingNovels = [...novels].sort((a, b) => b.reads - a.reads);
  const editorsPicks = novels.filter((n) => n.isEditorPick);
  const newReleases = [...novels].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const heroNovel = featuredNovels[activeHeroSlide % featuredNovels.length] || novels[0];
  const followingFeed = mounted ? dataStore.getFollowingFeed() : [];

  return (
    <div className="flex flex-col space-y-16 lg:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Blurred dynamic backdrop image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={heroNovel.bannerUrl || heroNovel.coverUrl}
            alt="Hero backdrop"
            className="w-full h-full object-cover opacity-20 dark:opacity-25 filter blur-3xl scale-110 transform transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold tracking-wide uppercase shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Next Generation Storytelling Universe</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Stories Worth <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-indigo-500 bg-clip-text text-transparent">
                Getting Lost In.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Read original novels, discover independent creators, and share stories with readers around the world. From serial web novels to future webtoons and animations.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => requireAuth("/discover")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-rose-600/25 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Start Reading</span>
              </button>

              <button
                onClick={() => requireAuth("/creator/upload")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-bold text-base shadow-sm transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <PenTool className="w-5 h-5 text-rose-500" />
                <span>Publish Your Story</span>
              </button>
            </div>

            {/* Trust and scale metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-200/60 dark:border-zinc-800/60 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  500K+
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Monthly Reads</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  1,200+
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Original Novels</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-rose-500">
                  $1,000+
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Monthly Prizes</p>
              </div>
            </div>
          </div>

          {/* Right Hero Spotlight Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-4 sm:p-5 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl backdrop-blur-xl">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-zinc-950">
                <img
                  src={heroNovel.coverUrl}
                  alt={heroNovel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3" /> FEATURED SPOTLIGHT
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/20 backdrop-blur-xs">
                    {heroNovel.genre}
                  </span>
                  <h3 className="text-xl font-black mt-1 line-clamp-1">{heroNovel.title}</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={heroNovel.creator.avatar}
                      alt={heroNovel.creator.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {heroNovel.creator.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{heroNovel.rating}</span>
                    <span className="text-zinc-400 text-[11px]">({heroNovel.totalRatings})</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                  {heroNovel.description}
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => requireAuth(`/novels/${heroNovel.slug}`)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Read Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveHeroSlide((prev) => prev + 1)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition"
                    title="Next Featured Story"
                  >
                    Next Story →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOLLOWING FEED: LATEST RELEASES FROM FOLLOWED CREATORS */}
      {followingFeed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Bell className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  Following Feed
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Live Updates
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                New chapters and webtoon releases from creators you follow
              </p>
            </div>

            <Link
              href="/library"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
            >
              <span>Manage Following</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followingFeed.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 hover:border-indigo-500/40 transition shadow-sm group"
              >
                <img
                  src={item.coverUrl}
                  alt={item.contentTitle}
                  className="w-16 h-20 rounded-2xl object-cover border border-zinc-700 flex-shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <img
                      src={item.creatorAvatar}
                      alt={item.creatorName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate font-semibold text-zinc-800 dark:text-zinc-300">
                      {item.creatorName}
                    </span>
                    {item.isVerified && <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
                  </div>

                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {item.contentTitle}
                  </h4>

                  <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 truncate">
                    {item.releaseTitle}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.releasedAt)}
                    </span>

                    <Link
                      href={
                        item.contentType === "NOVEL"
                          ? `/novels/${item.contentSlug}/chapter/${item.releaseNumber}`
                          : `/comics/${item.contentSlug}`
                      }
                      className="font-bold text-indigo-400 hover:underline"
                    >
                      Read Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. CREATOR PIPELINE BANNER: Writer -> Novel -> Comic -> Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                The Story Engine
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Where Great Stories Become Legends
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                We empower creators with a clear evolution path: serialize your novel, grow your fanbase, adapt into visual webtoons, and step into animation.
              </p>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold">
              <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200">
                1. Write Novel
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500" />
              <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200">
                2. Build Fandom
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500" />
              <div className="px-3 py-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                3. Webtoon Comic
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500" />
              <div className="px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300">
                4. Animation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRENDING NOW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-rose-500" />
              <span>Trending Now</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Ranked by real-time reader engagement, bookmarks, and completion rate
            </p>
          </div>
          <Link
            href="/discover?sort=trending"
            className="text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1 group"
          >
            <span>View All Trending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingNovels.slice(0, 4).map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      </section>

      {/* 4. ACTIVE CONTEST SPOTLIGHT: $500 Monthly Challenge */}
      {activeContest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 text-white shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-zinc-950 shadow-md flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> MONTHLY CREATOR CHALLENGE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300">
                    {activeContest.prizePool} Prize Pool
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100">
                  {activeContest.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  {activeContest.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {activeContest.prizeStructure.map((prize) => (
                    <div
                      key={prize.place}
                      className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center"
                    >
                      <p className="text-[11px] font-bold text-amber-400">{prize.place}</p>
                      <p className="text-base font-black text-white">{prize.reward}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center w-full max-w-xs space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Submissions Open</span>
                  </div>
                  <p className="text-xl font-extrabold text-white">{activeContest?.submissionCount || 48} Submissions</p>
                  <p className="text-xs text-amber-400 font-semibold">
                    Deadline: {activeContest ? formatDate(activeContest.endDate) : "Sep 30, 2026"}
                  </p>
                </div>

                <Link
                  href="/contests"
                  className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-zinc-950 font-black text-sm text-center shadow-xl shadow-amber-500/20 transition transform hover:scale-[1.02]"
                >
                  Enter Contest →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. POPULAR GENRES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-6 h-6 text-indigo-500" />
              <span>Explore by Genre</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Immerse yourself in carefully curated universes and themes
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs sm:text-sm font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
          >
            <span>All Genres</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {GENRES.map((g) => (
            <Link
              key={g.name}
              href={`/discover?genre=${encodeURIComponent(g.name)}`}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 hover:shadow-lg transition group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{g.icon}</span>
                <span className="text-[10px] text-zinc-400 font-medium">{g.count}</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition mt-2">
                {g.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. COMICS & WEBTOONS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-500" />
              <span>Original Comics & Webtoons</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Full-color vertical scroll serialized visual webtoons
            </p>
          </div>
          <Link
            href="/comics"
            className="text-xs sm:text-sm font-semibold text-violet-500 hover:text-violet-400 flex items-center gap-1"
          >
            <span>Explore Comics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {comics.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </section>

      {/* 7. EDITOR'S PICKS & NEW RELEASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor's Picks Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-rose-500" />
              <span>Editor&apos;s Curated Picks</span>
            </h3>
          </div>
          <div className="space-y-3">
            {editorsPicks.slice(0, 3).map((novel) => (
              <NovelCard key={novel.id} novel={novel} variant="horizontal" />
            ))}
          </div>
        </div>

        {/* New Releases Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Fresh Chapter Updates</span>
            </h3>
          </div>
          <div className="space-y-3">
            {newReleases.slice(0, 3).map((novel) => (
              <NovelCard key={novel.id} novel={novel} variant="horizontal" />
            ))}
          </div>
        </div>
      </section>

      {/* 8. RISING CREATORS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-500" />
              <span>Rising Creators</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Independent authors and artists gaining international fandoms
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.username}`}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-rose-500/50 hover:shadow-xl transition group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-500/40 group-hover:scale-105 transition"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition truncate">
                      {creator.name}
                    </h4>
                    {creator.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">@{creator.username}</p>
                  <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                    {creator.country || "Global Creator"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-3 leading-relaxed">
                {creator.bio}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatNumber(creator.followersCount)} followers
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {formatNumber(creator.totalReads)} reads
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
