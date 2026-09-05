import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/supabase/db";
import { prisma } from "@/lib/prisma";
import { Comic } from "@/lib/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const rawParams = await context.params;
    const rawSlug = rawParams?.slug || "";
    const cleanSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: "Slug is required" }, { status: 400 });
    }

    // 1. Query Prisma (PostgreSQL direct / connection pool)
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
      const whereCondition = isUuid
        ? { OR: [{ slug: cleanSlug }, { id: cleanSlug }] }
        : { slug: cleanSlug };

      const dbComic: any = await prisma.comic.findFirst({
        where: whereCondition,
        include: {
          episodes: {
            orderBy: { episodeNumber: "asc" },
          },
          profiles: true,
        },
      });

      if (dbComic) {
        // Increment views & reads in database in background
        prisma.comic.update({
          where: { id: dbComic.id },
          data: {
            views: { increment: 1 },
            reads: { increment: 1 },
          },
        }).catch((err) => console.warn("[COMIC VIEWS INCREMENT ERROR]", err));

        dbComic.views = (dbComic.views || 0) + 1;
        dbComic.reads = (dbComic.reads || 0) + 1;

        const formatted: Comic = {
          id: dbComic.id,
          creatorId: dbComic.creatorId,
          creator: {
            id: dbComic.creatorId,
            name: dbComic.profiles?.name || "Original Artist",
            username: dbComic.profiles?.username || `artist_${dbComic.creatorId.slice(0, 6)}`,
            avatar:
              dbComic.profiles?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
            isVerified: Boolean(dbComic.profiles?.isVerified),
          },
          title: dbComic.title || "Untitled Comic",
          slug: dbComic.slug,
          description: dbComic.description || "",
          coverUrl:
            dbComic.coverUrl ||
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
          bannerUrl: dbComic.bannerUrl || undefined,
          genre: dbComic.genre || "Action",
          secondaryGenre: dbComic.secondary_genre || undefined,
          tags: Array.isArray(dbComic.tags) ? dbComic.tags : [],
          language: dbComic.language || "en",
          format: dbComic.format || "PAGE_BASED",
          readingDirection: dbComic.reading_direction || "VERTICAL",
          subType: dbComic.sub_type || "MANGA",
          allowPdfDownload: dbComic.allow_pdf_download ?? true,
          status: (dbComic.status as any) || "ONGOING",
          contentRating: (dbComic.contentRating as any) || "TEEN",
          contentWarning: dbComic.content_warning || undefined,
          views: dbComic.views || 0,
          reads: dbComic.reads || 0,
          likesCount: dbComic.likes_count || 0,
          bookmarksCount: dbComic.bookmarks_count || 0,
          rating: Number(dbComic.rating) || 5.0,
          totalRatings: dbComic.totalRatings || 0,
          isFeatured: Boolean(dbComic.isFeatured),
          isEditorPick: Boolean(dbComic.isEditorPick),
          isPremium: Boolean(dbComic.isPremium),
          episodesCount: dbComic.episodes_count || (dbComic.episodes?.length || 0),
          episodes: (dbComic.episodes || []).map((ep: any) => ({
            id: ep.id,
            comicId: ep.comicId || dbComic.id,
            episodeNumber: ep.episodeNumber || 1,
            title: ep.title || `Episode ${ep.episodeNumber || 1}`,
            thumbnailUrl: ep.thumbnailUrl || undefined,
            imageUrls: Array.isArray(ep.imageUrls) ? ep.imageUrls : [],
            status: (ep.status as any) || "PUBLISHED",
            likesCount: ep.likes_count || 0,
            publishedAt: ep.publishedAt ? new Date(ep.publishedAt).toISOString() : new Date().toISOString(),
          })),
          createdAt: dbComic.createdAt ? new Date(dbComic.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: dbComic.updatedAt ? new Date(dbComic.updatedAt).toISOString() : new Date().toISOString(),
        };

        return NextResponse.json({ success: true, comic: formatted });
      }
    } catch (prismaErr) {
      console.warn("[PRISMA COMIC GET ERROR]", prismaErr);
    }

    // 2. Query Supabase Database Client fallback
    try {
      const supaComic = await dbService.getComicBySlug(cleanSlug);
      if (supaComic) {
        return NextResponse.json({ success: true, comic: supaComic });
      }
    } catch (supaErr) {
      console.warn("[SUPABASE COMIC GET ERROR]", supaErr);
    }

    // If not found anywhere, return 404
    return NextResponse.json(
      { success: false, error: "Comic not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[API COMIC SLUG GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve comic" },
      { status: 500 }
    );
  }
}
