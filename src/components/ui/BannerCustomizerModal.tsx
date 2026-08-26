"use client";

import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Upload,
  Sparkles,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Palette,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { compressImageToWebP, validateImageFile } from "@/lib/image-processing";

export interface BannerPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
}

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "preset-1",
    name: "Cyberpunk Neo-Tokyo",
    category: "Cyberpunk / Sci-Fi",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85",
    description: "Vibrant neon lights, futuristic cityscape & electric purple ambient",
  },
  {
    id: "preset-2",
    name: "Sakura Twilight Shrine",
    category: "Anime & Nature",
    url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1600&auto=format&fit=crop&q=85",
    description: "Soft cherry blossoms falling over ancient Japanese temple under twilight",
  },
  {
    id: "preset-3",
    name: "Dark Fantasy Citadel",
    category: "Epic Fantasy",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
    description: "Mystical floating islands, glowing runes & crimson clouds",
  },
  {
    id: "preset-4",
    name: "Celestial Aurora Cosmos",
    category: "Sci-Fi / Space",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=85",
    description: "Starlight nebulas, deep galactic wonders and crystal auroras",
  },
  {
    id: "preset-5",
    name: "Neon Alleyway Rain",
    category: "Urban / Manga",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=85",
    description: "Atmospheric rainy night in Shinjuku with reflective streets",
  },
  {
    id: "preset-6",
    name: "Wuxia Misty Peaks",
    category: "Wuxia / Cultivation",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=85",
    description: "Towering ethereal mountain summits cloaked in eternal mist",
  },
  {
    id: "preset-7",
    name: "Golden Sunset Horizon",
    category: "Romance / Drama",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=85",
    description: "Warm golden hour glow over calm anime sea waves",
  },
  {
    id: "preset-8",
    name: "Manga Inking Studio",
    category: "Artistic / Creator",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85",
    description: "Abstract fluid inks, geometric strokes & creative flow",
  },
];

interface BannerCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBanner?: string;
  onSaveBanner: (newBannerUrl: string) => Promise<void> | void;
}

export function BannerCustomizerModal({
  isOpen,
  onClose,
  currentBanner,
  onSaveBanner,
}: BannerCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "url">("presets");
  const [selectedBannerUrl, setSelectedBannerUrl] = useState<string>(
    currentBanner || BANNER_PRESETS[0].url
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const validation = validateImageFile(file, { maxSizeBytes: 10 * 1024 * 1024 });
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid image file");
      return;
    }

    try {
      setIsProcessingFile(true);
      const result = await compressImageToWebP(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.88,
      });
      setSelectedBannerUrl(result.dataUrl);
    } catch {
      setErrorMessage("Failed to process image. Please try another file.");
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) {
      setErrorMessage("Please enter a valid image URL");
      return;
    }
    setErrorMessage(null);
    setSelectedBannerUrl(customUrlInput.trim());
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveBanner(selectedBannerUrl);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      onClose();
    } catch {
      setErrorMessage("Failed to save banner. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#18181B] text-zinc-100 border border-zinc-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Customize Profile Banner</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] uppercase font-bold tracking-wider">
                  HD
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize your profile header with high-resolution artwork or presets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="px-6 pt-5 pb-3 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>Live Banner Preview</span>
            </span>
            <span className="text-[11px] text-zinc-500">Recommended ratio 16:9 or 3:1</span>
          </div>

          <div className="relative h-36 sm:h-44 w-full rounded-2xl overflow-hidden border border-zinc-700/80 bg-zinc-900 group shadow-inner">
            <img
              src={selectedBannerUrl}
              alt="Banner Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20" />
            
            {/* Simulated Avatar Overlay */}
            <div className="absolute bottom-3 left-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border-2 border-rose-500 p-0.5 shadow-xl flex items-center justify-center text-white font-bold text-sm">
                <span>YOU</span>
              </div>
              <div className="text-white drop-shadow-md">
                <p className="text-xs font-black">Your Profile Header</p>
                <p className="text-[10px] text-zinc-300">Banner updates instantly across Yomika</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "presets"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Presets ({BANNER_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "upload"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload From Device</span>
          </button>

          <button
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "url"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: PRESET GALLERY */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BANNER_PRESETS.map((preset) => {
                const isSelected = selectedBannerUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSelectedBannerUrl(preset.url);
                    }}
                    className={`relative rounded-2xl overflow-hidden border text-left group transition duration-200 ${
                      isSelected
                        ? "border-rose-500 ring-2 ring-rose-500/50 shadow-lg scale-[1.02]"
                        : "border-zinc-800 hover:border-zinc-600 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="h-24 w-full relative bg-zinc-900">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-rose-500 text-white shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-zinc-900">
                      <p className="text-[11px] font-bold text-white truncate">{preset.name}</p>
                      <p className="text-[9px] text-rose-400 font-medium truncate">{preset.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-rose-500 rounded-3xl p-8 text-center cursor-pointer transition bg-zinc-900/40 hover:bg-rose-500/5 group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 group-hover:bg-rose-500/20 text-zinc-400 group-hover:text-rose-400 transition flex items-center justify-center">
                  {isProcessingFile ? (
                    <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-rose-400 transition">
                    Click to browse or drop your banner image
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports PNG, JPG, WEBP up to 10MB. Automatically optimized for fast loading.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === "url" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300">
                Direct Image Link (HTTPS)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or your CDN link"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Ensure the image link is publicly accessible via HTTPS.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Banner...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply & Save Banner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
