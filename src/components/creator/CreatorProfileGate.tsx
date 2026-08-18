"use client";

import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Lock,
  Unlock,
  Globe,
  Tag,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  ExternalLink,
  Layers,
  FileCheck,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";
import { UserProfile } from "@/lib/types";
import { compressImageToWebP, validateImageFile } from "@/lib/image-processing";

const ALL_GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Cyberpunk",
  "Action",
  "Romance",
  "Mystery",
  "Supernatural",
  "Slice of Life",
];

const ALL_TYPES = [
  "NOVEL",
  "WEBTOON",
  "MANGA",
  "COMIC",
  "ILLUSTRATED_NOVEL",
];

interface CreatorProfileGateProps {
  onProfileCompleted?: () => void;
}

export function CreatorProfileGate({ onProfileCompleted }: CreatorProfileGateProps) {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(true);
  const [showLegalModal, setShowLegalModal] = useState<string | null>(null);

  // Form State initialized from authenticated user
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [country, setCountry] = useState(user?.country || "United States");
  const [primaryGenres, setPrimaryGenres] = useState<string[]>(
    user?.primaryGenres?.length ? user.primaryGenres : ["Fantasy", "Sci-Fi"]
  );
  const [preferredTypes, setPreferredTypes] = useState<string[]>(
    user?.preferredTypes?.length ? user.preferredTypes : ["NOVEL", "WEBTOON"]
  );
  const [agreedToTerms, setAgreedToTerms] = useState(user?.agreedToCreatorTerms || false);
  const [avatarError, setAvatarError] = useState(false);

  // Derive initials for professional avatar fallback
  const initials = useMemo(() => {
    const displayName = (name || user?.name || "Creator").trim();
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || "CR";
  }, [name, user?.name]);

  // Real-time calculation of dynamic completion checks
  const checks = useMemo(() => {
    return {
      name: name.trim().length >= 2,
      username: username.trim().length >= 3,
      bio: bio.trim().length >= 20,
      country: country.trim().length > 0,
      primaryGenres: primaryGenres.length > 0,
      preferredTypes: preferredTypes.length > 0,
      terms: Boolean(agreedToTerms),
    };
  }, [name, username, bio, country, primaryGenres, preferredTypes, agreedToTerms]);

  const completedCount = useMemo(() => {
    return Object.values(checks).filter(Boolean).length;
  }, [checks]);

  const totalRequired = 7;
  const completionPercentage = Math.round((completedCount / totalRequired) * 100);
  const is100PercentComplete = completionPercentage === 100;

  const toggleGenre = (genre: string) => {
    setPrimaryGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleType = (type: string) => {
    setPreferredTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const avatarFileRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, { maxSizeBytes: 8 * 1024 * 1024 });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const result = await compressImageToWebP(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.9,
      });

      const updated = dataStore.updateUserProfile(user.id, {
        avatar: result.dataUrl,
      });

      updateProfile(updated);
      setAvatarError(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process image. Please try another file.");
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!agreedToTerms) {
      alert("Please accept the Creator Agreement & Publishing Rights to continue.");
      return;
    }

    // Determine avatar URL: use user's existing authenticated photo or reliable fallback
    const resolvedAvatar =
      user.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name.trim() || username.trim()
      )}&backgroundColor=e11d48,4f46e5&textColor=ffffff`;

    const updated = dataStore.updateUserProfile(user.id, {
      username: username.trim().toLowerCase(),
      name: name.trim(),
      avatar: resolvedAvatar,
      bio: bio.trim(),
      country: country.trim(),
      preferredTypes,
      primaryGenres,
      agreedToCreatorTerms: true,
      role: "CREATOR",
    });

    // Update session user in AuthContext
    updateProfile(updated);

    if (is100PercentComplete) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      if (onProfileCompleted) {
        onProfileCompleted();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. TOP CREATOR IDENTITY & AVATAR CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar Display with Custom Photo Upload */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-rose-500/30 shadow-2xl bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl relative">
              {user?.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt={name || "Creator Avatar"}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}

              {/* Upload Hover Overlay */}
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1 text-white backdrop-blur-xs cursor-pointer"
                title="Upload Custom Profile Picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-rose-400" />
                    <span className="text-[9px] font-bold">Change Photo</span>
                  </>
                )}
              </button>
            </div>

            {/* Hidden Avatar File Input */}
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-zinc-900 text-rose-400 border border-zinc-700 shadow-md z-10">
              Creator
            </div>
          </div>

          {/* Identity Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 truncate">
                {name || user?.name || "New Storyteller"}
              </h2>
              <span className="text-xs font-mono font-bold text-zinc-400">
                @{username || user?.username || "creator"}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {user?.avatar && !avatarError
                ? "Custom profile photo active. Click image or change photo below to upload a new one."
                : "Default creator identity active. You can upload a custom profile picture anytime."}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition flex items-center gap-1.5"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>{isUploadingAvatar ? "Processing..." : "Upload Custom Avatar"}</span>
              </button>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition ${
                  is100PercentComplete
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {is100PercentComplete ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Publishing Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Publishing Locked</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS BAR & ONBOARDING HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                Complete Your Creator Profile
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  is100PercentComplete
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {completionPercentage}% Complete
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Complete your creator profile to unlock publishing, creator analytics, monetization features, and community tools.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition self-start sm:self-auto flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{isEditing ? "View Checklist" : "Edit Profile Details"}</span>
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-700 dark:text-zinc-300">Creator Profile</span>
            <span className={is100PercentComplete ? "text-emerald-500" : "text-amber-500"}>
              {completionPercentage}% Complete ({completedCount}/{totalRequired} fields)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                is100PercentComplete
                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                  : "bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Dynamic Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.name
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.name ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Display Name</span>
              <p className="text-[10px] font-normal text-zinc-500 truncate">
                {name || "Not entered"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.username
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.username ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Unique Creator Username</span>
              <p className="text-[10px] font-normal text-zinc-500 truncate">
                @{username || "not_set"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.bio
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.bio ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Creator Bio (min. 20 chars)</span>
              <p className="text-[10px] font-normal text-zinc-500">
                {bio ? `${bio.length}/20 chars entered` : "0/20 characters"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.country
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.country ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Country / Region</span>
              <p className="text-[10px] font-normal text-zinc-500 truncate">
                {country || "Not specified"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.primaryGenres
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.primaryGenres ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Primary Genres</span>
              <p className="text-[10px] font-normal text-zinc-500 truncate">
                {primaryGenres.length > 0 ? primaryGenres.join(", ") : "None selected"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
              checks.preferredTypes
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.preferredTypes ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Preferred Content Types</span>
              <p className="text-[10px] font-normal text-zinc-500 truncate">
                {preferredTypes.length > 0 ? preferredTypes.join(", ") : "None selected"}
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 sm:col-span-2 transition ${
              checks.terms
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
            }`}
          >
            {checks.terms ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <div className="min-w-0 text-xs font-bold">
              <span>Creator Agreement & Publishing Rights</span>
              <p className="text-[10px] font-normal text-zinc-500">
                {agreedToTerms ? "Accepted and verified" : "Pending agreement confirmation"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. FORM FIELDS */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Display Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aria Thorne"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Your public creator name shown to readers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Unique Creator Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="e.g. ariathorne"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Your unique public identity on Yumora.
                </p>
              </div>
            </div>

            {/* Creator Bio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Creator Bio *
                </label>
                <span
                  className={`text-[10px] font-semibold ${
                    bio.trim().length >= 20 ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {bio.trim().length}/20 min characters
                </span>
              </div>
              <textarea
                rows={3}
                required
                minLength={20}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell readers what you create and what kind of stories they can expect..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Tell readers what you create and what kind of stories they can expect.
              </p>
            </div>

            {/* Country / Region */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Country / Region *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States, Japan, Canada, Germany, India, United Kingdom"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Used to personalize your creator experience and support regional requirements.
              </p>
            </div>

            {/* Primary Genres */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Primary Genres * (Select at least 1)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      primaryGenres.includes(g)
                        ? "bg-rose-950/60 border-rose-500 text-rose-300 font-bold"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400">
                Choose the genres that best represent your work.
              </p>
            </div>

            {/* Preferred Content Types */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Preferred Content Types * (Select at least 1)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      preferredTypes.includes(t)
                        ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400">
                Select the formats you plan to publish.
              </p>
            </div>

            {/* Creator Agreement & Publishing Rights Checkbox */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="creator-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-rose-600 rounded cursor-pointer flex-shrink-0"
                  required
                />
                <div className="space-y-1">
                  <label
                    htmlFor="creator-terms"
                    className="text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    Creator Agreement & Publishing Rights
                  </label>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    I confirm that I have the necessary rights to publish the stories, characters, artwork, and other content I upload to Yumora. I agree to follow Yumora&apos;s{" "}
                    <button
                      type="button"
                      onClick={() => setShowLegalModal("terms")}
                      className="text-rose-500 hover:underline font-semibold inline"
                    >
                      Creator Terms
                    </button>
                    ,{" "}
                    <button
                      type="button"
                      onClick={() => setShowLegalModal("copyright")}
                      className="text-rose-500 hover:underline font-semibold inline"
                    >
                      Copyright Policy
                    </button>
                    , and{" "}
                    <button
                      type="button"
                      onClick={() => setShowLegalModal("guidelines")}
                      className="text-rose-500 hover:underline font-semibold inline"
                    >
                      Community Guidelines
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Lock Alert / Confirmation */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
                is100PercentComplete
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/20 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {is100PercentComplete ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <span>
                  {is100PercentComplete ? (
                    <strong>All requirements satisfied! Publishing will be unlocked immediately upon saving.</strong>
                  ) : (
                    <span>
                      Complete all required profile information and accept the Creator Agreement to unlock publishing.
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Dynamic Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                  is100PercentComplete
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 transform hover:scale-[1.02]"
                    : "bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/25"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {is100PercentComplete
                    ? "Complete Profile & Unlock Publishing"
                    : "Save Progress"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Legal Modal Popup for Creator Terms / Copyright / Guidelines */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-rose-500" />
                <h4 className="font-bold text-base">
                  {showLegalModal === "terms" && "Yumora Creator Terms"}
                  {showLegalModal === "copyright" && "Copyright & Ownership Policy"}
                  {showLegalModal === "guidelines" && "Community Content Guidelines"}
                </h4>
              </div>
              <button
                onClick={() => setShowLegalModal(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-3 leading-relaxed max-h-72 overflow-y-auto pr-1">
              {showLegalModal === "terms" && (
                <>
                  <p>
                    <strong>1. 100% Creator Ownership:</strong> You retain 100% full intellectual property ownership and copyright of all stories, characters, universe settings, and artwork you upload to Yumora.
                  </p>
                  <p>
                    <strong>2. Non-Exclusive License:</strong> You grant Yumora a non-exclusive license solely to host, display, index, format, and distribute your serialized work to readers on our web platform.
                  </p>
                  <p>
                    <strong>3. Commercial Freedom:</strong> You are free to publish your stories elsewhere, print physical copies, or sign adaptation deals with third parties at any time.
                  </p>
                </>
              )}

              {showLegalModal === "copyright" && (
                <>
                  <p>
                    <strong>1. Original Works Only:</strong> You represent and warrant that you hold all necessary copyrights or permissions for all text and illustrations you publish.
                  </p>
                  <p>
                    <strong>2. DMCA & Takedown Compliance:</strong> Yumora respects copyright owners and will remove any infringing content upon receiving valid notice under applicable laws.
                  </p>
                </>
              )}

              {showLegalModal === "guidelines" && (
                <>
                  <p>
                    <strong>1. Respectful Storytelling:</strong> Do not upload content promoting hate speech, harassment, or non-consensual exploitation.
                  </p>
                  <p>
                    <strong>2. Accurate Content Ratings:</strong> Label mature, intense, or violent themes accurately with our Content Warning & Age Rating selectors during story creation.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLegalModal(null)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
