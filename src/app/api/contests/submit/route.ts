import { NextRequest, NextResponse } from "next/server";
import { getContestStatus } from "@/lib/utils/contest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contest, novelId, creatorId, chaptersCount } = body;

    if (!contest || !novelId || !creatorId) {
      return NextResponse.json(
        { success: false, error: "Missing required submission fields." },
        { status: 400 }
      );
    }

    // Centralized Server-Side Status Check (Uses server clock UTC)
    const serverCurrentTime = Date.now();
    const computedStatus = getContestStatus(contest, serverCurrentTime);

    if (computedStatus === "ENDED") {
      return NextResponse.json(
        {
          success: false,
          error: "SUBMISSIONS REJECTED: The deadline for this contest has passed.",
          status: "ENDED",
        },
        { status: 403 }
      );
    }

    if (computedStatus === "SCHEDULED") {
      return NextResponse.json(
        {
          success: false,
          error: "SUBMISSIONS NOT OPEN: This contest is scheduled and has not started yet.",
          status: "SCHEDULED",
        },
        { status: 400 }
      );
    }

    if (computedStatus === "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "UNPUBLISHED CONTEST: This contest is an unpublished draft.",
          status: "DRAFT",
        },
        { status: 400 }
      );
    }

    const minChapters = contest.minChapters || 2;
    if (typeof chaptersCount === "number" && chaptersCount < minChapters) {
      return NextResponse.json(
        {
          success: false,
          error: `Story must have at least ${minChapters} chapters to qualify.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission validated successfully on server.",
      validatedAt: new Date(serverCurrentTime).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error during validation." },
      { status: 500 }
    );
  }
}
