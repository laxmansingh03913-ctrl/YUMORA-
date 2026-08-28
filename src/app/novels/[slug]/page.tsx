"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  BookOpen,
  Bookmark,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  UserPlus,
  UserCheck,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Coins,
  Headphones,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { formatNumber, formatDate } from "@/lib/utils";
import { ReportModal } from "@/components/ui/ReportModal";
import { NovelCard } from "@/components/ui/NovelCard";
import { TipCreatorModal } from "@/components/ui/TipCreatorModal";
import { CoinShopModal } from "@/components/ui/CoinShopModal";
import { Comment, Review, getStoryFormat } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function NovelDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);
  const [novel, setNovel] = useState(() => dataStore.getNovelBySlug(resolvedParams.slug));

  const { user, requireAuth } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(novel?.likesCount || 0);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [activeTab, setActiveTab] = useState<"chapters" | "reviews" | "discussion">("chapters");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);

  // New comment / review inputs
  const [newCommentText, setNewCommentText] = useState("");
  const [newReviewScore, setNewReviewScore] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const readingProgress = novel ? dataStore.getReadingProgress(novel.id) : undefined;

  useEffect(() => {
    let isCurrent = true;
    setMounted(true);

    const localFound = dataStore.getNovelBySlug(resolvedParams.slug);
    if (localFound) {
      setNovel(localFound);
      setIsBookmarked(dataStore.isBookmarked(localFound.id));
      setIsLiked(dataStore.isLiked(localFound.id));
      setLikesCount(localFound.likesCount || 0);
      setIsFollowingAuthor(dataStore.isFollowing(localFound.creatorId));
      setComments(dataStore.getComments(localFound.id));
    }

    // Dynamically query server API to resolve database/seed/persistent novel
    fetch(`/api/novels/${encodeURIComponent(resolvedParams.slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.success && data.novel) {
          setNovel(data.novel);
          setIsBookmarked(dataStore.isBookmarked(data.novel.id));
          setIsLiked(dataStore.isLiked(data.novel.id));
          setLikesCount(data.novel.likesCount || 0);
          setIsFollowingAuthor(dataStore.isFollowing(data.novel.creatorId));
          setComments(dataStore.getComments(data.novel.id));
        } else if (!localFound) {
          setNovel(undefined);
        }
      })
      .catch((err) => {
        console.warn("[NOVEL LOOKUP NOTICE]", err);
      });

    return () => {
      isCurrent = false;
    };
  }, [resolvedParams.slug]);

  if (!novel) {
    if (!mounted) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading novel...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Novel Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The novel or serial you are looking for does not exist or may have been removed.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/novels"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            Browse All Novels
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

  const handleBookmarkToggle = () => {
    const next = dataStore.toggleBookmark(novel.id);
    setIsBookmarked(next);
  };

  const handleLikeToggle = () => {
    const next = dataStore.toggleLike(novel.id);
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : prev - 1));
  };

  const handleFollowAuthor = () => {
    const next = dataStore.toggleFollow(novel.creatorId);
    setIsFollowingAuthor(next);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      contentId: novel.id,
      contentType: "NOVEL",
      text: newCommentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    dataStore.addComment(newComment);
    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !user) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
      contentId: novel.id,
      contentType: "NOVEL",
      score: newReviewScore,
      review: newReviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newRev, ...prev]);
    setNewReviewText("");
  };

  const creator = novel?.creator || {
    id: novel?.creatorId || "creator",
    name: "Original Author",
    username: "author",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
    isVerified: true,
  };

  const chapters = Array.isArray(novel.chapters) ? novel.chapters : [];
  const nextChapterToRead = readingProgress ? readingProgress.chapterNumber : 1;
  const similarNovels = dataStore
    .getNovels()
    .filter((n) => n.id !== novel.id && (n.genre === novel.genre || n.secondaryGenre === novel.genre))
    .slice(0, 3);

  return (
    <div className="min-h-screen pb-24 text-zinc-100 bg-[#0c0c12]">
      {/* 1. CINEMATIC HERO BANNER & METADATA OVERLAY */}
      <div className="relative w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] overflow-hidden bg-zinc-950 flex flex-col justify-between">
        {/* Background Image / Ambient Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${novel.bannerUrl || novel.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12] via-transparent to-[#0c0c12]/60" />

        {/* Top Breadcrumb Nav */}
        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 z-20">
          <nav className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-rose-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/novels" className="hover:text-rose-500 transition">
              Novels
            </Link>
            <span>/</span>
            <Link href={`/discover?genre=${novel.genre}`} className="hover:text-rose-500 transition">
              {novel.genre}
            </Link>
            <span>/</span>
            <span className="text-zinc-200 truncate">{novel.title}</span>
          </nav>
        </div>

        {/* Content Container */}
        <div className="relative h-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12 z-10 pt-8">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-end">
            {/* Novel Cover with Rank & Hot badge */}
            <div className="relative w-36 sm:w-48 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 flex-shrink-0 group">
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {novel.isFeatured && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Featured
                </div>
              )}
            </div>

            {/* Details & Author Info */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              {/* Tags and Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const formatInfo = getStoryFormat(novel);
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${formatInfo.bgClass}`}>
                      {formatInfo.badge}
                    </span>
                  );
                })()}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm shadow-rose-600/30">
                  {novel.genre}
                </span>
                {novel.secondaryGenre && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {novel.secondaryGenre}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400">
                  Status: {novel.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400">
                  Language: {(novel.language || "en").toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400">
                  Rating: {novel.contentRating || "TEEN"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {novel.title}
              </h1>

              {/* Author Row */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/creator/${creator.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition group"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-white group-hover:text-rose-400 transition">
                        {creator.name}
                      </span>
                      {creator.isVerified && (
                        <CheckCircle2 className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">@{creator.username}</span>
                  </div>
                </Link>

                <button
                  onClick={handleFollowAuthor}
                  className={`ml-2 px-3.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isFollowingAuthor
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
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
                      <span>Follow Author</span>
                    </>
                  )}
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{novel.rating}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{novel.totalRatings} ratings</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-white font-bold text-lg">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    <span>{formatNumber(novel.reads)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Total Reads</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-white font-bold text-lg">
                    <Bookmark className="w-4 h-4 text-rose-400" />
                    <span>{formatNumber(novel.bookmarksCount)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Bookmarks</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-white font-bold text-lg">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{formatNumber(likesCount)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Likes</p>
                </div>
              </div>

              {/* Description Synopsis */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Synopsis</h3>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {novel.description}
                </p>
              </div>

              {/* Content Warning if applicable */}
              {novel.contentWarning && (
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Content Advisory:</strong> {novel.contentWarning}
                  </span>
                </div>
              )}

              {/* Action Buttons: Read Now, Listen to Audiobook, Tip, Bookmark */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => requireAuth(`/novels/${novel.slug}/chapter/${nextChapterToRead}`)}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition transform hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {readingProgress
                      ? `Continue Chapter ${readingProgress.chapterNumber}`
                      : "Start Reading Ch. 1"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => requireAuth(`/novels/${novel.slug}/chapter/${nextChapterToRead}?listen=true`)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition transform hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  title="Listen to this chapter with AI Voice Narrator"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Listen to Audiobook</span>
                </button>

                <button
                  onClick={() => setIsTipModalOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                  title="Tip Author with Coins"
                >
                  <Coins className="w-4 h-4" />
                  <span>Tip Author</span>
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  className={`px-4 py-3.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 ${
                    isBookmarked
                      ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                      : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-white" : ""}`} />
                  <span>{isBookmarked ? "In Library" : "Bookmark"}</span>
                </button>

                <button
                  onClick={handleLikeToggle}
                  className={`px-4 py-3.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 ${
                    isLiked
                      ? "bg-rose-950/60 text-rose-400 border-rose-800/60"
                      : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{formatNumber(likesCount)}</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition"
                  title="Report Content"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN BODY TABS: Chapters, Reviews, Discussion */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`pb-2 text-sm sm:text-base font-bold transition relative ${
              activeTab === "chapters"
                ? "text-rose-500 border-b-2 border-rose-500"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Chapters ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 text-sm sm:text-base font-bold transition relative ${
              activeTab === "reviews"
                ? "text-rose-500 border-b-2 border-rose-500"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("discussion")}
            className={`pb-2 text-sm sm:text-base font-bold transition relative ${
              activeTab === "discussion"
                ? "text-rose-500 border-b-2 border-rose-500"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Discussion ({comments.length})
          </button>
        </div>

        {/* TAB 1: CHAPTERS LIST */}
        {activeTab === "chapters" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>All chapters released by author</span>
              <span>Updated: {formatDate(novel.updatedAt)}</span>
            </div>

            <div className="space-y-2.5">
              {chapters.map((chapter) => {
                const isRead = readingProgress && readingProgress.chapterNumber >= chapter.chapterNumber;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => requireAuth(`/novels/${novel.slug}/chapter/${chapter.chapterNumber}`)}
                    className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isRead
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {chapter.chapterNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition">
                          {chapter.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(chapter.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {chapter.readTimeMinutes} min read
                          </span>
                          <span>{chapter.wordCount.toLocaleString()} words</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {chapter.isFree ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          Free
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                          Premium
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Submit review */}
            <form
              onSubmit={handleAddReview}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4"
            >
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Write a Reader Review
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Score:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewReviewScore(s)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= newReviewScore ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your thoughts on characters, world-building, and plot..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Post Review
              </button>
            </form>

            {/* Existing reviews */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.user.avatar}
                        alt={rev.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {rev.user.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">{formatDate(rev.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.score }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {rev.review}
                  </p>
                </div>
              ))}
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
                placeholder="Join the discussion around this story..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
            </form>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  No comments yet. Be the first to start the conversation!
                </p>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.user.avatar}
                          alt={comm.user.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {comm.user.name}
                        </span>
                        {comm.user.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-rose-500" />
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {formatDate(comm.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                      {comm.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. SIMILAR STORIES RECOMMENDATIONS */}
        {similarNovels.length > 0 && (
          <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Readers Also Enjoyed
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {similarNovels.map((s) => (
                <NovelCard key={s.id} novel={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Content Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        contentId={novel.id}
        contentTitle={novel.title}
        contentType="NOVEL"
        creatorName={creator.name}
      />

      {/* Tip Author Modal */}
      <TipCreatorModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creator={creator}
        content={{
          id: novel.id,
          title: novel.title,
          type: "NOVEL",
        }}
        onOpenCoinShop={() => setIsCoinShopOpen(true)}
      />

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isCoinShopOpen}
        onClose={() => setIsCoinShopOpen(false)}
      />
    </div>
  );
}
