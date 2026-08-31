import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";
import { ensureUuid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch community posts from database
    const records = await prisma.communityPost.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    // 2. Map schema mapping fields to match frontend CommunityPost shape
    const posts = records.map((row) => ({
      id: row.id,
      userId: row.userId,
      user: {
        name: row.user?.name || "Storyteller",
        username: row.user?.username || "storyteller",
        avatar: row.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge: row.user?.role === "ADMIN" ? "Official Team" : row.user?.role === "CREATOR" ? "Author" : "Reader",
      },
      category: row.category,
      title: row.title,
      content: row.content,
      tags: row.tags,
      upvotes: row.upvotes,
      commentsCount: row._count.comments,
      views: row.views,
      isPinned: row.isPinned,
      createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("[GET /api/community/posts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching posts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, content, tags, userId } = body;

    if (!category || !title || !content || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: category, title, content, userId." },
        { status: 400 }
      );
    }

    const dbUserId = ensureUuid(userId);

    const newPost = await prisma.communityPost.create({
      data: {
        userId: dbUserId,
        category,
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        upvotes: 0,
        views: 0,
        isPinned: false,
      },
      include: {
        user: true,
      },
    });

    const formattedPost = {
      id: newPost.id,
      userId: newPost.userId,
      user: {
        name: newPost.user?.name || "Storyteller",
        username: newPost.user?.username || "storyteller",
        avatar: newPost.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge: newPost.user?.role === "ADMIN" ? "Official Team" : newPost.user?.role === "CREATOR" ? "Author" : "Reader",
      },
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags,
      upvotes: newPost.upvotes,
      commentsCount: 0,
      views: newPost.views,
      isPinned: newPost.isPinned,
      createdAt: newPost.createdAt ? newPost.createdAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({ success: true, post: formattedPost });
  } catch (error: any) {
    console.error("[POST /api/community/posts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error creating post." },
      { status: 500 }
    );
  }
}
