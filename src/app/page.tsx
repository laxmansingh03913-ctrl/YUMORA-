"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  PenTool,
  Award,
  ArrowRight,
  Star,
  Users,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Bell,
  Clock,
  Eye,
  Flame,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { ContinueReadingWidget } from "@/components/home/ContinueReadingWidget";
import { formatNumber, formatDate } from "@/lib/utils";
import { formatContestDeadline, getContestStatus } from "@/lib/utils/contest";

// Curated Showcase items from the editorial reference
const EDITORIAL_FEATURED = [
  {
    id: "feat-1",
    title: "Bound by Blood",
    slug: "bound-by-blood",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    genre: "Fantasy",
    views: "12.4K",
    rating: "4.8",
    reads: 12400,
    rank: 1,
  },
  {
    id: "feat-2",
    title: "Shadow's Ascent",
    slug: "shadows-ascent",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    genre: "Action",
    views: "9.8K",
    rating: "4.7",
    reads: 9800,
    rank: 2,
  },
  {
    id: "feat-3",
    title: "Path of the Wind",
    slug: "path-of-the-wind",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    genre: "Wuxia",
    views: "8.3K",
    rating: "4.6",
    reads: 8300,
    rank: 3,
  },
  {
    id: "feat-4",
    title: "Letters Unsent",
    slug: "letters-unsent",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    genre: "Romance",
    views: "7.1K",
    rating: "4.6",
    reads: 7100,
    rank: 4,
  },
  {
    id: "feat-5",
    title: "Re:Awakening",
    slug: "re-awakening",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    genre: "Sci-Fi",
    views: "6.2K",
    rating: "4.5",
    reads: 6200,
    rank: 5,
  },
];

const GENRES = [
  { name: "Fantasy", kana: "ファンタジー", count: "480+ Stories" },
  { name: "Action", kana: "アクション", count: "390+ Stories" },
  { name: "Sci-Fi", kana: "SF / 近未来", count: "320+ Stories" },
  { name: "Romance", kana: "恋愛 / ドラマ", count: "510+ Stories" },
  { name: "Wuxia", kana: "武侠 / 修仙", count: "210+ Stories" },
  { name: "Mystery", kana: "ミステリー", count: "190+ Stories" },
  { name: "Supernatural", kana: "超自然", count: "260+ Stories" },
  { name: "Slice of Life", kana: "日常 / 青春", count: "180+ Stories" },
];

export default function HomePage() {
  const { requireAuth } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const novels = dataStore.getNovels();
  const comics = dataStore.getComics();
  const creators = dataStore.getUsers().filter((u) => u.role === "CREATOR");
  const activeContest = dataStore.getActiveContest();
  const followingFeed = mounted ? dataStore.getFollowingFeed() : [];

  // Combine dynamic novels with editorial showcase
  const allFeaturedStories = [
    ...novels.map((n, idx) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      coverUrl: n.coverUrl,
      genre: n.genre,
      views: formatNumber(n.reads),
      rating: String(n.rating),
      reads: n.reads,
      rank: idx + 1,
    })),
    ...EDITORIAL_FEATURED.slice(novels.length),
  ].slice(0, 5);

  const scrollCarousel = (dir: "left" | "right") => {
    if (dir === "left") {
      setCarouselIndex((prev) => (prev > 0 ? prev - 1 : allFeaturedStories.length - 1));
    } else {
      setCarouselIndex((prev) => (prev < allFeaturedStories.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="flex flex-col space-y-12 lg:space-y-16 pb-20 bg-[#FAFAF7] text-[#111111] dark:bg-[#121214] dark:text-zinc-100 min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Neo-Japan Manga Editorial Design) */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative">
          
          {/* LEFT SIDE: Editorial Typography & Actions (5 cols for clean breathing room) */}
          <div className="lg:col-span-5 space-y-6 z-20 relative">
            {/* Small brand badge */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 border-2 border-[#D91E18] text-[#D91E18] text-[10px] font-black flex items-center justify-center rounded-xs bg-white dark:bg-zinc-900 shadow-xs">
                物語
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-widest text-[#111111] dark:text-white uppercase leading-tight">
                  YOMIKA
                </span>
                <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
                  WHERE STORIES COME ALIVE
                </span>
              </div>
            </div>

            {/* Large Dramatic Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[66px] font-black text-[#111111] dark:text-white tracking-tight leading-[1.04]">
              STORIES WORTH <br />
              <span className="text-[#D91E18]">GETTING</span> LOST IN.
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-[#555555] dark:text-zinc-400 max-w-xl leading-relaxed font-normal">
              Read original novels, discover independent creators, and share stories with readers around the world. From serial web novels to future webtoons and animations.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => requireAuth("/discover")}
                className="px-6 sm:px-8 py-3 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>START READING</span>
              </button>

              <button
                onClick={() => requireAuth("/creator/upload")}
                className="px-6 sm:px-8 py-3 rounded-lg bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-300 text-[#111111] dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <PenTool className="w-4 h-4 text-[#111111] dark:text-white" />
                <span>PUBLISH YOUR STORY</span>
              </button>
            </div>

            {/* Editorial Stats Row */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EAEAE5] dark:border-zinc-800 max-w-md">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#111111] dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#D91E18] animate-pulse" />
                  <span>LIVE</span>
                </div>
                <p className="text-[11px] text-[#555555] dark:text-zinc-500 font-medium">Real-time Publishing</p>
              </div>

              <div className="space-y-0.5 border-l border-[#EAEAE5] dark:border-zinc-800 pl-4">
                <p className="text-xs sm:text-sm font-black text-[#111111] dark:text-white">
                  {novels.length || 13}
                </p>
                <p className="text-[11px] text-[#555555] dark:text-zinc-500 font-medium">Published Novels</p>
              </div>

              <div className="space-y-0.5 border-l border-[#EAEAE5] dark:border-zinc-800 pl-4">
                <p className="text-xs sm:text-sm font-black text-[#D91E18]">
                  $1,000+
                </p>
                <p className="text-[11px] text-[#555555] dark:text-zinc-500 font-medium">Monthly Prizes</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Full-Bleed Organic Foreground Artwork (7 cols, Full Scale Fitting) */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[550px] sm:min-h-[660px] lg:min-h-[780px] xl:min-h-[880px] pt-2 lg:pt-0 select-none overflow-visible">
            
            {/* Soft Ambient Brand Aura */}
            <div className="w-80 h-80 sm:w-[550px] sm:h-[550px] lg:w-[750px] lg:h-[750px] rounded-full bg-red-500/10 dark:bg-red-600/15 blur-3xl absolute top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2 lg:right-[-60px] lg:translate-x-0 -z-10 animate-pulse-red pointer-events-none" />

            {/* Floating Organic Hero Visual: Character + Books + Manga + Light Novel Pages */}
            <div className="relative w-[110%] sm:w-[125%] lg:w-[138%] xl:w-[148%] h-[550px] sm:h-[660px] lg:h-[780px] xl:h-[880px] flex items-center justify-center pointer-events-none lg:-mr-20 xl:-mr-32">
              <img
                src="/hero-character.png"
                alt="Yomika Story Creator — Where Stories Come Alive"
                className="w-full h-full object-contain transform scale-105 sm:scale-115 lg:scale-128 xl:scale-138 filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_30px_55px_rgba(217,30,24,0.3)] transition-transform duration-700 animate-float-slow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero-creator.png";
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1.5 CONTINUE READING SHELF (Pick Up Where You Left Off) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ContinueReadingWidget />
      </div>

      {/* ========================================================================= */}
      {/* 2. FEATURED TODAY (注目の作品) CAROUSEL */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#111111] dark:bg-white rounded-2xs" />
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
              FEATURED TODAY
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
              注目の作品
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/novels"
              className="text-xs sm:text-sm font-black text-[#D91E18] hover:underline flex items-center gap-1"
            >
              <span>VIEW ALL →</span>
            </Link>

            {/* Carousel Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollCarousel("left")}
                aria-label="Previous story"
                className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-[#D91E18] hover:text-[#D91E18] flex items-center justify-center transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                aria-label="Next story"
                className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-[#D91E18] hover:text-[#D91E18] flex items-center justify-center transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Story Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {allFeaturedStories.map((story, idx) => (
            <div
              key={story.id}
              className="group relative flex flex-col rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-200 overflow-hidden shadow-2xs"
            >
              {/* Cover Artwork with Rank Badge */}
              <Link href={`/novels/${story.slug}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition" />

                {/* Red Rank Badge: 01, 02, 03 */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-xs text-xs font-black bg-[#D91E18] text-white shadow-xs z-10">
                  {String(story.rank || idx + 1).padStart(2, "0")}
                </span>

                {/* Genre Pill at bottom-left */}
                <div className="absolute bottom-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-zinc-100 border border-white/20">
                    {story.genre}
                  </span>
                </div>
              </Link>

              {/* Title & Metrics */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <Link href={`/novels/${story.slug}`}>
                  <h3 className="font-black text-xs sm:text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition line-clamp-1">
                    {story.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between pt-1.5 border-t border-[#EAEAE5] dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-zinc-400" />
                    {story.views}
                  </span>
                  <span className="flex items-center gap-1 text-[#D91E18] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {story.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOLLOWING FEED (LIVE CHAPTER RELEASES) */}
      {/* ========================================================================= */}
      {followingFeed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#D91E18] rounded-2xs" />
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
                Following Feed
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-[#D91E18]">
                LIVE UPDATES
              </span>
            </div>

            <Link
              href="/library"
              className="text-xs font-bold text-[#D91E18] hover:underline flex items-center gap-1"
            >
              <span>Manage Following →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followingFeed.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 flex items-center gap-3.5 hover:border-black dark:hover:border-white transition shadow-2xs group"
              >
                <img
                  src={item.coverUrl}
                  alt={item.contentTitle}
                  className="w-14 h-18 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <img
                      src={item.creatorAvatar}
                      alt={item.creatorName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate font-semibold text-zinc-800 dark:text-zinc-300 text-[11px]">
                      {item.creatorName}
                    </span>
                    {item.isVerified && <CheckCircle2 className="w-3 h-3 text-[#D91E18] flex-shrink-0" />}
                  </div>

                  <h4 className="font-black text-xs text-[#111111] dark:text-white truncate">
                    {item.contentTitle}
                  </h4>

                  <p className="text-[11px] font-bold text-[#D91E18] truncate">
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
                      className="font-black text-[#D91E18] hover:underline"
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

      {/* ========================================================================= */}
      {/* 4. CREATOR EVOLUTION PIPELINE */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-[#111111] dark:border-zinc-700 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
                THE CREATOR ENGINE • 創作者パイプライン
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white">
                From Serial Novel to Global Manga & Animation
              </h3>
              <p className="text-xs text-[#555555] dark:text-zinc-400 max-w-xl">
                We empower indie storytellers with an end-to-end evolution roadmap: serialize your novel, monetize chapters, convert to webtoon manga, and expand into animation.
              </p>
            </div>

            {/* 4-Step Visualizer */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
              <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#111111] dark:text-white">
                1. Write Novel
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D91E18]" />
              <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#111111] dark:text-white">
                2. Build Fandom
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D91E18]" />
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-[#D91E18]">
                3. Webtoon Manga
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D91E18]" />
              <div className="px-3 py-2 rounded-lg bg-[#D91E18] text-white">
                4. Animation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EXPLORE BY GENRE (Neo-Japan Editorial Categories) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#111111] dark:bg-white rounded-2xs" />
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
              EXPLORE BY GENRE
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
              ジャンル別
            </span>
          </div>

          <Link
            href="/discover"
            className="text-xs sm:text-sm font-black text-[#D91E18] hover:underline flex items-center gap-1"
          >
            <span>ALL GENRES →</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {GENRES.map((g) => (
            <Link
              key={g.name}
              href={`/discover?genre=${encodeURIComponent(g.name)}`}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-200 group relative shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#D91E18] font-bold tracking-widest uppercase">
                  {g.kana}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">→</span>
              </div>
              <h4 className="font-black text-sm sm:text-base text-[#111111] dark:text-white group-hover:text-[#D91E18] transition mt-1.5">
                {g.name}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {g.count}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ORIGINAL COMICS & MANGA */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#D91E18] rounded-2xs" />
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
              ORIGINAL COMICS & MANGA
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
              連載マンガ
            </span>
          </div>

          <Link
            href="/comics"
            className="text-xs sm:text-sm font-black text-[#D91E18] hover:underline flex items-center gap-1"
          >
            <span>EXPLORE COMICS →</span>
          </Link>
        </div>

        {comics.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {comics.map((comic, idx) => (
              <ComicCard key={comic.id} comic={comic} rank={idx + 1} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-center space-y-3">
            <Zap className="w-8 h-8 text-[#D91E18] mx-auto" />
            <h3 className="font-bold text-base text-[#111111] dark:text-white">No Visual Comics Uploaded Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Upload your webtoon or manga chapters to build your visual audience on Yomika.
            </p>
            <Link
              href="/creator/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Upload First Comic</span>
            </Link>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 7. MONTHLY CONTEST POSTER ($1,000+ Monthly Prizes) */}
      {/* ========================================================================= */}
      {activeContest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#111111] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 sm:p-8 text-[#111111] dark:text-white shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white uppercase tracking-wider">
                    OFFICIAL YOMIKA CONTEST
                  </span>
                  <span className="text-xs font-bold text-[#D91E18]">
                    {activeContest.prizePool} PRIZE POOL
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {activeContest.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 leading-relaxed max-w-2xl">
                  {activeContest.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {activeContest.prizeStructure.map((prize) => (
                    <div
                      key={prize.place}
                      className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center"
                    >
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{prize.place}</p>
                      <p className="text-sm font-black text-[#D91E18]">{prize.reward}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center w-full max-w-xs space-y-1">
                  <span className="text-[10px] font-black text-[#D91E18] uppercase tracking-wider">
                    {getContestStatus(activeContest) === "LIVE"
                      ? "● LIVE • SUBMISSIONS OPEN"
                      : getContestStatus(activeContest) === "SCHEDULED"
                      ? "⏳ COMING SOON"
                      : "CONTEST ENDED"}
                  </span>
                  <p className="text-lg font-black text-[#111111] dark:text-white">
                    {activeContest.submissionCount || 0} Entries
                  </p>
                  <p className="text-[11px] text-zinc-500 font-bold">
                    Deadline: {formatContestDeadline(activeContest.endDate, activeContest.timezone)}
                  </p>
                </div>

                <Link
                  href="/contests"
                  className="w-full max-w-xs py-3 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider text-center shadow-xs transition transform hover:scale-[1.02]"
                >
                  ENTER CONTEST NOW →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. RISING CREATORS SHOWCASE */}
      {/* ========================================================================= */}
      {creators.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#111111] dark:bg-white rounded-2xs" />
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
                RISING CREATORS
              </h2>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                注目の作家
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-black dark:hover:border-white transition shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 group-hover:scale-105 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition truncate">
                        {creator.name}
                      </h4>
                      {creator.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D91E18] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">@{creator.username}</p>
                    <p className="text-[10px] text-[#D91E18] font-bold mt-0.5">
                      {creator.country || "Global Creator"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#555555] dark:text-zinc-400 line-clamp-2 mt-2.5 leading-relaxed font-normal">
                  {creator.bio}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#EAEAE5] dark:border-zinc-800 text-[11px] text-zinc-500">
                  <span className="font-bold text-[#111111] dark:text-white">
                    {formatNumber(creator.followersCount)} followers
                  </span>
                  <span>
                    {formatNumber(creator.totalReads)} reads
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
