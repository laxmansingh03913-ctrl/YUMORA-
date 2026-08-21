import {
  Novel,
  Comic,
  ComicEpisode,
  Contest,
  CommunityPost,
  ReportItem,
  UserProfile,
  ReadingProgress,
  Chapter,
  Comment,
  Follow,
  NotificationItem,
  NotificationPreferences,
  MonetizationEligibility,
  MonetizationTier,
  MonetizationStatus,
} from "../types";
import {
  SEED_NOVELS,
  SEED_COMICS,
  SEED_CONTESTS,
  SEED_COMMUNITY_POSTS,
  SEED_REPORTS,
  SEED_USERS,
} from "./seed-data";

import { idbGet, idbSet } from "./idb";
import { dbService } from "../supabase/db";

const STORAGE_KEYS = {
  NOVELS: "yumora_novels",
  COMICS: "yumora_comics",
  BOOKMARKS: "yumora_bookmarks",
  LIKES: "yumora_likes",
  FOLLOWS: "yumora_follows",
  FOLLOW_RELATIONS: "yumora_follow_relations",
  NOTIFICATIONS: "yumora_notifications",
  READING_PROGRESS: "yumora_reading_progress",
  COMMUNITY_POSTS: "yumora_community_posts",
  REPORTS: "yumora_reports",
  COMMENTS: "yumora_comments",
  USERS: "yumora_users",
};

class DataStore {
  private memoryComics: Map<string, Comic> = new Map();
  private memoryNovels: Map<string, Novel> = new Map();
  private isHydratedFromIdb = false;

  constructor() {
    if (this.isBrowser()) {
      this.initFromIdb();
      this.syncFromSupabase();
    }
  }

  private async syncFromSupabase() {
    try {
      const [cloudNovels, cloudComics] = await Promise.all([
        dbService.getNovels(),
        dbService.getComics(),
      ]);

      if (cloudNovels && cloudNovels.length > 0) {
        cloudNovels.forEach((n) => {
          if (n && n.id) this.memoryNovels.set(n.id, n);
        });
      }

      if (cloudComics && cloudComics.length > 0) {
        cloudComics.forEach((c) => {
          if (c && c.id) this.memoryComics.set(c.id, c);
        });
      }
    } catch (e) {
      console.warn("Supabase background sync notice:", e);
    }
  }

  private async initFromIdb() {
    try {
      const idbComics = await idbGet<Comic[]>(STORAGE_KEYS.COMICS);
      if (idbComics && Array.isArray(idbComics)) {
        idbComics.forEach((c) => this.memoryComics.set(c.id, c));
      }
      const idbNovels = await idbGet<Novel[]>(STORAGE_KEYS.NOVELS);
      if (idbNovels && Array.isArray(idbNovels)) {
        idbNovels.forEach((n) => this.memoryNovels.set(n.id, n));
      }
      this.isHydratedFromIdb = true;
    } catch (e) {
      console.warn("IndexedDB init notice:", e);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("LocalStorage save warning (will persist via IndexedDB):", e);
    }
  }

  // Novels
  getNovels(): Novel[] {
    const customNovels = this.getItem<Novel[]>(STORAGE_KEYS.NOVELS, []);
    const novelMap = new Map<string, Novel>();
    SEED_NOVELS.forEach((n) => novelMap.set(n.id, n));
    customNovels.forEach((n) => novelMap.set(n.id, n));
    this.memoryNovels.forEach((n) => novelMap.set(n.id, n));
    return Array.from(novelMap.values());
  }

  getNovelBySlug(slug: string): Novel | undefined {
    return this.getNovels().find((n) => n.slug === slug || n.id === slug);
  }

  getChapter(novelSlug: string, chapterNumber: number): Chapter | undefined {
    const novel = this.getNovelBySlug(novelSlug);
    if (!novel) return undefined;
    return novel.chapters.find((ch) => ch.chapterNumber === chapterNumber);
  }

  saveNovel(novel: Novel): Novel {
    this.memoryNovels.set(novel.id, novel);
    const novels = this.getItem<Novel[]>(STORAGE_KEYS.NOVELS, []);
    const index = novels.findIndex((n) => n.id === novel.id);
    if (index >= 0) {
      novels[index] = novel;
    } else {
      novels.push(novel);
    }
    this.setItem(STORAGE_KEYS.NOVELS, novels);
    if (this.isBrowser()) {
      idbSet(STORAGE_KEYS.NOVELS, Array.from(this.memoryNovels.values())).catch(() => {});
    }
    return novel;
  }

  addChapter(novelId: string, chapter: Chapter): boolean {
    const allNovels = this.getNovels();
    const novel = allNovels.find((n) => n.id === novelId);
    if (!novel) return false;

    const existingChIdx = novel.chapters.findIndex((c) => c.chapterNumber === chapter.chapterNumber);
    if (existingChIdx >= 0) {
      novel.chapters[existingChIdx] = chapter;
    } else {
      novel.chapters.push(chapter);
      novel.chaptersCount = novel.chapters.length;
    }
    novel.updatedAt = new Date().toISOString();
    this.saveNovel(novel);
    return true;
  }

  // Comics
  getComics(): Comic[] {
    const customComics = this.getItem<Comic[]>(STORAGE_KEYS.COMICS, []);
    const comicMap = new Map<string, Comic>();
    SEED_COMICS.forEach((c) => comicMap.set(c.id, c));
    customComics.forEach((c) => comicMap.set(c.id, c));
    this.memoryComics.forEach((c) => comicMap.set(c.id, c));
    return Array.from(comicMap.values());
  }

  getComicBySlug(slug: string): Comic | undefined {
    return this.getComics().find((c) => c.slug === slug || c.id === slug);
  }

  saveComic(comic: Comic): Comic {
    this.memoryComics.set(comic.id, comic);
    const comics = this.getItem<Comic[]>(STORAGE_KEYS.COMICS, []);
    const index = comics.findIndex((c) => c.id === comic.id);
    if (index >= 0) {
      comics[index] = comic;
    } else {
      comics.push(comic);
    }
    this.setItem(STORAGE_KEYS.COMICS, comics);
    if (this.isBrowser()) {
      idbSet(STORAGE_KEYS.COMICS, Array.from(this.memoryComics.values())).catch(() => {});
    }
    return comic;
  }

  addComicEpisode(comicId: string, episode: ComicEpisode): boolean {
    const allComics = this.getComics();
    const comic = allComics.find((c) => c.id === comicId);
    if (!comic) return false;

    const existingEpIdx = comic.episodes.findIndex((e) => e.episodeNumber === episode.episodeNumber);
    if (existingEpIdx >= 0) {
      comic.episodes[existingEpIdx] = episode;
    } else {
      comic.episodes.push(episode);
      comic.episodesCount = comic.episodes.length;
    }
    comic.updatedAt = new Date().toISOString();
    this.saveComic(comic);
    return true;
  }

  // Bookmarks
  getBookmarks(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.BOOKMARKS, []);
  }

  toggleBookmark(contentId: string): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(contentId);
    let isBookmarked = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      bookmarks.push(contentId);
      isBookmarked = true;
    }
    this.setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return isBookmarked;
  }

  isBookmarked(contentId: string): boolean {
    return this.getBookmarks().includes(contentId);
  }

  // Likes
  getLikes(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.LIKES, []);
  }

  toggleLike(contentId: string): boolean {
    const likes = this.getLikes();
    const index = likes.indexOf(contentId);
    let isLiked = false;
    if (index >= 0) {
      likes.splice(index, 1);
      isLiked = false;
    } else {
      likes.push(contentId);
      isLiked = true;
    }
    this.setItem(STORAGE_KEYS.LIKES, likes);
    return isLiked;
  }

  isLiked(contentId: string): boolean {
    return this.getLikes().includes(contentId);
  }

  // Follows & Notifications Backend Logic
  getFollowRelationships(): Follow[] {
    return this.getItem<Follow[]>(STORAGE_KEYS.FOLLOW_RELATIONS, []);
  }

  followCreator(
    followerId: string,
    followingId: string,
    preferences?: NotificationPreferences
  ): { success: boolean; error?: string } {
    if (!followerId) {
      return { success: false, error: "Unauthorized. Please sign in to follow creators." };
    }
    if (followerId === followingId) {
      return { success: false, error: "Cannot follow yourself" };
    }
    const targetUser = this.getUserById(followingId) || this.getUserByUsername(followingId);
    if (!targetUser) {
      return { success: false, error: "Creator not found" };
    }

    const targetId = targetUser.id;
    const relations = this.getFollowRelationships();
    const existing = relations.find((f) => f.followerId === followerId && f.followingId === targetId);
    if (existing) {
      return { success: false, error: "Already following creator" };
    }

    const newFollow: Follow = {
      id: `follow-${Date.now()}`,
      followerId,
      followingId: targetId,
      createdAt: new Date().toISOString(),
      notificationsEnabled: true,
      preferences: preferences || {
        newChapters: true,
        newStories: true,
        newComics: true,
        announcements: true,
      },
    };

    relations.push(newFollow);
    this.setItem(STORAGE_KEYS.FOLLOW_RELATIONS, relations);

    // Also update legacy flat list for fast backward-compat
    const flatFollows = this.getFollows();
    if (!flatFollows.includes(targetId)) {
      flatFollows.push(targetId);
      this.setItem(STORAGE_KEYS.FOLLOWS, flatFollows);
    }

    // Auto-generate a welcome notification
    this.createFollowNotification({
      id: `notif-${Date.now()}`,
      userId: followerId,
      creatorId: targetId,
      creatorName: targetUser.name,
      creatorAvatar: targetUser.avatar,
      title: `You are now following ${targetUser.name}!`,
      message: `You will receive instant notifications when ${targetUser.name} publishes new chapters or webtoon episodes.`,
      contentUrl: `/creator/${targetUser.username}`,
      type: "ANNOUNCEMENT",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  }

  unfollowCreator(followerId: string, followingId: string): { success: boolean; error?: string } {
    if (!followerId) {
      return { success: false, error: "Unauthorized" };
    }
    const targetUser = this.getUserById(followingId) || this.getUserByUsername(followingId);
    const targetId = targetUser ? targetUser.id : followingId;

    const relations = this.getFollowRelationships();
    const updated = relations.filter((f) => !(f.followerId === followerId && f.followingId === targetId));
    this.setItem(STORAGE_KEYS.FOLLOW_RELATIONS, updated);

    const flatFollows = this.getFollows().filter((id) => id !== targetId);
    this.setItem(STORAGE_KEYS.FOLLOWS, flatFollows);

    return { success: true };
  }

  isFollowingCreator(followerId: string, followingId: string): boolean {
    if (!followerId || !followingId) return false;
    const targetUser = this.getUserById(followingId) || this.getUserByUsername(followingId);
    const targetId = targetUser ? targetUser.id : followingId;
    return this.getFollowRelationships().some(
      (f) => f.followerId === followerId && f.followingId === targetId
    );
  }

  getFollowRelationship(followerId: string, followingId: string): Follow | undefined {
    const targetUser = this.getUserById(followingId) || this.getUserByUsername(followingId);
    const targetId = targetUser ? targetUser.id : followingId;
    return this.getFollowRelationships().find(
      (f) => f.followerId === followerId && f.followingId === targetId
    );
  }

  updateFollowPreferences(
    followerId: string,
    followingId: string,
    updates: { notificationsEnabled?: boolean; preferences?: Partial<NotificationPreferences> }
  ): boolean {
    const relations = this.getFollowRelationships();
    const targetUser = this.getUserById(followingId) || this.getUserByUsername(followingId);
    const targetId = targetUser ? targetUser.id : followingId;

    const target = relations.find((f) => f.followerId === followerId && f.followingId === targetId);
    if (!target) return false;

    if (updates.notificationsEnabled !== undefined) {
      target.notificationsEnabled = updates.notificationsEnabled;
    }
    if (updates.preferences) {
      target.preferences = {
        ...(target.preferences || { newChapters: true, newStories: true, newComics: true, announcements: true }),
        ...updates.preferences,
      };
    }

    this.setItem(STORAGE_KEYS.FOLLOW_RELATIONS, relations);
    return true;
  }

  getFollowers(creatorId: string): UserProfile[] {
    const targetUser = this.getUserById(creatorId) || this.getUserByUsername(creatorId);
    const targetId = targetUser ? targetUser.id : creatorId;
    const followerIds = this.getFollowRelationships()
      .filter((f) => f.followingId === targetId)
      .map((f) => f.followerId);

    return this.getUsers().filter((u) => followerIds.includes(u.id));
  }

  getFollowing(userId: string): UserProfile[] {
    const followingIds = this.getFollowRelationships()
      .filter((f) => f.followerId === userId)
      .map((f) => f.followingId);

    return this.getUsers().filter((u) => followingIds.includes(u.id));
  }

  getFollowerCount(creatorId: string): number {
    const targetUser = this.getUserById(creatorId) || this.getUserByUsername(creatorId);
    if (!targetUser) return 0;
    const baseCount = targetUser.followersCount || 0;
    const customFollowers = this.getFollowRelationships().filter(
      (f) => f.followingId === targetUser.id && f.followerId !== "usr-reader-1"
    ).length;
    return baseCount + customFollowers;
  }

  getFollowingCount(userId: string): number {
    return this.getFollowRelationships().filter((f) => f.followerId === userId).length;
  }

  // Legacy fast follow helper
  getFollows(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.FOLLOWS, []);
  }

  toggleFollow(creatorId: string, currentUserId?: string): boolean {
    const followerId = currentUserId || "usr-reader-1";
    if (this.isFollowingCreator(followerId, creatorId)) {
      this.unfollowCreator(followerId, creatorId);
      return false;
    } else {
      const res = this.followCreator(followerId, creatorId);
      return res.success;
    }
  }

  isFollowing(creatorId: string): boolean {
    return this.isFollowingCreator("usr-reader-1", creatorId);
  }

  getFollowedCreatorsFeed(userId?: string): {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar: string;
    isVerified?: boolean;
    contentId: string;
    contentTitle: string;
    contentType: "NOVEL" | "COMIC";
    contentSlug: string;
    coverUrl: string;
    releaseTitle: string;
    releaseNumber: number;
    releasedAt: string;
  }[] {
    const currentFollowerId = userId || "";
    if (!currentFollowerId) return [];
    const followedIds = this.getFollowing(currentFollowerId).map((u) => u.id);
    if (followedIds.length === 0) return [];

    const novels = this.getNovels().filter((n) => followedIds.includes(n.creatorId));
    const comics = this.getComics().filter((c) => followedIds.includes(c.creatorId));

    const feed: {
      id: string;
      creatorId: string;
      creatorName: string;
      creatorUsername: string;
      creatorAvatar: string;
      isVerified?: boolean;
      contentId: string;
      contentTitle: string;
      contentType: "NOVEL" | "COMIC";
      contentSlug: string;
      coverUrl: string;
      releaseTitle: string;
      releaseNumber: number;
      releasedAt: string;
    }[] = [];

    novels.forEach((novel) => {
      const latestCh = novel.chapters[novel.chapters.length - 1];
      if (latestCh) {
        feed.push({
          id: `feed-novel-${novel.id}-${latestCh.chapterNumber}`,
          creatorId: novel.creatorId,
          creatorName: novel.creator.name,
          creatorUsername: novel.creator.username,
          creatorAvatar: novel.creator.avatar,
          isVerified: novel.creator.isVerified,
          contentId: novel.id,
          contentTitle: novel.title,
          contentType: "NOVEL",
          contentSlug: novel.slug,
          coverUrl: novel.coverUrl,
          releaseTitle: latestCh.title,
          releaseNumber: latestCh.chapterNumber,
          releasedAt: latestCh.publishedAt || novel.updatedAt,
        });
      }
    });

    comics.forEach((comic) => {
      const latestEp = comic.episodes[comic.episodes.length - 1];
      if (latestEp) {
        feed.push({
          id: `feed-comic-${comic.id}-${latestEp.episodeNumber}`,
          creatorId: comic.creatorId,
          creatorName: comic.creator.name,
          creatorUsername: comic.creator.username,
          creatorAvatar: comic.creator.avatar,
          isVerified: comic.creator.isVerified,
          contentId: comic.id,
          contentTitle: comic.title,
          contentType: "COMIC",
          contentSlug: comic.slug,
          coverUrl: comic.coverUrl,
          releaseTitle: latestEp.title,
          releaseNumber: latestEp.episodeNumber,
          releasedAt: latestEp.publishedAt || comic.updatedAt,
        });
      }
    });

    return feed.sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime());
  }

  getFollowingFeed(): {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar: string;
    isVerified?: boolean;
    contentId: string;
    contentTitle: string;
    contentType: "NOVEL" | "COMIC";
    contentSlug: string;
    coverUrl: string;
    releaseTitle: string;
    releaseNumber: number;
    releasedAt: string;
  }[] {
    return this.getFollowedCreatorsFeed();
  }

  // Notification Methods
  getNotifications(userId: string): NotificationItem[] {
    const customNotifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return customNotifs.filter((n) => !n.userId || n.userId === userId);
  }

  getUnreadNotificationCount(userId: string): number {
    return this.getNotifications(userId).filter((n) => !n.isRead).length;
  }

  createFollowNotification(notification: NotificationItem): void {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift(notification);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  markNotificationRead(notificationId: string): void {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const target = notifs.find((n) => n.id === notificationId);
    if (target) {
      target.isRead = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  markAllNotificationsRead(userId: string): void {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.forEach((n) => {
      if (!n.userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Reading Progress
  getReadingProgressMap(): Record<string, ReadingProgress> {
    return this.getItem<Record<string, ReadingProgress>>(STORAGE_KEYS.READING_PROGRESS, {});
  }

  saveReadingProgress(progress: ReadingProgress): void {
    const map = this.getReadingProgressMap();
    map[progress.contentId] = progress;
    this.setItem(STORAGE_KEYS.READING_PROGRESS, map);
  }

  getReadingProgress(contentId: string): ReadingProgress | undefined {
    return this.getReadingProgressMap()[contentId];
  }

  // Comments
  getComments(contentId: string): Comment[] {
    const all = this.getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
    return all.filter((c) => c.contentId === contentId);
  }

  addComment(comment: Comment): void {
    const all = this.getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
    all.unshift(comment);
    this.setItem(STORAGE_KEYS.COMMENTS, all);
  }

  // Community Posts
  getCommunityPosts(): CommunityPost[] {
    const customPosts = this.getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, []);
    const map = new Map<string, CommunityPost>();
    SEED_COMMUNITY_POSTS.forEach((p) => map.set(p.id, p));
    customPosts.forEach((p) => map.set(p.id, p));
    return Array.from(map.values()).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  addCommunityPost(post: CommunityPost): void {
    const customPosts = this.getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, []);
    customPosts.unshift(post);
    this.setItem(STORAGE_KEYS.COMMUNITY_POSTS, customPosts);
  }

  // Contests
  getContests(): Contest[] {
    return SEED_CONTESTS;
  }

  getContestBySlug(slug: string): Contest | undefined {
    return this.getContests().find((c) => c.slug === slug || c.id === slug);
  }

  // Reports
  getReports(): ReportItem[] {
    const custom = this.getItem<ReportItem[]>(STORAGE_KEYS.REPORTS, []);
    const map = new Map<string, ReportItem>();
    SEED_REPORTS.forEach((r) => map.set(r.id, r));
    custom.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }

  addReport(report: ReportItem): void {
    const custom = this.getItem<ReportItem[]>(STORAGE_KEYS.REPORTS, []);
    custom.unshift(report);
    this.setItem(STORAGE_KEYS.REPORTS, custom);
  }

  updateReportStatus(reportId: string, status: ReportItem["status"]): void {
    const reports = this.getReports();
    const target = reports.find((r) => r.id === reportId);
    if (target) {
      target.status = status;
      this.setItem(STORAGE_KEYS.REPORTS, reports);
    }
  }

  // Users & Creator Profile Onboarding
  getUsers(): UserProfile[] {
    const customUsers = this.getItem<UserProfile[]>(STORAGE_KEYS.USERS || "yumora_users", []);
    const map = new Map<string, UserProfile>();
    SEED_USERS.forEach((u) => map.set(u.id, u));
    customUsers.forEach((u) => map.set(u.id, u));
    return Array.from(map.values());
  }

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  getUserByUsername(username: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    const existingIdx = users.findIndex((u) => u.id === userId);
    let updatedUser: UserProfile;

    if (existingIdx >= 0) {
      updatedUser = { ...users[existingIdx], ...updates };
      users[existingIdx] = updatedUser;
    } else {
      updatedUser = {
        id: userId,
        name: updates.name || "User",
        username: updates.username || `user_${userId.slice(0, 6)}`,
        email: updates.email || "",
        role: updates.role || "READER",
        avatar:
          updates.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        bio: updates.bio || "Storyteller on Yumora.",
        country: updates.country || "Global",
        isVerified: false,
        isCreatorProfileComplete: false,
        isEmailVerified: Boolean(updates.isEmailVerified),
        isAgeVerified: true,
        monetizationTier: "NONE",
        monetizationStatus: "NOT_APPLIED",
        fraudAuditStatus: "CLEAN",
        followersCount: 0,
        followingCount: 0,
        totalReads: 0,
        createdAt: new Date().toISOString(),
        ...updates,
      };
      users.push(updatedUser);
    }

    // Auto calculate if creator profile is 100% complete
    const completion = this.calculateProfileCompletion(updatedUser);
    updatedUser.isCreatorProfileComplete = completion.isComplete;

    this.setItem(STORAGE_KEYS.USERS || "yumora_users", users);
    return updatedUser;
  }

  calculateProfileCompletion(user?: UserProfile): {
    percentage: number;
    isComplete: boolean;
    checks: {
      name: boolean;
      username: boolean;
      bio: boolean;
      country: boolean;
      primaryGenres: boolean;
      preferredTypes: boolean;
      terms: boolean;
    };
    missingFields: string[];
  } {
    if (!user) {
      return {
        percentage: 0,
        isComplete: false,
        checks: {
          name: false,
          username: false,
          bio: false,
          country: false,
          primaryGenres: false,
          preferredTypes: false,
          terms: false,
        },
        missingFields: [
          "Display Name",
          "Unique Creator Username",
          "Creator Bio",
          "Country / Region",
          "Primary Genres",
          "Preferred Content Types",
          "Creator Agreement & Publishing Rights",
        ],
      };
    }

    const checks = {
      name: Boolean(user.name && user.name.trim().length >= 2),
      username: Boolean(user.username && user.username.trim().length >= 3),
      bio: Boolean(user.bio && user.bio.trim().length >= 20),
      country: Boolean(user.country && user.country.trim().length > 0),
      primaryGenres: Boolean(user.primaryGenres && user.primaryGenres.length > 0),
      preferredTypes: Boolean(user.preferredTypes && user.preferredTypes.length > 0),
      terms: Boolean(user.agreedToCreatorTerms === true),
    };

    const keys = Object.keys(checks) as (keyof typeof checks)[];
    const completedCount = keys.filter((k) => checks[k]).length;
    const percentage = Math.round((completedCount / keys.length) * 100);

    const missingFields: string[] = [];
    if (!checks.name) missingFields.push("Display Name");
    if (!checks.username) missingFields.push("Unique Creator Username");
    if (!checks.bio) missingFields.push("Creator Bio (minimum 20 characters)");
    if (!checks.country) missingFields.push("Country / Region");
    if (!checks.primaryGenres) missingFields.push("Primary Genres");
    if (!checks.preferredTypes) missingFields.push("Preferred Content Types");
    if (!checks.terms) missingFields.push("Creator Agreement & Publishing Rights");

    return {
      percentage,
      isComplete: percentage === 100,
      checks,
      missingFields,
    };
  }

  isCreatorProfileComplete(userId: string): boolean {
    const user = this.getUserById(userId);
    return this.calculateProfileCompletion(user).isComplete;
  }

  calculateMonetizationEligibility(userId: string): MonetizationEligibility {
    const user = this.getUserById(userId);
    const novels = this.getNovels().filter((n) => n.creatorId === userId && n.status !== "DRAFT");
    const comics = this.getComics().filter((c) => c.creatorId === userId && c.status !== "DRAFT");

    // Content Calculations
    const totalNovelsCount = novels.length;
    const totalComicsCount = comics.length;
    const publishedChapters = novels.reduce((acc, n) => acc + n.chapters.length, 0);
    const publishedEpisodes = comics.reduce((acc, c) => acc + c.episodes.length, 0);
    const totalChaptersOrEpisodes = publishedChapters + publishedEpisodes;

    const hasApprovedWork = totalNovelsCount > 0 || totalComicsCount > 0;
    const meetsContentThreshold = publishedChapters >= 5 || publishedEpisodes >= 3;

    // Audience & Readership (Bot-filtered Genuine Reads)
    const followers = this.getFollowerCount(userId);
    const totalReads =
      novels.reduce((acc, n) => acc + n.reads, 0) +
      comics.reduce((acc, c) => acc + c.reads, 0) || (user?.totalReads || 0);

    const totalLikes =
      novels.reduce((acc, n) => acc + n.likesCount, 0) +
      comics.reduce((acc, c) => acc + (c.likesCount || 0), 0);
    const totalBookmarks = this.getBookmarks().filter((id) =>
      [...novels.map((n) => n.id), ...comics.map((c) => c.id)].includes(id)
    ).length;
    const totalComments = this.getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []).filter((cm) =>
      [...novels.map((n) => n.id), ...comics.map((c) => c.id)].includes(cm.contentId)
    ).length;
    const totalEngagements = totalLikes + totalBookmarks + totalComments;

    // Account & Integrity Criteria
    const isProfileComplete = this.isCreatorProfileComplete(userId);
    const isEmailVerified = user?.isEmailVerified ?? true;
    const isAgeVerified = user?.isAgeVerified ?? true;
    const hasOriginalityPledge = user?.agreedToCreatorTerms ?? isProfileComplete;
    const violationsCount = this.getReports().filter(
      (r) => r.creatorName === user?.name && (r.status === "RESOLVED" || r.status === "REVIEWED")
    ).length;

    const fraudAuditStatus = user?.fraudAuditStatus || "CLEAN";

    // Thresholds (Configurable)
    const followersThreshold = 500;
    const genuineReadsThreshold = 5000;
    const engagementsThreshold = 100;

    // Account age in days (simulated ≥ 30 for existing creators, or parsed from createdAt)
    const createdAtMs = user?.createdAt ? new Date(user.createdAt).getTime() : Date.now() - 35 * 86400000;
    const accountAgeDays = Math.max(1, Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)));
    const isAccountAgeMet = accountAgeDays >= 30;

    // Progress Scoring (Weighted Holistic Formula)
    let score = 0;
    if (isProfileComplete) score += 15;
    if (isEmailVerified && isAgeVerified) score += 10;
    if (isAccountAgeMet) score += 10;
    if (meetsContentThreshold) score += 25;
    else if (hasApprovedWork) score += 12;

    // Audience scaling
    score += Math.min(15, Math.round((followers / followersThreshold) * 15));
    score += Math.min(15, Math.round((totalReads / genuineReadsThreshold) * 15));
    score += Math.min(10, Math.round((totalEngagements / engagementsThreshold) * 10));

    const overallPercentage = Math.min(100, Math.max(0, score));

    // Missing requirements list
    const missingRequirements: string[] = [];
    if (!isProfileComplete) missingRequirements.push("Complete 100% of your Creator Profile");
    if (!isEmailVerified) missingRequirements.push("Verify your account email address");
    if (!isAgeVerified) missingRequirements.push("Verify legal age requirement (18+)");
    if (!isAccountAgeMet) missingRequirements.push(`Account age must be at least 30 days (current: ${accountAgeDays} days)`);
    if (!hasApprovedWork) missingRequirements.push("Publish at least 1 original story or comic");
    if (!meetsContentThreshold) missingRequirements.push("Publish at least 5 chapters (Novel) or 3 episodes (Webtoon/Comic)");
    if (followers < followersThreshold) missingRequirements.push(`${followersThreshold - followers} more followers needed (${followers}/${followersThreshold})`);
    if (totalReads < genuineReadsThreshold) missingRequirements.push(`${(genuineReadsThreshold - totalReads).toLocaleString()} more genuine reads needed (${totalReads.toLocaleString()}/${genuineReadsThreshold.toLocaleString()})`);
    if (totalEngagements < engagementsThreshold) missingRequirements.push(`${engagementsThreshold - totalEngagements} more reader engagements needed (${totalEngagements}/${engagementsThreshold})`);
    if (violationsCount > 0) missingRequirements.push(`Resolve ${violationsCount} active community violations`);
    if (fraudAuditStatus !== "CLEAN") missingRequirements.push("Account is under fraud/bot review");

    // Tier Qualification Logic
    const currentTier: MonetizationTier = user?.monetizationTier || (overallPercentage >= 100 ? "LEVEL_1_ELIGIBLE" : "NONE");
    const status: MonetizationStatus = user?.monetizationStatus || (currentTier !== "NONE" ? "ACTIVE" : "NOT_APPLIED");

    const canApplyLevel1 = overallPercentage >= 100 && fraudAuditStatus === "CLEAN" && violationsCount === 0 && currentTier === "NONE";
    const canApplyLevel2 = followers >= 2500 && totalReads >= 50000 && (currentTier === "LEVEL_1_ELIGIBLE" || currentTier === "NONE");
    const canApplyLevel3 = followers >= 10000 && totalReads >= 250000 && currentTier === "LEVEL_2_ESTABLISHED";

    return {
      overallPercentage,
      currentTier,
      status,
      accountAgeDays,
      isEmailVerified,
      isAgeVerified,
      isProfileComplete,
      hasOriginalityPledge,
      violationsCount,
      hasApprovedWork,
      publishedChaptersOrEpisodes: totalChaptersOrEpisodes,
      followersCount: followers,
      followersThreshold,
      genuineReadsCount: totalReads,
      genuineReadsThreshold,
      engagementsCount: totalEngagements,
      engagementsThreshold,
      fraudAuditStatus,
      missingRequirements,
      canApplyLevel1,
      canApplyLevel2,
      canApplyLevel3,
    };
  }

  applyForMonetization(
    userId: string,
    targetTier: MonetizationTier = "LEVEL_1_ELIGIBLE"
  ): { success: boolean; tier?: MonetizationTier; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: "User not found" };

    const eligibility = this.calculateMonetizationEligibility(userId);

    if (eligibility.fraudAuditStatus !== "CLEAN") {
      return { success: false, error: "Application on hold: Account is currently under fraud/bot review." };
    }

    if (eligibility.violationsCount > 0) {
      return { success: false, error: "Application rejected: Active community guidelines violations on record." };
    }

    if (targetTier === "LEVEL_1_ELIGIBLE" && eligibility.overallPercentage < 100) {
      return {
        success: false,
        error: `Incomplete requirements: You have completed ${eligibility.overallPercentage}% of the Level 1 criteria.`,
      };
    }

    // Upgrade Creator Tier
    const updated = this.updateUserProfile(userId, {
      monetizationTier: targetTier,
      monetizationStatus: "ACTIVE",
    });

    // Notify Creator
    this.createFollowNotification({
      id: `notif-monetize-${Date.now()}`,
      userId,
      creatorId: "usr-admin-1",
      creatorName: "Yumora Monetization Team",
      creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
      title: `🎉 Congratulations! ${targetTier.replace("_", " ")} Unlocked`,
      message: `Your monetization application has been approved. You can now enable tips, paid chapters, and reader subscriptions!`,
      contentUrl: "/creator",
      type: "ANNOUNCEMENT",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, tier: updated.monetizationTier };
  }

  simulateFraudAudit(userId: string, status: "CLEAN" | "UNDER_REVIEW" | "FLAGGED"): void {
    this.updateUserProfile(userId, {
      fraudAuditStatus: status,
      monetizationStatus: status === "CLEAN" ? "ACTIVE" : "UNDER_REVIEW",
    });
  }
}

export const dataStore = new DataStore();
