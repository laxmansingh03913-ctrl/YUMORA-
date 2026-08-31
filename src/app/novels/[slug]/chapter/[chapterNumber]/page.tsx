"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
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
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Minus,
  Plus,
  Type,
  Eye,
  Sliders,
  Headphones,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useReader } from "@/context/ReaderContext";
import { useAuth } from "@/context/AuthContext";
import { AudiobookPlayer } from "@/components/reader/AudiobookPlayer";
import { AIAssistantModal } from "@/components/reader/AIAssistantModal";
import DanmakuOverlay from "@/components/reader/DanmakuOverlay";
import { Comment, Chapter } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ReaderPageProps {
  params: Promise<{
    slug: string;
    chapterNumber: string;
  }>;
}

export default function ChapterReaderPage({ params }: ReaderPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoListen = searchParams ? searchParams.get("listen") === "true" : false;
  const novelSlug = resolvedParams.slug;
  const chapterNumber = parseInt(resolvedParams.chapterNumber, 10);

  const [mounted, setMounted] = useState(false);
  const [novel, setNovel] = useState(() => dataStore.getNovelBySlug(novelSlug));
  const chapters = Array.isArray(novel?.chapters) ? novel.chapters : [];
  const chapter = chapters.find((c) => c.chapterNumber === chapterNumber);

  const { settings, updateSettings, saveProgress } = useReader();
  const { user } = useAuth();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(0);
  const [isBionicReading, setIsBionicReading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickDock, setShowQuickDock] = useState(true);
  const [isAudiobookOpen, setIsAudiobookOpen] = useState(shouldAutoListen);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [activeAudioParagraphIdx, setActiveAudioParagraphIdx] = useState(0);

  const [loadedChapters, setLoadedChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    if (chapter) {
      setLoadedChapters([chapter]);
    }
  }, [chapter]);

  const loadNextContinuousChapter = () => {
    if (!novel) return;
    const lastLoaded = loadedChapters[loadedChapters.length - 1];
    if (!lastLoaded) return;
    const next = chapters.find((c) => c.chapterNumber === lastLoaded.chapterNumber + 1);
    if (next && !loadedChapters.some((c) => c.chapterNumber === next.chapterNumber)) {
      setLoadedChapters((prev) => [...prev, next]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  const handleAudioParagraphChange = (idx: number) => {
    setActiveAudioParagraphIdx(idx);
    const targetElement = document.getElementById(`novel-p-${idx}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Auto-scroll loop
  useEffect(() => {
    if (autoScrollSpeed <= 0) return;
    const speedMs = autoScrollSpeed === 1 ? 35 : autoScrollSpeed === 2 ? 22 : 12;
    const interval = setInterval(() => {
      window.scrollBy({ top: 1, behavior: "auto" });
      // Pause if reached bottom
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
        setAutoScrollSpeed(0);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [autoScrollSpeed]);

  // Fullscreen toggle listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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
    let isCurrent = true;
    setMounted(true);
    const found = dataStore.getNovelBySlug(novelSlug);
    if (found && Array.isArray(found.chapters) && found.chapters.length > 0) {
      setNovel(found);
      setIsBookmarked(dataStore.isBookmarked(found.id));
      setComments(dataStore.getComments(`${found.id}-ch-${chapterNumber}`));
      saveProgress(found.id, chapterNumber, 10);
    }

    // Dynamic fallback to server API
    fetch(`/api/novels/${encodeURIComponent(novelSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.success && data.novel) {
          setNovel(data.novel);
          setIsBookmarked(dataStore.isBookmarked(data.novel.id));
          setComments(dataStore.getComments(`${data.novel.id}-ch-${chapterNumber}`));
          saveProgress(data.novel.id, chapterNumber, 10);
        } else if (!found) {
          setNovel(undefined);
        }
      })
      .catch((err) => {
        console.warn("[CHAPTER NOVEL FETCH NOTICE]", err);
      });

    return () => {
      isCurrent = false;
    };
  }, [novelSlug, chapterNumber, saveProgress]);

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

  if (!novel || !chapter) {
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

  const prevChapter = chapters.find((c) => c.chapterNumber === chapterNumber - 1);
  const nextChapter = chapters.find((c) => c.chapterNumber === chapterNumber + 1);

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

  const renderParagraphContent = (paragraph: string) => {
    if (!isBionicReading) return paragraph;
    const words = paragraph.split(" ");
    return words.map((word, i) => {
      const mid = Math.ceil(word.length / 2);
      const boldPart = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={i}>
          <span className="font-extrabold opacity-100">{boldPart}</span>
          <span className="opacity-80">{rest}</span>{" "}
        </span>
      );
    });
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
          {/* AI Story Assistant Trigger */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="AI Story Companion (Translate, Summarize, Character Codex, Chat)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Companion</span>
          </button>

          {/* AI Audiobook Narrator Trigger */}
          <button
            onClick={() => setIsAudiobookOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
              isAudiobookOpen
                ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/30"
                : "bg-white/10 hover:bg-white/20 text-zinc-200"
            }`}
            title="Listen to Chapter with AI Narrator"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isAudiobookOpen ? "Listening" : "Listen"}</span>
          </button>

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
            <span>By {novel.creator?.name || "Author"}</span>
            <span>•</span>
            <span>{(chapter.wordCount ?? 0).toLocaleString()} words</span>
            <span>•</span>
            <span>{chapter.readTimeMinutes ?? 1} min read</span>
          </div>
        </div>

        {/* Continuous Multi-Chapter Story Prose */}
        <div className="space-y-12">
          {loadedChapters.map((ch, chIdx) => {
            const chParagraphs = ch.content.split("\n\n").filter((p: string) => p.trim());
            const isFirstChapter = chIdx === 0;

            return (
              <div key={ch.id} className="space-y-6">
                {!isFirstChapter && (
                  <div className="pt-14 pb-6 text-center border-t-2 border-dashed border-rose-500/30 my-10 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      <span>CONTINUOUS CHAPTER</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{ch.title}</h2>
                    <p className="text-xs text-zinc-400">
                      Chapter {ch.chapterNumber} • {(ch.wordCount ?? 0).toLocaleString()} words
                    </p>
                  </div>
                )}

                <article
                  className={`space-y-6 leading-relaxed ${getFontFamilyClass()}`}
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                  }}
                >
                  {chParagraphs.map((paragraph: string, idx: number) => {
                    const globalParagraphIdx = chIdx * 100 + idx;
                    const isSpeakingThis =
                      isAudiobookOpen && activeAudioParagraphIdx === globalParagraphIdx;
                    const hasImage = paragraph.includes("![") && paragraph.includes("](");
                    const isSystemBox =
                      paragraph.trim().startsWith("[") &&
                      paragraph.includes("]") &&
                      (paragraph.includes("ALERT") ||
                        paragraph.includes("SYSTEM") ||
                        paragraph.includes("SKILL") ||
                        paragraph.includes("LEVEL") ||
                        paragraph.includes("QUEST") ||
                        paragraph.includes("WARNING") ||
                        paragraph.includes("EXTRACTION") ||
                        paragraph.includes("CORONATION") ||
                        paragraph.includes("MATCH") ||
                        paragraph.includes("Do you accept"));

                    if (hasImage) {
                      const parts = paragraph.split(/(!\[.*?\]\(.*?\))/g);
                      return (
                        <div key={idx} id={`novel-p-${globalParagraphIdx}`} className="space-y-4">
                          {parts.map((part, partIdx) => {
                            const inlineImgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
                            if (inlineImgMatch) {
                              const [, caption, src] = inlineImgMatch;
                              return (
                                <div key={partIdx} className="my-8 space-y-2 text-center select-none not-prose">
                                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[600px] mx-auto group">
                                    <img
                                      src={src}
                                      alt={caption || "Light Novel Illustration"}
                                      className="w-full h-full object-cover max-h-[550px] transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                  </div>
                                  {caption && (
                                    <p className="text-xs text-zinc-400 italic font-sans tracking-wide">
                                      ✦ {caption} ✦
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            if (part.trim()) {
                              return (
                                <p
                                  key={partIdx}
                                  className={`indent-4 sm:indent-6 transition-all duration-300 ${
                                    isSpeakingThis
                                      ? "bg-rose-500/15 border-l-4 border-rose-500 pl-4 py-2 rounded-r-2xl shadow-sm ring-1 ring-rose-500/20"
                                      : ""
                                  }`}
                                >
                                  {renderParagraphContent(part)}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    }

                    if (isSystemBox) {
                      return (
                        <div
                          key={idx}
                          id={`novel-p-${globalParagraphIdx}`}
                          className="my-5 p-4 sm:p-5 rounded-2xl bg-indigo-950/40 dark:bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm font-mono shadow-lg shadow-indigo-950/30 space-y-1 backdrop-blur-xs relative overflow-hidden not-prose"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px] pb-1.5 border-b border-indigo-500/20">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span>SYSTEM NOTIFICATION</span>
                          </div>
                          <div className="pt-1.5 whitespace-pre-line leading-relaxed font-semibold">
                            {paragraph}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={idx}
                        id={`novel-p-${globalParagraphIdx}`}
                        className={`indent-4 sm:indent-6 transition-all duration-300 ${
                          isSpeakingThis
                            ? "bg-rose-500/15 border-l-4 border-rose-500 pl-4 py-2 rounded-r-2xl shadow-sm ring-1 ring-rose-500/20"
                            : ""
                        }`}
                      >
                        {renderParagraphContent(paragraph)}
                      </p>
                    );
                  })}
                </article>
              </div>
            );
          })}
        </div>

        {/* Chapter End Divider & Continuous Flow Trigger */}
        <div className="my-16 py-8 border-t border-b border-white/10 text-center space-y-4">
          <Sparkles className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold">
            End of Chapter {loadedChapters[loadedChapters.length - 1]?.chapterNumber || chapter.chapterNumber}
          </p>

          {/* Continuous Scroll: Load next chapter right below without page reload */}
          {(() => {
            const lastLoadedNum = loadedChapters[loadedChapters.length - 1]?.chapterNumber || chapterNumber;
            const nextCh = chapters.find((c) => c.chapterNumber === lastLoadedNum + 1);
            if (!nextCh) return null;

            return (
              <div className="py-3 max-w-md mx-auto">
                <button
                  onClick={loadNextContinuousChapter}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/25 transition transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                  <span>Load Next Chapter Continuously (Ch. {nextCh.chapterNumber})</span>
                </button>
              </div>
            );
          })()}

          <p className="text-xs opacity-60 max-w-sm mx-auto">
            Enjoyed this chapter? Support {novel.creator?.name || "the author"} by leaving a reaction or sharing your thoughts below.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
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
                {chapters.map((c) => (
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

      {/* 8. FLOATING QUICK CONTROL DOCK */}
      <aside aria-label="Quick reading controls" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-zinc-950/90 dark:bg-zinc-900/90 text-white backdrop-blur-xl border border-zinc-700/60 shadow-2xl shadow-black/50">
          {/* Font Size Steppers */}
          <div className="flex items-center gap-0.5 bg-zinc-800/80 rounded-full px-1 py-0.5 border border-zinc-700/50">
            <button
              onClick={() => updateSettings({ fontSize: Math.max(13, settings.fontSize - 1) })}
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Decrease Font Size (A-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-black px-1 min-w-[28px] text-center text-rose-400">
              {settings.fontSize}px
            </span>
            <button
              onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 1) })}
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Increase Font Size (A+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Theme Dots */}
          <div className="flex items-center gap-1 bg-zinc-800/80 rounded-full px-1.5 py-1 border border-zinc-700/50">
            {[
              { id: "dark", bg: "bg-[#0c0c12]", title: "Dark" },
              { id: "midnight", bg: "bg-black", title: "OLED Pitch Black" },
              { id: "sepia", bg: "bg-[#f7f1e5]", title: "Cream Sepia Paper" },
              { id: "slate", bg: "bg-[#1e293b]", title: "Slate Gray" },
              { id: "light", bg: "bg-white", title: "Clean Light" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id as typeof settings.theme })}
                className={`w-5 h-5 rounded-full border transition cursor-pointer ${t.bg} ${
                  settings.theme === t.id
                    ? "ring-2 ring-rose-500 scale-110 border-white"
                    : "border-zinc-600 hover:scale-105 opacity-70"
                }`}
                title={t.title}
              />
            ))}
          </div>

          {/* Auto Scroll Play / Speed Button */}
          <button
            onClick={() => setAutoScrollSpeed((prev) => (prev >= 3 ? 0 : prev + 1))}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              autoScrollSpeed > 0
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Auto-Scroll (Click to change speed 1x / 2x / 3x / Off)"
          >
            {autoScrollSpeed > 0 ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>{autoScrollSpeed}x</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Auto</span>
              </>
            )}
          </button>

          {/* AI Story Assistant Trigger */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-2.5 py-1 rounded-full text-xs font-black transition flex items-center gap-1 cursor-pointer bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-rose-500/40 text-rose-400 hover:text-white hover:bg-rose-600"
            title="AI Story Assistant (Translate, Summarize, Character Codex, Chat)"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">AI</span>
          </button>

          {/* AI Audiobook Narrator Toggle */}
          <button
            onClick={() => setIsAudiobookOpen((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isAudiobookOpen
                ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/30 animate-pulse"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Listen to Chapter (AI Voice Audiobook)"
          >
            <Headphones className="w-3 h-3" />
            <span className="hidden sm:inline">Listen</span>
          </button>

          {/* Bionic Reading Toggle */}
          <button
            onClick={() => setIsBionicReading((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isBionicReading
                ? "bg-amber-500 text-zinc-950 font-black"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Bionic Reading Mode (Highlights first letters of words for faster comprehension)"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">Bionic</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Toggle Distraction-Free Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Full Settings Dialog Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-7 h-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Full Reader Appearance Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* 8.5 FLOATING VERTICAL SCROLL NAVIGATION PAD (RIGHT EDGE) */}
      <aside className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-2 p-2 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl backdrop-blur-md text-zinc-300 select-none">
        {/* Scroll To Top */}
        <button
          onClick={scrollToTop}
          className="p-2 rounded-xl hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 text-rose-400" />
        </button>

        {/* Live Scroll % Badge */}
        <div className="w-10 py-1 text-center font-mono font-black text-[10px] text-zinc-400 border-y border-zinc-800">
          {Math.round(scrollProgress)}%
        </div>

        {/* Auto Scroll Toggle */}
        <button
          onClick={() => setAutoScrollSpeed((prev) => (prev >= 3 ? 0 : prev + 1))}
          className={`p-2 rounded-xl transition flex flex-col items-center cursor-pointer ${
            autoScrollSpeed > 0
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse"
              : "hover:bg-zinc-800 hover:text-white"
          }`}
          title={`Auto-Scroll: ${autoScrollSpeed > 0 ? `${autoScrollSpeed}x Speed` : 'Off'}`}
        >
          {autoScrollSpeed > 0 ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
        </button>

        {/* Scroll To Bottom */}
        <button
          onClick={scrollToBottom}
          className="p-2 rounded-xl hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Scroll to Bottom"
        >
          <ArrowDown className="w-4 h-4 text-rose-400" />
        </button>
      </aside>

      {/* 9. AI AUDIOBOOK NARRATOR DOCK */}
      {isAudiobookOpen && (
        <AudiobookPlayer
          paragraphs={chapter.content.split("\n\n").filter((p: string) => p.trim())}
          chapterTitle={chapter.title}
          chapterNumber={chapter.chapterNumber}
          authorName={novel.creator?.name || "Original Author"}
          currentParagraphIdx={activeAudioParagraphIdx}
          onParagraphChange={handleAudioParagraphChange}
          onClose={() => setIsAudiobookOpen(false)}
          onChapterComplete={() => {
            if (nextChapter) {
              router.push(`/novels/${novel.slug}/chapter/${nextChapter.chapterNumber}`);
            }
          }}
        />
      )}

      {/* 10. AI STORY ASSISTANT MODAL */}
      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        novelTitle={novel.title}
        authorName={novel.creator?.name || "Original Author"}
        chapterContent={chapter.content}
      />

      {/* 11. REAL-TIME DANMAKU / BULLET REACTION COMMENTS STREAM */}
      <DanmakuOverlay
        storyId={novel.id}
        episodeNumber={chapter.chapterNumber}
        storyTitle={novel.title}
      />
    </div>
  );
}
