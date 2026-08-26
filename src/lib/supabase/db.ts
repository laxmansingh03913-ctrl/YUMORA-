/**
 * Supabase Real PostgreSQL Database Client Service for Yomika
 */

import { supabase } from "./client";
import { Novel, Comic, ComicEpisode, Chapter, UserProfile, Comment, Contest } from "../types";

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
        .select("*, chapters(*)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: "Original Author",
          username: `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
          isVerified: true,
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
        .select("*, chapters(*)")
        .eq("slug", slug)
        .single();

      if (error || !data) return null;
      const row: any = data;
      return {
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: "Original Author",
          username: `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
          isVerified: true,
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

      const { data, error } = await supabase
        .from("novels")
        .upsert(
          [
            {
              id: validNovelId,
              creator_id: validCreatorId,
              title: novel.title,
              slug: novel.slug,
              description: novel.description,
              cover_url: novel.coverUrl,
              banner_url: novel.bannerUrl,
              genre: novel.genre,
              secondary_genre: novel.secondaryGenre,
              tags: novel.tags || [],
              language: novel.language || "en",
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
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

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
        .select("*, episodes(*)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: "Original Artist",
          username: `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
          isVerified: true,
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
        .select("*, episodes(*)")
        .eq("slug", slug)
        .single();

      if (error || !data) return null;
      const row: any = data;
      return {
        id: row.id,
        creatorId: row.creator_id || "creator",
        creator: {
          id: row.creator_id || "creator",
          name: "Original Artist",
          username: `creator_${String(row.creator_id || "auth").slice(0, 6)}`,
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
          isVerified: true,
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
