import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Optional user check (allows unauthenticated voting to match original client experience, or secure it)
    // To match original page.tsx where users can vote, we don't strictly reject anonymous votes, but we can log them or let them pass.
    // Let's let them pass but enforce uniqueness on the client, or check authentication if available:
    const authUser = await getAuthenticatedServerUser(req);

    // 2. Parse body parameters
    const body = await req.json();
    const { contestId, novelId } = body;

    if (!contestId || !novelId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (contestId, novelId)." },
        { status: 400 }
      );
    }

    // 3. Increment the vote count in database
    const updated = await prisma.contestSubmission.update({
      where: {
        contestId_contentId_contentType: {
          contestId,
          contentId: novelId,
          contentType: "NOVEL",
        },
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    // 4. Send database notification to the creator
    try {
      const novel = await prisma.novel.findUnique({
        where: { id: novelId },
        include: {
          profiles: {
            select: { name: true, avatar: true }
          }
        }
      });

      if (novel) {
        const voterProfile = authUser?.id ? await prisma.user.findUnique({
          where: { id: authUser.id },
          select: { name: true, avatar: true }
        }) : null;

        const voterName = voterProfile?.name || authUser?.name || "A Reader";
        const voterAvatar = voterProfile?.avatar || (authUser as any)?.avatar || "/hero-character.png";

        await prisma.notification.create({
          data: {
            userId: novel.creatorId,
            title: "New Contest Vote! 🗳️",
            message: `${voterName} voted for your story "${novel.title}" in the tournament!`,
            type: "VOTE",
            contentId: novelId,
            contentType: "NOVEL",
            contentUrl: `/novels/${novel.slug}`,
            creatorName: voterName,
            creatorAvatar: voterAvatar,
          },
        });
      }
    } catch (notifErr) {
      console.warn("[VOTE NOTIFICATION TRIGGER ERROR]", notifErr);
    }

    return NextResponse.json({
      success: true,
      votes: updated.votes,
      message: "Vote successfully cast and saved in database.",
    });
  } catch (error: any) {
    console.error("[POST /api/contests/vote ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error casting vote." },
      { status: 500 }
    );
  }
}
