import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const genre = searchParams.get("genre") || "";
    const language = searchParams.get("language") || "";
    const status = searchParams.get("status") || "";
    const contentRating = searchParams.get("contentRating") || "";
    const format = searchParams.get("format") || ""; // web_novels, light_novels, manga, webtoons, comics
    const sortBy = searchParams.get("sortBy") || "trending"; // trending, reads, rating, newest, likes
    const activeTab = searchParams.get("tab") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build novels query - include chapters count
    let novelsQuery = supabase
      .from("novels")
      .select("*, profiles:profiles(name, username, avatar), chapters(id)", { count: "exact" });

    // Build comics query
    let comicsQuery = supabase
      .from("comics")
      .select("*, profiles:profiles(name, username, avatar)", { count: "exact" });

    // Apply search
    if (q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      novelsQuery = novelsQuery.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},genre.ilike.${searchTerm}`
      );
      comicsQuery = comicsQuery.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},genre.ilike.${searchTerm}`
      );
    }

    // Apply genre filter
    if (genre && genre !== "All Genres") {
      novelsQuery = novelsQuery.or(`genre.ilike.%${genre}%,secondary_genre.ilike.%${genre}%`);
      comicsQuery = comicsQuery.or(`genre.ilike.%${genre}%,secondary_genre.ilike.%${genre}%`);
    }

    // Apply language filter
    if (language && language !== "all") {
      novelsQuery = novelsQuery.eq("language", language);
      comicsQuery = comicsQuery.eq("language", language);
    }

    // Apply status filter
    if (status && status !== "all") {
      novelsQuery = novelsQuery.eq("status", status);
      comicsQuery = comicsQuery.eq("status", status);
    }

    // Apply content rating filter
    if (contentRating && contentRating !== "all") {
      novelsQuery = novelsQuery.eq("content_rating", contentRating);
      comicsQuery = comicsQuery.eq("content_rating", contentRating);
    }

    // Apply tab filters
    if (activeTab === "trending") {
      novelsQuery = novelsQuery.gte("reads", 500);
      comicsQuery = comicsQuery.gte("reads", 500);
    } else if (activeTab === "editors") {
      novelsQuery = novelsQuery.eq("is_editor_pick", true);
      comicsQuery = comicsQuery.eq("is_editor_pick", true);
    } else if (activeTab === "completed") {
      novelsQuery = novelsQuery.eq("status", "COMPLETED");
      comicsQuery = comicsQuery.eq("status", "COMPLETED");
    } else if (activeTab === "gems") {
      novelsQuery = novelsQuery.lte("reads", 150000).gte("rating", 4.8);
      comicsQuery = comicsQuery.lte("reads", 150000).gte("rating", 4.8);
    }

    // Apply format filter (novels only, comics only, or both)
    const novelFormats = ["web_novels", "light_novels"];
    const comicFormats = ["manga", "webtoons", "comics"];
    const storyFormatMap: Record<string, string> = {
      web_novels: "WEB_NOVEL",
      light_novels: "LIGHT_NOVEL",
      manga: "MANGA",
      webtoons: "WEBTOON",
      comics: "COMIC",
    };

    let includeNovels = true;
    let includeComics = true;

    if (format && format !== "all") {
      if (novelFormats.includes(format)) {
        includeComics = false;
        if (format === "light_novels") {
          novelsQuery = novelsQuery.in("sub_type", ["LIGHT_NOVEL", "ILLUSTRATED_NOVEL"]);
        } else {
          novelsQuery = novelsQuery.eq("sub_type", storyFormatMap[format]);
        }
      } else if (comicFormats.includes(format)) {
        includeNovels = false;
        comicsQuery = comicsQuery.eq("sub_type", storyFormatMap[format]);
      }
    }

    // Apply sorting
    const sortColumn = sortBy === "reads" ? "reads"
      : sortBy === "rating" ? "rating"
      : sortBy === "likes" ? "likes_count"
      : sortBy === "newest" ? "created_at"
      : "reads"; // trending default: sort by reads * rating combo approximated by reads

    const ascending = false;

    if (includeNovels) {
      novelsQuery = novelsQuery.order(sortColumn, { ascending }).range(offset, offset + limit - 1);
    }
    if (includeComics) {
      comicsQuery = comicsQuery.order(sortColumn, { ascending }).range(offset, offset + limit - 1);
    }

    // Execute queries in parallel
    const [novelsResult, comicsResult] = await Promise.all([
      includeNovels ? novelsQuery : Promise.resolve({ data: [], count: 0, error: null }),
      includeComics ? comicsQuery : Promise.resolve({ data: [], count: 0, error: null }),
    ]);

    const novels = (novelsResult.data || []).map((row: any) => ({
      id: row.id,
      type: "NOVEL" as const,
      title: row.title,
      slug: row.slug,
      coverUrl: row.cover_url,
      genre: row.genre,
      secondaryGenre: row.secondary_genre,
      tags: row.tags || [],
      description: row.description,
      language: row.language || "en",
      status: row.status,
      contentRating: row.content_rating,
      storyFormat: row.sub_type === "ILLUSTRATED_NOVEL" ? "LIGHT_NOVEL" : row.sub_type,
      isEditorPick: row.is_editor_pick,
      reads: row.reads || 0,
      rating: row.rating || 5.0,
      likesCount: row.likes_count || 0,
      chaptersCount: Array.isArray(row.chapters) ? row.chapters.length : 0,
      createdAt: row.created_at,
      creatorName: row.profiles?.name || "Creator",
      creatorUsername: row.profiles?.username || "creator",
      creatorAvatar: row.profiles?.avatar,
    }));

    const comics = (comicsResult.data || []).map((row: any) => ({
      id: row.id,
      type: "COMIC" as const,
      title: row.title,
      slug: row.slug,
      coverUrl: row.cover_url,
      genre: row.genre,
      secondaryGenre: row.secondary_genre,
      tags: row.tags || [],
      description: row.description,
      language: row.language || "en",
      status: row.status,
      contentRating: row.content_rating,
      storyFormat: row.sub_type,
      isEditorPick: row.is_editor_pick,
      reads: row.reads || 0,
      rating: row.rating || 5.0,
      likesCount: row.likes_count || 0,
      createdAt: row.created_at,
      creatorName: row.profiles?.name || "Creator",
      creatorUsername: row.profiles?.username || "creator",
      creatorAvatar: row.profiles?.avatar,
    }));

    return NextResponse.json({
      success: true,
      results: [...novels, ...comics],
      novelCount: novelsResult.count || novels.length,
      comicCount: comicsResult.count || comics.length,
      total: (novelsResult.count || novels.length) + (comicsResult.count || comics.length),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
