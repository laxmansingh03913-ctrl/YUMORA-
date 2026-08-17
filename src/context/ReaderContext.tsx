"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ReaderSettings, ReadingProgress } from "../lib/types";
import { dataStore } from "../lib/data/store";

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

  const saveProgress = (contentId: string, chapterNumber: number, progressPercentage: number) => {
    dataStore.saveReadingProgress({
      contentId,
      contentType: "NOVEL",
      chapterNumber,
      progressPercentage,
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
