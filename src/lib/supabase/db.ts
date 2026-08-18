/**
 * Supabase Real PostgreSQL Database Client Service for Yumora
 */

import { supabase } from "./client";
import { Novel, Comic, Chapter, UserProfile, Comment, Contest } from "../types";

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
        .insert([novel])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert novel error:", error.message);
        return null;
      }
      return data as unknown as Novel;
    } catch {
      return null;
    }
  },

  // 2. Chapters
  async insertChapter(chapter: Partial<Chapter>): Promise<Chapter | null> {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .insert([chapter])
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
  async getComments(novelId?: string, chapterId?: string): Promise<Comment[]> {
    try {
      let query = supabase.from("comments").select("*, user:profiles(*)");
      if (chapterId) query = query.eq("chapter_id", chapterId);
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
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from("comments").insert([
        {
          user_id: comment.userId,
          content: comment.content,
          novel_id: comment.novelId,
          chapter_id: comment.chapterId,
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
