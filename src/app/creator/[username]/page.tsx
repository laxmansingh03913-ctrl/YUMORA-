"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Globe,
  UserPlus,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  Star,
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
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { NovelCard } from "@/components/ui/NovelCard";
import { ComicCard } from "@/components/ui/ComicCard";
import { formatNumber, formatDate } from "@/lib/utils";
import { NotificationPreferences, UserProfile, Novel, Comic } from "@/lib/types";

interface CreatorProfileProps {
  params: Promise<{ username: string }>;
}

export default function CreatorProfilePage({ params }: CreatorProfileProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const creator = dataStore.getUserByUsername(username);

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowDropdown, setShowFollowDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tabs: all, novels, webtoons, comics, about
  const [activeTab, setActiveTab] = useState<"all" | "novels" | "webtoons" | "comics" | "about">("all");

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

  useEffect(() => {
    if (creator) {
      const isUserFollowing = user ? dataStore.isFollowingCreator(user.id, creator.id) : false;
      setIsFollowing(isUserFollowing);
      setFollowersCount(dataStore.getFollowerCount(creator.id));
      setFollowingCount(creator.followingCount || dataStore.getFollowingCount(creator.id));

      if (user) {
        const relation = dataStore.getFollowRelationship(user.id, creator.id);
        if (relation) {
          setNotificationsEnabled(relation.notificationsEnabled ?? true);
          if (relation.preferences) setNotifPreferences(relation.preferences);
        }
      }
    }
  }, [username, user, creator]);

  if (!creator) {
    return notFound();
  }

  const isSelf = user?.id === creator.id;

  // Real Public Content (Approved & Published only)
  const creatorNovels = dataStore
    .getNovels()
    .filter((n) => n.creatorId === creator.id && n.status !== "DRAFT");
  const creatorComics = dataStore
    .getComics()
    .filter((c) => c.creatorId === creator.id && c.status !== "DRAFT");

  const webtoonsList = creatorComics.filter((c) => c.subType === "WEBTOON" || c.format === "VERTICAL");
  const westernComicsList = creatorComics.filter((c) => c.subType !== "WEBTOON" && c.format !== "VERTICAL");
  const totalWorks = creatorNovels.length + creatorComics.length;

  // Real Public Statistics
  const totalPublicReads =
    creatorNovels.reduce((acc, n) => acc + n.reads, 0) +
    creatorComics.reduce((acc, c) => acc + c.reads, 0) || creator.totalReads;
  const totalPublicLikes =
    creatorNovels.reduce((acc, n) => acc + n.likesCount, 0) +
    creatorComics.reduce(
      (acc, c) => acc + (c.likesCount || c.episodes?.reduce((eAcc, ep) => eAcc + (ep.likesCount || 0), 0) || 0),
      0
    );

  // Followers & Following Lists
  const followersList = dataStore.getFollowers(creator.id);
  const followingList = dataStore.getFollowing(creator.id);

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

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
        // Rollback
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
        // Rollback
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        showToast(res.error || "Failed to follow creator");
      } else {
        showToast(`✓ Following @${creator.username}! Release notifications enabled.`);
      }
    }

    setTimeout(() => setIsFollowLoading(false), 300);
  };

  // Update Notification Preferences
  const handleSaveNotifPreferences = (newEnabled: boolean, newPrefs: NotificationPreferences) => {
    if (!user) return;
    setNotificationsEnabled(newEnabled);
    setNotifPreferences(newPrefs);
    dataStore.updateFollowPreferences(user.id, creator.id, {
      notificationsEnabled: newEnabled,
      preferences: newPrefs,
    });
    setShowNotificationModal(false);
    setShowFollowDropdown(false);
    showToast(newEnabled ? "🔔 Notification settings updated" : "🔕 Notifications muted for this creator");
  };

  // Filtered List for Modal Search
  const activeList = listModalType === "followers" ? followersList : followingList;
  const filteredList = activeList.filter((u) => {
    const q = listSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
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

      {/* 1. CREATOR HEADER & BANNER */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 sm:h-64 md:h-80 w-full bg-zinc-950 overflow-hidden relative">
          <img
            src={
              creator.banner ||
              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80"
            }
            alt={creator.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>

        {/* Profile Card Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-zinc-950 shadow-2xl bg-zinc-900"
                />
                {creator.isVerified && (
                  <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-zinc-950 ring-2 ring-zinc-900" title="Verified Creator">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/30 uppercase tracking-wide">
                    CREATOR
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  @{creator.username}
                </p>

                {creator.country && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{creator.country}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Follow & Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
              {isSelf ? (
                <Link
                  href="/creator"
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Edit in Creator Studio</span>
                </Link>
              ) : (
                <div className="relative flex items-center flex-1 sm:flex-none">
                  {/* Main Follow / Following Button */}
                  <button
                    onClick={handleFollowAction}
                    disabled={isFollowLoading}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                      isFollowing
                        ? "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700"
                        : "bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/20 transform hover:scale-[1.02] active:scale-[0.98]"
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
                        <span>+ Follow Creator</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Options trigger when following */}
                  {isFollowing && (
                    <div className="relative">
                      <button
                        onClick={() => setShowFollowDropdown(!showFollowDropdown)}
                        className="ml-1.5 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                        title="Notification & Follow Settings"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {showFollowDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-30 space-y-1 animate-in fade-in">
                          <button
                            onClick={() => setShowNotificationModal(true)}
                            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800 flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              {notificationsEnabled ? <Bell className="w-3.5 h-3.5 text-indigo-400" /> : <BellOff className="w-3.5 h-3.5 text-zinc-500" />}
                              <span>{notificationsEnabled ? "Notifications On" : "Notifications Off"}</span>
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
                </div>
              )}

              {/* Social Links */}
              {creator.website && (
                <a
                  href={creator.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition shadow-xs"
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
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition shadow-xs flex items-center justify-center"
                  title="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Short Bio Banner */}
          {creator.bio && (
            <div className="pt-4 max-w-3xl">
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {creator.bio}
              </p>
            </div>
          )}

          {/* 2. CREATOR PUBLIC STATISTICS STRIP */}
          <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-0.5">
              <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                {formatNumber(totalPublicReads)}
              </p>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Total Reads</p>
            </div>

            <button
              onClick={() => {
                setListModalType("followers");
                setListSearchQuery("");
              }}
              className="space-y-0.5 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 text-indigo-500 dark:text-indigo-400">
                {formatNumber(followersCount)}
              </p>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center justify-center gap-1">
                <span>Followers</span>
                <span className="text-[9px] text-zinc-500">↗</span>
              </p>
            </button>

            <div className="space-y-0.5">
              <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                {totalWorks}
              </p>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Published Works</p>
            </div>

            <div className="space-y-0.5">
              <p className="text-lg sm:text-xl font-black text-rose-500">
                {formatNumber(totalPublicLikes)}
              </p>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Story Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABBED WORKS CATALOG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
          {[
            { id: "all", label: `All Works (${totalWorks})`, icon: Layers },
            { id: "novels", label: `Novels (${creatorNovels.length})`, icon: BookOpen },
            { id: "webtoons", label: `Webtoons (${webtoonsList.length})`, icon: Sparkles },
            { id: "comics", label: `Comics (${westernComicsList.length})`, icon: ImageIcon },
            { id: "about", label: "About Creator", icon: Info },
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
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No works published yet</h3>
                <p className="text-xs text-zinc-500">This creator hasn&apos;t published any novels or comics yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {creatorNovels.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      <span>Original Novels ({creatorNovels.length})</span>
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
                      <span>Webtoons & Comics ({creatorComics.length})</span>
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
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No novels published yet</h3>
                <p className="text-xs text-zinc-500">Check back soon for upcoming novel serializations.</p>
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
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No webtoons published yet</h3>
                <p className="text-xs text-zinc-500">This creator has not serialized vertical scroll webtoons.</p>
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
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No comics published yet</h3>
                <p className="text-xs text-zinc-500">No page-based manga or comic books available.</p>
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
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Author Biography & Background
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {creator.bio || "No biography provided yet."}
              </p>

              {creator.primaryGenres && creator.primaryGenres.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Primary Storytelling Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {creator.primaryGenres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. NOTIFICATION PREFERENCES MODAL */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
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
                { key: "newChapters", label: "New Novel Chapters", desc: "When a new serialized chapter is published" },
                { key: "newComics", label: "New Webtoon & Comic Episodes", desc: "When a new visual episode drops" },
                { key: "newStories", label: "New Story Launches", desc: "When the author launches a brand new series" },
                { key: "announcements", label: "Creator Announcements", desc: "Q&As, schedule changes, and community updates" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={notifPreferences[item.key as keyof NotificationPreferences]}
                    onChange={(e) =>
                      setNotifPreferences((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</p>
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

      {/* 5. FOLLOWERS & FOLLOWING DEDICATED MODAL */}
      {listModalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full max-h-[85vh] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  {listModalType === "followers" ? `Followers (${followersCount})` : `Following (${followingCount})`}
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
                    {listModalType === "followers" ? "No followers yet." : "This creator isn't following anyone yet."}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {listSearchQuery ? "No matching accounts found for your search." : "Follow this author to join their reader community."}
                  </p>
                </div>
              ) : (
                filteredList.map((person) => {
                  const isUserFollowingPerson = user ? dataStore.isFollowingCreator(user.id, person.id) : false;
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
                            {person.isVerified && <CheckCircle2 className="w-3 h-3 text-rose-500" />}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">@{person.username}</p>
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
                            // Force re-render state
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
    </div>
  );
}
