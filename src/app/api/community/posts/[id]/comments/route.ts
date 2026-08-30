import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Fetch comments for post ID from database
    const records = await prisma.communityComment.findMany({
      where: { postId },
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
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const comments = records.map((row) => ({
      id: row.id,
      postId: row.postId,
      userId: row.userId,
      user: {
        name: row.user?.name || "Storyteller",
        username: row.user?.username || "storyteller",
        avatar: row.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge: row.user?.role === "ADMIN" ? "Official Team" : row.user?.role === "CREATOR" ? "Author" : "Reader",
      },
      text: row.text,
      upvotes: row.upvotes,
      createdAt: row.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error("[GET /api/community/posts/[id]/comments ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching comments." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // 1. Authenticate user session
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to reply." },
        { status: 401 }
      );
    }

    // 2. Parse body data
    const body = await req.json();
    const { text } = body;

    // 3. Validation
    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    // 4. Create CommunityComment record in PostgreSQL Database
    const newComment = await prisma.communityComment.create({
      data: {
        postId,
        userId: authUser.id,
        text: text.trim(),
        upvotes: 0,
      },
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
      },
    });

    // 5. Format comment reply DTO
    const formattedComment = {
      id: newComment.id,
      postId: newComment.postId,
      userId: newComment.userId,
      user: {
        name: newComment.user?.name || "Storyteller",
        username: newComment.user?.username || "storyteller",
        avatar: newComment.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge: newComment.user?.role === "ADMIN" ? "Official Team" : newComment.user?.role === "CREATOR" ? "Author" : "Reader",
      },
      text: newComment.text,
      upvotes: newComment.upvotes,
      createdAt: newComment.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, comment: formattedComment });
  } catch (error: any) {
    console.error("[POST /api/community/posts/[id]/comments ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error posting reply." },
      { status: 500 }
    );
  }
}
