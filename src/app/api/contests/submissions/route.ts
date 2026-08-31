import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get("contestId");

    if (!contestId) {
      return NextResponse.json(
        { success: false, error: "Missing contestId parameter." },
        { status: 400 }
      );
    }

    // 1. Fetch submissions from database
    const submissions = await prisma.contestSubmission.findMany({
      where: { contestId },
    });

    const novelIds = submissions.map((s) => s.contentId);

    // 2. Fetch associated Novels details
    const novels = await prisma.novel.findMany({
      where: {
        id: { in: novelIds },
      },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    // 3. Format and join data
    const formattedEntries = submissions.map((sub) => {
      const novel = novels.find((n) => n.id === sub.contentId);
      if (!novel) return null;

      const authorName = novel.profiles?.name || "Creator";
      const authorUsername = novel.profiles?.username || authorName.toLowerCase().replace(/\s+/g, "_");

      return {
        id: novel.id,
        submissionId: sub.id,
        title: novel.title,
        slug: novel.slug,
        author: `@${authorUsername}`,
        authorName,
        avatar: novel.profiles?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        coverUrl: novel.coverUrl,
        genre: novel.genre,
        chaptersCount: novel._count?.chapters || 2,
        rating: 4.8, // Fallback standard rating
        votes: sub.votes,
        status: sub.status,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      submissions: formattedEntries,
    });
  } catch (error: any) {
    console.error("[GET /api/contests/submissions ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching contest submissions." },
      { status: 500 }
    );
  }
}
