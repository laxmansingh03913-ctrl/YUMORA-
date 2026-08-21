"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Image as ImageIcon,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  CheckCircle2,
  MoveVertical,
  Layers,
  ArrowRightLeft,
  Download,
  BookOpen,
  Eye,
  Sliders,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { formatNumber, formatDate } from "@/lib/utils";

interface ComicPageProps {
  params: Promise<{ slug: string }>;
}

export default function ComicDetailPage({ params }: ComicPageProps) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);
  const [comic, setComic] = useState(() => dataStore.getComicBySlug(resolvedParams.slug));

  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comic?.views || 1420);

  // Reading Mode: "VERTICAL" | "RTL" | "LTR"
  const [readingMode, setReadingMode] = useState<"VERTICAL" | "RTL" | "LTR">("VERTICAL");

  // Page index for Page-based Manga / Comic mode
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const found = dataStore.getComicBySlug(resolvedParams.slug);
    setComic(found);
    if (found) {
      setIsBookmarked(dataStore.isBookmarked(found.id));
      setIsLiked(dataStore.isLiked(found.id));
      setLikesCount(found.views || 1420);
      if (found.format === "VERTICAL") {
        setReadingMode("VERTICAL");
      } else if (found.readingDirection === "RTL") {
        setReadingMode("RTL");
      } else {
        setReadingMode("VERTICAL");
      }
    }
  }, [resolvedParams.slug]);

  if (!comic) {
    if (!mounted) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading comic...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Comic Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The comic or webtoon you are looking for does not exist or may have been removed.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/comics"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            Browse All Comics
          </Link>
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition"
          >
            Discover Feed
          </Link>
        </div>
      </div>
    );
  }

  const activeEpisode = comic.episodes[activeEpisodeIdx] || comic.episodes[0];
  const pages = activeEpisode?.imageUrls || [];

  const handleBookmarkToggle = () => {
    const next = dataStore.toggleBookmark(comic.id);
    setIsBookmarked(next);
  };

  const handleLikeToggle = () => {
    const next = dataStore.toggleLike(comic.id);
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : prev - 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 space-y-6 ${isFullscreen ? "bg-black text-white" : ""}`}>
      {/* Header Banner */}
      {!isFullscreen && (
        <div className="relative pt-6 pb-8 bg-zinc-950 border-b border-zinc-800 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Link
              href="/comics"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Comics & Manga</span>
            </Link>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={comic.coverUrl}
                alt={comic.title}
                className="w-32 h-44 object-cover rounded-2xl shadow-xl border border-zinc-700 flex-shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                    {comic.subType || comic.genre}
                  </span>
                  <span className="text-xs text-zinc-400">{comic.status}</span>
                  <span className="text-xs text-zinc-400 uppercase font-bold">• {comic.language}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black">{comic.title}</h1>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  {comic.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {comic.rating}
                  </span>
                  <span>{formatNumber(comic.reads)} reads</span>
                  <span>{comic.episodes.length} Episodes</span>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleBookmarkToggle}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                        isBookmarked
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                    </button>

                    <button
                      onClick={handleLikeToggle}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                        isLiked
                          ? "bg-rose-600 border-rose-500 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span>{likesCount}</span>
                    </button>

                    {comic.allowPdfDownload !== false && (
                      <button
                        onClick={() => alert("Downloading processed high-res PDF for offline reading...")}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1 transition"
                        title="Download Offline PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Reader Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Floating Reader Toolbar */}
        <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-md text-xs text-zinc-300 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs sm:text-sm">
              Ep. {activeEpisode.episodeNumber}: {activeEpisode.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Mode Switcher: Vertical vs Manga RTL vs Comic LTR */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setReadingMode("VERTICAL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  readingMode === "VERTICAL" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Vertical Continuous Scroll (Webtoon)"
              >
                <MoveVertical className="w-3 h-3" />
                <span className="hidden sm:inline">Vertical</span>
              </button>

              <button
                onClick={() => setReadingMode("RTL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  readingMode === "RTL" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Right-to-Left (Manga RTL)"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Manga RTL</span>
              </button>

              <button
                onClick={() => setReadingMode("LTR")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  readingMode === "LTR" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Left-to-Right (Western Comic)"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Comic LTR</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 15))}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(140, prev + 15))}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 1. VERTICAL SCROLL MODE (Webtoon) */}
        {readingMode === "VERTICAL" && (
          <div
            className="mx-auto flex flex-col items-center bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-200"
            style={{ maxWidth: `${zoomLevel * 8.5}px` }}
          >
            {pages.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Panel ${idx + 1}`}
                className="w-full object-cover select-none block"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* 2. PAGE-BY-PAGE MANGA (RTL) / COMIC (LTR) MODE */}
        {readingMode !== "VERTICAL" && (
          <div className="space-y-4">
            <div
              className="mx-auto aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 relative flex items-center justify-center transition-all"
              style={{ maxWidth: `${zoomLevel * 7.5}px` }}
            >
              {pages[activePageIndex] ? (
                <img
                  src={pages[activePageIndex]}
                  alt={`Page ${activePageIndex + 1}`}
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <p className="text-zinc-500 text-xs">No page image available</p>
              )}

              {/* Click navigation overlays */}
              <button
                onClick={() => {
                  if (readingMode === "RTL") {
                    setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1));
                  } else {
                    setActivePageIndex((prev) => Math.max(0, prev - 1));
                  }
                }}
                className="absolute left-0 top-0 bottom-0 w-1/3 hover:bg-white/5 transition flex items-center justify-start p-4 group cursor-pointer"
                title={readingMode === "RTL" ? "Next Page (RTL)" : "Previous Page (LTR)"}
              >
                <div className="p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={() => {
                  if (readingMode === "RTL") {
                    setActivePageIndex((prev) => Math.max(0, prev - 1));
                  } else {
                    setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1));
                  }
                }}
                className="absolute right-0 top-0 bottom-0 w-1/3 hover:bg-white/5 transition flex items-center justify-end p-4 group cursor-pointer"
                title={readingMode === "RTL" ? "Previous Page (RTL)" : "Next Page (LTR)"}
              >
                <div className="p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>

              {/* Page Number Badge */}
              <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-zinc-300 text-xs font-mono font-bold">
                Page {activePageIndex + 1} / {pages.length}
              </div>
            </div>

            {/* Page Thumbnail Scroller */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center">
              {pages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePageIndex(idx)}
                  className={`w-12 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                    idx === activePageIndex ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105" : "border-zinc-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Episode Pagination & Navigation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              disabled={activeEpisodeIdx === 0}
              onClick={() => {
                setActiveEpisodeIdx((prev) => prev - 1);
                setActivePageIndex(0);
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 text-xs font-bold flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Episode</span>
            </button>

            <span className="text-xs font-bold">
              Episode {activeEpisodeIdx + 1} of {comic.episodes.length}
            </span>

            <button
              disabled={activeEpisodeIdx === comic.episodes.length - 1}
              onClick={() => {
                setActiveEpisodeIdx((prev) => prev + 1);
                setActivePageIndex(0);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition shadow-md"
            >
              <span>Next Episode</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Episode List Drawer */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              All Episodes ({comic.episodes.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {comic.episodes.map((ep, idx) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveEpisodeIdx(idx);
                    setActivePageIndex(0);
                  }}
                  className={`p-3 rounded-xl text-left text-xs transition flex items-center justify-between ${
                    idx === activeEpisodeIdx
                      ? "bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 font-bold"
                      : "bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="truncate">
                    Ep. {ep.episodeNumber}: {ep.title}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {formatDate(ep.publishedAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
