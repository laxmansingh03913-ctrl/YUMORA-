"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Clock,
  Heart,
  Users,
  Plus,
  Play,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { dbService } from "@/lib/supabase/db";
import { useAuth } from "@/context/AuthContext";
import { NovelCard } from "@/components/ui/NovelCard";
import { Novel, ReadingProgress, UserProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function LibraryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"continue" | "bookmarks" | "history" | "likes" | "following" | "lists">("continue");

  const [novels, setNovels] = useState<Novel[]>([]);
  const [bookmarks, setBookmarks] = useState<Novel[]>([]);
  const [likes, setLikes] = useState<Novel[]>([]);
  const [readingProgressMap, setReadingProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [followingCreators, setFollowingCreators] = useState<UserProfile[]>([]);

  // Custom reading lists
  const [customLists, setCustomLists] = useState<{ id: string; name: string; count: number }[]>([]);
  const [newListName, setNewListName] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Load novels from store (already Supabase-synced)
      const all = dataStore.getNovels();
      setNovels(all);

      let bIds = dataStore.getBookmarks();
      let lIds = dataStore.getLikes();
      let fIds = dataStore.getFollows();

      if (user?.id) {
        try {
          const [dbB, dbL, dbF] = await Promise.all([
            dbService.getUserBookmarks(user.id),
            dbService.getUserLikes(user.id),
            dbService.getUserFollows(user.id),
          ]);
          if (dbB && dbB.length > 0) bIds = Array.from(new Set([...bIds, ...dbB]));
          if (dbL && dbL.length > 0) lIds = Array.from(new Set([...lIds, ...dbL]));
          if (dbF && dbF.length > 0) fIds = Array.from(new Set([...fIds, ...dbF]));
        } catch {
          // ignore
        }

        // Fetch reading progress from Supabase
        try {
          const { supabase } = await import("@/lib/supabase/client");
          const { data: progressRows } = await supabase
            .from("reading_progress")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (progressRows && progressRows.length > 0) {
            const currentMap = dataStore.getReadingProgressMap();
            progressRows.forEach((row: any) => {
              const contentId = row.novel_id || row.comic_id;
              if (!contentId) return;
              const local = currentMap[contentId];
              const dbLastRead = new Date(row.updated_at || "").getTime();
              const localLastRead = local ? new Date(local.lastReadAt || "").getTime() : 0;

              // Enrich with novel/comic metadata if available
              const matchedNovel = all.find((n) => n.id === contentId);
              if (!local || dbLastRead >= localLastRead) {
                currentMap[contentId] = {
                  ...(local || {}),
                  contentId,
                  userId: row.user_id,
                  contentType: row.novel_id ? "NOVEL" : "COMIC",
                  chapterNumber: row.chapter_number || 1,
                  progressPercentage: row.percentage || 0,
                  lastReadAt: row.updated_at || new Date().toISOString(),
                  contentTitle: local?.contentTitle || matchedNovel?.title,
                  contentSlug: local?.contentSlug || matchedNovel?.slug,
                  coverUrl: local?.coverUrl || matchedNovel?.coverUrl,
                  creatorName: local?.creatorName || (matchedNovel as any)?.creator?.name,
                  totalUnits: local?.totalUnits || (matchedNovel as any)?.chaptersCount || (matchedNovel as any)?.episodesCount,
                };
              }
            });
            setReadingProgressMap({ ...currentMap });
          } else {
            setReadingProgressMap(dataStore.getReadingProgressMap());
          }
        } catch (e) {
          console.error("Library page progress error:", e);
          setReadingProgressMap(dataStore.getReadingProgressMap());
        }
      } else {
        setReadingProgressMap(dataStore.getReadingProgressMap());
      }

      setBookmarks(all.filter((n) => bIds.includes(n.id)));
      setLikes(all.filter((n) => lIds.includes(n.id)));

      // Load real creator profiles from Supabase for following tab
      if (user?.id) {
        try {
          const realProfiles = await dbService.getFollowedCreatorProfiles(user.id);
          setFollowingCreators(realProfiles);
        } catch {
          setFollowingCreators([]);
        }
      } else {
        setFollowingCreators([]);
      }
    };

    loadData();
  }, [user]);

  const continueReadingItems = Object.entries(readingProgressMap)
    .map(([id, prog]) => {
      const novel = novels.find((n) => n.id === id);
      return { novel, prog };
    })
    .filter((item): item is { novel: Novel; prog: ReadingProgress } => !!item.novel);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCustomLists((prev) => [
      ...prev,
      { id: `list-${Date.now()}`, name: newListName.trim(), count: 0 },
    ]);
    setNewListName("");
    setIsAddingList(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>My Personal Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          Your Story Shelf & History
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Pick up right where you left off, manage reading lists, and keep up with creators
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
        {[
          { id: "continue", label: `Continue Reading (${continueReadingItems.length})`, icon: Play },
          { id: "bookmarks", label: `Bookmarks (${bookmarks.length})`, icon: Bookmark },
          { id: "history", label: "Reading History", icon: Clock },
          { id: "likes", label: `Liked (${likes.length})`, icon: Heart },
          { id: "following", label: `Followed Creators (${followingCreators.length})`, icon: Users },
          { id: "lists", label: `Reading Lists (${customLists.length})`, icon: Plus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CONTINUE READING */}
      {activeTab === "continue" && (
        <div className="space-y-4">
          {continueReadingItems.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <BookOpen className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No active reading sessions
              </h3>
              <p className="text-xs text-zinc-500">
                Start reading any story in the Discover feed and your progress will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {continueReadingItems.map(({ novel, prog }) => (
                <div
                  key={novel.id}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-500/50 transition group"
                >
                  <div className="flex gap-3.5">
                    <img
                      src={novel.coverUrl}
                      alt={novel.title}
                      className="w-16 h-24 object-cover rounded-xl shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        {novel.genre}
                      </span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition truncate mt-1">
                        {novel.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">by {novel.creator.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Chapter {prog.chapterNumber} / {novel.chaptersCount}
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                      <span>Chapter Progress</span>
                      <span className="text-rose-500 font-bold">{prog.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${prog.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/novels/${novel.slug}/chapter/${prog.chapterNumber}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                  >
                    <span>Resume Chapter {prog.chapterNumber}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKMARKS */}
      {activeTab === "bookmarks" && (
        <div>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-zinc-500 py-12 text-center">
              No bookmarked stories yet. Click the bookmark icon on any novel card to save it here!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {bookmarks.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: READING HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {continueReadingItems.map(({ novel, prog }) => (
            <div
              key={novel.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={novel.coverUrl}
                  alt={novel.title}
                  className="w-10 h-14 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {novel.title}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Read Chapter {prog.chapterNumber} • Last opened {formatDate(prog.lastReadAt)}
                  </p>
                </div>
              </div>
              <Link
                href={`/novels/${novel.slug}/chapter/${prog.chapterNumber}`}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-600 hover:text-white transition"
              >
                Revisit
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: LIKED STORIES */}
      {activeTab === "likes" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {likes.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOLLOWED CREATORS */}
      {activeTab === "following" && (
        <div>
          {followingCreators.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <Users className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">You&apos;re not following anyone yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Follow your favorite authors to get instant release updates and customized chapter feeds.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Discover Creators</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followingCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                >
                  <Link
                    href={`/creator/${creator.username}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {creator.name}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">@{creator.username}</p>
                      <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                        {(creator.followersCount ?? 0).toLocaleString()} followers
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={async () => {
                      if (!user?.id) return;
                      await dbService.toggleFollow(user.id, creator.id).catch(() => {});
                      setFollowingCreators((prev) => prev.filter((c) => c.id !== creator.id));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 text-xs font-semibold transition flex-shrink-0"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUSTOM READING LISTS */}
      {activeTab === "lists" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Custom Story Collections
            </h3>
            <button
              onClick={() => setIsAddingList(!isAddingList)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          </div>

          {isAddingList && (
            <form
              onSubmit={handleCreateList}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-2"
            >
              <input
                type="text"
                required
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g. Must-Read Dark Fantasy)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
              >
                Create
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customLists.map((list) => (
              <div
                key={list.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 hover:border-zinc-700 transition"
              >
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{list.name}</h4>
                <p className="text-xs text-zinc-400">{list.count} stories saved</p>
                <div className="pt-2 flex justify-end">
                  <span className="text-[11px] font-semibold text-rose-500 cursor-pointer">
                    View Collection →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
