"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Globe,
  UserPlus,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Heart,
  Share2,
  Bell,
  BellOff,
  Users,
  Eye,
  Info,
  ChevronDown,
  X,
  Search,
  Check,
  Sliders,
  Bookmark,
  Layers,
  Flame,
  Calendar,
  Edit3,
  PenTool,
  Copy,
  ExternalLink,
  ShieldCheck,
  Camera,
  Upload,
  Loader2,
  MessageSquare,
  Send,
  Coins,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { formatNumber, formatDate } from "@/lib/utils";
import { NotificationPreferences, UserProfile, Novel, Comic, Comment } from "@/lib/types";
import { compressImageToWebP, validateImageFile } from "@/lib/image-processing";
import { TipCreatorModal } from "@/components/ui/TipCreatorModal";
import { CoinShopModal } from "@/components/ui/CoinShopModal";
import { dbService } from "@/lib/supabase/db";

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

interface CreatorProfileProps {
  params: Promise<{ username: string }>;
}

export default function CreatorProfilePage({ params }: CreatorProfileProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { user, isAuthenticated, openAuthModal, updateProfile } = useAuth();

  // Find creator from dataStore or fallback to authenticated user
  const [asyncCreator, setAsyncCreator] = useState<UserProfile | null>(() => {
    const fromStore = dataStore.getUserByUsername(username) || dataStore.getUserById(username);
    if (fromStore) return fromStore;
    if (
      user &&
      (user.username.toLowerCase() === username.toLowerCase() ||
        user.id === username)
    ) {
      return user;
    }
    return null;
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!asyncCreator);

  // Sync / Fetch profile from Supabase Database if not found locally
  useEffect(() => {
    let isMounted = true;

    const fetchCreatorProfile = async () => {
      // 1. Check if already in local store
      const local = dataStore.getUserByUsername(username) || dataStore.getUserById(username);
      if (local) {
        if (isMounted) {
          setAsyncCreator(local);
          setIsLoadingProfile(false);
        }
        return;
      }

      // 2. Check current authenticated user
      if (
        user &&
        (user.username.toLowerCase() === username.toLowerCase() ||
          user.id === username)
      ) {
        if (isMounted) {
          setAsyncCreator(user);
          setIsLoadingProfile(false);
        }
        return;
      }

      // 3. Query Supabase profiles table directly across all accounts / browsers
      try {
        const cloud = await dbService.getProfileByUsername(username);
        if (cloud && isMounted) {
          dataStore.updateUserProfile(cloud.id, cloud);
          setAsyncCreator(cloud);
        }
      } catch (e) {
        console.warn("Supabase fetch profile error:", e);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchCreatorProfile();
    return () => {
      isMounted = false;
    };
  }, [username, user]);

  const creator = asyncCreator;

  // Self check
  const isSelf = Boolean(user && creator && (user.id === creator.id || user.username.toLowerCase() === creator.username.toLowerCase()));

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(creator?.followersCount || 0);
  const [followingCount, setFollowingCount] = useState(creator?.followingCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowDropdown, setShowFollowDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Edit Profile Modal for Self
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(creator?.name || "");
  const [editBio, setEditBio] = useState(creator?.bio || "");
  const [editCountry, setEditCountry] = useState(creator?.country || "United States");
  const [editWebsite, setEditWebsite] = useState(creator?.website || "");
  const [editTwitter, setEditTwitter] = useState(creator?.twitter || "");
  const [editGenres, setEditGenres] = useState<string[]>(creator?.primaryGenres || ["Fantasy", "Sci-Fi"]);

  // Tabs: all, novels, webtoons, comics, about, feedback
  const [activeTab, setActiveTab] = useState<"all" | "novels" | "webtoons" | "comics" | "about" | "feedback">("all");
  const [creatorFeedback, setCreatorFeedback] = useState<Comment[]>(() => (creator ? dataStore.getComments(creator.id) : []));
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);

  // Followers & Following Modal
  const [listModalType, setListModalType] = useState<"followers" | "following" | null>(null);
  const [listSearchQuery, setListSearchQuery] = useState("");

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState<NotificationPreferences>({
    newChapters: true,
    newStories: true,
    newComics: true,
    announcements: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync state when creator or user changes
  useEffect(() => {
    if (creator) {
      setFollowersCount(dataStore.getFollowerCount(creator.id) || creator.followersCount || 0);
      setFollowingCount(creator.followingCount || dataStore.getFollowingCount(creator.id) || 0);
      setEditName(creator.name);
      setEditBio(creator.bio || "");
      setEditCountry(creator.country || "United States");
      setEditWebsite(creator.website || "");
      setEditTwitter(creator.twitter || "");
      setEditGenres(creator.primaryGenres || ["Fantasy", "Sci-Fi"]);

      if (user && !isSelf) {
        const isUserFollowing = dataStore.isFollowingCreator(user.id, creator.id);
        setIsFollowing(isUserFollowing);
        const relation = dataStore.getFollowRelationship(user.id, creator.id);
        if (relation) {
          setNotificationsEnabled(relation.notificationsEnabled ?? true);
          if (relation.preferences) setNotifPreferences(relation.preferences);
        }
      }
    }
  }, [creator, user, isSelf]);

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Derive Initials for avatar fallback
  const initials = useMemo(() => {
    const displayName = (creator?.name || "Storyteller").trim();
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || "CR";
  }, [creator?.name]);

  if (isLoadingProfile && !creator) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D91E18] animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Loading creator profile...</p>
          <p className="text-xs text-zinc-400 font-mono">@{username}</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            Creator Profile Not Found
          </h2>
          <p className="text-xs text-zinc-500">
            The profile for <span className="font-mono text-rose-500">@{username}</span> does not exist or has not been published yet.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => openAuthModal("signup", `/creator/${username}`)}
            className="px-5 py-2.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Claim @{username} or Sign In
          </button>
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition"
          >
            Discover Stories
          </Link>
        </div>
      </div>
    );
  }

  // Real Public Content (Approved & Published only)
  const creatorNovels = dataStore
    .getNovels()
    .filter((n) => n.creatorId === creator.id && n.status !== "DRAFT");
  const creatorComics = dataStore
    .getComics()
    .filter((c) => c.creatorId === creator.id && c.status !== "DRAFT");

  const webtoonsList = creatorComics.filter(
    (c) => c.subType === "WEBTOON" || c.format === "VERTICAL"
  );
  const westernComicsList = creatorComics.filter(
    (c) => c.subType !== "WEBTOON" && c.format !== "VERTICAL"
  );
  const totalWorks = creatorNovels.length + creatorComics.length;

  // Real Public Statistics
  const totalPublicReads =
    creatorNovels.reduce((acc, n) => acc + n.reads, 0) +
    creatorComics.reduce((acc, c) => acc + c.reads, 0) ||
    creator.totalReads ||
    0;
  const totalPublicLikes =
    creatorNovels.reduce((acc, n) => acc + n.likesCount, 0) +
    creatorComics.reduce(
      (acc, c) =>
        acc +
        (c.likesCount ||
          c.episodes?.reduce((eAcc, ep) => eAcc + (ep.likesCount || 0), 0) ||
          0),
      0
    );

  // Followers & Following Lists
  const followersList = dataStore.getFollowers(creator.id);
  const followingList = dataStore.getFollowing(creator.id);

  // Follow Toggle with Optimistic UI & Error Rollback
  const handleFollowAction = () => {
    if (!isAuthenticated || !user) {
      openAuthModal();
      return;
    }
    if (isSelf) return;

    if (isFollowLoading) return;
    setIsFollowLoading(true);

    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    if (prevFollowing) {
      // Optimistic Unfollow
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
      setShowFollowDropdown(false);

      const res = dataStore.unfollowCreator(user.id, creator.id);
      if (!res.success) {
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        showToast(res.error || "Failed to unfollow creator");
      } else {
        showToast(`Unfollowed @${creator.username}`);
      }
    } else {
      // Optimistic Follow
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);

      const res = dataStore.followCreator(user.id, creator.id, notifPreferences);
      if (!res.success) {
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        showToast(res.error || "Failed to follow creator");
      } else {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
        showToast(`✓ Following @${creator.username}! Release notifications enabled.`);
      }
    }

    setTimeout(() => setIsFollowLoading(false), 300);
  };

  // Update Notification Preferences
  const handleSaveNotifPreferences = (
    newEnabled: boolean,
    newPrefs: NotificationPreferences
  ) => {
    if (!user) return;
    setNotificationsEnabled(newEnabled);
    setNotifPreferences(newPrefs);
    dataStore.updateFollowPreferences(user.id, creator.id, {
      notificationsEnabled: newEnabled,
      preferences: newPrefs,
    });
    setShowNotificationModal(false);
    setShowFollowDropdown(false);
    showToast(
      newEnabled
        ? "🔔 Notification settings updated"
        : "🔕 Notifications muted for this creator"
    );
  };

  // Share profile link
  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      } catch {
        // ignore
      }
      showToast("✓ Profile link copied to clipboard!");
    }
  };

  // Custom Avatar Upload for Self
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, { maxSizeBytes: 8 * 1024 * 1024 });
    if (!validation.valid) {
      showToast(`⚠️ ${validation.error}`);
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
      showToast("✓ Custom profile photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to process image. Please try another file.");
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save quick edits to public profile
  const handleSaveQuickProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated = dataStore.updateUserProfile(user.id, {
      name: editName.trim(),
      bio: editBio.trim(),
      country: editCountry.trim(),
      website: editWebsite.trim(),
      twitter: editTwitter.trim(),
      primaryGenres: editGenres,
    });

    updateProfile(updated);
    setIsEditModalOpen(false);
    showToast("✓ Public profile updated successfully!");
  };

  const handleAddCreatorFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;
    if (!user) {
      openAuthModal("signup", `/creator/${username}`);
      return;
    }
    if (!creator) return;

    const newComment: Comment = {
      id: `feedb-${Date.now()}`,
      userId: user.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      contentId: creator.id,
      contentType: "COMMUNITY_POST",
      text: newFeedbackText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    dataStore.addComment(newComment);
    setCreatorFeedback((prev) => [newComment, ...prev]);
    setNewFeedbackText("");
    showToast("✓ Message posted to creator's guestbook!");
  };

  // Filtered List for Modal Search
  const activeList = listModalType === "followers" ? followersList : followingList;
  const filteredList = activeList.filter((u) => {
    const q = listSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen pb-28 space-y-8 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CREATOR HERO BANNER */}
      <div className="relative">
        <div className="h-44 sm:h-56 md:h-64 w-full bg-gradient-to-r from-rose-950 via-zinc-900 to-indigo-950 overflow-hidden relative">
          <img
            src={
              creator.banner ||
              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80"
            }
            alt={creator.name}
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
        </div>

        {/* Profile Info Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAEAE5] dark:border-zinc-800">
            {/* Left: Floating Avatar + Name & Details (Safely on body canvas) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              <div className="-mt-14 sm:-mt-18 md:-mt-20 relative group flex-shrink-0 z-10">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden ring-4 ring-white dark:ring-[#121214] shadow-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl sm:text-4xl flex-shrink-0 relative">
                  {creator.avatar && !avatarError ? (
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}

                  {/* Upload Overlay for Self */}
                  {isSelf && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1 text-white backdrop-blur-xs cursor-pointer"
                      title="Upload Custom Profile Picture"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-rose-400" />
                          <span className="text-[10px] font-bold">Change Photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Hidden File Input for Avatar Upload */}
                {isSelf && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                )}

                {creator.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-zinc-950 ring-2 ring-white dark:ring-zinc-900 shadow-md z-10"
                    title="Verified Creator"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  </div>
                )}
              </div>

              {/* Text Information */}
              <div className="space-y-1.5 min-w-0 pt-1 sm:pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
                    {creator.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      creator.role === "ADMIN"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        : "bg-[#D91E18]/10 text-[#D91E18] border border-[#D91E18]/30"
                    }`}
                  >
                    {creator.role === "ADMIN" ? "Official Team" : "Verified Creator"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#555555] dark:text-zinc-400 font-medium">
                  <span className="font-bold text-[#111111] dark:text-zinc-200">
                    @{creator.username}
                  </span>

                  {creator.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D91E18]" />
                      <span>{creator.country}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Joined {creator.createdAt ? formatDate(creator.createdAt) : "Recently"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Follow / Edit / Share */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
              {isSelf ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-[#EAEAE5] dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D91E18]" />
                    <span>Edit Profile</span>
                  </button>

                  <Link
                    href="/creator"
                    className="px-4 py-2.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Studio Dashboard</span>
                  </Link>
                </>
              ) : (
                <div className="relative flex items-center flex-1 sm:flex-none">
                  {/* Main Follow / Following Button */}
                  <button
                    onClick={handleFollowAction}
                    disabled={isFollowLoading}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                      isFollowing
                        ? "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700"
                        : "bg-[#D91E18] hover:bg-[#B71813] text-white shadow-rose-600/20 transform hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>✓ Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>+ Follow Storyteller</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Options trigger when following */}
                  {isFollowing && (
                    <div className="relative">
                      <button
                        onClick={() => setShowFollowDropdown(!showFollowDropdown)}
                        className="ml-1.5 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                        title="Notification Settings"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {showFollowDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-30 space-y-1 animate-in fade-in">
                          <button
                            onClick={() => setShowNotificationModal(true)}
                            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800 flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              {notificationsEnabled ? (
                                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <BellOff className="w-3.5 h-3.5 text-zinc-500" />
                              )}
                              <span>
                                {notificationsEnabled
                                  ? "Notifications On"
                                  : "Notifications Off"}
                              </span>
                            </span>
                            <Sliders className="w-3 h-3 text-zinc-500" />
                          </button>

                          <button
                            onClick={handleFollowAction}
                            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Unfollow @{creator.username}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Tip Creator Button */}
                  {!isSelf && (
                    <button
                      onClick={() => setIsTipModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-amber-500/20 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                      title={`Send Coins Tip to ${creator.name}`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Tip Creator</span>
                    </button>
                  )}
                </div>
              )}

              {/* Share Profile Button */}
              <button
                onClick={handleShareProfile}
                className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#D91E18] hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-2xs"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Social Links */}
              {creator.website && (
                <a
                  href={creator.website.startsWith("http") ? creator.website : `https://${creator.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#D91E18] transition shadow-2xs"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}

              {creator.twitter && (
                <a
                  href={`https://twitter.com/${creator.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#D91E18] transition shadow-2xs flex items-center justify-center"
                  title="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Creator Bio Snippet */}
          {creator.bio && (
            <div className="pt-4 max-w-3xl">
              <p className="text-xs sm:text-sm text-[#444444] dark:text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
                {creator.bio}
              </p>
            </div>
          )}

          {/* 2. CREATOR PUBLIC STATISTICS STRIP */}
          <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-2xs">
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">
                {formatNumber(totalPublicReads)}
              </p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Total Reads
              </p>
            </div>

            <button
              onClick={() => {
                setListModalType("followers");
                setListSearchQuery("");
              }}
              className="space-y-0.5 p-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(followersCount)}
              </p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide flex items-center justify-center gap-1">
                <span>Followers</span>
                <span className="text-[9px] text-zinc-500">↗</span>
              </p>
            </button>

            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">
                {totalWorks}
              </p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Published Works
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-[#D91E18]">
                {formatNumber(totalPublicLikes)}
              </p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Story Likes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABBED WORKS & ABOUT CATALOG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
          {[
            { id: "all", label: `All Works (${totalWorks})`, icon: Layers },
            { id: "novels", label: `Novels (${creatorNovels.length})`, icon: BookOpen },
            { id: "webtoons", label: `Webtoons (${webtoonsList.length})`, icon: Sparkles },
            { id: "comics", label: `Comics (${westernComicsList.length})`, icon: ImageIcon },
            { id: "about", label: "About Storyteller", icon: Info },
            { id: "feedback", label: `Guestbook & Feedback (${creatorFeedback.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ALL WORKS */}
        {activeTab === "all" && (
          <div className="space-y-6">
            {totalWorks === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    No Stories Published Yet
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isSelf
                      ? "Start your storytelling journey by creating your first novel or comic in Creator Studio."
                      : "This creator hasn't published any public stories yet. Follow them to be notified upon release!"}
                  </p>
                </div>
                {isSelf && (
                  <Link
                    href="/creator/upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Create New Story</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {creatorNovels.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      <span>Serialized Novels ({creatorNovels.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {creatorNovels.map((novel) => (
                        <NovelCard key={novel.id} novel={novel} />
                      ))}
                    </div>
                  </div>
                )}

                {creatorComics.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>Webtoons & Illustrated Comics ({creatorComics.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {creatorComics.map((comic) => (
                        <ComicCard key={comic.id} comic={comic} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NOVELS ONLY */}
        {activeTab === "novels" && (
          <div className="space-y-4">
            {creatorNovels.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 max-w-md mx-auto">
                <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  No Novels Published
                </h3>
                <p className="text-xs text-zinc-500">
                  Check back soon for serialized web novel releases.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {creatorNovels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEBTOONS ONLY */}
        {activeTab === "webtoons" && (
          <div className="space-y-4">
            {webtoonsList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 max-w-md mx-auto">
                <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  No Webtoons Serialized
                </h3>
                <p className="text-xs text-zinc-500">
                  This storyteller has not published vertical-scroll webtoons yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {webtoonsList.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMICS & MANGA */}
        {activeTab === "comics" && (
          <div className="space-y-4">
            {westernComicsList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 max-w-md mx-auto">
                <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  No Comic Books Serialized
                </h3>
                <p className="text-xs text-zinc-500">
                  No page-based manga or comic issues available at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {westernComicsList.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ABOUT */}
        {activeTab === "about" && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Storyteller Biography
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {creator.bio || "No biography written yet."}
                </p>
              </div>

              {creator.primaryGenres && creator.primaryGenres.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Primary Storytelling Genres
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {creator.primaryGenres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {creator.preferredTypes && creator.preferredTypes.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Preferred Mediums & Formats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {creator.preferredTypes.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: GUESTBOOK & READER FEEDBACK */}
        {activeTab === "feedback" && (
          <div className="space-y-6">
            {/* Post message to creator */}
            <form
              onSubmit={handleAddCreatorFeedback}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs"
            >
              <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <span>Leave a Message or Review for {creator.name}</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Share your appreciation, review their stories, or ask questions about upcoming releases.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  placeholder={`Write a public message to @${creator.username}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>

            {/* Feedback List */}
            <div className="space-y-3">
              {creatorFeedback.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No messages yet on {creator.name}&apos;s profile.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Be the first reader to write a note or review!
                  </p>
                </div>
              ) : (
                creatorFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={fb.user.avatar}
                          alt={fb.user.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {fb.user.name}
                            </span>
                            {fb.user.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {formatDate(fb.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-10">
                      {fb.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. QUICK EDIT PROFILE MODAL (FOR SELF) */}
      {isEditModalOpen && isSelf && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="max-w-lg w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  Edit Public Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickProfile} className="space-y-4">
              {/* Avatar Upload Preview */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {creator.avatar && !avatarError ? (
                    <img
                      src={creator.avatar}
                      alt={editName || creator.name}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Profile Avatar
                  </p>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>{isUploadingAvatar ? "Compressing..." : "Upload New Photo"}</span>
                  </button>

                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Creator Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell readers about your storytelling themes and worlds..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Country / Region
                </label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  placeholder="e.g. United States, Japan, India"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://mywebsite.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Twitter / X Handle
                  </label>
                  <input
                    type="text"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Genres Multi-Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Primary Genres
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setEditGenres((prev) =>
                          prev.includes(g)
                            ? prev.filter((item) => item !== g)
                            : [...prev, g]
                        )
                      }
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                        editGenres.includes(g)
                          ? "bg-rose-950/60 border-rose-500 text-rose-300 font-bold"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. NOTIFICATION PREFERENCES MODAL */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  Notification Settings
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Choose which updates you would like to receive for <strong>@{creator.username}</strong>:
            </p>

            <div className="space-y-3">
              {[
                {
                  key: "newChapters",
                  label: "New Novel Chapters",
                  desc: "When a new serialized chapter is published",
                },
                {
                  key: "newComics",
                  label: "New Webtoon & Comic Episodes",
                  desc: "When a new visual episode drops",
                },
                {
                  key: "newStories",
                  label: "New Story Launches",
                  desc: "When the author launches a brand new series",
                },
                {
                  key: "announcements",
                  label: "Creator Announcements",
                  desc: "Q&As, schedule changes, and community updates",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      notifPreferences[item.key as keyof NotificationPreferences]
                    }
                    onChange={(e) =>
                      setNotifPreferences((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-zinc-400">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleSaveNotifPreferences(false, notifPreferences)}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Mute All Notifications
              </button>

              <button
                onClick={() => handleSaveNotifPreferences(true, notifPreferences)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FOLLOWERS & FOLLOWING DEDICATED MODAL */}
      {listModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-lg w-full max-h-[85vh] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  {listModalType === "followers"
                    ? `Followers (${followersCount})`
                    : `Following (${followingCount})`}
                </h3>
              </div>
              <button
                onClick={() => setListModalType(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={listSearchQuery}
                  onChange={(e) => setListSearchQuery(e.target.value)}
                  placeholder="Search by name or @username..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-xs font-bold text-zinc-400">
                    {listModalType === "followers"
                      ? "No followers yet."
                      : "This creator isn't following anyone yet."}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {listSearchQuery
                      ? "No matching accounts found for your search."
                      : "Follow this storyteller to join their community."}
                  </p>
                </div>
              ) : (
                filteredList.map((person) => {
                  const isUserFollowingPerson = user
                    ? dataStore.isFollowingCreator(user.id, person.id)
                    : false;
                  const isPersonSelf = user?.id === person.id;

                  return (
                    <div
                      key={person.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                    >
                      <Link
                        href={`/creator/${person.username}`}
                        onClick={() => setListModalType(null)}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                            <span>{person.name}</span>
                            {person.isVerified && (
                              <CheckCircle2 className="w-3 h-3 text-rose-500" />
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            @{person.username}
                          </p>
                        </div>
                      </Link>

                      {!isPersonSelf && (
                        <button
                          onClick={() => {
                            if (!user) {
                              openAuthModal();
                              return;
                            }
                            if (isUserFollowingPerson) {
                              dataStore.unfollowCreator(user.id, person.id);
                              showToast(`Unfollowed @${person.username}`);
                            } else {
                              dataStore.followCreator(user.id, person.id);
                              showToast(`✓ Following @${person.username}`);
                            }
                            setFollowersCount(dataStore.getFollowerCount(creator.id));
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            isUserFollowingPerson
                              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              : "bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                          }`}
                        >
                          {isUserFollowingPerson ? "Following" : "+ Follow"}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tip Creator Modal */}
      {creator && (
        <TipCreatorModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          creator={creator}
          onOpenCoinShop={() => setIsCoinShopOpen(true)}
        />
      )}

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isCoinShopOpen}
        onClose={() => setIsCoinShopOpen(false)}
      />
    </div>
  );
}
