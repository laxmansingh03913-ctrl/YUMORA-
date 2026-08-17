"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  ShieldAlert,
  CheckCircle2,
  Circle,
  User,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Unlock,
  Upload,
  Globe,
  Tag,
  BookOpen,
  MoveVertical,
  Layers,
  FileType,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";
import { UserProfile } from "@/lib/types";

const ALL_GENRES = ["Fantasy", "Sci-Fi", "Cyberpunk", "Action", "Romance", "Mystery", "Supernatural", "Slice of Life"];
const ALL_TYPES = ["NOVEL", "WEBTOON", "MANGA", "COMIC", "ILLUSTRATED_NOVEL"];

interface CreatorProfileGateProps {
  onProfileCompleted?: () => void;
}

export function CreatorProfileGate({ onProfileCompleted }: CreatorProfileGateProps) {
  const { user, updateProfile } = useAuth();

  // Current completion data
  const completion = dataStore.calculateProfileCompletion(user || undefined);

  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [username, setUsername] = useState(user?.username || "");
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(
    user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
  );
  const [bio, setBio] = useState(user?.bio || "");
  const [country, setCountry] = useState(user?.country || "United States");
  const [preferredTypes, setPreferredTypes] = useState<string[]>(
    user?.preferredTypes?.length ? user.preferredTypes : ["NOVEL", "WEBTOON"]
  );
  const [primaryGenres, setPrimaryGenres] = useState<string[]>(
    user?.primaryGenres?.length ? user.primaryGenres : ["Fantasy", "Sci-Fi"]
  );
  const [agreedToTerms, setAgreedToTerms] = useState(user?.agreedToCreatorTerms || false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!agreedToTerms) {
      alert("Please agree to the Creator Publishing Terms to complete your profile.");
      return;
    }

    const updated = dataStore.updateUserProfile(user.id, {
      username: username.trim(),
      name: name.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
      country: country.trim(),
      preferredTypes,
      primaryGenres,
      agreedToCreatorTerms: true,
      role: "CREATOR",
    });

    // Update session user in AuthContext
    updateProfile(updated);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setIsEditing(false);
    if (onProfileCompleted) onProfileCompleted();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Complete Your Creator Profile
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                Publishing Locked
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Yumora requires a 100% complete creator profile to maintain platform quality & creator accountability
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>{isEditing ? "View Checklist" : "Complete Profile"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-zinc-700 dark:text-zinc-300">Profile Completion Status</span>
          <span className={`${completion.percentage === 100 ? "text-emerald-500" : "text-amber-500"}`}>
            {completion.percentage}% Complete
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completion.percentage === 100
                ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                : "bg-gradient-to-r from-amber-500 to-rose-500"
            }`}
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
      </div>

      {/* VIEW 1: CHECKLIST */}
      {!isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.username
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.username ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Unique Creator Username</span>
                <p className="text-[10px] font-normal text-zinc-500">@{user?.username || "not set"}</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.name
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.name ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Display Name</span>
                <p className="text-[10px] font-normal text-zinc-500">{user?.name || "not set"}</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.avatar
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.avatar ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Profile Picture / Avatar</span>
                <p className="text-[10px] font-normal text-zinc-500">High-resolution creator avatar</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.bio
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.bio ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Creator Bio (min. 20 chars)</span>
                <p className="text-[10px] font-normal text-zinc-500">
                  {user?.bio ? `${user.bio.substring(0, 30)}...` : "not set"}
                </p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.country
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.country ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Country / Region</span>
                <p className="text-[10px] font-normal text-zinc-500">{user?.country || "not set"}</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                completion.checks.preferences
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.preferences ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Genres & Medium Preferences</span>
                <p className="text-[10px] font-normal text-zinc-500">Primary storytelling genres</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 sm:col-span-2 transition ${
                completion.checks.terms
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              {completion.checks.terms ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <div className="min-w-0 text-xs font-bold">
                <span>Creator Terms & Publishing Rights Agreement</span>
                <p className="text-[10px] font-normal text-zinc-500">
                  Intellectual property rights & creator conduct guidelines
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                Missing <strong>{completion.missingFields.length}</strong> required items to unlock Creator Studio.
              </span>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition flex-shrink-0"
            >
              Complete Now
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: EDITING / COMPLETION FORM */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in">
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
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Unique Creator Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="e.g. ariathorne"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Profile Picture / Avatar URL *
            </label>
            <div className="flex gap-3 items-center">
              <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-zinc-700 flex-shrink-0" />
              <input
                type="text"
                required
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Creator Bio * (min. 20 chars)
            </label>
            <textarea
              rows={3}
              required
              minLength={20}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about your storytelling background, inspirations, and favorite themes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Country / Region *
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Japan, Canada, United States, Germany, India"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Primary Storytelling Genres */}
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
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Mediums */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Preferred Content Types
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
          </div>

          {/* Creator Terms Agreement */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 accent-indigo-600 rounded"
              required
            />
            <label htmlFor="terms" className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed cursor-pointer">
              <strong>Creator Agreement & Publishing Rights Confirmation:</strong> I confirm that I hold full legal publishing rights for all stories, characters, and artwork I publish on Yumora, and agree to abide by community content guidelines.
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              Save Profile & Unlock Studio
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
