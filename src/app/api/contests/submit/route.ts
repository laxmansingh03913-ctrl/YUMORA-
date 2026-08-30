import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContestStatus } from "@/lib/utils/contest";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to submit a story." },
        { status: 401 }
      );
    }

    // 2. Parse body parameters
    const body = await req.json();
    const { contestId, novelId, creatorId } = body;

    if (!contestId || !novelId || !creatorId) {
      return NextResponse.json(
        { success: false, error: "Missing required submission fields (contestId, novelId, creatorId)." },
        { status: 400 }
      );
    }

    // 3. Authenticate ownership
    if (authUser.role !== "ADMIN" && authUser.id !== creatorId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You can only submit your own stories." },
        { status: 403 }
      );
    }

    // 4. Query active contest from database to check status
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json(
        { success: false, error: "Contest not found." },
        { status: 404 }
      );
    }

    const serverCurrentTime = Date.now();
    const computedStatus = getContestStatus(contest, serverCurrentTime);

    if (computedStatus === "ENDED") {
      return NextResponse.json(
        { success: false, error: "Submissions rejected: The deadline for this contest has passed." },
        { status: 403 }
      );
    }

    if (computedStatus === "SCHEDULED") {
      return NextResponse.json(
        { success: false, error: "Submissions not open: This contest is scheduled and has not started yet." },
        { status: 400 }
      );
    }

    if (computedStatus === "DRAFT") {
      return NextResponse.json(
        { success: false, error: "Unpublished contest: This contest is currently in draft." },
        { status: 400 }
      );
    }

    // 5. Query novel to verify ownership in database
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      return NextResponse.json(
        { success: false, error: "Selected story not found." },
        { status: 404 }
      );
    }

    if (authUser.role !== "ADMIN" && novel.creatorId !== authUser.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own the selected story." },
        { status: 403 }
      );
    }

    // 6. Verify chapter count eligibility in database
    const realChaptersCount = await prisma.chapter.count({
      where: { novelId: novelId },
    });

    const minChapters = contest.minChapters || 2;
    if (realChaptersCount < minChapters) {
      return NextResponse.json(
        { success: false, error: `Story must have at least ${minChapters} chapters to qualify. This story only has ${realChaptersCount}.` },
        { status: 400 }
      );
    }

    // 7. Check if already submitted
    const existingSubmission = await prisma.contestSubmission.findUnique({
      where: {
        contestId_contentId_contentType: {
          contestId,
          contentId: novelId,
          contentType: "NOVEL",
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: "This story has already been submitted to the contest." },
        { status: 400 }
      );
    }

    // 8. Create and persist submission in database
    const submission = await prisma.contestSubmission.create({
      data: {
        contestId,
        contentId: novelId,
        contentType: "NOVEL",
        creatorId,
        status: "PENDING",
        votes: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submission successfully validated and persisted in database.",
      submission,
    });
  } catch (error: any) {
    console.error("[POST /api/contests/submit ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during submission." },
      { status: 500 }
    );
  }
}
