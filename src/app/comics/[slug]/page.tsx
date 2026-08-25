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
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  ThumbsUp,
  Coins,
  Headphones,
  Radio,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/supabase/db";
import { formatNumber, formatDate } from "@/lib/utils";
import { TipCreatorModal } from "@/components/ui/TipCreatorModal";
import { CoinShopModal } from "@/components/ui/CoinShopModal";
import { MangaDubbingPlayer } from "@/components/reader/MangaDubbingPlayer";
import DanmakuOverlay from "@/components/reader/DanmakuOverlay";

interface ComicPageProps {
  params: Promise<{ slug: string }>;
}

export default function ComicDetailPage({ params }: ComicPageProps) {
  const resolvedParams = use(params);
  const { user, openAuthModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [comic, setComic] = useState(() => dataStore.getComicBySlug(resolvedParams.slug));
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);
  const [isDubbingOpen, setIsDubbingOpen] = useState(false);
  const [activeDubbingPanelIdx, setActiveDubbingPanelIdx] = useState(0);

  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comic?.views || 1420);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  // Tabs: "episodes" | "reviews" | "discussion"
  const [activeTab, setActiveTab] = useState<"episodes" | "reviews" | "discussion">("episodes");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newReviewScore, setNewReviewScore] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // Reading Mode: "VERTICAL" | "RTL" | "LTR"
  const [readingMode, setReadingMode] = useState<"VERTICAL" | "RTL" | "LTR">("VERTICAL");

  // Page index for Page-based Manga / Comic mode
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(0);

  // Vertical Hands-free Auto-Scroll Effect
  useEffect(() => {
    if (autoScrollSpeed === 0) return;
    let animationFrameId: number;
    const scrollStep = () => {
      window.scrollBy({ top: autoScrollSpeed * 1.2, behavior: "auto" });
      animationFrameId = requestAnimationFrame(scrollStep);
    };
    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoScrollSpeed]);

  useEffect(() => {
    setMounted(true);
    const local = dataStore.getComicBySlug(resolvedParams.slug);
    if (local) {
      const sorted = {
        ...local,
        episodes: [...(local.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber),
      };
      setComic(sorted);
      setIsBookmarked(dataStore.isBookmarked(sorted.id));
      setIsLiked(dataStore.isLiked(sorted.id));
      setLikesCount(sorted.views || 1420);
      setReviews(dataStore.getReviews(sorted.id));
      setComments(dataStore.getComments(sorted.id));
      const creatorTarget = sorted.creatorId || sorted.creator?.id || sorted.creator?.username;
      if (creatorTarget) {
        setIsFollowingAuthor(dataStore.isFollowingCreator(user?.id || "usr-reader-1", creatorTarget));
      }
      if (sorted.format === "VERTICAL") {
        setReadingMode("VERTICAL");
      } else if (sorted.readingDirection === "RTL") {
        setReadingMode("RTL");
      } else {
        setReadingMode("VERTICAL");
      }

      // Auto-record reading progress
      dataStore.saveReadingProgress({
        contentId: sorted.id,
        contentType: "COMIC",
        contentTitle: sorted.title,
        contentSlug: sorted.slug,
        coverUrl: sorted.coverUrl,
        creatorName: sorted.creator?.name || "Original Creator",
        chapterNumber: sorted.episodes[activeEpisodeIdx]?.episodeNumber || 1,
        episodeTitle: sorted.episodes[activeEpisodeIdx]?.title || `Episode ${activeEpisodeIdx + 1}`,
        progressPercentage: Math.round(((activeEpisodeIdx + 1) / (sorted.episodes.length || 1)) * 100),
        totalUnits: sorted.episodes.length,
        lastReadAt: new Date().toISOString(),
      });
    }

    // Always fetch latest live episodes from Supabase Cloud
    dbService.getComicBySlug(resolvedParams.slug).then((cloud) => {
      if (cloud && cloud.episodes && cloud.episodes.length > 0) {
        const sortedCloud = {
          ...cloud,
          episodes: [...(cloud.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber),
        };
        setComic(sortedCloud);
        dataStore.saveComic(sortedCloud);
      }
    });
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

  const handleFollowAuthor = () => {
    if (!comic) return;
    const creatorId = comic.creatorId || comic.creator?.id || comic.creator?.username;
    if (!creatorId) return;
    const next = dataStore.toggleFollow(creatorId, user?.id);
    setIsFollowingAuthor(next);
  };

  const handleDubbingPanelChange = (panelIndex: number) => {
    setActiveDubbingPanelIdx(panelIndex);
    setActivePageIndex(panelIndex);
    const element = document.getElementById(`comic-panel-${panelIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    if (!user) {
      openAuthModal("signup", `/comics/${comic.slug}`);
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
      contentId: comic.id,
      contentType: "COMIC",
      score: newReviewScore,
      review: newReviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    dataStore.addReview(newRev);
    setReviews((prev) => [newRev, ...prev]);
    setNewReviewText("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!user) {
      openAuthModal("signup", `/comics/${comic.slug}`);
      return;
    }

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      contentId: comic.id,
      contentType: "COMIC",
      text: newCommentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    dataStore.addComment(newComment);
    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
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

  const creator = comic.creator || {
    id: comic.creatorId || "creator",
    name: "Original Creator",
    username: "creator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    isVerified: true,
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

                {/* Author Row */}
                <div className="flex items-center gap-3 py-0.5">
                  <Link
                    href={`/creator/${creator.username}`}
                    className="flex items-center gap-2 hover:opacity-80 transition group"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-400 transition">
                          {creator.name}
                        </span>
                        {creator.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">@{creator.username}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleFollowAuthor}
                    className={`ml-2 px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isFollowingAuthor
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    {isFollowingAuthor ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

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
                      onClick={() => {
                        const target = document.getElementById("community-feedback-section");
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                          setActiveTab("reviews");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                      title="Jump to Reader Reviews & Discussion"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>{reviews.length + comments.length} Reviews</span>
                    </button>

                    <button
                      onClick={() => setIsDubbingOpen(!isDubbingOpen)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer transform hover:scale-105 active:scale-95"
                      title="AI Multi-Character Voice Narration & SFX Dubbing"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Manga Dub 🎙️</span>
                    </button>

                    <button
                      onClick={() => setIsTipModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transform hover:scale-105 active:scale-95"
                      title="Tip Creator with Coins"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Tip</span>
                    </button>

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

            {/* Live Dubbing Button in Toolbar */}
            <button
              onClick={() => setIsDubbingOpen(!isDubbingOpen)}
              className={`ml-2 px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                isDubbingOpen
                  ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400"
                  : "bg-zinc-950 border border-zinc-700 text-rose-400 hover:text-rose-300"
              }`}
              title="Toggle AI Multi-Character Voice Acting & SFX Dubbing"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{isDubbingOpen ? "Dubbing ON" : "🎭 Voice Dub"}</span>
            </button>
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

            {/* Auto-Scroll for Vertical Webtoon */}
            {readingMode === "VERTICAL" && (
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() =>
                    setAutoScrollSpeed((prev) =>
                      prev === 0 ? 1 : prev === 1 ? 2 : prev === 2 ? 3 : 0
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    autoScrollSpeed > 0
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Hands-free Smooth Vertical Auto-Scroll"
                >
                  <span>
                    {autoScrollSpeed === 0
                      ? "▶ Auto-Scroll"
                      : `▶ ${autoScrollSpeed}x Scroll`}
                  </span>
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
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
            {pages.map((imgUrl, idx) => {
              const isCurrentDubbing = isDubbingOpen && activeDubbingPanelIdx === idx;
              return (
                <div
                  key={idx}
                  id={`comic-panel-${idx}`}
                  className={`w-full relative transition-all duration-500 ${
                    isCurrentDubbing
                      ? "ring-4 ring-rose-500 shadow-2xl scale-[1.01] z-20 my-2 rounded-2xl overflow-hidden"
                      : ""
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Panel ${idx + 1}`}
                    className="w-full object-cover select-none block"
                    loading="lazy"
                  />
                </div>
              );
            })}
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

          {/* Interactive Community Tabs */}
          <div id="community-feedback-section" className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <button
                onClick={() => setActiveTab("episodes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "episodes"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Episodes ({comic.episodes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "reviews"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Reviews ({reviews.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("discussion")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "discussion"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussion ({comments.length})</span>
              </button>
            </div>

            {/* TAB 1: ALL EPISODES */}
            {activeTab === "episodes" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Episode to Read
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
            )}

            {/* TAB 2: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Submit review */}
                <form
                  onSubmit={handleAddReview}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Rate & Review this Comic
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewReviewScore(s)}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= newReviewScore ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1">{newReviewScore} / 5</span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your review on the art style, character design, and pacing..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Post Review
                  </button>
                </form>

                {/* Existing reviews */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-center py-8 text-xs text-zinc-500">
                      No reader reviews yet. Be the first to leave a review!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.user.avatar}
                              alt={rev.user.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                            />
                            <div>
                              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                {rev.user.name}
                              </p>
                              <p className="text-[10px] text-zinc-400">{formatDate(rev.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: rev.score }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
                          {rev.review}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DISCUSSION & COMMENTS */}
            {activeTab === "discussion" && (
              <div className="space-y-6">
                {/* Add comment */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Join the discussion or leave feedback for the author..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-center py-8 text-xs text-zinc-500">
                      No comments yet. Start the conversation!
                    </p>
                  ) : (
                    comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={comm.user.avatar}
                              alt={comm.user.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                  {comm.user.name}
                                </span>
                                {comm.user.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400">{formatDate(comm.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
                          {comm.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tip Creator Modal */}
      <TipCreatorModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creator={creator}
        content={{
          id: comic.id,
          title: comic.title,
          type: "COMIC",
        }}
        onOpenCoinShop={() => setIsCoinShopOpen(true)}
      />

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isCoinShopOpen}
        onClose={() => setIsCoinShopOpen(false)}
      />

      {/* AI Manga Motion Dubbing & Multi-Character Voice Player */}
      {isDubbingOpen && (
        <MangaDubbingPlayer
          comicTitle={comic.title}
          episodeTitle={activeEpisode.title}
          episodeNumber={activeEpisode.episodeNumber}
          totalPages={pages.length}
          activePanelIndex={activeDubbingPanelIdx}
          onPanelChange={handleDubbingPanelChange}
          onClose={() => setIsDubbingOpen(false)}
        />
      )}

      {/* Real-time Danmaku / Bullet Comments Reaction Stream */}
      <DanmakuOverlay
        storyId={comic.id}
        episodeNumber={activeEpisode.episodeNumber}
        storyTitle={comic.title}
      />
    </div>
  );
}
