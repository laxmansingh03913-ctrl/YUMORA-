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
    const limit = Math.min(parseInt(searchParams.get("limit") || "80"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build novels query
    let novelsQuery = supabase
      .from("novels")
      .select("*, profiles:profiles(name, username, avatar)", { count: "exact" });

    // Build comics query
    let comicsQuery = supabase
      .from("comics")
      .select("*, profiles:profiles(name, username, avatar)", { count: "exact" });

    // 1. Search filter
    if (q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      novelsQuery = novelsQuery.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},genre.ilike.${searchTerm}`
      );
      comicsQuery = comicsQuery.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},genre.ilike.${searchTerm}`
      );
    }

    // 2. Genre filter
    if (genre && genre !== "All Genres") {
      novelsQuery = novelsQuery.or(`genre.ilike.%${genre}%,secondary_genre.ilike.%${genre}%`);
      comicsQuery = comicsQuery.or(`genre.ilike.%${genre}%,secondary_genre.ilike.%${genre}%`);
    }

    // 3. Language filter
    if (language && language !== "all") {
      novelsQuery = novelsQuery.eq("language", language);
      comicsQuery = comicsQuery.eq("language", language);
    }

    // 4. Status filter
    if (status && status !== "all") {
      novelsQuery = novelsQuery.eq("status", status);
      comicsQuery = comicsQuery.eq("status", status);
    }

    // 5. Content Rating filter
    if (contentRating && contentRating !== "all") {
      novelsQuery = novelsQuery.eq("content_rating", contentRating);
      comicsQuery = comicsQuery.eq("content_rating", contentRating);
    }

    // 6. Curated Tab Filters (Removed arbitrary 500 reads requirement so new stories appear!)
    if (activeTab === "trending") {
      // Prioritize stories with reads, but do not hide newer ones
      novelsQuery = novelsQuery.order("reads", { ascending: false });
      comicsQuery = comicsQuery.order("reads", { ascending: false });
    } else if (activeTab === "editors") {
      novelsQuery = novelsQuery.eq("is_editor_pick", true);
      comicsQuery = comicsQuery.eq("is_editor_pick", true);
    } else if (activeTab === "completed") {
      novelsQuery = novelsQuery.eq("status", "COMPLETED");
      comicsQuery = comicsQuery.eq("status", "COMPLETED");
    } else if (activeTab === "gems") {
      novelsQuery = novelsQuery.gte("rating", 4.5);
      comicsQuery = comicsQuery.gte("rating", 4.5);
    }

    // 7. Format Filter
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
          novelsQuery = novelsQuery.or("sub_type.eq.LIGHT_NOVEL,sub_type.eq.ILLUSTRATED_NOVEL,format.eq.ILLUSTRATED");
        } else {
          novelsQuery = novelsQuery.eq("sub_type", storyFormatMap[format] || "WEB_NOVEL");
        }
      } else if (comicFormats.includes(format)) {
        includeNovels = false;
        comicsQuery = comicsQuery.eq("sub_type", storyFormatMap[format] || "COMIC");
      }
    }

    // 8. Sorting
    const sortColumn =
      sortBy === "reads"
        ? "reads"
        : sortBy === "rating"
        ? "rating"
        : sortBy === "likes"
        ? "likes_count"
        : sortBy === "newest"
        ? "created_at"
        : "reads";

    if (includeNovels) {
      novelsQuery = novelsQuery.order(sortColumn, { ascending: false }).range(offset, offset + limit - 1);
    }
    if (includeComics) {
      comicsQuery = comicsQuery.order(sortColumn, { ascending: false }).range(offset, offset + limit - 1);
    }

    // Fetch active query results + Global format counts in parallel
    const [novelsResult, comicsResult, allNovelsOverview, allComicsOverview] = await Promise.all([
      includeNovels ? novelsQuery : Promise.resolve({ data: [], count: 0, error: null }),
      includeComics ? comicsQuery : Promise.resolve({ data: [], count: 0, error: null }),
      supabase.from("novels").select("sub_type, format"),
      supabase.from("comics").select("sub_type"),
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
      storyFormat:
        row.sub_type === "ILLUSTRATED_NOVEL" || row.format === "ILLUSTRATED"
          ? "LIGHT_NOVEL"
          : row.sub_type || "WEB_NOVEL",
      isEditorPick: row.is_editor_pick,
      reads: row.reads || 0,
      rating: Number(row.rating || 5.0),
      likesCount: row.likes_count || 0,
      chaptersCount: row.chapters_count || 0,
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
      storyFormat: row.sub_type || "COMIC",
      isEditorPick: row.is_editor_pick,
      reads: row.reads || 0,
      rating: Number(row.rating || 5.0),
      likesCount: row.likes_count || 0,
      episodesCount: row.episodes_count || 0,
      createdAt: row.created_at,
      creatorName: row.profiles?.name || "Creator",
      creatorUsername: row.profiles?.username || "creator",
      creatorAvatar: row.profiles?.avatar,
    }));

    // Interleave & sort combined results according to sortBy
    const combinedResults = [...novels, ...comics].sort((a, b) => {
      if (sortBy === "reads" || sortBy === "trending") {
        return (b.reads || 0) - (a.reads || 0);
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "likes") {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

    // Calculate true global format counts for the format selector badges
    const novelRows = allNovelsOverview.data || [];
    const comicRows = allComicsOverview.data || [];

    const formatCounts = {
      all: novelRows.length + comicRows.length,
      web_novels: novelRows.filter(
        (n: any) => n.sub_type !== "ILLUSTRATED_NOVEL" && n.sub_type !== "LIGHT_NOVEL" && n.format !== "ILLUSTRATED"
      ).length,
      light_novels: novelRows.filter(
        (n: any) => n.sub_type === "ILLUSTRATED_NOVEL" || n.sub_type === "LIGHT_NOVEL" || n.format === "ILLUSTRATED"
      ).length,
      manga: comicRows.filter((c: any) => c.sub_type === "MANGA").length,
      webtoons: comicRows.filter((c: any) => c.sub_type === "WEBTOON").length,
      comics: comicRows.filter((c: any) => c.sub_type === "COMIC" || c.sub_type === "GRAPHIC_NOVEL").length,
    };

    return NextResponse.json({
      success: true,
      results: combinedResults,
      formatCounts,
      novelCount: novelsResult.count || novels.length,
      comicCount: comicsResult.count || comics.length,
      total: (novelsResult.count || novels.length) + (comicsResult.count || comics.length),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
