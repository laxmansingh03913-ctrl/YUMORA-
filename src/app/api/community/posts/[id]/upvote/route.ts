import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

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
        { success: false, error: "Unauthorized: You must be logged in to upvote." },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await req.json();
    const { direction } = body; // "up" or "down"
    const delta = direction === "down" ? -1 : 1;

    // 3. Update upvotes in database
    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        upvotes: {
          increment: delta,
        },
      },
    });

    return NextResponse.json({
      success: true,
      upvotes: updatedPost.upvotes,
    });
  } catch (error: any) {
    console.error("[POST /api/community/posts/[id]/upvote ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error updating upvotes." },
      { status: 500 }
    );
  }
}
