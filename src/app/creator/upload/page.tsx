"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  PenTool,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  Eye,
  Send,
  Plus,
  Trash2,
  Lock,
  Globe,
  Tag,
  Clock,
  Layers,
  Save,
  Wand2,
  X,
  RotateCcw,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sliders,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Monitor,
  MoveVertical,
  Zap,
  FileType,
  FileArchive,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Novel, Comic, ComicEpisode, ContentType, ContentStatus, ContentRating, LanguageCode } from "@/lib/types";
import { slugify, calculateReadTime } from "@/lib/utils";
import { CreatorProfileGate } from "@/components/creator/CreatorProfileGate";

const CONTENT_WARNING_OPTIONS = [
  "None",
  "Mild Violence",
  "Gore / Intense Combat",
  "Dark Psychological Themes",
  "Strong Language",
  "Romantic / Suggestive Themes",
];

const PRESET_COVERS = [
  { label: "Manga Cover", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80" },
  { label: "Valkyrie Webtoon", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80" },
  { label: "Cosmic Sci-Fi", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
  { label: "Dark Fantasy", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
];

const SAMPLE_EXTRACTED_PAGES = [
  { id: "page-1", name: "Page 01 (Cover/Intro)", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80" },
  { id: "page-2", name: "Page 02 (The City Below)", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80" },
  { id: "page-3", name: "Page 03 (Encounter in the Alley)", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80" },
  { id: "page-4", name: "Page 04 (Awakening Surge)", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80" },
];

export default function CreatorUploadWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imagesBulkInputRef = useRef<HTMLInputElement>(null);

  // 4-Step Progress Flow: 1 (Format) -> 2 (Details) -> 3 (Content / PDF Processing) -> 4 (Review & Publish)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Content Medium
  const [formatChoice, setFormatChoice] = useState<
    "NOVEL" | "ILLUSTRATED_NOVEL" | "MANGA" | "WEBTOON" | "COMIC" | "PDF_BOOK"
  >("MANGA");
  const [readingDirection, setReadingDirection] = useState<"RTL" | "LTR" | "VERTICAL">("RTL");
  const [allowPdfDownload, setAllowPdfDownload] = useState(true);

  // Metadata
  const [title, setTitle] = useState("Kitsune: Shadow of Neo-Edo");
  const [description, setDescription] = useState(
    "In the rain-slicked neon alleys of Neo-Edo, a disgraced spirit hunter discovers a cybernetic shrine that can reforge forgotten yokai souls into lethal blade resonance."
  );
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [genre, setGenre] = useState("Cyberpunk");
  const [secondaryGenre, setSecondaryGenre] = useState("Action");
  const [tagInput, setTagInput] = useState("Manga, Cyberpunk, Yokai, Action, Supernatural");
  const [language, setLanguage] = useState<LanguageCode>("ja");
  const [contentStatus, setContentStatus] = useState<ContentStatus>("ONGOING");
  const [contentRating, setContentRating] = useState<ContentRating>("TEEN");
  const [contentWarnings, setContentWarnings] = useState<string[]>(["Mild Violence"]);
  const [isSeries, setIsSeries] = useState(true);
  const [hasCopyright, setHasCopyright] = useState(true);

  // Advanced Cover Drawer
  const [showUrlOption, setShowUrlOption] = useState(false);

  // Upload Tab inside Step 3: "images" | "pdf" | "zip"
  const [uploadTab, setUploadTab] = useState<"images" | "pdf" | "zip">("pdf");
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);

  // Extracted Comic/Manga Pages
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState("Chapter 1: The Shrine in the Neon Rain");
  const [pages, setPages] = useState<{ id: string; name: string; url: string }[]>(
    SAMPLE_EXTRACTED_PAGES
  );
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Extracted Novel Chapter State (For Novel & PDF Novel Ingestion)
  const [chapterTitle, setChapterTitle] = useState("Chapter 1: The Broken Loom of Orion");
  const [chapterContent, setChapterContent] = useState(
    "The rain in Neo-Edo did not wash away the sin; it only reflected the neon signs in distorted pools of oil.\n\nRen adjusted his breathing mask, his hand resting lightly against the titanium scabbard at his hip. Above him, a holographic dragon curled through the smog."
  );

  // AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"synopsis" | "tags" | "pitch">("synopsis");
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Draft Toast
  const [draftToast, setDraftToast] = useState(false);

  // Word count & read time
  const wordCount = chapterContent.trim().split(/\s+/).filter(Boolean).length;
  const readTime = calculateReadTime(chapterContent);

  // PDF Processing Simulator
  const handlePdfUpload = (file: File) => {
    setIsProcessingPdf(true);
    setProcessedFileName(file.name);

    setTimeout(() => {
      setIsProcessingPdf(false);
      // Simulate high-res extracted pages
      setPages([
        { id: `page-${Date.now()}-1`, name: `${file.name} - Page 01`, url: SAMPLE_EXTRACTED_PAGES[0].url },
        { id: `page-${Date.now()}-2`, name: `${file.name} - Page 02`, url: SAMPLE_EXTRACTED_PAGES[1].url },
        { id: `page-${Date.now()}-3`, name: `${file.name} - Page 03`, url: SAMPLE_EXTRACTED_PAGES[2].url },
        { id: `page-${Date.now()}-4`, name: `${file.name} - Page 04`, url: SAMPLE_EXTRACTED_PAGES[3].url },
      ]);
    }, 1500);
  };

  // Move Page Up
  const movePageUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...pages];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setPages(updated);
  };

  // Move Page Down
  const movePageDown = (idx: number) => {
    if (idx === pages.length - 1) return;
    const updated = [...pages];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setPages(updated);
  };

  // Remove Page
  const removePage = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Content Warnings Toggle
  const handleToggleWarning = (warn: string) => {
    if (warn === "None") {
      setContentWarnings(["None"]);
      return;
    }
    const filtered = contentWarnings.filter((w) => w !== "None");
    if (filtered.includes(warn)) {
      const next = filtered.filter((w) => w !== warn);
      setContentWarnings(next.length === 0 ? ["None"] : next);
    } else {
      setContentWarnings([...filtered, warn]);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    const draft = {
      formatChoice,
      readingDirection,
      allowPdfDownload,
      title,
      description,
      coverUrl,
      genre,
      secondaryGenre,
      tagInput,
      language,
      contentStatus,
      contentRating,
      contentWarnings,
      episodeTitle,
      pages,
      chapterTitle,
      chapterContent,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("yumora_creator_draft", JSON.stringify(draft));
    setDraftToast(true);
    setTimeout(() => setDraftToast(false), 3000);
  };

  // AI Assistant Trigger
  const handleTriggerAi = (mode: "synopsis" | "tags" | "pitch") => {
    setAiMode(mode);
    setIsAiModalOpen(true);
    setIsAiGenerating(true);
    setAiGeneratedText("");

    setTimeout(() => {
      setIsAiGenerating(false);
      if (mode === "synopsis") {
        setAiGeneratedText(
          `In the neon-lit shadow of Neo-Edo, a disgraced spirit hunter uncovers a cybernetic shrine that reforges ancient yokai souls into lethal blade resonance. Serialized on Yumora.`
        );
      } else if (mode === "tags") {
        setAiGeneratedText("Manga, Cyberpunk, Yokai, Supernatural, Action, Blade Resonance");
      } else if (mode === "pitch") {
        setAiGeneratedText(`"Ghost in the Shell meets Demon Slayer in a stunning dark cyberpunk manga series."`);
      }
    }, 800);
  };

  const handleApplyAiSuggestion = () => {
    if (aiMode === "synopsis") setDescription(aiGeneratedText);
    if (aiMode === "tags") setTagInput(aiGeneratedText);
    setIsAiModalOpen(false);
  };

  // Final Publish Handler
  const handleCompletePublish = () => {
    if (!dataStore.isCreatorProfileComplete(user?.id || "")) {
      alert("🔒 Publishing Locked: Please complete 100% of your Creator Profile before publishing content to Yumora.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const slug = slugify(title) || `work-${Date.now()}`;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);

    const isVisualMedium =
      formatChoice === "MANGA" ||
      formatChoice === "WEBTOON" ||
      formatChoice === "COMIC" ||
      formatChoice === "PDF_BOOK" ||
      formatChoice === "ILLUSTRATED_NOVEL";

    if (isVisualMedium) {
      const newComic: Comic = {
        id: `comic-${Date.now()}`,
        creatorId: user?.id || "usr-creator-3",
        creator: {
          id: user?.id || "usr-creator-3",
          name: user?.name || "Mei Lin Takahashi",
          username: user?.username || "meilintakahashi",
          avatar: user?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
          isVerified: true,
        },
        title,
        slug,
        description,
        coverUrl,
        genre,
        secondaryGenre,
        tags,
        language,
        format: formatChoice === "WEBTOON" ? "VERTICAL" : "PAGE_BASED",
        readingDirection,
        subType: formatChoice,
        allowPdfDownload,
        status: contentStatus,
        contentRating,
        contentWarning: contentWarnings.join(", "),
        views: 1,
        reads: 1,
        rating: 5.0,
        totalRatings: 1,
        isFeatured: true,
        isEditorPick: true,
        isPremium: false,
        episodesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        episodes: [
          {
            id: `ep-${Date.now()}-1`,
            comicId: `comic-${Date.now()}`,
            episodeNumber: 1,
            title: episodeTitle,
            thumbnailUrl: coverUrl,
            imageUrls: pages.map((p) => p.url),
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            likesCount: 1,
          },
        ],
      };

      dataStore.saveComic(newComic);
    } else {
      // Pure Text Novel
      const newNovel: Novel = {
        id: `novel-${Date.now()}`,
        creatorId: user?.id || "usr-creator-1",
        creator: {
          id: user?.id || "usr-creator-1",
          name: user?.name || "Aria Thorne",
          username: user?.username || "ariathorne",
          avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
          isVerified: true,
        },
        title,
        slug,
        description,
        coverUrl,
        genre,
        secondaryGenre,
        tags,
        language,
        status: contentStatus,
        contentRating,
        contentWarning: contentWarnings.join(", "),
        views: 1,
        reads: 1,
        likesCount: 1,
        bookmarksCount: 1,
        rating: 5.0,
        totalRatings: 1,
        isFeatured: false,
        isEditorPick: false,
        isPremium: false,
        chaptersCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chapters: [
          {
            id: `ch-${Date.now()}-1`,
            novelId: `novel-${Date.now()}`,
            chapterNumber: 1,
            title: chapterTitle,
            content: chapterContent,
            status: "PUBLISHED",
            wordCount,
            isFree: true,
            readTimeMinutes: readTime,
            publishedAt: new Date().toISOString(),
          },
        ],
      };
      dataStore.saveNovel(newNovel);
    }

    try {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setStep(5);
  };

  const STEPS_NAV = [
    { num: 1, label: "01 Format Choice", title: "Format Choice" },
    { num: 2, label: "02 Series Details", title: "Series Details" },
    { num: 3, label: "03 Upload & Process", title: "Content Ingestion" },
    { num: 4, label: "04 Review & Publish", title: "Review & Publish" },
  ];

  const isProfileComplete = dataStore.isCreatorProfileComplete(user?.id || "");

  if (!isProfileComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Creator Verification Required</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            Creator Studio Onboarding
          </h1>
          <p className="text-xs text-zinc-500">
            Please complete all required fields on your creator profile to unlock publishing access
          </p>
        </div>
        <CreatorProfileGate onProfileCompleted={() => setStep(1)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Toast */}
      {draftToast && (
        <div className="fixed bottom-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Draft auto-saved successfully to local storage!</span>
        </div>
      )}

      {/* Header & Positioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Yumora Studio • Universal Creator Ingestion Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Publish to the Story Universe
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Architecture: <strong className="text-zinc-700 dark:text-zinc-300">PDF / Images / Manuscript → Ingestion → Universal Web Reader</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Top 4-Step Progress Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS_NAV.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as typeof step)}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30"
                    : isCompleted
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : `0${s.num}`}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">{s.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {isActive ? "In Progress" : isCompleted ? "Completed" : "Pending"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CONTENT TYPE & FORMAT SELECTION */}
      {step === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              01 Choose Publishing Medium & Format
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Select your story medium. Yumora will optimize the reading interface and upload tools accordingly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Manga */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("MANGA");
                setReadingDirection("RTL");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "MANGA"
                  ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                🇯🇵 Manga (Right-to-Left)
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Classic Japanese page-by-page flow with RTL swipe navigation and black/white or color spreads.
              </p>
            </button>

            {/* 2. Webtoon */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("WEBTOON");
                setReadingDirection("VERTICAL");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "WEBTOON"
                  ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <MoveVertical className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                📱 Webtoon (Vertical Scroll)
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Continuous vertical scrolling canvas tailored for mobile webtoons and full-color digital strips.
              </p>
            </button>

            {/* 3. Western Comic */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("COMIC");
                setReadingDirection("LTR");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "COMIC"
                  ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                🖼️ Western Comic / Graphic Novel
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Standard Left-to-Right page flow for indie comic issues, graphic novels, and art books.
              </p>
            </button>

            {/* 4. Serialized Novel */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("NOVEL");
                setReadingDirection("LTR");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "NOVEL"
                  ? "bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                📖 Serialized Novel
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Pure text prose chapters with custom reading fonts, line-height, and light/dark/sepia themes.
              </p>
            </button>

            {/* 5. Illustrated Novel */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("ILLUSTRATED_NOVEL");
                setReadingDirection("LTR");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "ILLUSTRATED_NOVEL"
                  ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                🎨 Illustrated Light Novel
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Text manuscript blended with inline character art and full-page colored illustrations.
              </p>
            </button>

            {/* 6. PDF Book / Manga Archive */}
            <button
              type="button"
              onClick={() => {
                setFormatChoice("PDF_BOOK");
                setReadingDirection("RTL");
                setUploadTab("pdf");
              }}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                formatChoice === "PDF_BOOK"
                  ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <FileType className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                📄 PDF Book / Manga Import
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Ingest existing PDF documents into optimized web pages for high-speed online reading.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SERIES DETAILS WITH LIVE SIDE-BY-SIDE PREVIEW */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    02 Series Details & Cover
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Configure cover artwork, synopsis, format, and reader classification
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerAi("synopsis")}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Improve with AI</span>
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Series Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kitsune: Shadow of Neo-Edo"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Synopsis */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Series Synopsis / Premise *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTriggerAi("synopsis")}
                    className="text-[11px] text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Polish Hook</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a captivating premise for your series..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 leading-relaxed transition resize-y"
                />
              </div>

              {/* Cover Artwork Uploader */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Series Cover Artwork
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Recommended: <strong className="text-zinc-300">1600 × 2560 px</strong> (JPG, PNG, WebP)
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.result) setCoverUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative aspect-[3/4] w-24 sm:w-28 rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-700 flex-shrink-0">
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Drag and drop your series cover
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        High-resolution artwork for discover feed and episode listings
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlOption(!showUrlOption)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
                      >
                        {showUrlOption ? "Hide URL & Presets" : "Advanced URL"}
                      </button>
                    </div>
                  </div>
                </div>

                {showUrlOption && (
                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Direct Cover URL
                      </label>
                      <input
                        type="text"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
                        Sample Presets
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_COVERS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setCoverUrl(preset.url)}
                            className="p-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:border-indigo-500 text-left text-[11px] font-semibold flex items-center gap-1.5 transition"
                          >
                            <img src={preset.url} alt={preset.label} className="w-6 h-8 object-cover rounded" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reading Direction & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Reading Direction */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Reading Flow Direction
                  </label>
                  <select
                    value={readingDirection}
                    onChange={(e) => setReadingDirection(e.target.value as typeof readingDirection)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RTL">Right-to-Left (Manga RTL)</option>
                    <option value="LTR">Left-to-Right (Western LTR)</option>
                    <option value="VERTICAL">Vertical Continuous Scroll</option>
                  </select>
                </div>

                {/* Primary Genre */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    {["Cyberpunk", "Action", "Fantasy", "Sci-Fi", "Romance", "Mystery", "Supernatural", "Slice of Life"].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Release Status
                  </label>
                  <select
                    value={contentStatus}
                    onChange={(e) => setContentStatus(e.target.value as ContentStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ONGOING">Ongoing Serial</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                {/* Age Rating */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Age Rating
                  </label>
                  <select
                    value={contentRating}
                    onChange={(e) => setContentRating(e.target.value as ContentRating)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EVERYONE">Everyone (All Ages)</option>
                    <option value="TEEN">Teen (13+)</option>
                    <option value="MATURE">Mature (18+)</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ja">日本語 (JA)</option>
                    <option value="en">English (EN)</option>
                    <option value="ko">한국어 (KO)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="hi">हिन्दी (HI)</option>
                  </select>
                </div>

                {/* PDF Offline Download Permission */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Offline PDF Download
                  </label>
                  <select
                    value={allowPdfDownload ? "yes" : "no"}
                    onChange={(e) => setAllowPdfDownload(e.target.value === "yes")}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="yes">Allow Offline PDF Download</option>
                    <option value="no">Online Reader Only</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Tags & Keywords
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTriggerAi("tags")}
                    className="text-[11px] text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate Tags</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Manga, Cyberpunk, Yokai, Action, Supernatural"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Content Warnings */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Content Advisories
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_WARNING_OPTIONS.map((warn) => {
                    const isSelected = contentWarnings.includes(warn);
                    return (
                      <button
                        key={warn}
                        type="button"
                        onClick={() => handleToggleWarning(warn)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-indigo-950/50 border-indigo-500 text-indigo-300"
                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {warn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Copyright */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="copyright"
                  checked={hasCopyright}
                  onChange={(e) => setHasCopyright(e.target.checked)}
                  className="mt-1 accent-indigo-600 rounded"
                />
                <label htmlFor="copyright" className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed cursor-pointer">
                  <strong>Creator IP Verification:</strong> I confirm that I own or hold valid licensing rights to publish this manuscript, artwork, and character designs on Yumora.
                </label>
              </div>
            </div>
          </div>

          {/* Right Live Story Card Preview (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Live Reader Card Preview
                </span>
                <span className="text-[10px] text-zinc-400">Updates dynamically</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-3 p-4">
                <div className="aspect-[16/10] rounded-xl overflow-hidden relative bg-zinc-900">
                  <img src={coverUrl} alt={title || "Cover Preview"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {formatChoice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-zinc-200 backdrop-blur-xs">
                      {readingDirection}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
                    <span className="text-[11px] font-semibold">{genre}</span>
                    <span className="text-[11px] uppercase font-bold text-indigo-400">{language}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-white line-clamp-1">
                    {title || "Untitled Series"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                    <span>By {user?.name || "Mei Lin Takahashi"}</span>
                    {user?.isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
                    {description || "No synopsis entered yet."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {tagInput.split(",").slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-800 text-zinc-400 truncate max-w-[100px]"
                    >
                      #{t.trim()}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Chapter 1 Ready</span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    Read Online →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONTENT UPLOAD & PDF PROCESSING PIPELINE */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    03 Ingest Content & Process Pages
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Upload images, import PDF document, or archive bundle
                  </p>
                </div>

                {/* Upload Method Switcher */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadTab("pdf")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      uploadTab === "pdf"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <FileType className="w-3.5 h-3.5" />
                    <span>PDF Import</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadTab("images")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      uploadTab === "images"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Bulk Images</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadTab("zip")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      uploadTab === "zip"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>ZIP Archive</span>
                  </button>
                </div>
              </div>

              {/* Episode Title & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Chapter / Ep #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Chapter Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="e.g. Chapter 1: The Shrine in the Neon Rain"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* PDF Ingestion Area */}
              {uploadTab === "pdf" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                    accept="application/pdf"
                    className="hidden"
                  />

                  <div className="p-8 rounded-3xl border-2 border-dashed border-indigo-500/50 bg-indigo-950/10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto ring-4 ring-indigo-500/20">
                      {isProcessingPdf ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : (
                        <FileType className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {isProcessingPdf ? "Processing PDF Document..." : "Upload Manga / Comic / Book PDF"}
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                        {isProcessingPdf
                          ? "Extracting high-resolution pages and generating web reader page stream..."
                          : "Yumora processes PDF files into interactive web reader pages (PDF → Pages → Online Reader)."}
                      </p>
                    </div>

                    {isProcessingPdf ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-900/40 text-indigo-300 text-xs font-bold animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rendering Page Layers & Optimizing for Web Reader...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => pdfInputRef.current?.click()}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Select PDF File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePdfUpload(
                              new File(["dummy"], "Manga_Chapter_01.pdf", { type: "application/pdf" })
                            )
                          }
                          className="px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-300 transition"
                        >
                          Simulate &apos;Manga_Chapter_01.pdf&apos; Ingestion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bulk Images Upload Tab */}
              {uploadTab === "images" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    ref={imagesBulkInputRef}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach((file, idx) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setPages((prev) => [
                              ...prev,
                              { id: `page-${Date.now()}-${idx}`, name: file.name, url: reader.result as string },
                            ]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        Upload Individual Page Images
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Bulk select JPG, PNG, or WebP images. They will be auto-ordered in sequence.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => imagesBulkInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Select Multiple Images</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ZIP Archive Tab */}
              {uploadTab === "zip" && (
                <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-500 flex items-center justify-center mx-auto">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      Upload ZIP Archive
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      ZIP file containing numbered images (e.g. `001.png`, `002.png`, etc.)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProcessingPdf(true);
                      setTimeout(() => {
                        setIsProcessingPdf(false);
                        setPages(SAMPLE_EXTRACTED_PAGES);
                      }, 1200);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Unpack ZIP</span>
                  </button>
                </div>
              )}

              {/* Extracted / Reorderable Pages List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-bold text-zinc-300">
                    Extracted Pages ({pages.length} Pages Ready)
                  </span>
                  <span>Use arrows to reorder pages</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {pages.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-xs text-zinc-400">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-12 h-16 object-cover rounded-lg border border-zinc-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Page {idx + 1} of {pages.length} • High Resolution Web Reader Page
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePageUp(idx)}
                          className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === pages.length - 1}
                          onClick={() => movePageDown(idx)}
                          className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePage(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 transition ml-1"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Web Reader Canvas Simulation (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Yumora Reader Ingestion Preview
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition ${
                      previewDevice === "mobile" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition ${
                      previewDevice === "desktop" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reader Simulation */}
              <div
                className={`mx-auto max-h-[550px] overflow-y-auto bg-black rounded-2xl border border-zinc-800 shadow-2xl p-0 transition-all ${
                  previewDevice === "mobile" ? "max-w-[320px]" : "w-full"
                }`}
              >
                <div className="p-4 text-center text-white bg-zinc-950 border-b border-zinc-800">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{title}</p>
                  <h4 className="text-xs font-extrabold">{episodeTitle}</h4>
                </div>

                <div className="flex flex-col">
                  {pages.map((p) => (
                    <div key={p.id} className="relative">
                      <img src={p.url} alt={p.name} className="w-full object-cover select-none block" />
                    </div>
                  ))}
                </div>

                <div className="p-6 text-center text-white bg-zinc-950 border-t border-zinc-800 space-y-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
                  <p className="text-xs font-bold">End of Chapter {episodeNumber}</p>
                  {allowPdfDownload && (
                    <p className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Offline PDF Download Enabled
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & LAUNCH */}
      {step === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
              Verification Passed
            </span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              04 Review & Launch Story
            </h3>
            <p className="text-xs text-zinc-500">
              Confirm your metadata, reading format, and page sequence before publishing
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-200 space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="flex gap-4 items-start">
              <img
                src={coverUrl}
                alt={title}
                className="w-20 h-28 object-cover rounded-xl shadow-md border border-zinc-700 flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                    {formatChoice}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                    {readingDirection}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">{title}</h3>
                <p className="text-xs text-zinc-400">By {user?.name || "Mei Lin Takahashi"}</p>
                <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">Chapter</p>
                <p className="font-bold text-white mt-0.5">Chapter {episodeNumber}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">Pages Extracted</p>
                <p className="font-bold text-white mt-0.5">{pages.length} Pages</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">Reading Mode</p>
                <p className="font-bold text-white mt-0.5">Universal Web</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: CELEBRATION */}
      {step === 5 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-indigo-500/40 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto ring-8 ring-indigo-500/10">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              🎉 Your Work is Live on Yumora!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              &ldquo;{title}&rdquo; has been processed and published to the global story universe with full online web reader support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={`/comics/${slugify(title)}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              Open Universal Web Reader
            </Link>

            <Link
              href="/creator"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
            >
              Go to Creator Studio
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {step <= 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((prev) => Math.max(1, prev - 1) as typeof step)}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                Step {step} of 4
              </span>
              <p className="text-[10px] text-zinc-400 hidden sm:block">
                {STEPS_NAV[step - 1]?.title}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.min(4, prev + 1) as typeof step)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 transform hover:scale-[1.02]"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompletePublish}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5 transform hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Story</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Creator Assistant</h3>
                  <p className="text-[11px] text-zinc-400">Smart assistance for visual storytellers</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed min-h-[100px] flex items-center justify-center">
              {isAiGenerating ? (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating creative suggestion...</span>
                </div>
              ) : (
                <p>{aiGeneratedText}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAiSuggestion}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-md"
              >
                Apply to Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
