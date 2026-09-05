"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Split,
  EyeOff,
  CheckCheck,
  Maximize2,
  Type,
  Mic,
  Play,
  Pause,
  Radio,
  Volume2,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import {
  Novel,
  Comic,
  Chapter,
  ComicEpisode,
  ContentStatus,
  ContentRating,
  LanguageCode,
} from "@/lib/types";
import { slugify, calculateReadTime } from "@/lib/utils";
import { CreatorProfileGate } from "@/components/creator/CreatorProfileGate";
import { dbService } from "@/lib/supabase/db";
import { parseDocumentFile, DocumentParseResult } from "@/lib/importer/documentParser";
import { uploadDataUrlToSupabase, SUPABASE_BUCKETS } from "@/lib/supabase/storage";
import {
  validateImageFile,
  compressImageToWebP,
  formatBytes,
  MAX_COVER_SIZE_BYTES,
  MAX_PAGE_SIZE_BYTES,
} from "@/lib/image-processing";

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

interface CompressionInfo {
  originalSize: number;
  compressedSize: number;
  savingsPct: number;
}

export default function CreatorUploadWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imagesBulkInputRef = useRef<HTMLInputElement>(null);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 4-Step Progress Flow: 1 (Format) -> 2 (Details) -> 3 (Content / Novel Markdown) -> 4 (Review & Publish)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Upload Mode: Start New Series vs Add Chapter to Existing Series
  const [uploadMode, setUploadMode] = useState<"NEW_SERIES" | "ADD_CHAPTER">("NEW_SERIES");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  const [selectedSeriesType, setSelectedSeriesType] = useState<"NOVEL" | "COMIC">("COMIC");

  // User's existing works
  const [userNovels, setUserNovels] = useState<Novel[]>([]);
  const [userComics, setUserComics] = useState<Comic[]>([]);

  useEffect(() => {
    const allNovels = dataStore.getNovels();
    const allComics = dataStore.getComics();
    const myNovels = user ? allNovels.filter((n) => n.creatorId === user.id) : [];
    const myComics = user ? allComics.filter((c) => c.creatorId === user.id) : [];
    setUserNovels(myNovels);
    setUserComics(myComics);
  }, [user]);

  // Content Medium
  const [formatChoice, setFormatChoice] = useState<
    "NOVEL" | "ILLUSTRATED_NOVEL" | "MANGA" | "WEBTOON" | "COMIC" | "GRAPHIC_NOVEL" | "PDF_BOOK"
  >("NOVEL");
  const [readingDirection, setReadingDirection] = useState<"RTL" | "LTR" | "VERTICAL">("LTR");
  const [allowPdfDownload, setAllowPdfDownload] = useState(true);

  // Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [secondaryGenre, setSecondaryGenre] = useState("Adventure");
  const [tagInput, setTagInput] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [contentStatus, setContentStatus] = useState<ContentStatus>("ONGOING");
  const [contentRating, setContentRating] = useState<ContentRating>("TEEN");
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  const [isSeries, setIsSeries] = useState(true);
  const [hasCopyright, setHasCopyright] = useState(true);

  // Cover Image Processing & Compression Status
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [coverCompressionInfo, setCoverCompressionInfo] = useState<CompressionInfo | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [showUrlOption, setShowUrlOption] = useState(false);

  // Comic / Manga Bulk Image Processing
  const [uploadTab, setUploadTab] = useState<"images" | "pdf" | "zip">("images");
  const [episodeDistributionMode, setEpisodeDistributionMode] = useState<
    "EACH_IMAGE_IS_EPISODE" | "ALL_IMAGES_ONE_EPISODE"
  >("EACH_IMAGE_IS_EPISODE");
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isCompressingPages, setIsCompressingPages] = useState(false);
  const [pageCompressionMessage, setPageCompressionMessage] = useState<string | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<
    {
      id: string;
      name: string;
      url: string;
      size?: string;
      dialogueLines?: { speaker: string; role: "HERO" | "HEROINE" | "VILLAIN" | "NARRATOR"; text: string }[];
    }[]
  >([]);
  const [panelViewMode, setPanelViewMode] = useState<"grid" | "list">("grid");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeVoicePageIdx, setActiveVoicePageIdx] = useState<number | null>(null);

  // Novel Markdown Manuscript Studio State
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState("Chapter 1");
  const [chapterContent, setChapterContent] = useState("");
  const [novelChaptersMap, setNovelChaptersMap] = useState<
    Record<number, { id?: string; title: string; content: string }>
  >({
    1: { title: "Chapter 1", content: "" },
  });

  // Switch between chapters cleanly - saves current and opens blank or existing chapter
  const switchChapter = (newNum: number) => {
    if (newNum < 1) return;
    // 1. Save current chapter (preserve the id if it exists)
    const updatedMap = {
      ...novelChaptersMap,
      [chapterNumber]: {
        id: novelChaptersMap[chapterNumber]?.id,
        title: chapterTitle || `Chapter ${chapterNumber}`,
        content: chapterContent,
      },
    };
    setNovelChaptersMap(updatedMap);

    // 2. Load target chapter (or blank if new)
    const target = updatedMap[newNum] || {
      title: `Chapter ${newNum}`,
      content: "",
    };

    setChapterNumber(newNum);
    setChapterTitle(target.title || `Chapter ${newNum}`);
    setChapterContent(target.content || "");
  };

  const handleContentChange = (newContent: string) => {
    setChapterContent(newContent);
    setNovelChaptersMap((prev) => ({
      ...prev,
      [chapterNumber]: {
        id: prev[chapterNumber]?.id,
        title: chapterTitle || `Chapter ${chapterNumber}`,
        content: newContent,
      },
    }));
  };

  const handleTitleChange = (newTitle: string) => {
    setChapterTitle(newTitle);
    setNovelChaptersMap((prev) => ({
      ...prev,
      [chapterNumber]: {
        id: prev[chapterNumber]?.id,
        title: newTitle,
        content: chapterContent,
      },
    }));
  };

  // Cloud Database Auto-Save & Recovery States (Direct PostgreSQL)
  const [cloudDraft, setCloudDraft] = useState<any | null>(null);
  const [showDraftRecoveryBanner, setShowDraftRecoveryBanner] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastCloudSavedTime, setLastCloudSavedTime] = useState<string | null>(null);
  
  // Document (.docx / .txt / .md) Import States
  const [docImportResult, setDocImportResult] = useState<DocumentParseResult | null>(null);
  const [isDocImportModalOpen, setIsDocImportModalOpen] = useState(false);
  const [isImportingDoc, setIsImportingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Cloud Draft Check on Mount
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/creator/drafts?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (
          data.success &&
          data.draft &&
          (data.draft.title ||
            (data.draft.chaptersData &&
              Object.keys(data.draft.chaptersData).length > 0 &&
              Object.values(data.draft.chaptersData).some((c: any) => c.content?.trim())))
        ) {
          setCloudDraft(data.draft);
          setShowDraftRecoveryBanner(true);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // 2. Debounced Cloud Database Auto-Save
  useEffect(() => {
    if (!user?.id) return;
    // Don't auto-save if completely blank initial state
    if (
      !title &&
      !chapterContent &&
      Object.keys(novelChaptersMap).length <= 1 &&
      !novelChaptersMap[1]?.content
    ) {
      return;
    }

    setAutoSaveState("saving");
    const timer = setTimeout(async () => {
      try {
        const currentActiveMap = {
          ...novelChaptersMap,
          [chapterNumber]: {
            id: novelChaptersMap[chapterNumber]?.id,
            title: chapterTitle || `Chapter ${chapterNumber}`,
            content: chapterContent,
          },
        };

        const res = await fetch("/api/creator/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            seriesId: selectedSeriesId || null,
            format: formatChoice,
            title,
            description,
            coverUrl,
            genre,
            secondaryGenre,
            tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
            uploadMode,
            currentStep: step,
            chaptersData: currentActiveMap,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAutoSaveState("saved");
          setLastCloudSavedTime(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        } else {
          setAutoSaveState("error");
        }
      } catch {
        setAutoSaveState("error");
      }
    }, 3500); // 3.5 second debounce for active typing

    return () => clearTimeout(timer);
  }, [
    user?.id,
    title,
    description,
    coverUrl,
    genre,
    secondaryGenre,
    tagInput,
    formatChoice,
    uploadMode,
    step,
    chapterNumber,
    chapterTitle,
    chapterContent,
    novelChaptersMap,
    selectedSeriesId,
  ]);

  const handleRestoreCloudDraft = () => {
    if (!cloudDraft) return;
    if (cloudDraft.title) setTitle(cloudDraft.title);
    if (cloudDraft.description) setDescription(cloudDraft.description);
    if (cloudDraft.coverUrl) setCoverUrl(cloudDraft.coverUrl);
    if (cloudDraft.genre) setGenre(cloudDraft.genre);
    if (cloudDraft.secondaryGenre) setSecondaryGenre(cloudDraft.secondaryGenre);
    if (cloudDraft.tags && Array.isArray(cloudDraft.tags)) setTagInput(cloudDraft.tags.join(", "));
    if (cloudDraft.format) setFormatChoice(cloudDraft.format);
    if (cloudDraft.uploadMode) setUploadMode(cloudDraft.uploadMode);
    if (cloudDraft.seriesId) setSelectedSeriesId(cloudDraft.seriesId);

    if (cloudDraft.chaptersData && typeof cloudDraft.chaptersData === "object") {
      setNovelChaptersMap(cloudDraft.chaptersData);
      const nums = Object.keys(cloudDraft.chaptersData).map(Number).sort((a, b) => a - b);
      const firstNum = nums[0] || 1;
      setChapterNumber(firstNum);
      setChapterTitle(cloudDraft.chaptersData[firstNum]?.title || `Chapter ${firstNum}`);
      setChapterContent(cloudDraft.chaptersData[firstNum]?.content || "");
    }
    if (cloudDraft.currentStep) {
      setStep(cloudDraft.currentStep as any);
    }
    setShowDraftRecoveryBanner(false);
  };

  const handleDiscardCloudDraft = async () => {
    if (user?.id) {
      await fetch(`/api/creator/drafts?userId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    setShowDraftRecoveryBanner(false);
    setCloudDraft(null);
  };

  // 3. Document File Import Handler (.docx / .txt / .md)
  const handleDocumentFileUpload = async (file: File) => {
    setIsImportingDoc(true);
    try {
      const res = await parseDocumentFile(file);
      if (res.success && res.chapters.length > 0) {
        setDocImportResult(res);
        setIsDocImportModalOpen(true);
      } else {
        alert(res.error || "Failed to extract chapters from document.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to process document file.");
    } finally {
      setIsImportingDoc(false);
    }
  };

  const applyImportedChapters = (mode: "REPLACE" | "APPEND") => {
    if (!docImportResult) return;

    const newMap: Record<number, { id?: string; title: string; content: string }> =
      mode === "APPEND" ? { ...novelChaptersMap } : {};

    const existingNums = Object.keys(novelChaptersMap).map(Number);
    const baseNum = mode === "APPEND" && existingNums.length > 0 ? Math.max(...existingNums) : 0;

    docImportResult.chapters.forEach((ch, idx) => {
      const targetNum = mode === "APPEND" ? baseNum + idx + 1 : ch.chapterNumber;
      newMap[targetNum] = {
        title: ch.title,
        content: ch.content,
      };
    });

    setNovelChaptersMap(newMap);
    const firstImportedNum =
      mode === "APPEND" ? baseNum + 1 : docImportResult.chapters[0].chapterNumber;
    setChapterNumber(firstImportedNum);
    setChapterTitle(newMap[firstImportedNum]?.title || `Chapter ${firstImportedNum}`);
    setChapterContent(newMap[firstImportedNum]?.content || "");

    setIsDocImportModalOpen(false);
    setDocImportResult(null);
  };

  // Handler for selecting an existing series to add a chapter to
  // Fetches latest data from DB API to ensure real chapter content is loaded
  const handleSelectExistingSeries = async (seriesId: string, type: "NOVEL" | "COMIC") => {
    setSelectedSeriesId(seriesId);
    setSelectedSeriesType(type);
    setUploadMode("ADD_CHAPTER");

    if (type === "COMIC") {
      const comic = dataStore.getComics().find((c) => c.id === seriesId);
      if (comic) {
        setTitle(comic.title);
        setDescription(comic.description);
        setCoverUrl(comic.coverUrl);
        setGenre(comic.genre);
        setSecondaryGenre(comic.secondaryGenre || "Fantasy");
        setTagInput(comic.tags.join(", "));
        setFormatChoice(comic.subType || "MANGA");
        setReadingDirection(comic.readingDirection || "VERTICAL");
        const nextEpNum =
          comic.episodes && comic.episodes.length > 0
            ? Math.max(...comic.episodes.map((e) => e.episodeNumber)) + 1
            : (comic.episodesCount || 0) + 1;
        setChapterNumber(nextEpNum);
        setChapterTitle(`Episode ${nextEpNum}`);
        setPages([]);
        setStep(3); // Jump right to Content Studio!
      }
    } else {
      // Try to fetch latest novel data from API (includes real chapter content from DB)
      let novel = dataStore.getNovels().find((n) => n.id === seriesId);
      try {
        const res = await fetch(`/api/novels/${encodeURIComponent(novel?.slug || seriesId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.novel) {
            novel = data.novel;
            // Update local cache with fresh data
            dataStore.saveNovel(data.novel);
          }
        }
      } catch {
        // Fallback to local cache if API fails
      }

      if (novel) {
        setTitle(novel.title);
        setDescription(novel.description);
        setCoverUrl(novel.coverUrl);
        setGenre(novel.genre);
        setSecondaryGenre(novel.secondaryGenre || "Fantasy");
        setTagInput(novel.tags.join(", "));
        setFormatChoice("NOVEL");
        setReadingDirection("LTR");

        // Populate novelChaptersMap with all chapters - including real DB content and IDs
        const existingChaptersMap: Record<number, { id?: string; title: string; content: string }> = {};
        if (novel.chapters && novel.chapters.length > 0) {
          novel.chapters.forEach((ch) => {
            existingChaptersMap[ch.chapterNumber] = {
              id: ch.id, // Preserve DB chapter ID for proper upsert (edit existing chapter)
              title: ch.title || `Chapter ${ch.chapterNumber}`,
              content: ch.content || "",
            };
          });
        } else {
          existingChaptersMap[1] = { title: "Chapter 1", content: "" };
        }
        setNovelChaptersMap(existingChaptersMap);

        const nextChNum =
          novel.chapters && novel.chapters.length > 0
            ? Math.max(...novel.chapters.map((c) => c.chapterNumber)) + 1
            : (novel.chaptersCount || 0) + 1;
        setChapterNumber(nextChNum);
        setChapterTitle(`Chapter ${nextChNum}`);
        setChapterContent("");
        setStep(3); // Jump right to Writing Studio!
      }
    }
  };

  // Pre-fill series from URL parameters (e.g. from Comic/Novel landing page: ?mode=ADD_CHAPTER&seriesId=...&type=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const seriesId = params.get("seriesId");
    const type = params.get("type");

    if (mode === "ADD_CHAPTER" && seriesId) {
      handleSelectExistingSeries(seriesId, (type as "NOVEL" | "COMIC") || "COMIC");
    }
  }, []);

  // Novel Markdown Studio View Modes
  const [novelViewMode, setNovelViewMode] = useState<"split" | "edit" | "preview">("split");
  const [proseFont, setProseFont] = useState<"serif" | "sans" | "mono">("serif");
  const [proseFontSize, setProseFontSize] = useState<16 | 18 | 20>(18);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Word count & read time
  const wordCount = useMemo(() => {
    return chapterContent.trim().split(/\s+/).filter(Boolean).length;
  }, [chapterContent]);

  const readTime = useMemo(() => {
    return calculateReadTime(chapterContent);
  }, [chapterContent]);

  // AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"synopsis" | "tags" | "pitch">("synopsis");
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Draft Toast
  const [draftToast, setDraftToast] = useState(false);

  const isVisualMedium =
    formatChoice === "MANGA" ||
    formatChoice === "WEBTOON" ||
    formatChoice === "COMIC" ||
    formatChoice === "GRAPHIC_NOVEL" ||
    formatChoice === "PDF_BOOK";

  // Cover Image Upload with Size Validation & WebP Compression
  const handleCoverUpload = async (file: File) => {
    setCoverError(null);
    const validation = validateImageFile(file, { maxSizeBytes: MAX_COVER_SIZE_BYTES });
    if (!validation.valid) {
      setCoverError(validation.error || "Invalid image file.");
      return;
    }

    try {
      setIsCompressingCover(true);
      const result = await compressImageToWebP(file, { maxWidth: 1600, maxHeight: 2560, quality: 0.88 });
      setCoverUrl(result.dataUrl);
      setCoverCompressionInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savingsPct: result.savingsPct,
      });
    } catch (err) {
      console.error("Cover compression failed:", err);
      setCoverError("Failed to process cover image. Please try another file.");
    } finally {
      setIsCompressingCover(false);
    }
  };

  // Bulk Comic Images Upload with Size Validation & WebP Compression
  const handleBulkImagesUpload = async (files: FileList | File[]) => {
    setPagesError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsCompressingPages(true);
    setPageCompressionMessage(`Compressing ${fileArray.length} pages to WebP...`);

    const newPages: { id: string; name: string; url: string; size?: string }[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const validation = validateImageFile(file, { maxSizeBytes: MAX_PAGE_SIZE_BYTES });
      if (!validation.valid) {
        setPagesError(`Skipped "${file.name}": ${validation.error}`);
        continue;
      }

      try {
        setPageCompressionMessage(`Processing page ${i + 1} of ${fileArray.length} into WebP...`);
        const result = await compressImageToWebP(file, { maxWidth: 1800, maxHeight: 3200, quality: 0.85 });
        newPages.push({
          id: `page-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: result.fileName,
          url: result.dataUrl,
          size: `${formatBytes(result.compressedSize)} (WebP -${result.savingsPct}%)`,
        });
      } catch (err) {
        console.error("Page compression failed:", err);
      }
    }

    if (newPages.length > 0) {
      setPages((prev) => [...prev, ...newPages]);
    }

    setIsCompressingPages(false);
    setPageCompressionMessage(null);
  };

  // PDF Processing Simulator
  const handlePdfUpload = (file: File) => {
    setIsProcessingPdf(true);
    setProcessedFileName(file.name);

    setTimeout(() => {
      setIsProcessingPdf(false);
      setPages([
        { id: `page-${Date.now()}-1`, name: `${file.name} - Page 01.webp`, url: SAMPLE_EXTRACTED_PAGES[0].url, size: "380 KB (WebP)" },
        { id: `page-${Date.now()}-2`, name: `${file.name} - Page 02.webp`, url: SAMPLE_EXTRACTED_PAGES[1].url, size: "420 KB (WebP)" },
        { id: `page-${Date.now()}-3`, name: `${file.name} - Page 03.webp`, url: SAMPLE_EXTRACTED_PAGES[2].url, size: "390 KB (WebP)" },
        { id: `page-${Date.now()}-4`, name: `${file.name} - Page 04.webp`, url: SAMPLE_EXTRACTED_PAGES[3].url, size: "410 KB (WebP)" },
      ]);
    }, 1200);
  };

  // Comic Page Reordering & Batch Management Helpers
  const movePageUp = (idx: number) => {
    if (idx <= 0) return;
    setPages((prev) => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
      return arr;
    });
  };

  const movePageDown = (idx: number) => {
    setPages((prev) => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
      return arr;
    });
  };

  const removePage = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  };

  const sortPagesByName = () => {
    setPages((prev) =>
      [...prev].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      )
    );
  };

  const reversePages = () => {
    setPages((prev) => [...prev].reverse());
  };

  const clearAllPages = () => {
    if (confirm("Are you sure you want to remove all uploaded comic pages?")) {
      setPages([]);
    }
  };

  // Markdown Formatting Toolbar Helpers
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "text") => {
    const textarea = markdownTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = chapterContent.substring(start, end) || placeholder;

    const newText =
      chapterContent.substring(0, start) +
      before +
      selectedText +
      after +
      chapterContent.substring(end);

    setChapterContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // Markdown Prose Parser & Renderer for Live Reader Preview
  const renderMarkdownPreview = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/);

    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Header 1
      if (trimmed.startsWith("# ")) {
        return (
          <h2
            key={idx}
            className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6 mt-8 tracking-tight"
          >
            {trimmed.replace(/^#\s+/, "")}
          </h2>
        );
      }

      // Header 2
      if (trimmed.startsWith("## ")) {
        return (
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 mt-6 tracking-tight text-indigo-400"
          >
            {trimmed.replace(/^##\s+/, "")}
          </h3>
        );
      }

      // Header 3
      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={idx}
            className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-3 mt-5"
          >
            {trimmed.replace(/^###\s+/, "")}
          </h4>
        );
      }

      // Light Novel Image Insert
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const [, caption, src] = imgMatch;
        return (
          <div key={idx} className="my-6 space-y-2 text-center select-none not-prose">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 max-h-[350px] mx-auto">
              <img
                src={src}
                alt={caption || "Light Novel Illustration"}
                className="w-full h-full object-cover max-h-[320px]"
              />
            </div>
            {caption && (
              <p className="text-[11px] text-zinc-400 italic font-sans">✦ {caption} ✦</p>
            )}
          </div>
        );
      }

      // LitRPG System Box Insert
      const isSystemBox =
        trimmed.startsWith("[") &&
        trimmed.includes("]") &&
        (trimmed.includes("ALERT") ||
          trimmed.includes("SYSTEM") ||
          trimmed.includes("SKILL") ||
          trimmed.includes("LEVEL") ||
          trimmed.includes("QUEST") ||
          trimmed.includes("WARNING") ||
          trimmed.includes("EXTRACTION") ||
          trimmed.includes("CORONATION") ||
          trimmed.includes("MATCH") ||
          trimmed.includes("Do you accept"));

      if (isSystemBox) {
        return (
          <div
            key={idx}
            className="my-4 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 text-xs font-mono shadow-md space-y-1"
          >
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>SYSTEM NOTIFICATION</span>
            </div>
            <div className="pt-0.5 whitespace-pre-line leading-relaxed font-semibold">
              {trimmed}
            </div>
          </div>
        );
      }

      // Horizontal Rule / Scene Break
      if (trimmed === "---" || trimmed === "***" || trimmed === "* * *") {
        return (
          <div key={idx} className="my-8 flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600 select-none">
            <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
            <span className="text-sm font-serif">✦ ✦ ✦</span>
            <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
          </div>
        );
      }

      // Blockquote
      if (trimmed.startsWith(">")) {
        const quoteContent = trimmed
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join(" ");

        return (
          <blockquote
            key={idx}
            className="my-5 pl-4 sm:pl-5 py-2 border-l-4 border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-r-2xl italic text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            {renderInlineFormatting(quoteContent)}
          </blockquote>
        );
      }

      // Standard Paragraph with inline formatting
      return (
        <p
          key={idx}
          className={`leading-relaxed transition-all ${
            idx === 0 && !trimmed.startsWith("#") ? "first-letter:text-4xl first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-indigo-500" : ""
          }`}
        >
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  // Inline formatting helper for Bold, Italic, Dialogue
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Process markdown formatting: bold **text**, italic *text*, dialogue quotes "..."
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|"[^"]+")/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-zinc-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-indigo-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <span key={i} className="text-amber-300 dark:text-amber-200 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Save Draft to localStorage
  const handleSaveDraft = () => {
    const currentSavedChapters = {
      ...novelChaptersMap,
      [chapterNumber]: {
        id: novelChaptersMap[chapterNumber]?.id,
        title: chapterTitle || `Chapter ${chapterNumber}`,
        content: chapterContent,
      },
    };

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
      chapterNumber,
      chapterTitle,
      chapterContent,
      novelChaptersMap: currentSavedChapters,
      selectedSeriesId,
      selectedSeriesType,
      uploadMode,
      pages,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("yumora_creator_draft", JSON.stringify(draft));
      setDraftToast(true);
      setTimeout(() => setDraftToast(false), 3000);
    } catch {
      // ignore
    }
  };

  // Cloud Publishing State
  const [isPublishingToCloud, setIsPublishingToCloud] = useState(false);
  const [cloudPublishStatus, setCloudPublishStatus] = useState<string | null>(null);

  // Final Publish Handler
  const handleCompletePublish = async () => {
    const creatorId = user?.id || "usr-creator-active";
    const creatorName = user?.name || "Mei Lin Takahashi";
    const creatorUsername = user?.username || "meilintakahashi";
    const creatorAvatar =
      user?.avatar ||
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80";

    // Auto-complete or ensure creator profile if missing fields
    if (user && !dataStore.isCreatorProfileComplete(user.id)) {
      dataStore.updateUserProfile(user.id, {
        name: user.name || "Creator",
        username: user.username || `creator_${user.id.slice(0, 6)}`,
        bio:
          user.bio && user.bio.length >= 20
            ? user.bio
            : "Original storyteller and visual artist creating stories on Yomika.",
        country: user.country || "Global",
        primaryGenres: user.primaryGenres?.length ? user.primaryGenres : [genre, secondaryGenre],
        preferredTypes: user.preferredTypes?.length
          ? user.preferredTypes
          : [isVisualMedium ? "COMIC" : "NOVEL"],
        agreedToCreatorTerms: true,
      });
    }

    if (!title.trim()) {
      alert("Please enter a series title.");
      return;
    }

    setIsPublishingToCloud(true);
    setCloudPublishStatus("Uploading cover to Supabase Storage...");

    const slug = slugify(title) || `work-${Date.now()}`;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      // 1. Upload Cover Image to Supabase Storage
      let finalCoverUrl = coverUrl;
      if (coverUrl.startsWith("data:")) {
        finalCoverUrl = await uploadDataUrlToSupabase(
          SUPABASE_BUCKETS.COVERS,
          `${slug}-cover-${Date.now()}.webp`,
          coverUrl
        );
      }

      if (isVisualMedium) {
        setCloudPublishStatus(`Uploading ${pages.length} manga pages to Supabase Storage...`);
        const finalPageUrls = await Promise.all(
          (pages.length > 0 ? pages : [{ id: "p1", name: "Cover", url: finalCoverUrl }]).map(
            async (p, idx) => {
              if (p.url.startsWith("data:")) {
                const uploadedUrl = await uploadDataUrlToSupabase(
                  SUPABASE_BUCKETS.COMICS,
                  `${slug}/ep-${chapterNumber}/page-${idx + 1}-${Date.now()}.webp`,
                  p.url
                );
                return uploadedUrl;
              }
              return p.url;
            }
          )
        );

        if (uploadMode === "ADD_CHAPTER" && selectedSeriesId) {
          if (episodeDistributionMode === "EACH_IMAGE_IS_EPISODE" && finalPageUrls.length > 1) {
            setCloudPublishStatus(`Adding ${finalPageUrls.length} separate episodes to series...`);
            for (let idx = 0; idx < finalPageUrls.length; idx++) {
              const epNum = chapterNumber + idx;
              const epId = `ep-${selectedSeriesId}-${epNum}-${Date.now() + idx}`;
              const pageUrl = finalPageUrls[idx];
              const ep: ComicEpisode = {
                id: epId,
                comicId: selectedSeriesId,
                episodeNumber: epNum,
                title: `Episode ${epNum}`,
                thumbnailUrl: pageUrl,
                imageUrls: [pageUrl],
                status: "ONGOING",
                publishedAt: new Date().toISOString(),
                likesCount: 0,
              };
              await dbService.insertEpisode(ep, selectedSeriesId);
              dataStore.addComicEpisode(selectedSeriesId, ep);
            }
          } else {
            setCloudPublishStatus(`Adding Episode ${chapterNumber} to existing series...`);
            const episodeId = crypto.randomUUID();
            const newEpisode: ComicEpisode = {
              id: episodeId,
              comicId: selectedSeriesId,
              episodeNumber: chapterNumber,
              title: chapterTitle || `Episode ${chapterNumber}`,
              thumbnailUrl: finalCoverUrl,
              imageUrls: finalPageUrls,
              status: "ONGOING",
              publishedAt: new Date().toISOString(),
              likesCount: 0,
            };
            await dbService.insertEpisode(newEpisode, selectedSeriesId);
            dataStore.addComicEpisode(selectedSeriesId, newEpisode);
          }
        } else {
          setCloudPublishStatus("Saving comic to Supabase Cloud Database...");
          const comicId = crypto.randomUUID();

          let episodesToAttach: ComicEpisode[] = [];

          if (episodeDistributionMode === "EACH_IMAGE_IS_EPISODE" && finalPageUrls.length > 0) {
            episodesToAttach = finalPageUrls.map((pageUrl, idx) => {
              const epNum = idx + 1;
              return {
                id: crypto.randomUUID(),
                comicId,
                episodeNumber: epNum,
                title: `Episode ${epNum}`,
                thumbnailUrl: pageUrl,
                imageUrls: [pageUrl],
                status: "PUBLISHED",
                publishedAt: new Date().toISOString(),
                likesCount: 1,
              };
            });
          } else {
            const episodeId = crypto.randomUUID();
            episodesToAttach = [
              {
                id: episodeId,
                comicId,
                episodeNumber: chapterNumber,
                title: chapterTitle || `Episode ${chapterNumber}`,
                thumbnailUrl: finalCoverUrl,
                imageUrls: finalPageUrls,
                status: "PUBLISHED",
                publishedAt: new Date().toISOString(),
                likesCount: 1,
              },
            ];
          }

          const newComic: Comic = {
            id: comicId,
            creatorId,
            creator: {
              id: creatorId,
              name: creatorName,
              username: creatorUsername,
              avatar: creatorAvatar,
              isVerified: true,
            },
            title,
            slug,
            description,
            coverUrl: finalCoverUrl,
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
            episodesCount: episodesToAttach.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            episodes: episodesToAttach,
          };

          // Save locally to dataStore first for instant access
          dataStore.saveComic(newComic);

          // Insert into Supabase PostgreSQL Cloud DB
          const insertedComic = await dbService.insertComic(newComic);
          if (!insertedComic) {
            throw new Error("Failed to save comic to cloud database. Please try again.");
          }
          for (const ep of episodesToAttach) {
            const insertedEp = await dbService.insertEpisode(ep, comicId);
            if (!insertedEp) {
              throw new Error(`Failed to save episode ${ep.episodeNumber} to database.`);
            }
          }
        }
      } else {
        // Pure Text Serialized Novel
        if (uploadMode === "ADD_CHAPTER" && selectedSeriesId) {
          // Collect all written chapters from novelChaptersMap including current active chapter
          const allSavedChapters = {
            ...novelChaptersMap,
            [chapterNumber]: {
              id: novelChaptersMap[chapterNumber]?.id,
              title: chapterTitle || `Chapter ${chapterNumber}`,
              content: chapterContent,
            },
          };

          const chaptersToSave = Object.entries(allSavedChapters)
            .filter(([_, data]) => data.content && data.content.trim().length > 0)
            .map(([numStr, data], idx) => {
              const num = parseInt(numStr, 10);
              const words = data.content.trim().split(/\s+/).filter(Boolean).length;
              const existingChapterId = data.id;
              const chapterId = existingChapterId || crypto.randomUUID();
              return {
                id: chapterId,
                novelId: selectedSeriesId,
                chapterNumber: num,
                title: data.title || `Chapter ${num}`,
                content: data.content,
                status: "PUBLISHED" as const,
                wordCount: words,
                readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
                isFree: true,
                publishedAt: new Date().toISOString(),
              };
            })
            .sort((a, b) => a.chapterNumber - b.chapterNumber);

          // If no chapters had content in map, fallback to current active
          if (chaptersToSave.length === 0) {
            const chapterId = novelChaptersMap[chapterNumber]?.id || crypto.randomUUID();
            chaptersToSave.push({
              id: chapterId,
              novelId: selectedSeriesId,
              chapterNumber,
              title: chapterTitle || `Chapter ${chapterNumber}`,
              content: chapterContent,
              status: "PUBLISHED" as const,
              wordCount,
              readTimeMinutes: readTime,
              isFree: true,
              publishedAt: new Date().toISOString(),
            });
          }

          for (let i = 0; i < chaptersToSave.length; i++) {
            const ch = chaptersToSave[i];
            setCloudPublishStatus(`Saving Chapter ${ch.chapterNumber} (${i + 1}/${chaptersToSave.length}) directly to Database...`);
            const inserted = await dbService.insertChapter(ch, selectedSeriesId);
            if (!inserted) {
              throw new Error(`Failed to save Chapter ${ch.chapterNumber} to cloud database.`);
            }
          }
        } else {
          setCloudPublishStatus("Saving novel manuscript directly to Supabase Cloud Database...");
          const novelId = crypto.randomUUID();

          // Collect all written chapters from novelChaptersMap
          const allSavedChapters = {
            ...novelChaptersMap,
            [chapterNumber]: {
              title: chapterTitle || `Chapter ${chapterNumber}`,
              content: chapterContent,
            },
          };

          const chaptersToAttach: Chapter[] = Object.entries(allSavedChapters)
            .filter(([numStr, data]) => data.content.trim().length > 0 || numStr === "1")
            .map(([numStr, data], idx) => {
              const num = parseInt(numStr, 10);
              const words = data.content.trim().split(/\s+/).filter(Boolean).length;
              return {
                id: crypto.randomUUID(),
                novelId,
                chapterNumber: num,
                title: data.title || `Chapter ${num}`,
                content: data.content,
                status: "PUBLISHED" as const,
                wordCount: words,
                readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
                isFree: true,
                publishedAt: new Date().toISOString(),
              };
            })
            .sort((a, b) => a.chapterNumber - b.chapterNumber);

          const newNovel: Novel = {
            id: novelId,
            creatorId,
            creator: {
              id: creatorId,
              name: creatorName,
              username: creatorUsername,
              avatar: creatorAvatar,
              isVerified: true,
            },
            title,
            slug,
            description,
            coverUrl: finalCoverUrl,
            genre,
            secondaryGenre,
            tags,
            language,
            format: formatChoice === "ILLUSTRATED_NOVEL" ? "ILLUSTRATED" : "STANDARD",
            subType: formatChoice === "ILLUSTRATED_NOVEL" ? "ILLUSTRATED_NOVEL" : "WEB_NOVEL",
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
            chaptersCount: chaptersToAttach.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            chapters: chaptersToAttach,
          };

          // Insert directly into Supabase PostgreSQL Cloud DB
          const insertedNovel = await dbService.insertNovel(newNovel);
          if (!insertedNovel) {
            throw new Error("Failed to save novel to cloud database. Please try again.");
          }
          for (const ch of chaptersToAttach) {
            const insertedCh = await dbService.insertChapter(ch, novelId);
            if (!insertedCh) {
              throw new Error(`Failed to save chapter ${ch.chapterNumber} to cloud database.`);
            }
          }
        }
      }

      // Clear database draft once successfully published to cloud
      if (user?.id) {
        fetch(`/api/creator/drafts?userId=${encodeURIComponent(user.id)}`, { method: "DELETE" }).catch(() => {});
        setCloudDraft(null);
        setShowDraftRecoveryBanner(false);
      }

      try {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      setStep(5);
    } catch (err: any) {
      console.error("Cloud publish error:", err);
      const errMsg = err?.message || "Failed to save story to database. Please check your connection and try again.";
      alert(`Database Upload Error: ${errMsg}`);

      // Automatically dispatch high-priority error email to Admin
      try {
        fetch("/api/admin/error-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            errorType: "STORY_UPLOAD_FAILURE",
            errorMessage: errMsg,
            endpoint: "/creator/upload",
            userId: user?.id,
            userEmail: user?.email,
            storyTitle: title,
            chapterNumber,
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    } finally {
      setIsPublishingToCloud(false);
      setCloudPublishStatus(null);
    }
  };

  const STEPS_NAV = [
    { num: 1, label: "01 Format Choice", title: "Format Choice" },
    { num: 2, label: "02 Series Details", title: "Series Details & Cover" },
    { num: 3, label: "03 Content Studio", title: isVisualMedium ? "Comic / Page Ingestion" : "Novel Markdown Studio" },
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
      {/* Draft Toast */}
      {draftToast && (
        <div className="fixed bottom-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Draft auto-saved successfully with WebP assets!</span>
        </div>
      )}

      {/* Cloud Draft Recovery Banner (Direct Database) */}
      {showDraftRecoveryBanner && cloudDraft && (
        <div className="p-4 sm:p-5 rounded-3xl bg-indigo-950/70 border border-indigo-500/40 text-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500 text-white uppercase tracking-wider">
                  Cloud Draft Found
                </span>
                <span className="text-[11px] text-zinc-400">
                  {cloudDraft.lastSavedAt
                    ? `Saved: ${new Date(cloudDraft.lastSavedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}`
                    : "Unpublished Manuscript"}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-200 mt-1">
                &ldquo;{cloudDraft.title || "Untitled Story"}&rdquo; •{" "}
                {Object.keys(cloudDraft.chaptersData || {}).length} Chapter(s) ready to restore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleRestoreCloudDraft}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Restore Draft</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardCloudDraft}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Header & Positioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Yomika Studio • Direct Database Connected Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Publish to the Story Universe
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Features: <strong className="text-zinc-700 dark:text-zinc-300">Word (.docx) Importer • Cloud DB Auto-Save • Live Chapter Splitter</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Cloud DB Auto-Save Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold">
            {autoSaveState === "saving" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="text-amber-400">Saving to Cloud DB...</span>
              </>
            ) : autoSaveState === "saved" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Cloud Saved ({lastCloudSavedTime || "Active"})</span>
              </>
            ) : autoSaveState === "error" ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400">Sync Paused</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Direct DB Mode</span>
              </>
            )}
          </div>

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

      {/* 4-Step Progress Navigation */}
      {step <= 4 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {STEPS_NAV.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as typeof step)}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  isActive
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : isCompleted
                    ? "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/50 text-zinc-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black">
                  <span>{s.label}</span>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{s.title}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 1: FORMAT & SERIES SELECTION */}
      {step === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          {/* Mode Switcher: New Series vs Add Chapter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                01 Publication Flow
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Start a brand new series or add subsequent chapters to your existing works
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setUploadMode("NEW_SERIES");
                  setSelectedSeriesId("");
                  setChapterNumber(1);
                  setChapterTitle("Chapter 1");
                  setChapterContent("");
                  setNovelChaptersMap({ 1: { title: "Chapter 1", content: "" } });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  uploadMode === "NEW_SERIES"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Story / Series</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode("ADD_CHAPTER")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  uploadMode === "ADD_CHAPTER"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Add Chapter / Episode ({userNovels.length + userComics.length})</span>
              </button>
            </div>
          </div>

          {/* If ADD_CHAPTER mode: Display existing series to pick from */}
          {uploadMode === "ADD_CHAPTER" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-500 tracking-wider">
                  Select a Series to Add Next Chapter:
                </span>
                <span className="text-xs text-zinc-400">Click any series to jump directly to chapter upload</span>
              </div>

              {userComics.length === 0 && userNovels.length === 0 ? (
                <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                  <p className="text-xs text-zinc-500">No existing series found in your creator account.</p>
                  <button
                    type="button"
                    onClick={() => setUploadMode("NEW_SERIES")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                  >
                    Create Your First Series Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Manga / Comics list */}
                  {userComics.map((c) => {
                    const currentEps = c.episodesCount || c.episodes?.length || 1;
                    const nextEp =
                      c.episodes && c.episodes.length > 0
                        ? Math.max(...c.episodes.map((e) => e.episodeNumber)) + 1
                        : currentEps + 1;

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectExistingSeries(c.id, "COMIC")}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex gap-3.5 items-center hover:scale-[1.01] ${
                          selectedSeriesId === c.id
                            ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <img
                          src={c.coverUrl}
                          alt={c.title}
                          className="w-14 h-18 rounded-xl object-cover flex-shrink-0 border border-zinc-700"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white">
                              {c.subType || "MANGA"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">{c.genre}</span>
                          </div>
                          <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {c.title}
                          </h4>
                          <p className="text-[11px] text-emerald-500 font-bold">
                            Current: {currentEps} Ep • Next: Episode {nextEp} →
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Novels list */}
                  {userNovels.map((n) => {
                    const currentChs = n.chaptersCount || n.chapters?.length || 1;
                    const nextCh =
                      n.chapters && n.chapters.length > 0
                        ? Math.max(...n.chapters.map((c) => c.chapterNumber)) + 1
                        : currentChs + 1;

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleSelectExistingSeries(n.id, "NOVEL")}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex gap-3.5 items-center hover:scale-[1.01] ${
                          selectedSeriesId === n.id
                            ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <img
                          src={n.coverUrl}
                          alt={n.title}
                          className="w-14 h-18 rounded-xl object-cover flex-shrink-0 border border-zinc-700"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white">
                              NOVEL
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">{n.genre}</span>
                          </div>
                          <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-emerald-500 font-bold">
                            Current: {currentChs} Ch • Next: Chapter {nextCh} →
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Select Format for New Story:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Serialized Novel */}
                <button
                  type="button"
                  onClick={() => {
                    setFormatChoice("NOVEL");
                    setReadingDirection("LTR");
                  }}
                  className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                    formatChoice === "NOVEL"
                      ? "bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/40"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    📖 Serialized Web Novel
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Pure text prose chapters with markdown styling, reading typography controls, and real-time word counter.
                  </p>
                </button>

            {/* 2. Manga (RTL) */}
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
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                🗾 Japanese Manga (RTL)
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Traditional Right-to-Left page turns with spread view and zoom optimization.
              </p>
            </button>

            {/* 3. Webtoon (Vertical Scroll) */}
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
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <MoveVertical className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                📱 Vertical Webtoon / Manhwa
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Infinite vertical scroll designed for mobile reading with seamless panel transitions.
              </p>
            </button>

            {/* 4. Western Comic (LTR) */}
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
                🎨 Graphic Novel / Comic
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Left-to-Right page flow for indie comic issues, graphic novels, and art books.
              </p>
            </button>

            {/* 5. Illustrated Light Novel */}
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
                ✨ Illustrated Light Novel
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
                📄 PDF Book / Manga Ingestion
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Ingest existing PDF documents into optimized WebP pages for online web reading.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* STEP 2: SERIES DETAILS & COVER UPLOAD (WITH SIZE LIMITS & WEBP AUTO-COMPRESSION) */}
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
                  onClick={() => {
                    setIsAiModalOpen(true);
                    setIsAiGenerating(true);
                    setAiGeneratedText("");
                    setTimeout(() => {
                      setIsAiGenerating(false);
                      setAiGeneratedText(
                        `In a world governed by celestial constellation looms, an outlaw cartographer discovers a fractured starlight compass capable of reshaping the cosmic tapestry.`
                      );
                    }, 800);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI Polish</span>
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Series Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chronicles of the Astral Weaver"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Synopsis / Hook *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a captivating premise for your series..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 leading-relaxed transition resize-y"
                />
              </div>

              {/* COVER ARTWORK UPLOADER (ENFORCING 10MB LIMIT & WEBP COMPRESSION) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Series Cover Artwork (Max 10 MB)
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Auto-Compresses to <strong className="text-indigo-400">Optimized WebP</strong>
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {coverError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{coverError}</span>
                  </div>
                )}

                <div className="p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative aspect-[3/4] w-24 sm:w-28 rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-700 flex-shrink-0">
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    {isCompressingCover && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mb-1" />
                        <span>Compressing WebP...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Upload or drop series cover image
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Supported: JPG, PNG, WebP (Max 10MB). Automatically optimized for ultra-fast CDN delivery.
                      </p>
                    </div>

                    {coverCompressionInfo && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          WebP Optimized: {formatBytes(coverCompressionInfo.originalSize)} → {formatBytes(coverCompressionInfo.compressedSize)} (-{coverCompressionInfo.savingsPct}% saved)
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressingCover}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isCompressingCover ? "Compressing..." : "Upload & Compress Image"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlOption(!showUrlOption)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
                      >
                        {showUrlOption ? "Hide Presets" : "Preset Covers"}
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
                        Sample Curated Artwork
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_COVERS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setCoverUrl(preset.url);
                              setCoverCompressionInfo(null);
                            }}
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

              {/* Genre & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Primary Genre *
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    {["Sci-Fi", "Fantasy", "Cyberpunk", "Action", "Romance", "Mystery", "Adventure"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Secondary Genre
                  </label>
                  <select
                    value={secondaryGenre}
                    onChange={(e) => setSecondaryGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    {["Fantasy", "Sci-Fi", "Action", "Mystery", "Steampunk", "Slice of Life"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Search & Discover Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Magic, Progression, Cyberpunk, Dungeons"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Series Live Card Preview */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-xl space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Discovery Card Preview
              </span>

              <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800 group">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white self-start mb-1">
                    {formatChoice}
                  </span>
                  <h4 className="font-extrabold text-sm text-white line-clamp-1">{title || "Untitled Story"}</h4>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 mt-0.5">{description}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Author:</span>
                  <span className="text-white font-bold">{user?.name || "Aria Thorne"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Genre:</span>
                  <span className="text-white font-bold">{genre} / {secondaryGenre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{contentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONTENT STUDIO (NOVEL MARKDOWN STUDIO OR COMIC PAGE INGESTION) */}
      {step === 3 && (
        <div>
          {!isVisualMedium ? (
            /* =================== NOVEL MARKDOWN STUDIO =================== */
            <div className="space-y-6">
              {/* Studio Header Bar */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 uppercase tracking-wider">
                      Novel Studio
                    </span>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                      03 Markdown Manuscript Editor & Live Reader Preview
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Write in standard markdown prose. Real-time typography rendering, word count, and mobile/desktop preview.
                  </p>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNovelViewMode("split")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      novelViewMode === "split"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNovelViewMode("edit")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      novelViewMode === "edit"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Editor Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNovelViewMode("preview")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      novelViewMode === "preview"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reader Preview</span>
                  </button>
                </div>
              </div>

              {uploadMode === "ADD_CHAPTER" && selectedSeriesId && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        Adding Chapter to Novel: <span className="text-indigo-400">{title}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">Auto-detected next chapter: #{chapterNumber}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold text-[11px]"
                  >
                    Change Series
                  </button>
                </div>
              )}

              {/* Document File Importer (.docx / .txt / .md) */}
              <input
                type="file"
                ref={docInputRef}
                accept=".docx,.txt,.md,.markdown"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDocumentFileUpload(file);
                }}
                className="hidden"
              />

              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0 ring-4 ring-indigo-500/10">
                    <FileType className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Import Full Manuscript (.docx / .txt / .md)</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                        Auto-Chapter Splitter
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Drag & drop your Word book or text file. We automatically detect and split all chapters into your manuscript!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isImportingDoc}
                  onClick={() => docInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  {isImportingDoc ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing Document...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Word File</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chapter Meta */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Chapter #
                    </label>
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => switchChapter(chapterNumber - 1)}
                        disabled={chapterNumber <= 1}
                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 font-black text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={chapterNumber}
                        onChange={(e) =>
                          switchChapter(
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                        className="w-full text-center bg-transparent text-xs font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => switchChapter(chapterNumber + 1)}
                        className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-black text-xs text-white flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={chapterTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder={`e.g. Chapter ${chapterNumber}: The Awakening`}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Chapter Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase whitespace-nowrap">
                    Quick Select Ch:
                  </span>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => switchChapter(num)}
                      className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                        chapterNumber === num
                          ? "bg-indigo-600 text-white shadow-xs"
                          : novelChaptersMap[num]?.content
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Ch {num} {novelChaptersMap[num]?.content ? "✓" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Grid */}
              <div
                className={`grid gap-6 items-start ${
                  novelViewMode === "split"
                    ? "grid-cols-1 lg:grid-cols-12"
                    : "grid-cols-1"
                }`}
              >
                {/* Editor Column */}
                {(novelViewMode === "split" || novelViewMode === "edit") && (
                  <div className={novelViewMode === "split" ? "lg:col-span-6 space-y-3" : "w-full space-y-3"}>
                    {/* Markdown Formatting Toolbar */}
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**", "bold text")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs flex items-center gap-1 transition"
                        title="Bold (**text**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*", "italic text")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 italic text-xs flex items-center gap-1 transition"
                        title="Italic (*text*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                      <button
                        type="button"
                        onClick={() => insertMarkdown("# ", "", "Heading 1")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 transition"
                        title="Heading 1 (# )"
                      >
                        <Heading1 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("## ", "", "Heading 2")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 transition"
                        title="Heading 2 (## )"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("> ", "", "Memorable quote or thought")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 transition"
                        title="Blockquote (> )"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown('"', '"', "Spoken dialogue")}
                        className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-mono text-xs transition"
                        title="Dialogue Quote"
                      >
                        &ldquo;Quote&rdquo;
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n\n---\n\n", "")}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 transition"
                        title="Scene Divider (---)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Divider</span>
                      </button>

                      <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                      {/* Insert Light Novel Art */}
                      <button
                        type="button"
                        onClick={async () => {
                          const fileInput = document.createElement("input");
                          fileInput.type = "file";
                          fileInput.accept = "image/*";
                          fileInput.onchange = async (event: any) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            
                            try {
                              setCloudPublishStatus("Uploading illustration...");
                              const result = await compressImageToWebP(file, { maxWidth: 1200, maxHeight: 1800, quality: 0.85 });
                              const uploadedUrl = await uploadDataUrlToSupabase(
                                "comics",
                                `illustrations/novel-art-${Date.now()}.webp`,
                                result.dataUrl
                              );
                              
                              insertMarkdown(
                                "\n\n![Illustration: Epic Moment](",
                                ")\n\n",
                                uploadedUrl
                              );
                            } catch (err) {
                              alert("Failed to upload image. Please try again.");
                            } finally {
                              setCloudPublishStatus(null);
                            }
                          };
                          fileInput.click();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 transition border border-amber-500/30 cursor-pointer"
                        title="Upload & Insert Light Novel Splash Illustration"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Upload Artwork</span>
                      </button>

                      {/* Insert LitRPG System Window */}
                      <button
                        type="button"
                        onClick={() =>
                          insertMarkdown(
                            "\n\n[SYSTEM NOTIFICATION: ",
                            "]\n\n",
                            "Awakening Complete | Host Level: 1 | Skill: Shadow Extraction"
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 transition border border-indigo-500/30 cursor-pointer"
                        title="Insert Holographic System Window ([ALERT: ...])"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>System Box</span>
                      </button>

                      <div className="ml-auto flex items-center gap-2 text-[11px] font-bold text-zinc-400 pr-2">
                        <span>{wordCount.toLocaleString()} words</span>
                        <span>•</span>
                        <span>{readTime} min read</span>
                      </div>
                    </div>

                    {/* Markdown Manuscript Editor */}
                    <div className="relative rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md">
                      <textarea
                        ref={markdownTextareaRef}
                        rows={22}
                        value={chapterContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Write your story manuscript in Markdown..."
                        className="w-full p-6 bg-transparent text-sm sm:text-base font-mono leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none resize-y min-h-[480px]"
                      />
                    </div>
                  </div>
                )}

                {/* Preview Column */}
                {(novelViewMode === "split" || novelViewMode === "preview") && (
                  <div className={novelViewMode === "split" ? "lg:col-span-6 space-y-3" : "w-full space-y-3"}>
                    {/* Typography & Device Controls */}
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-400">Typography:</span>
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setProseFont("serif")}
                            className={`px-2.5 py-1 rounded-lg font-serif font-bold ${
                              proseFont === "serif" ? "bg-indigo-600 text-white" : "text-zinc-400"
                            }`}
                          >
                            Serif
                          </button>
                          <button
                            type="button"
                            onClick={() => setProseFont("sans")}
                            className={`px-2.5 py-1 rounded-lg font-sans font-bold ${
                              proseFont === "sans" ? "bg-indigo-600 text-white" : "text-zinc-400"
                            }`}
                          >
                            Sans
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
                          {[16, 18, 20].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setProseFontSize(sz as typeof proseFontSize)}
                              className={`px-2 py-1 rounded-lg font-bold ${
                                proseFontSize === sz ? "bg-indigo-600 text-white" : "text-zinc-400"
                              }`}
                            >
                              {sz}px
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setPreviewTheme("dark")}
                            className={`px-2 py-1 rounded-lg ${previewTheme === "dark" ? "bg-zinc-950 text-white font-bold" : "text-zinc-400"}`}
                          >
                            Dark
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTheme("sepia")}
                            className={`px-2 py-1 rounded-lg ${previewTheme === "sepia" ? "bg-[#fbf0d9] text-zinc-900 font-bold" : "text-zinc-400"}`}
                          >
                            Sepia
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTheme("light")}
                            className={`px-2 py-1 rounded-lg ${previewTheme === "light" ? "bg-white text-zinc-900 font-bold" : "text-zinc-400"}`}
                          >
                            Light
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("mobile")}
                            className={`p-1.5 rounded-lg text-xs font-bold transition ${
                              previewDevice === "mobile" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}
                            title="Mobile Preview Frame"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("desktop")}
                            className={`p-1.5 rounded-lg text-xs font-bold transition ${
                              previewDevice === "desktop" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}
                            title="Desktop Preview Frame"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live Reader Canvas Frame */}
                    <div
                      className={`mx-auto rounded-3xl border shadow-2xl transition-all overflow-hidden ${
                        previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                      } ${
                        previewTheme === "dark"
                          ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                          : previewTheme === "sepia"
                          ? "bg-[#fbf0d9] border-[#e8d7b3] text-[#433422]"
                          : "bg-white border-zinc-200 text-zinc-900"
                      }`}
                    >
                      {/* Reader Header Simulation */}
                      <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-70">
                        <span className="font-bold truncate max-w-[200px]">{title}</span>
                        <span>Ch. {chapterNumber}</span>
                      </div>

                      {/* Rendered Markdown Article */}
                      <article
                        className={`p-6 sm:p-8 max-h-[560px] overflow-y-auto space-y-4 ${
                          proseFont === "serif"
                            ? "font-serif"
                            : proseFont === "mono"
                            ? "font-mono"
                            : "font-sans"
                        }`}
                        style={{ fontSize: `${proseFontSize}px` }}
                      >
                        {renderMarkdownPreview(chapterContent)}
                      </article>

                      {/* Reader Footer Simulation */}
                      <div className="p-4 border-t border-black/10 dark:border-white/10 text-center text-xs opacity-60">
                        <span>End of Chapter {chapterNumber} • {readTime} min read</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* =================== COMIC / MANGA PAGE INGESTION =================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        03 Ingest Content & Process Pages
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Upload images (Max 15MB/page) with auto-WebP compression
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setUploadTab("images")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          uploadTab === "images" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Bulk Images</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadTab("pdf")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          uploadTab === "pdf" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <FileType className="w-3.5 h-3.5" />
                        <span>PDF Import</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadTab("zip")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          uploadTab === "zip" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <FileArchive className="w-3.5 h-3.5" />
                        <span>ZIP Archive</span>
                      </button>
                    </div>
                  </div>

                  {uploadMode === "ADD_CHAPTER" && selectedSeriesId && (
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            Adding Episode to: <span className="text-indigo-400">{title}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500">Auto-detected next episode: #{chapterNumber}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold text-[11px]"
                      >
                        Change Series
                      </button>
                    </div>
                  )}

                  {/* Chapter/Episode Details */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Chapter / Ep #
                        </label>
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setChapterNumber((prev) => Math.max(1, prev - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-black text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full text-center bg-transparent text-xs font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setChapterNumber((prev) => prev + 1)}
                            className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-black text-xs text-white flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Episode Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={chapterTitle}
                          onChange={(e) => setChapterTitle(e.target.value)}
                          placeholder={`e.g. Episode ${chapterNumber}: Awakening`}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Quick Episode Selector Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase whitespace-nowrap">
                        Quick Select Ep:
                      </span>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setChapterNumber(num);
                            if (!chapterTitle || chapterTitle.startsWith("Episode ") || chapterTitle.startsWith("Chapter ")) {
                              setChapterTitle(`Episode ${num}`);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                            chapterNumber === num
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Ep {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Episode Distribution Strategy Selector */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Episode Distribution Strategy:</span>
                      </label>
                      <span className="text-[11px] font-bold text-indigo-400">
                        {episodeDistributionMode === "EACH_IMAGE_IS_EPISODE"
                          ? `⚡ Auto-Split (${pages.length} Episode${pages.length !== 1 ? "s" : ""})`
                          : `📑 Single Episode (${pages.length} Page${pages.length !== 1 ? "s" : ""})`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEpisodeDistributionMode("EACH_IMAGE_IS_EPISODE")}
                        className={`p-3.5 rounded-2xl border text-left transition space-y-1.5 cursor-pointer ${
                          episodeDistributionMode === "EACH_IMAGE_IS_EPISODE"
                            ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 text-indigo-300 font-bold"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black">1 Image = 1 Episode (Auto-Split)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Har uploaded image ek alag Episode banegi (1st image = Ep 1, 2nd image = Ep 2...).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEpisodeDistributionMode("ALL_IMAGES_ONE_EPISODE")}
                        className={`p-3.5 rounded-2xl border text-left transition space-y-1.5 cursor-pointer ${
                          episodeDistributionMode === "ALL_IMAGES_ONE_EPISODE"
                            ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 text-indigo-300 font-bold"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-black">Multi-Page Single Episode</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Saari uploaded images ek hi episode ke andar consecutive pages (Page 1, 2, 3...) banengi.
                        </p>
                      </button>
                    </div>
                  </div>

                  {pagesError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{pagesError}</span>
                    </div>
                  )}

                  {/* Bulk Images Ingestion Tab with Drag and Drop */}
                  {uploadTab === "images" && (
                    <div className="space-y-4">
                      <input
                        type="file"
                        multiple
                        ref={imagesBulkInputRef}
                        onChange={(e) => {
                          if (e.target.files) handleBulkImagesUpload(e.target.files);
                        }}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(false);
                          if (e.dataTransfer.files) {
                            handleBulkImagesUpload(e.dataTransfer.files);
                          }
                        }}
                        onClick={() => imagesBulkInputRef.current?.click()}
                        className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition text-center space-y-3 cursor-pointer ${
                          isDraggingOver
                            ? "border-rose-500 bg-rose-500/10 scale-[1.01]"
                            : "border-zinc-300 dark:border-zinc-800 hover:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-950/50"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center mx-auto">
                          {isCompressingPages ? (
                            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                          ) : (
                            <Upload className="w-7 h-7" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {isCompressingPages
                              ? "Compressing Pages to WebP..."
                              : isDraggingOver
                              ? "Drop Comic Pages Here!"
                              : "Drag & Drop Bulk Comic / Manga Pages"}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                            {pageCompressionMessage ||
                              "Select or drop 20+ JPG, PNG, or WebP images (Max 15MB/page). Auto-optimizes to high-speed WebP."}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isCompressingPages}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Browse Files from Computer</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PDF Ingestion Tab */}
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
                              ? "Extracting high-resolution pages and generating WebP stream..."
                              : "Yomika processes PDF files into interactive web reader pages."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Select PDF File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Pages Management Toolbar & Re-Order List/Grid */}
                  {pages.length > 0 && (
                    <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      {/* Toolbar Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>Uploaded Panels</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold">
                              {pages.length} Pages
                            </span>
                          </span>
                          <p className="text-[11px] text-zinc-400">
                            Reorder pages to arrange reading sequence
                          </p>
                        </div>

                        {/* Batch Controls: Sort, Reverse, Clear, Grid/List Toggle */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={sortPagesByName}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center gap-1"
                            title="Sort Alphabetically by Filename (Page 1, 2, 3...)"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Sort Names</span>
                          </button>

                          <button
                            type="button"
                            onClick={reversePages}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center gap-1"
                            title="Reverse Page Sequence (RTL / LTR)"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reverse</span>
                          </button>

                          <button
                            type="button"
                            onClick={clearAllPages}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[11px] font-bold transition flex items-center gap-1"
                            title="Clear All Uploaded Pages"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>

                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 ml-1">
                            <button
                              type="button"
                              onClick={() => setPanelViewMode("grid")}
                              className={`p-1 rounded text-xs transition ${
                                panelViewMode === "grid"
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                              title="Thumbnail Grid View"
                            >
                              ▦
                            </button>
                            <button
                              type="button"
                              onClick={() => setPanelViewMode("list")}
                              className={`p-1 rounded text-xs transition ${
                                panelViewMode === "list"
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                              title="Compact List View"
                            >
                              ☰
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* THUMBNAIL GRID VIEW */}
                      {panelViewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
                          {pages.map((p, idx) => (
                            <div
                              key={p.id}
                              className="relative group p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/60 transition flex flex-col justify-between"
                            >
                              {/* Page Index Badge */}
                              <div className="flex items-center justify-between pb-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 font-mono text-[10px] font-bold">
                                  #{String(idx + 1).padStart(2, "0")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePage(idx)}
                                  className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                                  title="Delete Page"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Thumbnail Image */}
                              <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/60 relative">
                                <img
                                  src={p.url}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              </div>

                              {/* Voice Dubbing Trigger */}
                              <button
                                type="button"
                                onClick={() => setActiveVoicePageIdx(idx)}
                                className="w-full mt-1.5 py-1 px-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                title="Add/Edit exact voice lines for this manga panel"
                              >
                                <Mic className="w-3 h-3" />
                                <span>
                                  {p.dialogueLines && p.dialogueLines.length > 0
                                    ? `${p.dialogueLines.length} Voice Lines ✓`
                                    : "+ Voice Dubbing"}
                                </span>
                              </button>

                              {/* Reorder Buttons */}
                              <div className="flex items-center justify-between pt-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => movePageUp(idx)}
                                  className="px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                  title="Move Left / Earlier"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                  <span>Left</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={idx === pages.length - 1}
                                  onClick={() => movePageDown(idx)}
                                  className="px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                  title="Move Right / Later"
                                >
                                  <span>Right</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* COMPACT LIST VIEW */
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
                                  <button
                                    type="button"
                                    onClick={() => setActiveVoicePageIdx(idx)}
                                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <Mic className="w-2.5 h-2.5" />
                                    <span>
                                      {p.dialogueLines && p.dialogueLines.length > 0
                                        ? `${p.dialogueLines.length} Voice Lines (Click to edit)`
                                        : "+ Add Voice Dubbing"}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => movePageUp(idx)}
                                  className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === pages.length - 1}
                                  onClick={() => movePageDown(idx)}
                                  className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 disabled:opacity-20 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePage(idx)}
                                  className="p-1.5 rounded-lg hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 transition ml-1 cursor-pointer"
                                  title="Delete Page"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dedicated Episode Voice Dubbing Script Studio for Creators */}
                  <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span>Manga Voice Dubbing & Speech Bubble Script Studio</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-bold">
                              Live Voice Acting
                            </span>
                          </h4>
                          <p className="text-xs text-zinc-500">
                            Write character speech bubble dialogues for each panel to enable AI Voice Dubbing
                          </p>
                        </div>
                      </div>

                      {/* Quick AI Script Filler */}
                      <button
                        type="button"
                        onClick={() => {
                          if (pages.length === 0) {
                            setPages([
                              {
                                id: `page-${Date.now()}-1`,
                                name: "Panel 01.webp",
                                url: coverUrl || "https://picsum.photos/seed/manga1/800/1200",
                                size: "380 KB (WebP)",
                                dialogueLines: [
                                  {
                                    speaker: "Narrator",
                                    role: "NARRATOR",
                                    text: `Chapter ${chapterNumber}: ${chapterTitle || "My First Day"}.`,
                                  },
                                  {
                                    speaker: "Hero",
                                    role: "HERO",
                                    text: "Where legends are born... or totally roasted.",
                                  },
                                ],
                              },
                              {
                                id: `page-${Date.now()}-2`,
                                name: "Panel 02.webp",
                                url: coverUrl || "https://picsum.photos/seed/manga2/800/1200",
                                size: "420 KB (WebP)",
                                dialogueLines: [
                                  {
                                    speaker: "Hero",
                                    role: "HERO",
                                    text: "Heh... Everyone will be impressed by my confidence!",
                                  },
                                ],
                              },
                            ]);
                            return;
                          }
                          const updated = pages.map((p, idx) => ({
                            ...p,
                            dialogueLines: [
                              {
                                speaker: idx === 0 ? "Narrator" : "Hero",
                                role: (idx === 0 ? "NARRATOR" : "HERO") as
                                  | "HERO"
                                  | "HEROINE"
                                  | "VILLAIN"
                                  | "NARRATOR",
                                text:
                                  idx === 0
                                    ? `Chapter ${chapterNumber}: ${chapterTitle || "The Awakening"}.`
                                    : `Panel ${idx + 1}: Speech bubble dialogue text...`,
                              },
                            ],
                          }));
                          setPages(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Auto-fill starter template dialogues for all panels"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ Auto-Fill Template</span>
                      </button>
                    </div>

                    {pages.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
                        <Mic className="w-8 h-8 text-indigo-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            No Manga Pages Uploaded Yet
                          </p>
                          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-0.5">
                            Upload your comic images above, or click &ldquo;✨ Auto-Fill Template&rdquo; to test the voice script editor!
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Panel-by-Panel Script Cards */
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {pages.map((p, pIdx) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold">
                                  Panel #{pIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">
                                  {p.name}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...pages];
                                  const cur = updated[pIdx].dialogueLines || [];
                                  updated[pIdx].dialogueLines = [
                                    ...cur,
                                    {
                                      speaker: "Character",
                                      role: "HERO",
                                      text: "",
                                    },
                                  ];
                                  setPages(updated);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Dialogue</span>
                              </button>
                            </div>

                            {/* Dialogue Lines for this page */}
                            <div className="space-y-2">
                              {(p.dialogueLines || []).map((line, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={line.speaker}
                                        onChange={(e) => {
                                          const updated = [...pages];
                                          if (updated[pIdx].dialogueLines) {
                                            updated[pIdx].dialogueLines![dIdx].speaker =
                                              e.target.value;
                                            setPages(updated);
                                          }
                                        }}
                                        placeholder="Speaker Name"
                                        className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 w-32"
                                      />

                                      <select
                                        value={line.role}
                                        onChange={(e) => {
                                          const updated = [...pages];
                                          if (updated[pIdx].dialogueLines) {
                                            updated[pIdx].dialogueLines![dIdx].role = e
                                              .target.value as any;
                                            setPages(updated);
                                          }
                                        }}
                                        className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 cursor-pointer"
                                      >
                                        <option value="HERO">Hero (Male ⚡)</option>
                                        <option value="HEROINE">Heroine (Female 🌸)</option>
                                        <option value="VILLAIN">Villain (Deep 👑)</option>
                                        <option value="NARRATOR">Narrator (🎙️)</option>
                                      </select>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {/* Listen / Test Voice Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            typeof window !== "undefined" &&
                                            "speechSynthesis" in window
                                          ) {
                                            window.speechSynthesis.cancel();
                                            const u = new SpeechSynthesisUtterance(
                                              line.text || "Voice line test"
                                            );
                                            if (line.role === "HEROINE") u.pitch = 1.25;
                                            else if (line.role === "VILLAIN") u.pitch = 0.75;
                                            else u.pitch = 1.0;
                                            window.speechSynthesis.speak(u);
                                          }
                                        }}
                                        className="px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[11px] font-bold text-rose-500 flex items-center gap-1 cursor-pointer"
                                        title="Test this voice line"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        <span>Test</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...pages];
                                          if (updated[pIdx].dialogueLines) {
                                            updated[pIdx].dialogueLines = updated[
                                              pIdx
                                            ].dialogueLines!.filter((_, i) => i !== dIdx);
                                            setPages(updated);
                                          }
                                        }}
                                        className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                        title="Delete Line"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <textarea
                                    rows={2}
                                    value={line.text}
                                    onChange={(e) => {
                                      const updated = [...pages];
                                      if (updated[pIdx].dialogueLines) {
                                        updated[pIdx].dialogueLines![dIdx].text =
                                          e.target.value;
                                        setPages(updated);
                                      }
                                    }}
                                    placeholder="Enter speech bubble dialogue text appearing on this page..."
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                              ))}

                              {(!p.dialogueLines || p.dialogueLines.length === 0) && (
                                <p className="text-[11px] text-zinc-400 italic">
                                  No dialogue added for this panel. (Click &ldquo;Add Dialogue&rdquo; to add character speech lines)
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Comic Web Reader Ingestion Canvas Preview */}
              <div className="lg:col-span-5 sticky top-20 space-y-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Comic Reader Ingestion Preview
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

                  <div
                    className={`mx-auto max-h-[520px] overflow-y-auto bg-black rounded-2xl border border-zinc-800 shadow-2xl p-0 transition-all ${
                      previewDevice === "mobile" ? "max-w-[320px]" : "w-full"
                    }`}
                  >
                    <div className="p-4 text-center text-white bg-zinc-950 border-b border-zinc-800">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{title}</p>
                      <h4 className="text-xs font-extrabold">{chapterTitle}</h4>
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
                      <p className="text-xs font-bold">End of Chapter {chapterNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REVIEW & LAUNCH */}
      {step === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
              Ready to Publish
            </span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              04 Review & Launch Story
            </h3>
            <p className="text-xs text-zinc-500">
              Confirm your metadata, reading format, and chapter details before releasing to the community
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
                <p className="text-xs text-zinc-400">By {user?.name || "Aria Thorne"}</p>
                <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">Chapters / Ep</p>
                <p className="font-bold text-white mt-0.5">
                  {isVisualMedium
                    ? `${pages.length} Pages`
                    : `${Object.values(novelChaptersMap).filter((d) => d.content && d.content.trim().length > 0).length || 1} Chapters`}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">{isVisualMedium ? "Panels" : "Total Words"}</p>
                <p className="font-bold text-white mt-0.5">
                  {isVisualMedium
                    ? `${pages.length} Panels`
                    : `${Object.values(novelChaptersMap).reduce((acc, d) => acc + (d.content ? d.content.trim().split(/\s+/).filter(Boolean).length : 0), 0).toLocaleString()} words`}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[10px] text-zinc-400">Status</p>
                <p className="font-bold text-emerald-400 mt-0.5">Ready to Sync</p>
              </div>
            </div>

            {!isVisualMedium && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-left">
                <p className="text-xs font-bold text-zinc-300">
                  Chapters to be written to Database:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {Object.entries({
                    ...novelChaptersMap,
                    [chapterNumber]: {
                      id: novelChaptersMap[chapterNumber]?.id,
                      title: chapterTitle || `Chapter ${chapterNumber}`,
                      content: chapterContent,
                    },
                  })
                    .filter(([_, data]) => data.content && data.content.trim().length > 0)
                    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
                    .map(([numStr, data]) => {
                      const words = data.content.trim().split(/\s+/).filter(Boolean).length;
                      return (
                        <div
                          key={numStr}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                        >
                          <span className="font-bold text-zinc-200">
                            Ch. {numStr}: {data.title}
                          </span>
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">
                            ✓ Ready ({words} words)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
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
              🎉 Your Work is Live on Yomika!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              &ldquo;{title}&rdquo; has been processed and published to the global story universe with full online web reader support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isVisualMedium && pages.length === 0 ? (
              <Link
                href={`/creator/upload?mode=ADD_CHAPTER&seriesId=${selectedSeriesId || slugify(title)}&type=COMIC`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Episode 1 in Studio</span>
              </Link>
            ) : (
              <Link
                href={isVisualMedium ? `/comics/${slugify(title)}` : `/novels/${slugify(title)}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Open Universal Web Reader
              </Link>
            )}

            <Link
              href={isVisualMedium ? `/comics/${slugify(title)}` : `/novels/${slugify(title)}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
            >
              View Series Page
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
                  onClick={() => {
                    if (step === 3) {
                      if (!isVisualMedium) {
                        setNovelChaptersMap((prev) => ({
                          ...prev,
                          [chapterNumber]: {
                            id: prev[chapterNumber]?.id,
                            title: chapterTitle || `Chapter ${chapterNumber}`,
                            content: chapterContent,
                          },
                        }));
                      } else if (pages.length === 0) {
                        const proceedAsTeaser = window.confirm(
                          "Notice: You haven't uploaded any episode panels yet.\n\nDo you want to proceed and register this series as an 'Announcement / Coming Soon Teaser'?"
                        );
                        if (!proceedAsTeaser) return;
                      }
                    }
                    setStep((prev) => Math.min(4, prev + 1) as typeof step);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 transform hover:scale-[1.02]"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPublishingToCloud}
                  onClick={handleCompletePublish}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {isPublishingToCloud ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{cloudPublishStatus || "Publishing to Supabase..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish to Supabase Cloud</span>
                    </>
                  )}
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
                  <p className="text-[11px] text-zinc-400">Smart premise generation for creators</p>
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
                  <span>Generating creative premise...</span>
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
                onClick={() => {
                  setDescription(aiGeneratedText);
                  setIsAiModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-md"
              >
                Apply to Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Panel Voice Dubbing Ingestion Modal */}
      {activeVoicePageIdx !== null && pages[activeVoicePageIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                  #{activeVoicePageIdx + 1}
                </div>
                <div>
                  <h3 className="font-black text-sm text-zinc-100">
                    Panel Voice Dubbing & Speech Bubble Script
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Add the character dialogues appearing on this manga page
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveVoicePageIdx(null)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
              {/* Left: Panel Preview */}
              <div className="md:col-span-5 aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                <img
                  src={pages[activeVoicePageIdx].url}
                  alt={`Panel ${activeVoicePageIdx + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right: Dialogue Lines */}
              <div className="md:col-span-7 space-y-3 overflow-y-auto pr-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {(pages[activeVoicePageIdx].dialogueLines || []).map((line, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={line.speaker}
                          onChange={(e) => {
                            const updated = [...pages];
                            if (updated[activeVoicePageIdx].dialogueLines) {
                              updated[activeVoicePageIdx].dialogueLines![dIdx].speaker =
                                e.target.value;
                              setPages(updated);
                            }
                          }}
                          placeholder="Speaker (e.g. Hero, Ren)"
                          className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500 w-32"
                        />

                        <select
                          value={line.role}
                          onChange={(e) => {
                            const updated = [...pages];
                            if (updated[activeVoicePageIdx].dialogueLines) {
                              updated[activeVoicePageIdx].dialogueLines![dIdx].role = e
                                .target.value as any;
                              setPages(updated);
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="HERO">Hero (Male Voice)</option>
                          <option value="HEROINE">Heroine (Female Voice)</option>
                          <option value="VILLAIN">Villain (Deep Voice)</option>
                          <option value="NARRATOR">Narrator</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...pages];
                            if (updated[activeVoicePageIdx].dialogueLines) {
                              updated[activeVoicePageIdx].dialogueLines = updated[
                                activeVoicePageIdx
                              ].dialogueLines!.filter((_, i) => i !== dIdx);
                              setPages(updated);
                            }
                          }}
                          className="text-zinc-500 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={line.text}
                        onChange={(e) => {
                          const updated = [...pages];
                          if (updated[activeVoicePageIdx].dialogueLines) {
                            updated[activeVoicePageIdx].dialogueLines![dIdx].text =
                              e.target.value;
                            setPages(updated);
                          }
                        }}
                        placeholder="Enter speech bubble dialogue text..."
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  ))}

                  {(!pages[activeVoicePageIdx].dialogueLines ||
                    pages[activeVoicePageIdx].dialogueLines!.length === 0) && (
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center space-y-2">
                      <Mic className="w-6 h-6 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400 font-medium">
                        No voice lines added for this panel yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...pages];
                      const currentLines =
                        updated[activeVoicePageIdx].dialogueLines || [];
                      updated[activeVoicePageIdx].dialogueLines = [
                        ...currentLines,
                        {
                          speaker: "Speaker",
                          role: "HERO",
                          text: "Speech bubble dialogue text...",
                        },
                      ];
                      setPages(updated);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVoicePageIdx(null)}
                    className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 font-bold text-xs text-white shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Import Confirmation Modal */}
      {isDocImportModalOpen && docImportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-zinc-100">
                    Manuscript Analyzed Successfully!
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    File: <strong className="text-zinc-200">{docImportResult.fileName}</strong> • {docImportResult.totalWords.toLocaleString()} Words
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDocImportModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <p className="font-bold text-zinc-300">
                  Detected {docImportResult.chapters.length} Chapters:
                </p>
                <span className="text-[11px] text-zinc-500">Auto-numbered in sequence</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {docImportResult.chapters.map((ch) => (
                  <div
                    key={ch.chapterNumber}
                    className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 max-w-[320px]">
                      <p className="font-bold text-zinc-100 truncate">{ch.title}</p>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">
                        {ch.content.slice(0, 90)}...
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-zinc-800 text-emerald-400 font-mono text-[11px] font-bold flex-shrink-0">
                      {ch.wordCount.toLocaleString()} words
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDocImportModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>

              {Object.keys(novelChaptersMap).some((k) => novelChaptersMap[Number(k)]?.content?.trim()) && (
                <button
                  type="button"
                  onClick={() => applyImportedChapters("APPEND")}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-xs font-bold transition cursor-pointer"
                >
                  Append As New Chapters
                </button>
              )}

              <button
                type="button"
                onClick={() => applyImportedChapters("REPLACE")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                Load {docImportResult.chapters.length} Chapters to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
