"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ReaderSettings, ReadingProgress } from "../lib/types";
import { dataStore } from "../lib/data/store";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase/client";

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "dark",
  fontFamily: "serif",
  fontSize: 18,
  lineHeight: 1.8,
  maxWidth: "standard",
  autoScrollSpeed: 0,
};

interface ReaderContextType {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
  saveProgress: (contentId: string, chapterNumber: number, progressPercentage: number) => void;
  getProgress: (contentId: string) => ReadingProgress | undefined;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("yumora_reader_settings");
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {
      // fallback to default
    }
    setMounted(true);
  }, []);

  // On user login, load their reading progress from Supabase into local store
  useEffect(() => {
    if (!user?.id || !mounted) return;

    const syncProgressFromDB = async () => {
      try {
        const { data: rows } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (rows && rows.length > 0) {
          const currentMap = dataStore.getReadingProgressMap();
          rows.forEach((row: any) => {
            const contentId = row.novel_id || row.comic_id;
            if (!contentId) return;
            const local = currentMap[contentId];
            const dbLastRead = new Date(row.updated_at || "").getTime();
            const localLastRead = local ? new Date(local.lastReadAt || "").getTime() : 0;

            // Only update if DB version is newer or doesn't exist locally
            if (!local || dbLastRead >= localLastRead) {
              currentMap[contentId] = {
                ...(local || {}),
                contentId,
                userId: row.user_id,
                contentType: row.novel_id ? "NOVEL" : "COMIC",
                chapterNumber: row.chapter_number || 1,
                episodeNumber: row.episode_number,
                progressPercentage: row.percentage || 0,
                scrollOffset: row.scroll_position || 0,
                pageIndex: 0,
                lastReadAt: row.updated_at || new Date().toISOString(),
              };
            }
          });
          try {
            localStorage.setItem("yumora_reading_progress", JSON.stringify(currentMap));
          } catch { /* ignore */ }
        }
      } catch (e) {
        console.warn("Reading progress DB sync error:", e);
      }
    };

    syncProgressFromDB();
  }, [user?.id, mounted]);

  const updateSettings = (partial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (typeof window !== "undefined") {
        localStorage.setItem("yumora_reader_settings", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      localStorage.setItem("yumora_reader_settings", JSON.stringify(DEFAULT_SETTINGS));
    }
  };

  const saveProgress = (
    contentId: string,
    chapterNumber: number,
    progressPercentage: number,
    metadata?: {
      contentTitle?: string;
      contentSlug?: string;
      coverUrl?: string;
      creatorName?: string;
      episodeTitle?: string;
      totalUnits?: number;
      contentType?: "NOVEL" | "COMIC";
    }
  ) => {
    const novel = dataStore.getNovelById(contentId) || dataStore.getNovelBySlug(contentId);
    const comic = dataStore.getComicById(contentId) || dataStore.getComicBySlug(contentId);

    const title = metadata?.contentTitle || novel?.title || comic?.title;
    const slug = metadata?.contentSlug || novel?.slug || comic?.slug;
    const cover = metadata?.coverUrl || novel?.coverUrl || comic?.coverUrl;
    const creator = metadata?.creatorName || novel?.creator.name || comic?.creator.name;
    const total = metadata?.totalUnits || novel?.chapters.length || comic?.episodes.length;
    const type = metadata?.contentType || (comic ? "COMIC" : "NOVEL");

    // Save with userId so it syncs to Supabase
    dataStore.saveReadingProgress({
      contentId,
      userId: user?.id,
      contentType: type,
      contentTitle: title,
      contentSlug: slug,
      coverUrl: cover,
      creatorName: creator,
      episodeTitle: metadata?.episodeTitle || (type === "NOVEL" ? `Chapter ${chapterNumber}` : `Episode ${chapterNumber}`),
      chapterNumber,
      progressPercentage,
      totalUnits: total,
      lastReadAt: new Date().toISOString(),
    });
  };

  const getProgress = (contentId: string) => {
    return dataStore.getReadingProgress(contentId);
  };

  return (
    <ReaderContext.Provider
      value={{
        settings: mounted ? settings : DEFAULT_SETTINGS,
        updateSettings,
        resetSettings,
        saveProgress,
        getProgress,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return context;
}
