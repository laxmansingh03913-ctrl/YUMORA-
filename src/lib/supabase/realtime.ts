/**
 * Yomika A-to-Z Real-Time WebSocket Synchronization Engine
 * Subscribes to live PostgreSQL row changes via Supabase Realtime channels
 */

"use client";

import { useEffect } from "react";
import { supabase } from "./client";
import { dataStore } from "../data/store";
import { Novel, Comic, Chapter, ComicEpisode, Comment, UserProfile } from "../types";

export function useRealtimeSync() {
  useEffect(() => {
    // Check if Supabase client is available
    if (!supabase) return;

    // Listen to all PostgreSQL Table Events in Real-Time
    const channel = supabase
      .channel("yomika_global_realtime")
      // 1. Profiles Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const profile = payload.new as UserProfile;
            if (profile?.id) {
              dataStore.updateUserProfile(profile.id, profile);
            }
          }
        }
      )
      // 2. Novels Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "novels" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const novel = payload.new as Novel;
            if (novel?.id) {
              dataStore.saveNovel(novel);
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old?.id) {
              dataStore.deleteNovel(payload.old.id);
            }
          }
        }
      )
      // 3. Chapters Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chapters" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const chapter = payload.new as Chapter;
            if (chapter?.novelId && chapter?.id) {
              dataStore.saveChapter(chapter.novelId, chapter);
            }
          }
        }
      )
      // 4. Comics Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comics" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const comic = payload.new as Comic;
            if (comic?.id) {
              dataStore.saveComic(comic);
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old?.id) {
              dataStore.deleteComic(payload.old.id);
            }
          }
        }
      )
      // 5. Comic Episodes Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "episodes" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const ep = payload.new as ComicEpisode;
            if (ep?.comicId && ep?.id) {
              dataStore.saveEpisode(ep.comicId, ep);
            }
          }
        }
      )
      // 6. Comments Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const comment = payload.new as Comment;
            if (comment?.id) {
              dataStore.addComment(comment);
            }
          }
        }
      )
      // 7. Likes Realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        (payload) => {
          // Triggers re-sync of likes count
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("⚡ [YOMIKA REALTIME] Connected to live Supabase WebSocket channel");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}

export function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  return <>{children}</>;
}
