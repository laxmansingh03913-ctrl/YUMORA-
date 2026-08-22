/**
 * Supabase Real PostgreSQL Database Client Service for Yomika
 */

import { supabase } from "./client";
import { Novel, Comic, ComicEpisode, Chapter, UserProfile, Comment, Contest } from "../types";

export const dbService = {
  // 1. Novels
  async getNovels(): Promise<Novel[]> {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*, chapters(*), creator:profiles(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch novels notice:", error.message);
        return [];
      }
      return (data as unknown as Novel[]) || [];
    } catch {
      return [];
    }
  },

  async getNovelBySlug(slug: string): Promise<Novel | null> {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*, chapters(*), creator:profiles(*)")
        .eq("slug", slug)
        .single();

      if (error) return null;
      return (data as unknown as Novel) || null;
    } catch {
      return null;
    }
  },

  async insertNovel(novel: Partial<Novel>): Promise<Novel | null> {
    try {
      const { data, error } = await supabase
        .from("novels")
        .upsert(
          [
            {
              id: novel.id,
              creator_id: novel.creatorId,
              title: novel.title,
              slug: novel.slug,
              description: novel.description,
              cover_url: novel.coverUrl,
              banner_url: novel.bannerUrl,
              genre: novel.genre,
              secondary_genre: novel.secondaryGenre,
              tags: novel.tags,
              language: novel.language,
              status: novel.status,
              content_rating: novel.contentRating,
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
        .select("*, episodes(*), creator:profiles(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch comics notice:", error.message);
        return [];
      }
      return (data as unknown as Comic[]) || [];
    } catch {
      return [];
    }
  },

  async getComicBySlug(slug: string): Promise<Comic | null> {
    try {
      const { data, error } = await supabase
        .from("comics")
        .select("*, episodes(*), creator:profiles(*)")
        .eq("slug", slug)
        .single();

      if (error) return null;
      return (data as unknown as Comic) || null;
    } catch {
      return null;
    }
  },

  async insertComic(comic: Partial<Comic>): Promise<Comic | null> {
    try {
      const { data, error } = await supabase
        .from("comics")
        .upsert(
          [
            {
              id: comic.id,
              creator_id: comic.creatorId,
              title: comic.title,
              slug: comic.slug,
              description: comic.description,
              cover_url: comic.coverUrl,
              banner_url: comic.bannerUrl,
              genre: comic.genre,
              secondary_genre: comic.secondaryGenre,
              tags: comic.tags,
              language: comic.language,
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
      const { data, error } = await supabase
        .from("episodes")
        .upsert(
          [
            {
              id: episode.id,
              comic_id: comicId,
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
        .single();

      if (error) return null;
      return data as unknown as UserProfile;
    } catch {
      return null;
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

      if (error) return [];
      return (data as unknown as Contest[]) || [];
    } catch {
      return [];
    }
  },
};
