"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  MessageSquare,
  Sparkles,
  Share2,
  BookOpen,
  Send,
  X,
  List,
  Check,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useReader } from "@/context/ReaderContext";
import { useAuth } from "@/context/AuthContext";
import { formatNumber, formatDate } from "@/lib/utils";
import { Comment } from "@/lib/types";

interface ReaderPageProps {
  params: Promise<{
    slug: string;
    chapterNumber: string;
  }>;
}

export default function ChapterReaderPage({ params }: ReaderPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const novelSlug = resolvedParams.slug;
  const chapterNumber = parseInt(resolvedParams.chapterNumber, 10);

  const [mounted, setMounted] = useState(false);
  const [novel, setNovel] = useState(() => dataStore.getNovelBySlug(novelSlug));
  const chapter = novel?.chapters.find((c) => c.chapterNumber === chapterNumber);

  const { settings, updateSettings, saveProgress } = useReader();
  const { user } = useAuth();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  // Scroll listener for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));

        // Save progress to store
        if (novel) {
          saveProgress(novel.id, chapterNumber, Math.round(currentProgress));
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [novel, chapterNumber, saveProgress]);

  useEffect(() => {
    setMounted(true);
    const found = dataStore.getNovelBySlug(novelSlug);
    setNovel(found);
    if (found) {
      setIsBookmarked(dataStore.isBookmarked(found.id));
      setComments(dataStore.getComments(`${found.id}-ch-${chapterNumber}`));
      saveProgress(found.id, chapterNumber, 10);
    }
  }, [novelSlug, chapterNumber]);

  if (!novel || !chapter) {
    if (!mounted) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading chapter...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Chapter Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The requested chapter or novel could not be found or may have been updated.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={novel ? `/novels/${novel.slug}` : "/novels"}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            {novel ? "Back to Novel Overview" : "Browse All Novels"}
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

  const prevChapter = novel.chapters.find((c) => c.chapterNumber === chapterNumber - 1);
  const nextChapter = novel.chapters.find((c) => c.chapterNumber === chapterNumber + 1);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
      id: `comm-ch-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
      contentId: `${novel.id}-ch-${chapterNumber}`,
      contentType: "NOVEL",
      chapterNumber,
      text: commentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    dataStore.addComment(newComment);
    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  // Determine theme class & styles
  const getThemeClasses = () => {
    switch (settings.theme) {
      case "light":
        return "bg-white text-zinc-900";
      case "sepia":
        return "bg-[#f7f1e5] text-[#3d2f24]";
      case "slate":
        return "bg-[#1e293b] text-[#e2e8f0]";
      case "midnight":
        return "bg-black text-zinc-300";
      case "dark":
      default:
        return "bg-[#0c0c12] text-zinc-200";
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      case "serif":
      default:
        return "font-serif";
    }
  };

  const getWidthClass = () => {
    switch (settings.maxWidth) {
      case "narrow":
        return "max-w-xl";
      case "wide":
        return "max-w-4xl";
      case "full":
        return "max-w-6xl";
      case "standard":
      default:
        return "max-w-2xl";
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getThemeClasses()}`}>
      {/* 1. TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800/20 z-50">
        <div
          className="h-full bg-rose-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. TOP FLOATING READER HEADER */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/40 border-b border-white/5 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-3">
          <Link
            href={`/novels/${novel.slug}`}
            className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 transition"
            title="Back to story overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold hidden sm:inline truncate max-w-[160px]">
              {novel.title}
            </span>
          </Link>
          <span className="text-zinc-500 hidden sm:inline">•</span>
          <span className="text-zinc-300 font-medium truncate max-w-[200px]">
            Ch. {chapter.chapterNumber}: {chapter.title}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Chapter Quick Selector */}
          <button
            onClick={() => setIsChapterListOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">Chapters</span>
          </button>

          {/* Discussion Drawer */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1 relative"
            title="Chapter Comments"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Discussion</span>
            {comments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {comments.length}
              </span>
            )}
          </button>

          {/* Reader Appearance Customizer */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1"
            title="Reader Customization"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Appearance</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN STORY READING CONTENT */}
      <main className={`mx-auto px-6 sm:px-8 py-12 lg:py-16 ${getWidthClass()}`}>
        {/* Chapter Header */}
        <div className="text-center space-y-3 mb-12 pb-8 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500">
            Chapter {chapter.chapterNumber}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {chapter.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs opacity-60">
            <span>By {novel.creator.name}</span>
            <span>•</span>
            <span>{chapter.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{chapter.readTimeMinutes} min read</span>
          </div>
        </div>

        {/* Story Prose */}
        <article
          className={`space-y-6 leading-relaxed ${getFontFamilyClass()}`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          {chapter.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="indent-4 sm:indent-6">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Chapter End Divider */}
        <div className="my-16 py-8 border-t border-b border-white/10 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold">
            End of Chapter {chapter.chapterNumber}
          </p>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            Enjoyed this chapter? Support {novel.creator.name} by leaving a reaction or sharing your thoughts below.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discuss Chapter ({comments.length})</span>
            </button>
          </div>
        </div>

        {/* 4. CHAPTER NAVIGATION BAR */}
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link
              href={`/novels/${novel.slug}/chapter/${prevChapter.chapterNumber}`}
              className="flex-1 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-3 group"
            >
              <ChevronLeft className="w-5 h-5 text-rose-500 group-hover:-translate-x-1 transition" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-rose-500">Previous</p>
                <p className="font-bold text-xs sm:text-sm line-clamp-1">{prevChapter.title}</p>
              </div>
            </Link>
          ) : (
            <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-40 cursor-not-allowed">
              <p className="text-[10px] uppercase font-bold">First Chapter</p>
              <p className="font-bold text-xs">No previous chapter</p>
            </div>
          )}

          {nextChapter ? (
            <Link
              href={`/novels/${novel.slug}/chapter/${nextChapter.chapterNumber}`}
              className="flex-1 p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold transition flex items-center justify-end gap-3 group shadow-xl shadow-rose-600/20"
            >
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-white/80">Next Chapter</p>
                <p className="font-bold text-xs sm:text-sm line-clamp-1">{nextChapter.title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition" />
            </Link>
          ) : (
            <Link
              href={`/novels/${novel.slug}`}
              className="flex-1 p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-center font-bold text-xs sm:text-sm transition"
            >
              <span>Back to Novel Overview</span>
            </Link>
          )}
        </div>
      </main>

      {/* 5. APPEARANCE SETTINGS DRAWER */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm">Reader Appearance</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Theme */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">Color Palette</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: "dark", label: "Dark", bg: "bg-[#0c0c12]", border: "border-zinc-700" },
                  { id: "midnight", label: "OLED", bg: "bg-black", border: "border-zinc-800" },
                  { id: "sepia", label: "Sepia", bg: "bg-[#f7f1e5] text-zinc-900", border: "border-[#e6dac6]" },
                  { id: "slate", label: "Slate", bg: "bg-[#1e293b]", border: "border-slate-600" },
                  { id: "light", label: "Light", bg: "bg-white text-zinc-900", border: "border-zinc-300" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ theme: t.id as typeof settings.theme })}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center ${t.bg} ${t.border} ${
                      settings.theme === t.id ? "ring-2 ring-rose-500 scale-105" : "opacity-80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">Typography</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "serif", label: "Merriweather Serif", fontClass: "font-serif" },
                  { id: "sans", label: "Inter Sans", fontClass: "font-sans" },
                  { id: "mono", label: "Monospace", fontClass: "font-mono" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSettings({ fontFamily: f.id as typeof settings.fontFamily })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${f.fontClass} ${
                      settings.fontFamily === f.id
                        ? "bg-rose-950/40 border-rose-500 text-rose-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1">
                <span>Font Size</span>
                <span className="text-rose-400">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                step={1}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Line Height Spacing */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">Line Spacing</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1.4, label: "Compact (1.4x)" },
                  { val: 1.8, label: "Normal (1.8x)" },
                  { val: 2.2, label: "Relaxed (2.2x)" },
                ].map((lh) => (
                  <button
                    key={lh.val}
                    onClick={() => updateSettings({ lineHeight: lh.val })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      settings.lineHeight === lh.val
                        ? "bg-rose-950/40 border-rose-500 text-rose-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Width */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">Page Width</label>
              <div className="grid grid-cols-4 gap-2">
                {(["narrow", "standard", "wide", "full"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSettings({ maxWidth: w })}
                    className={`py-2 rounded-xl text-xs font-semibold uppercase border transition ${
                      settings.maxWidth === w
                        ? "bg-rose-950/40 border-rose-500 text-rose-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TABLE OF CONTENTS DRAWER */}
      {isChapterListOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm h-full bg-zinc-900 border-l border-zinc-800 text-zinc-100 p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <h3 className="font-bold text-sm">Table of Contents</h3>
                <button
                  onClick={() => setIsChapterListOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
                {novel.chapters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setIsChapterListOpen(false);
                      router.push(`/novels/${novel.slug}/chapter/${c.chapterNumber}`);
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs transition flex items-center justify-between ${
                      c.chapterNumber === chapterNumber
                        ? "bg-rose-950/50 border border-rose-500/50 text-rose-300 font-bold"
                        : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <span className="truncate">
                      Ch. {c.chapterNumber}: {c.title}
                    </span>
                    {c.chapterNumber === chapterNumber && (
                      <Check className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CHAPTER COMMENTS & DISCUSSION DRAWER */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 text-zinc-100 p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <div>
                  <h3 className="font-bold text-sm">Chapter {chapter.chapterNumber} Discussion</h3>
                  <p className="text-[11px] text-zinc-400">{comments.length} comments</p>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-12">
                    No comments yet for Chapter {chapter.chapterNumber}. Be the first to share your reaction!
                  </p>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-2xl bg-zinc-800/70 border border-zinc-700/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={comm.user.avatar}
                            alt={comm.user.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-bold text-zinc-200">{comm.user.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {formatDate(comm.createdAt)}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed pt-1">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Post comment input */}
            <form onSubmit={handlePostComment} className="pt-4 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a reaction..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
