/**
 * Supabase Real PostgreSQL Database Client Service for Yomika
 */

import { supabase } from "./client";
import { Novel, Comic, ComicEpisode, Chapter, UserProfile, Comment, Contest, ReadingProgress, PayoutRequest } from "../types";

function ensureUuid(id?: string): string {
  if (!id) {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "10000000-0000-0000-0000-000000000001";
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  // Convert string hash to 32 hex chars
  let hex = "";
  for (let i = 0; i < id.length; i++) {
    hex += id.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function mapProfileFromDb(row: any): UserProfile | null {
  if (!row || !row.id) return null;
  return {
    id: String(row.id),
    name: row.name || "Storyteller",
    username: row.username || `creator_${String(row.id).slice(0, 6)}`,
    email: row.email || "",
    role: row.role || "CREATOR",
    avatar:
      row.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    banner: row.banner || "",
    bio: row.bio || "",
    country: row.country || "Global",
    website: row.website || "",
    twitter: row.twitter || "",
    preferredTypes: Array.isArray(row.preferred_types || row.preferredTypes)
      ? row.preferred_types || row.preferredTypes
      : [],
    primaryGenres: Array.isArray(row.primary_genres || row.primaryGenres)
      ? row.primary_genres || row.primaryGenres
      : ["Fantasy", "Sci-Fi"],
    agreedToCreatorTerms: Boolean(
      row.agreed_to_creator_terms ?? row.agreedToCreatorTerms ?? true
    ),
    isCreatorProfileComplete: Boolean(
      row.is_creator_profile_complete ?? row.isCreatorProfileComplete ?? true
    ),
    isEmailVerified: Boolean(row.is_email_verified ?? row.isEmailVerified ?? true),
    isAgeVerified: Boolean(row.is_age_verified ?? row.isAgeVerified ?? true),
    monetizationTier: row.monetization_tier || row.monetizationTier || "NONE",
    monetizationStatus:
      row.monetization_status || row.monetizationStatus || "NOT_APPLIED",
    fraudAuditStatus:
      row.fraud_audit_status || row.fraudAuditStatus || "CLEAN",
    isVerified: Boolean(row.is_verified ?? row.isVerified),
    followersCount:
      typeof (row.followers_count ?? row.followersCount) === "number"
        ? row.followers_count ?? row.followersCount
        : 0,
    followingCount:
      typeof (row.following_count ?? row.followingCount) === "number"
        ? row.following_count ?? row.followingCount
        : 0,
    totalReads:
      typeof (row.total_reads ?? row.totalReads) === "number"
        ? row.total_reads ?? row.totalReads
        : 0,
    coins: typeof row.coins === "number" ? row.coins : 0,
    totalTipsReceived:
      typeof (row.total_tips_received ?? row.totalTipsReceived) === "number"
        ? row.total_tips_received ?? row.totalTipsReceived
        : 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

async function ensureProfile(creatorId?: string, name?: string, username?: string): Promise<string> {
  const validId = ensureUuid(creatorId);
  try {
    await supabase.from("profiles").upsert(
      [
        {
          id: validId,
          username: username || `creator_${validId.slice(0, 6)}`,
          name: name || "Creator",
          email: `${username || "creator"}_${validId.slice(0, 4)}@yumora.app`,
          role: "CREATOR",
        },
      ],
      { onConflict: "id" }
    );
  } catch {
    // ignore
  }
  return validId;
}

export const dbService = {
  // 1. Novels
  async getNovels(): Promise<Novel[]> {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*, chapters(*), profiles:profiles(*)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: row.profiles?.name || "Original Author",
          username: row.profiles?.username || `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: row.profiles?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
          isVerified: row.profiles?.is_verified ?? true,
        },
        title: row.title || "Untitled Novel",
        slug: row.slug || row.id,
        description: row.description || "",
        coverUrl: row.cover_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
        bannerUrl: row.banner_url,
        genre: row.genre || "Fantasy",
        secondaryGenre: row.secondary_genre,
        tags: Array.isArray(row.tags) ? row.tags : [],
        language: row.language || "en",
        format: row.format || (row.sub_type === "ILLUSTRATED_NOVEL" ? "ILLUSTRATED" : "STANDARD"),
        subType: row.sub_type || (row.format === "ILLUSTRATED" ? "ILLUSTRATED_NOVEL" : "WEB_NOVEL"),
        status: row.status || "ONGOING",
        contentRating: row.content_rating || "TEEN",
        contentWarning: row.content_warning,
        views: row.views || 0,
        reads: row.reads || 0,
        likesCount: row.likes_count || 0,
        bookmarksCount: row.bookmarks_count || 0,
        rating: row.rating || 5.0,
        totalRatings: row.total_ratings || 0,
        isFeatured: !!row.is_featured,
        isEditorPick: !!row.is_editor_pick,
        isPremium: !!row.is_premium,
        chaptersCount: row.chapters_count || (row.chapters?.length || 0),
        chapters: (row.chapters || []).map((ch: any) => ({
          id: ch.id,
          novelId: ch.novel_id || row.id,
          chapterNumber: ch.chapter_number || 1,
          title: ch.title || `Chapter ${ch.chapter_number || 1}`,
          content: ch.content || "",
          status: ch.status || "PUBLISHED",
          wordCount: ch.word_count || 0,
          isFree: ch.is_free ?? true,
          publishedAt: ch.published_at || new Date().toISOString(),
          readTimeMinutes: ch.read_time_minutes || 1,
        })),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async getNovelBySlug(slug: string): Promise<Novel | null> {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*, chapters(*), profiles:profiles(*)")
        .eq("slug", slug)
        .single();

      if (error || !data) return null;
      const row: any = data;
      return {
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: row.profiles?.name || "Original Author",
          username: row.profiles?.username || `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: row.profiles?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
          isVerified: row.profiles?.is_verified ?? true,
        },
        title: row.title || "Untitled Novel",
        slug: row.slug || row.id,
        description: row.description || "",
        coverUrl: row.cover_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
        bannerUrl: row.banner_url,
        genre: row.genre || "Fantasy",
        secondaryGenre: row.secondary_genre,
        tags: Array.isArray(row.tags) ? row.tags : [],
        language: row.language || "en",
        format: row.format || (row.sub_type === "ILLUSTRATED_NOVEL" ? "ILLUSTRATED" : "STANDARD"),
        subType: row.sub_type || (row.format === "ILLUSTRATED" ? "ILLUSTRATED_NOVEL" : "WEB_NOVEL"),
        status: row.status || "ONGOING",
        contentRating: row.content_rating || "TEEN",
        contentWarning: row.content_warning,
        views: row.views || 0,
        reads: row.reads || 0,
        likesCount: row.likes_count || 0,
        bookmarksCount: row.bookmarks_count || 0,
        rating: row.rating || 5.0,
        totalRatings: row.total_ratings || 0,
        isFeatured: !!row.is_featured,
        isEditorPick: !!row.is_editor_pick,
        isPremium: !!row.is_premium,
        chaptersCount: row.chapters_count || (row.chapters?.length || 0),
        chapters: (row.chapters || []).map((ch: any) => ({
          id: ch.id,
          novelId: ch.novel_id || row.id,
          chapterNumber: ch.chapter_number || 1,
          title: ch.title || `Chapter ${ch.chapter_number || 1}`,
          content: ch.content || "",
          status: ch.status || "PUBLISHED",
          wordCount: ch.word_count || 0,
          isFree: ch.is_free ?? true,
          publishedAt: ch.published_at || new Date().toISOString(),
          readTimeMinutes: ch.read_time_minutes || 1,
        })),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  async insertNovel(novel: Partial<Novel>): Promise<Novel | null> {
    try {
      const validCreatorId = await ensureProfile(
        novel.creatorId,
        novel.creator?.name,
        novel.creator?.username
      );
      const validNovelId = ensureUuid(novel.id);

      const isLightNovel =
        novel.subType === "ILLUSTRATED_NOVEL" ||
        novel.format === "ILLUSTRATED" ||
        (novel.tags || []).some((t) => t.toLowerCase().includes("light novel"));

      const finalSubType = isLightNovel ? "ILLUSTRATED_NOVEL" : "WEB_NOVEL";
      const finalFormat = isLightNovel ? "ILLUSTRATED" : "STANDARD";
      const finalTags = Array.from(
        new Set([...(novel.tags || []), ...(isLightNovel ? ["Light Novel"] : [])])
      );

      const payload: Record<string, any> = {
        id: validNovelId,
        creator_id: validCreatorId,
        title: novel.title,
        slug: novel.slug,
        description: novel.description,
        cover_url: novel.coverUrl,
        banner_url: novel.bannerUrl,
        genre: novel.genre,
        secondary_genre: novel.secondaryGenre,
        tags: finalTags,
        language: novel.language || "en",
        format: finalFormat,
        sub_type: finalSubType,
        status: novel.status || "ONGOING",
        content_rating: novel.contentRating || "TEEN",
        content_warning: novel.contentWarning,
        views: novel.views || 1,
        reads: novel.reads || 1,
        likes_count: novel.likesCount || 0,
        bookmarks_count: novel.bookmarksCount || 0,
        rating: novel.rating || 5.0,
        total_ratings: novel.totalRatings || 1,
        is_featured: novel.isFeatured || false,
        is_editor_pick: novel.isEditorPick || false,
        is_premium: novel.isPremium || false,
        chapters_count: novel.chaptersCount || novel.chapters?.length || 1,
      };

      // Upsert into Supabase novels table
      let { data, error } = await supabase
        .from("novels")
        .upsert([payload], { onConflict: "id" })
        .select()
        .single();

      // If columns format/sub_type don't exist yet, retry without them (tags keep classification)
      if (error && (error.message.includes("column") || error.code === "42703")) {
        delete payload.format;
        delete payload.sub_type;
        const retry = await supabase
          .from("novels")
          .upsert([payload], { onConflict: "id" })
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("Supabase insert novel error:", error.message);
        return null;
      }
      return data as unknown as Novel;
    } catch (e) {
      console.warn("Supabase insert novel exception:", e);
      return null;
    }
  },

  async insertChapter(chapter: Partial<Chapter>, novelId: string): Promise<Chapter | null> {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .upsert(
          [
            {
              id: chapter.id,
              novel_id: novelId,
              chapter_number: chapter.chapterNumber,
              title: chapter.title,
              content: chapter.content,
              status: chapter.status || "PUBLISHED",
              word_count: chapter.wordCount || 0,
              read_time_minutes: chapter.readTimeMinutes || 1,
              is_free: chapter.isFree ?? true,
              published_at: chapter.publishedAt || new Date().toISOString(),
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Supabase insert chapter error:", error.message);
        return null;
      }
      return data as unknown as Chapter;
    } catch {
      return null;
    }
  },

  // 2. Comics & Manga
  async getComics(): Promise<Comic[]> {
    try {
      const { data, error } = await supabase
        .from("comics")
        .select("*, episodes(*), profiles:profiles(*)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: row.profiles?.name || "Original Artist",
          username: row.profiles?.username || `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: row.profiles?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
          isVerified: row.profiles?.is_verified ?? true,
        },
        title: row.title || "Untitled Comic",
        slug: row.slug || row.id,
        description: row.description || "",
        coverUrl: row.cover_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
        bannerUrl: row.banner_url,
        genre: row.genre || "Action",
        secondaryGenre: row.secondary_genre,
        tags: Array.isArray(row.tags) ? row.tags : [],
        language: row.language || "en",
        format: row.format || "PAGE_BASED",
        readingDirection: row.reading_direction || "VERTICAL",
        subType: row.sub_type || "MANGA",
        allowPdfDownload: row.allow_pdf_download ?? true,
        status: row.status || "ONGOING",
        contentRating: row.content_rating || "TEEN",
        contentWarning: row.content_warning,
        views: row.views || 0,
        reads: row.reads || 0,
        likesCount: row.likes_count || 0,
        bookmarksCount: row.bookmarks_count || 0,
        rating: row.rating || 5.0,
        totalRatings: row.total_ratings || 0,
        isFeatured: !!row.is_featured,
        isEditorPick: !!row.is_editor_pick,
        isPremium: !!row.is_premium,
        episodesCount: row.episodes_count || (row.episodes?.length || 0),
        episodes: (row.episodes || []).map((ep: any) => ({
          id: ep.id,
          comicId: ep.comic_id || row.id,
          episodeNumber: ep.episode_number || 1,
          title: ep.title || `Episode ${ep.episode_number || 1}`,
          thumbnailUrl: ep.thumbnail_url,
          imageUrls: Array.isArray(ep.image_urls) ? ep.image_urls : [],
          status: ep.status || "PUBLISHED",
          publishedAt: ep.published_at || new Date().toISOString(),
          likesCount: ep.likes_count || 0,
        })),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async getComicBySlug(slug: string): Promise<Comic | null> {
    try {
      const { data, error } = await supabase
        .from("comics")
        .select("*, episodes(*), profiles:profiles(*)")
        .eq("slug", slug)
        .single();

      if (error || !data) return null;
      const row: any = data;
      return {
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: row.profiles?.name || "Original Artist",
          username: row.profiles?.username || `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: row.profiles?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
          isVerified: row.profiles?.is_verified ?? true,
        },
        title: row.title || "Untitled Comic",
        slug: row.slug || row.id,
        description: row.description || "",
        coverUrl: row.cover_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
        bannerUrl: row.banner_url,
        genre: row.genre || "Action",
        secondaryGenre: row.secondary_genre,
        tags: Array.isArray(row.tags) ? row.tags : [],
        language: row.language || "en",
        format: row.format || "PAGE_BASED",
        readingDirection: row.reading_direction || "VERTICAL",
        subType: row.sub_type || "MANGA",
        allowPdfDownload: row.allow_pdf_download ?? true,
        status: row.status || "ONGOING",
        contentRating: row.content_rating || "TEEN",
        contentWarning: row.content_warning,
        views: row.views || 0,
        reads: row.reads || 0,
        likesCount: row.likes_count || 0,
        bookmarksCount: row.bookmarks_count || 0,
        rating: row.rating || 5.0,
        totalRatings: row.total_ratings || 0,
        isFeatured: !!row.is_featured,
        isEditorPick: !!row.is_editor_pick,
        isPremium: !!row.is_premium,
        episodesCount: row.episodes_count || (row.episodes?.length || 0),
        episodes: (row.episodes || []).map((ep: any) => ({
          id: ep.id,
          comicId: ep.comic_id || row.id,
          episodeNumber: ep.episode_number || 1,
          title: ep.title || `Episode ${ep.episode_number || 1}`,
          thumbnailUrl: ep.thumbnail_url,
          imageUrls: Array.isArray(ep.image_urls) ? ep.image_urls : [],
          status: ep.status || "PUBLISHED",
          publishedAt: ep.published_at || new Date().toISOString(),
          likesCount: ep.likes_count || 0,
        })),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  async insertComic(comic: Partial<Comic>): Promise<Comic | null> {
    try {
      const validCreatorId = await ensureProfile(
        comic.creatorId,
        comic.creator?.name,
        comic.creator?.username
      );
      const validComicId = ensureUuid(comic.id);

      const { data, error } = await supabase
        .from("comics")
        .upsert(
          [
            {
              id: validComicId,
              creator_id: validCreatorId,
              title: comic.title,
              slug: comic.slug,
              description: comic.description,
              cover_url: comic.coverUrl,
              banner_url: comic.bannerUrl,
              genre: comic.genre,
              secondary_genre: comic.secondaryGenre,
              tags: comic.tags || [],
              language: comic.language || "en",
              format: comic.format || "PAGE_BASED",
              reading_direction: comic.readingDirection || "VERTICAL",
              sub_type: comic.subType || "MANGA",
              allow_pdf_download: comic.allowPdfDownload ?? true,
              status: comic.status || "ONGOING",
              content_rating: comic.contentRating || "TEEN",
              content_warning: comic.contentWarning,
              views: comic.views || 1,
              reads: comic.reads || 1,
              likes_count: comic.likesCount || 0,
              bookmarks_count: comic.bookmarksCount || 0,
              rating: comic.rating || 5.0,
              total_ratings: comic.totalRatings || 1,
              is_featured: comic.isFeatured ?? true,
              is_editor_pick: comic.isEditorPick ?? true,
              is_premium: comic.isPremium || false,
              episodes_count: comic.episodesCount || comic.episodes?.length || 1,
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Supabase insert comic error:", error.message);
        return null;
      }
      return data as unknown as Comic;
    } catch (e) {
      console.warn("Supabase insert comic exception:", e);
      return null;
    }
  },

  async insertEpisode(episode: Partial<ComicEpisode>, comicId: string): Promise<ComicEpisode | null> {
    try {
      const validComicId = ensureUuid(comicId);
      const validEpisodeId = ensureUuid(episode.id);

      const { data, error } = await supabase
        .from("episodes")
        .upsert(
          [
            {
              id: validEpisodeId,
              comic_id: validComicId,
              episode_number: episode.episodeNumber,
              title: episode.title,
              thumbnail_url: episode.thumbnailUrl,
              image_urls: episode.imageUrls || [],
              status: episode.status || "PUBLISHED",
              likes_count: episode.likesCount || 0,
              published_at: episode.publishedAt || new Date().toISOString(),
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Supabase insert episode error:", error.message);
        return null;
      }
      return data as unknown as ComicEpisode;
    } catch {
      return null;
    }
  },

  async deleteComic(comicId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("comics").delete().eq("id", comicId);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteNovel(novelId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("novels").delete().eq("id", novelId);
      return !error;
    } catch {
      return false;
    }
  },

  // 3. Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) return null;
      return mapProfileFromDb(data);
    } catch {
      return null;
    }
  },

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      if (!username) return null;
      const clean = username.trim().replace(/^@/, "");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", clean)
        .maybeSingle();

      if (error || !data) return null;
      return mapProfileFromDb(data);
    } catch {
      return null;
    }
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((r) => mapProfileFromDb(r)).filter((p): p is UserProfile => p !== null);
    } catch {
      return [];
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      return !error;
    } catch {
      return false;
    }
  },

  async upsertProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      if (!profile.id) return false;
      const { error } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              id: profile.id,
              username: profile.username || `user_${profile.id.slice(0, 6)}`,
              name: profile.name || "Creator",
              email: profile.email || "",
              role: profile.role || "CREATOR",
              avatar: profile.avatar,
              banner: profile.banner,
              bio: profile.bio || "Storyteller on Yomika.",
              country: profile.country || "Global",
              is_verified: profile.isVerified || false,
              is_creator_profile_complete: profile.isCreatorProfileComplete || false,
              monetization_tier: profile.monetizationTier || "NONE",
              monetization_status: profile.monetizationStatus || "NOT_APPLIED",
              followers_count: profile.followersCount || 0,
              following_count: profile.followingCount || 0,
              total_reads: profile.totalReads || 0,
            },
          ],
          { onConflict: "id" }
        );

      return !error;
    } catch {
      return false;
    }
  },

  // 4. Comments
  async getComments(novelId?: string, chapterId?: string, comicId?: string, episodeId?: string): Promise<Comment[]> {
    try {
      let query = supabase.from("comments").select("*, user:profiles(*)");
      if (episodeId) query = query.eq("episode_id", episodeId);
      else if (comicId) query = query.eq("comic_id", comicId);
      else if (chapterId) query = query.eq("chapter_id", chapterId);
      else if (novelId) query = query.eq("novel_id", novelId);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) return [];
      return (data as unknown as Comment[]) || [];
    } catch {
      return [];
    }
  },

  async addComment(comment: {
    userId: string;
    content: string;
    novelId?: string;
    chapterId?: string;
    comicId?: string;
    episodeId?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from("comments").insert([
        {
          user_id: comment.userId,
          content: comment.content,
          novel_id: comment.novelId,
          chapter_id: comment.chapterId,
          comic_id: comment.comicId,
          episode_id: comment.episodeId,
        },
      ]);
      return !error;
    } catch {
      return false;
    }
  },

  // 5. Contests
  async getContests(): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .order("start_date", { ascending: false });

      if (error || !data || data.length === 0) return [];
      return data.map((c: any) => ({
        id: c.id,
        contestNumber: c.contest_number || c.contestNumber || "08",
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle || "",
        description: c.description || "",
        bannerUrl: c.banner_url || c.bannerUrl || "/hero-character.png",
        heroCoverUrl: c.hero_cover_url || c.heroCoverUrl || "/hero-character.png",
        category: c.category || "Sci-Fi & Fantasy",
        prizePool: c.prize_pool || c.prizePool || "$850 USD",
        prizeStructure: c.prize_structure || c.prizeStructure || [
          { place: "Grand Prize", reward: "$500 USD", desc: "Official Feature & Publishing Review" },
          { place: "Runner Up", reward: "$200 USD", desc: "Verified Badge & Banner Spotlight" },
          { place: "3rd Place", reward: "$100 USD", desc: "Community Spotlight & Verified Badge" },
          { place: "Reader Choice", reward: "$50 USD", desc: "Audience Favorite Badge & Promo" },
        ],
        startDate: c.start_date || c.startDate,
        endDate: c.end_date || c.endDate,
        timezone: c.timezone || "Asia/Kolkata",
        status: c.status || "LIVE",
        isPublished: c.is_published ?? c.isPublished ?? true,
        rules: c.rules || [
          "Minimum 2 published chapters at submission time",
          "Original work owned 100% by the publishing author",
          "Submissions evaluated based on reader engagement, originality, and storytelling pace",
        ],
        judgingCriteria: c.judging_criteria || c.judgingCriteria || [
          { title: "WORLD BUILDING & LORE", weight: "35%", percentage: 35, desc: "Rich universe rules, immersive setting, and distinct creative premise" },
          { title: "CHARACTER ARCS & VOICE", weight: "30%", percentage: 30, desc: "Compelling protagonist motives, believable dialogue, and emotional resonance" },
          { title: "PACING & ORIGINALITY", weight: "20%", percentage: 20, desc: "Addictive narrative hooks, unexpected twists, and polished prose flow" },
          { title: "READER IMPACT & ENGAGEMENT", weight: "15%", percentage: 15, desc: "Audience comments, community votes, and chapter read-through rate" },
        ],
        eligibleGenres: c.eligible_genres || c.eligibleGenres || ["All"],
        minChapters: c.min_chapters || c.minChapters || 2,
        submissionCount: c.submission_count || c.submissionCount || 0,
        createdAt: c.created_at || c.createdAt,
        updatedAt: c.updated_at || c.updatedAt,
      })) as Contest[];
    } catch {
      return [];
    }
  },

  // 6. User Activity: Bookmarks
  async getUserBookmarks(userId: string): Promise<string[]> {
    try {
      if (!userId) return [];
      const validUserId = ensureUuid(userId);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("novel_id, comic_id")
        .eq("user_id", validUserId);

      if (error || !data) return [];
      return data
        .map((r: any) => r.novel_id || r.comic_id)
        .filter(Boolean);
    } catch {
      return [];
    }
  },

  async toggleBookmark(userId: string, targetId: string, type: "NOVEL" | "COMIC"): Promise<boolean> {
    try {
      if (!userId || !targetId) return false;
      const validUserId = ensureUuid(userId);
      const validTargetId = ensureUuid(targetId);

      const field = type === "NOVEL" ? "novel_id" : "comic_id";
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", validUserId)
        .eq(field, validTargetId)
        .maybeSingle();

      if (existing) {
        await supabase.from("bookmarks").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("bookmarks").insert([
          {
            user_id: validUserId,
            [field]: validTargetId,
          },
        ]);
        return true;
      }
    } catch {
      return false;
    }
  },

  // 7. User Activity: Likes
  async getUserLikes(userId: string): Promise<string[]> {
    try {
      if (!userId) return [];
      const validUserId = ensureUuid(userId);
      const { data, error } = await supabase
        .from("likes")
        .select("target_id")
        .eq("user_id", validUserId);

      if (error || !data) return [];
      return data.map((r: any) => r.target_id).filter(Boolean);
    } catch {
      return [];
    }
  },

  async toggleLike(userId: string, targetId: string, targetType: string): Promise<boolean> {
    try {
      if (!userId || !targetId) return false;
      const validUserId = ensureUuid(userId);
      const validTargetId = ensureUuid(targetId);

      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", validUserId)
        .eq("target_id", validTargetId)
        .maybeSingle();

      if (existing) {
        await supabase.from("likes").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("likes").insert([
          {
            user_id: validUserId,
            target_id: validTargetId,
            target_type: targetType || "STORY",
          },
        ]);
        return true;
      }
    } catch {
      return false;
    }
  },

  // 8. User Activity: Follows
  async getUserFollows(userId: string): Promise<string[]> {
    try {
      if (!userId) return [];
      const validUserId = ensureUuid(userId);
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", validUserId);

      if (error || !data) return [];
      return data.map((r: any) => r.following_id).filter(Boolean);
    } catch {
      return [];
    }
  },

  // Returns full profile data for all creators a user follows
  async getFollowedCreatorProfiles(userId: string): Promise<UserProfile[]> {
    try {
      if (!userId) return [];
      const validUserId = ensureUuid(userId);

      // Step 1: Get the IDs of followed creators
      const { data: followRows, error: followError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", validUserId);

      if (followError || !followRows || followRows.length === 0) return [];

      const followingIds = followRows
        .map((r: any) => r.following_id)
        .filter(Boolean);

      if (followingIds.length === 0) return [];

      // Step 2: Batch-fetch their profiles from the profiles table
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followingIds);

      if (profileError || !profileRows) return [];

      return profileRows
        .map((row: any) => mapProfileFromDb(row))
        .filter((p: UserProfile | null): p is UserProfile => p !== null);
    } catch {
      return [];
    }
  },

  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    try {
      if (!followerId || !followingId || followerId === followingId) return false;
      const validFollower = ensureUuid(followerId);
      const validFollowing = ensureUuid(followingId);

      const { data: existing } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", validFollower)
        .eq("following_id", validFollowing)
        .maybeSingle();

      if (existing) {
        await supabase.from("follows").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("follows").insert([
          {
            follower_id: validFollower,
            following_id: validFollowing,
          },
        ]);
        return true;
      }
    } catch {
      return false;
    }
  },

  // 9. Reading Progress
  async getReadingProgress(userId: string, contentId: string): Promise<ReadingProgress | null> {
    try {
      if (!userId || !contentId) return null;
      const validUserId = ensureUuid(userId);
      const validContentId = ensureUuid(contentId);

      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", validUserId)
        .eq("content_id", validContentId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        contentId: data.content_id,
        contentType: data.content_type || "NOVEL",
        chapterNumber: data.chapter_number,
        episodeNumber: data.episode_number,
        scrollOffset: data.scroll_offset || 0,
        pageIndex: data.page_index || 0,
        progressPercentage: data.progress_percentage || 0,
        lastReadAt: data.last_read_at || data.updated_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  async saveReadingProgress(progress: Partial<ReadingProgress>): Promise<boolean> {
    try {
      if (!progress.userId || !progress.contentId) return false;
      const validUserId = ensureUuid(progress.userId);
      const validContentId = ensureUuid(progress.contentId);

      const { error } = await supabase
        .from("reading_progress")
        .upsert(
          [
            {
              user_id: validUserId,
              content_id: validContentId,
              content_type: progress.contentType || "NOVEL",
              chapter_number: progress.chapterNumber,
              episode_number: progress.episodeNumber,
              scroll_offset: progress.scrollOffset || 0,
              page_index: progress.pageIndex || 0,
              last_read_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id,content_id" }
        );

      return !error;
    } catch {
      return false;
    }
  },

  // 10. Authoritative Coin Wallet & Transactions
  async getWalletBalance(userId: string): Promise<number> {
    try {
      if (!userId) return 0;
      const validUserId = ensureUuid(userId);

      const { data, error } = await supabase
        .from("coin_wallets")
        .select("balance")
        .eq("user_id", validUserId)
        .maybeSingle();

      if (error || !data) return 0;
      return typeof data.balance === "number" ? data.balance : 0;
    } catch {
      return 0;
    }
  },

  async recordCoinTransaction(tx: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    referenceId?: string;
  }): Promise<boolean> {
    try {
      if (!tx.userId || !tx.amount) return false;
      const validUserId = ensureUuid(tx.userId);

      // 1. Fetch current wallet balance
      const currentBalance = await this.getWalletBalance(validUserId);
      const newBalance = Math.max(0, currentBalance + tx.amount);

      // 2. Upsert updated wallet balance
      await supabase
        .from("coin_wallets")
        .upsert(
          [
            {
              user_id: validUserId,
              balance: newBalance,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" }
        );

      // 3. Log to audit ledger
      await supabase.from("coin_transactions").insert([
        {
          user_id: validUserId,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          reference_id: tx.referenceId,
          created_at: new Date().toISOString(),
        },
      ]);

      return true;
    } catch {
      return false;
    }
  },

  async sendTip(
    fromUserId: string,
    toCreatorId: string,
    amount: number,
    contentTitle?: string,
    message?: string
  ): Promise<{ success: boolean; error?: string; remainingCoins?: number }> {
    try {
      if (!fromUserId || !toCreatorId || amount <= 0) {
        return { success: false, error: "Invalid tip parameters." };
      }

      const validFromUser = ensureUuid(fromUserId);
      const validToCreator = ensureUuid(toCreatorId);

      const senderBalance = await this.getWalletBalance(validFromUser);
      if (senderBalance < amount) {
        return {
          success: false,
          error: `Insufficient coins balance. You have ${senderBalance} coins.`,
        };
      }

      // Deduct from sender
      await this.recordCoinTransaction({
        userId: validFromUser,
        amount: -amount,
        type: "TIP_SENT",
        description: `Tipped ${amount} coins to creator on ${contentTitle || "story"}`,
      });

      // Credit to creator
      await this.recordCoinTransaction({
        userId: validToCreator,
        amount: amount,
        type: "TIP_RECEIVED",
        description: `Received ${amount} coins tip from reader: ${message || "Support"}`,
      });

      const remaining = senderBalance - amount;
      return { success: true, remainingCoins: remaining };
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to complete coin tip." };
    }
  },

  // 11. Authoritative Payout Requests
  async getPayoutRequests(creatorId?: string): Promise<PayoutRequest[]> {
    try {
      let query = supabase
        .from("payout_requests")
        .select("*, user:profiles(id, name, email, username)");

      if (creatorId) {
        query = query.eq("user_id", ensureUuid(creatorId));
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error || !data) return [];

      return data.map((r: any) => ({
        id: r.id,
        creatorId: r.user_id,
        creatorName: r.user?.name || "Creator",
        creatorEmail: r.user?.email || "",
        amountInr: r.amount_inr,
        amountUsd: r.amount_usd || Math.round((r.amount_inr / 83) * 100) / 100,
        method: r.method || "UPI",
        details: r.details,
        accountHolderName: r.account_holder_name || r.user?.name || "",
        status: r.status || "PENDING",
        requestedAt: r.created_at || new Date().toISOString(),
        processedAt: r.processed_at,
        transactionReference: r.reference_id,
        notes: r.note,
      }));
    } catch {
      return [];
    }
  },

  async createPayoutRequest(req: Partial<PayoutRequest>): Promise<boolean> {
    try {
      if (!req.creatorId || !req.amountInr) return false;
      const validUserId = ensureUuid(req.creatorId);

      const { error } = await supabase.from("payout_requests").insert([
        {
          user_id: validUserId,
          amount_inr: req.amountInr,
          amount_usd: req.amountUsd || Math.round((req.amountInr / 83) * 100) / 100,
          method: req.method || "UPI",
          details: req.details,
          account_holder_name: req.accountHolderName || "",
          status: "PENDING",
          created_at: new Date().toISOString(),
        },
      ]);

      return !error;
    } catch {
      return false;
    }
  },

  async upsertContest(contest: Partial<Contest>): Promise<boolean> {
    try {
      const { error } = await supabase.from("contests").upsert([
        {
          id: contest.id,
          title: contest.title,
          slug: contest.slug,
          subtitle: contest.subtitle,
          description: contest.description,
          banner_url: contest.bannerUrl,
          prize_pool: contest.prizePool,
          start_date: contest.startDate,
          end_date: contest.endDate,
          status: contest.status,
          rules: contest.rules,
          min_chapters: contest.minChapters,
        },
      ]);
      return !error;
    } catch {
      return false;
    }
  },
};
