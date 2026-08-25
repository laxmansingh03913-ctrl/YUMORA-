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
