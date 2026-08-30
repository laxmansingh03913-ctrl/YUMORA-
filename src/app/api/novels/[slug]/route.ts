import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/supabase/db";
import { prisma } from "@/lib/prisma";
import { Novel } from "@/lib/types";

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

    // 1. Query Supabase (primary source of truth)
    try {
      const dbNovel: any = await prisma.novel.findFirst({
        where: {
          OR: [{ slug: cleanSlug }, { id: cleanSlug }],
        },
        include: {
          chapters: {
            orderBy: { chapterNumber: "asc" },
          },
          creator: true,
        },
      });

      if (dbNovel) {
        const formatted: Novel = {
          id: dbNovel.id,
          creatorId: dbNovel.creatorId,
          creator: {
            id: dbNovel.creatorId,
            name: dbNovel.creator?.name || "Author",
            username: dbNovel.creator?.username || `author_${dbNovel.creatorId.slice(0, 6)}`,
            avatar:
              dbNovel.creator?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
            isVerified: Boolean(dbNovel.creator?.isVerified),
          },
          title: dbNovel.title,
          slug: dbNovel.slug,
          description: dbNovel.description || "",
          coverUrl:
            dbNovel.coverUrl ||
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
          bannerUrl: dbNovel.bannerUrl || undefined,
          genre: dbNovel.genre || "Fantasy",
          secondaryGenre: dbNovel.secondaryGenre || undefined,
          tags: Array.isArray(dbNovel.tags) ? dbNovel.tags : [],
          language: (dbNovel.language as any) || "en",
          status: (dbNovel.status as any) || "ONGOING",
          contentRating: (dbNovel.contentRating as any) || "TEEN",
          contentWarning: (dbNovel as any).contentWarning || undefined,
          views: dbNovel.views || 0,
          reads: dbNovel.reads || 0,
          likesCount: (dbNovel as any).likesCount || 0,
          bookmarksCount: (dbNovel as any).bookmarksCount || 0,
          rating: dbNovel.rating || 5.0,
          totalRatings: dbNovel.totalRatings || 0,
          isFeatured: Boolean(dbNovel.isFeatured),
          isEditorPick: Boolean(dbNovel.isEditorPick),
          isPremium: Boolean(dbNovel.isPremium),
          chaptersCount: (dbNovel as any).chaptersCount || (dbNovel.chapters?.length || 0),
          chapters: (dbNovel.chapters || []).map((ch: any) => ({
            id: ch.id,
            novelId: ch.novelId,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
            status: (ch.status as any) || "PUBLISHED",
            wordCount: ch.wordCount || 0,
            isFree: ch.isFree,
            publishedAt: ch.publishedAt ? new Date(ch.publishedAt).toISOString() : new Date().toISOString(),
            readTimeMinutes: (ch as any).readTimeMinutes || 1,
          })),
          createdAt: dbNovel.createdAt ? new Date(dbNovel.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: dbNovel.updatedAt ? new Date(dbNovel.updatedAt).toISOString() : new Date().toISOString(),
        };

        return NextResponse.json({ success: true, novel: formatted });
      }
    } catch (prismaErr) {
      console.warn("[PRISMA NOVEL GET ERROR]", prismaErr);
    }

    // 4. Query Supabase Database Client
    try {
      const supaNovel = await dbService.getNovelBySlug(cleanSlug);
      if (supaNovel) {
        return NextResponse.json({ success: true, novel: supaNovel });
      }
    } catch (supaErr) {
      console.warn("[SUPABASE NOVEL GET ERROR]", supaErr);
    }

    // If not found anywhere, return 404
    return NextResponse.json(
      { success: false, error: "Novel not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[API NOVEL SLUG GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve novel" },
      { status: 500 }
    );
  }
}
