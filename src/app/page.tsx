"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  PenTool,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Layers,
  Trophy,
  Compass,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { ContinueReadingWidget } from "@/components/home/ContinueReadingWidget";
import { formatNumber, formatDate } from "@/lib/utils";
import { formatContestDeadline, getContestStatus } from "@/lib/utils/contest";
import { Novel, Comic } from "@/lib/types";
import { dbService } from "@/lib/supabase/db";

// ─────────────────────────────────────────────────────────────────────────────
// TOP 10 CURATED LEADERBOARD BENCHMARKS
// ─────────────────────────────────────────────────────────────────────────────
const TOP_10_CURATED = [
  {
    id: "top-1",
    title: "SOLO LEVELING: ARISE",
    slug: "solo-leveling-arise",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    genre: "Action",
    tags: ["Fantasy", "Action", "Magic"],
    rating: "4.9",
    views: "18.5M Views",
    type: "COMIC",
  },
  {
    id: "top-2",
    title: "WORLD GOVERNED BY CELESTIAL CONSTELLATION",
    slug: "world-governed-by-celestial-constellation-looms",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    genre: "Fantasy",
    tags: ["Action", "Constellation", "Magic"],
    rating: "4.9",
    views: "1.2M Reads",
    type: "COMIC",
  },
  {
    id: "top-3",
    title: "Omniscient Reader's Viewpoint",
    slug: "omniscient-readers-viewpoint",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    genre: "Fantasy",
    tags: ["Fantasy", "Action"],
    rating: "4.9",
    views: "14.2M Views",
    type: "COMIC",
  },
  {
    id: "top-4",
    title: "The Beginning After the End",
    slug: "the-beginning-after-the-end",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    genre: "Magic",
    tags: ["Reincarnation", "Action"],
    rating: "4.9",
    views: "11.8M Views",
    type: "COMIC",
  },
  {
    id: "top-5",
    title: "Villains Are Destined to Die",
    slug: "villains-are-destined-to-die",
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    genre: "Romance",
    tags: ["Romance", "Otome", "Drama"],
    rating: "4.8",
    views: "9.4M Views",
    type: "COMIC",
  },
  {
    id: "top-6",
    title: "Return of the Blossoming Blade",
    slug: "return-of-the-blossoming-blade",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    genre: "Murim",
    tags: ["Martial Arts", "Comedy"],
    rating: "4.9",
    views: "8.7M Views",
    type: "COMIC",
  },
  {
    id: "top-7",
    title: "Summer Korean Sough",
    slug: "summer-korean-sough",
    coverUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    genre: "Drama",
    tags: ["Romance", "School"],
    rating: "4.8",
    views: "7.1M Views",
    type: "COMIC",
  },
  {
    id: "top-8",
    title: "The Bastard of the Red Star",
    slug: "the-bastard-of-the-red-star",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    genre: "Dark Fantasy",
    tags: ["Revenge", "Magic"],
    rating: "4.7",
    views: "6.5M Views",
    type: "COMIC",
  },
  {
    id: "top-9",
    title: "Tower of God: S3",
    slug: "tower-of-god",
    coverUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
    genre: "Adventure",
    tags: ["Tower", "Action"],
    rating: "4.9",
    views: "16.1M Views",
    type: "COMIC",
  },
  {
    id: "top-10",
    title: "Eleceed: Lightning Awakens",
    slug: "eleceed",
    coverUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80",
    genre: "Supernatural",
    tags: ["Action", "Comedy"],
    rating: "4.9",
    views: "12.3M Views",
    type: "COMIC",
  },
];

const FORMATS = [
  { name: "Web Novels", href: "/discover?format=web_novels", emoji: "📖", desc: "480+ stories" },
  { name: "Light Novels", href: "/discover?format=light_novels", emoji: "✨", desc: "210+ stories" },
  { name: "Manga", href: "/discover?format=manga", emoji: "🖤", desc: "190+ stories" },
  { name: "Webtoons", href: "/discover?format=webtoons", emoji: "📱", desc: "140+ stories" },
  { name: "Comics", href: "/comics", emoji: "🎨", desc: "80+ stories" },
];

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View All",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 sm:mb-8">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-black tracking-widest text-indigo-400 uppercase mb-0.5">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition group"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// ─── Story Card ───────────────────────────────────────────────────────────────
function StoryCard({
  cover,
  title,
  genre,
  rating,
  views,
  slug,
  isOriginal = false,
  isComic = false,
}: {
  cover: string;
  title: string;
  genre: string;
  rating?: string;
  views?: string;
  slug: string;
  isOriginal?: boolean;
  isComic?: boolean;
}) {
  const targetHref = isComic ? `/comics/${slug}` : `/novels/${slug}`;

  return (
    <Link
      href={targetHref}
      className="group flex-shrink-0 w-36 sm:w-44 lg:w-48 block snap-start space-y-2 select-none"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-all duration-300 shadow-md">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 pointer-events-none">
          {rating && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-white">{rating}</span>
            </div>
          )}
          {views && (
            <div className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/5 text-[9px] font-bold text-white/80">
              {views}
            </div>
          )}
        </div>
        {isOriginal && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-rose-600 to-indigo-600 text-white uppercase tracking-wider shadow-md pointer-events-none">
            ORIGINAL
          </span>
        )}
      </div>
      <div className="px-1 text-left">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{genre}</p>
        <h3 className="text-xs sm:text-sm font-black text-zinc-800 dark:text-white group-hover:text-indigo-400 transition-colors leading-tight line-clamp-1 mt-0.5">
          {title}
        </h3>
      </div>
    </Link>
  );
}

// ─── Horizontal Shelf ─────────────────────────────────────────────────────────
function HorizontalShelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 snap-x snap-mandatory scrollbar-none">
      {children}
    </div>
  );
}

// ─── Top 10 Trending Leaderboard ──────────────────────────────────────────────
function Top10Leaderboard({ items }: { items: any[] }) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <p className="text-[11px] font-black tracking-widest text-indigo-400 uppercase">
              Real-Time Global Rankings
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Top 10 Trending Manga and Webtoon
          </h2>
        </div>
        <Link
          href="/comics"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
        >
          <span>Explore Charts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll Shelf for Top 10 */}
      <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 snap-x snap-mandatory scrollbar-none">
        {items.slice(0, 10).map((item, idx) => {
          const rank = idx + 1;
          const targetHref =
            item.type === "COMIC" || item.isComic
              ? `/comics/${item.slug}`
              : `/novels/${item.slug}`;

          return (
            <Link
              key={item.id || idx}
              href={targetHref}
              className="group relative flex-shrink-0 w-44 sm:w-52 block snap-start space-y-2 select-none"
            >
              {/* Card Container */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-all duration-300">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Giant Metallic Rank Typography (Top Left) */}
                <div className="absolute top-1.5 left-2.5 pointer-events-none select-none leading-none z-10">
                  <span
                    className={`font-black tracking-tighter drop-shadow-md ${
                      rank === 1
                        ? "text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]"
                        : rank === 2
                        ? "text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-zinc-300 to-zinc-400 drop-shadow-[0_2px_8px_rgba(200,200,200,0.5)]"
                        : rank === 3
                        ? "text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-amber-600 via-rose-500 to-indigo-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]"
                        : "text-4xl sm:text-5xl text-white/30 group-hover:text-white/60 transition-colors"
                    }`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Bottom Card Info Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1.5 z-10">
                  <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {/* Genre badges */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(item.tags || [item.genre || "Fantasy", "Action"]).slice(0, 2).map((t: string) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-[9px] font-bold text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-zinc-300 font-bold">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {item.rating || "4.9"}
                    </span>
                    <span className="text-zinc-400">
                      {item.views || "18.5M Views"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function IndexPage() {
  const { user, requireAuth } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [novels, setNovels] = useState<Novel[]>(() => dataStore.getNovels());
  const [comics, setComics] = useState<Comic[]>(() => dataStore.getComics());

  useEffect(() => {
    setMounted(true);
    dbService.getNovels().then((data) => {
      if (data && data.length > 0) setNovels(data);
    });
    dbService.getComics().then((data) => {
      if (data && data.length > 0) setComics(data);
    });
  }, []);

  const creators = dataStore.getUsers().filter((u) => u.role === "CREATOR" || u.role === "ADMIN");
  const activeContest = dataStore.getActiveContest();
  const followingFeed = mounted && user ? dataStore.getFollowingFeed() : [];

  // Assemble curated Hero Slides
  const heroSlides = [
    {
      id: "celestial-constellation",
      title: "WORLD GOVERNED BY CELESTIAL CONSTELLATION",
      slug: "world-governed-by-celestial-constellation-looms",
      type: "COMIC",
      description:
        "In an ancient cosmos where constellations choose mortal vessels, an academy outlander unlocks the forbidden Void Constellation, shattering the thousand-year balance of powers.",
      coverUrl:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
      genre: "Celestial Fantasy",
      rating: "4.9",
      views: "1.2M Reads",
      tags: ["Action", "Fantasy", "Romance"],
    },
    ...novels.slice(0, 3).map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      type: "NOVEL",
      description: n.description || "A captivating story from our top verified authors on Yomika.",
      coverUrl: n.coverUrl,
      genre: n.genre,
      rating: String(n.rating),
      views: `${formatNumber(n.reads)} Reads`,
      tags: [n.genre, "Web Novel"],
    })),
  ];

  const slide = heroSlides[slideIndex] ?? heroSlides[0];

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setSlideIndex(idx);
      setTimeout(() => setAnimating(false), 500);
    },
    [animating]
  );

  const next = useCallback(() => {
    if (heroSlides.length === 0) return;
    goTo((slideIndex + 1) % heroSlides.length);
  }, [goTo, slideIndex, heroSlides.length]);

  const prev = useCallback(() => {
    if (heroSlides.length === 0) return;
    goTo((slideIndex - 1 + heroSlides.length) % heroSlides.length);
  }, [goTo, slideIndex, heroSlides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused]);

  const pauseAndResume = () => {
    setPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setPaused(false), 12000);
  };

  const handleNav = (fn: () => void) => {
    pauseAndResume();
    fn();
  };

  // Merge items for Top 10 Leaderboard
  const top10Items = TOP_10_CURATED.map((curated, idx) => {
    if (idx === 1 && comics.length > 0) {
      const match = comics.find((c) => c.slug === "world-governed-by-celestial-constellation-looms");
      if (match) {
        return {
          ...curated,
          title: match.title,
          slug: match.slug,
          coverUrl: match.coverUrl || curated.coverUrl,
        };
      }
    }
    return curated;
  });

  const trendingList = novels.length >= 4 ? novels : [...novels];
  const originalsList = novels.length >= 6 ? novels.slice(0, 6) : [...novels].slice(0, 6);

  return (
    <div className="min-h-screen bg-[#09090e] text-zinc-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. CINEMATIC HERO SPOTLIGHT BANNER (DESIGN 1 SPEC)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-10">
        {/* Ambient Glow Halo */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-4/5 h-72 bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

        {/* Hero Spotlight Container */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-black via-[#0d0d18] to-black border border-indigo-500/20 shadow-2xl shadow-indigo-950/40">
          {/* Background Animated Art */}
          <div className="absolute inset-0 z-0">
            <img
              src={slide.coverUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center opacity-45 sm:opacity-55 transition-all duration-700 scale-102 filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-radial-gradient-vignette opacity-60 pointer-events-none" />
          </div>

          {/* Banner Content Details */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>YOMIKA SPOTLIGHT • {slide.genre}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
              {slide.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl line-clamp-3">
              {slide.description}
            </p>

            {/* Ratings & Metadata */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-amber-400 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {slide.rating}
              </span>
              <span className="text-xs font-bold text-zinc-300">
                {slide.views}
              </span>
              <div className="flex items-center gap-1.5">
                {(slide.tags || ["Action", "Fantasy", "Romance"]).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 border border-white/10 text-zinc-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={slide.type === "COMIC" ? `/comics/${slide.slug}` : `/novels/${slide.slug}`}
                className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition shadow-lg shadow-indigo-600/35 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Read Episode 1</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => requireAuth("/library")}
                className="px-5 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>My Library</span>
              </button>
            </div>

            {/* Slide Pagination Dots */}
            <div className="flex items-center gap-2 pt-3">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleNav(() => goTo(i))}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === slideIndex
                      ? "w-8 bg-indigo-500 shadow-md shadow-indigo-500/50"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Left / Right Nav Arrows */}
          <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2 z-20">
            <button
              onClick={() => handleNav(prev)}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNav(next)}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP 10 TRENDING MANGA AND WEBTOON (DESIGN 1 SPEC)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-4">
        <Top10Leaderboard items={top10Items} />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CONTENT SHELVES & INTERACTIVE SECTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-14 sm:space-y-20 pb-24 pt-6">
        {/* Continue Reading (If user has progress) */}
        {mounted && user && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <ContinueReadingWidget />
          </div>
        )}

        {/* Most Read Stories */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Curated" title="Popular on Yomika" href="/novels" />
          <HorizontalShelf>
            {trendingList.slice(0, 10).map((n) => (
              <StoryCard
                key={n.id}
                cover={n.coverUrl}
                title={n.title}
                genre={n.genre}
                rating={String(n.rating)}
                views={formatNumber(n.reads)}
                slug={n.slug}
              />
            ))}
          </HorizontalShelf>
        </div>

        {/* Explore Formats */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Browse" title="Explore Story Formats" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {FORMATS.map((f) => (
              <Link
                key={f.name}
                href={f.href}
                className="group relative flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden"
              >
                <span className="text-2xl sm:text-3xl mb-3 relative z-10">{f.emoji}</span>
                <h3 className="text-sm sm:text-base font-black text-white relative z-10">{f.name}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 relative z-10">{f.desc}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/0 group-hover:text-indigo-400 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Yomika Originals Grid */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Exclusive" title="Original Series" href="/novels" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {originalsList.map((n) => (
              <StoryCard
                key={n.id}
                cover={n.coverUrl}
                title={n.title}
                genre={n.genre}
                rating={String(n.rating)}
                views={formatNumber(n.reads)}
                slug={n.slug}
                isOriginal
              />
            ))}
          </div>
        </div>

        {/* Rising Creators Ecosystem */}
        {creators.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <SectionHeader eyebrow="Community" title="Featured Creators" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {creators.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/creator/${c.username}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 transition-all group"
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                        {c.name}
                      </h4>
                      {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">@{c.username}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(c.followersCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {formatNumber(c.totalReads)}
                      </span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-bold text-zinc-300 group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition">
                    View
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contest or Creator Callout Banner */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          {activeContest ? (
            <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-zinc-950 via-indigo-950/40 to-zinc-950 p-6 sm:p-10 lg:p-12 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">
                    Official Creator Tournament
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    {activeContest.title}
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
                    {activeContest.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/contests"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm tracking-wide transition shadow-lg shadow-indigo-600/30"
                    >
                      Enter Contest →
                    </Link>
                    <span className="text-xs text-zinc-400">
                      Deadline: {formatContestDeadline(activeContest.endDate, activeContest.timezone)}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden lg:block space-y-3">
                  <p className="text-[11px] text-indigo-400 font-black uppercase tracking-widest">
                    Prize Pool
                  </p>
                  <p className="text-5xl xl:text-6xl font-black text-white">
                    {activeContest.prizePool}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                    {getContestStatus(activeContest) === "LIVE" ? "● SUBMISSIONS OPEN" : "⏳ UPCOMING"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-zinc-950 via-indigo-950/20 to-zinc-950 p-8 sm:p-12 lg:p-14 text-center shadow-xl">
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                Creator Launchpad
              </p>
              <h2
                className="font-black text-white leading-tight mb-4"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                Create. Publish.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                  Build Your Fandom.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
                Yomika equips creators with 2-tier series registration, motion manga dubbing, and direct monetization. Launch your stories to readers worldwide.
              </p>
              <button
                type="button"
                onClick={() => requireAuth("/creator/upload")}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-sm tracking-wide transition shadow-lg shadow-indigo-600/30 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Start Creating Today</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
