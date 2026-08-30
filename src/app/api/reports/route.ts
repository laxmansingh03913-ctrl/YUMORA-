import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from the server session headers/cookies
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to submit a report." },
        { status: 401 }
      );
    }

    // 2. Parse body parameters
    const body = await req.json();
    const { contentId, contentType, reason, description } = body;

    // 3. Validation
    if (!contentId || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (contentId, reason)" },
        { status: 400 }
      );
    }

    const validContentTypes = ["NOVEL", "COMIC", "ANIMATION"];
    const activeContentType = contentType && validContentTypes.includes(contentType) ? contentType : "NOVEL";

    // 4. Save Report record to PostgreSQL Database
    const newReport = await prisma.report.create({
      data: {
        reporterId: authUser.id,
        contentId: contentId,
        contentType: activeContentType,
        reason: reason,
        description: description || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      report: newReport,
      message: "Your report has been successfully submitted and logged in the moderation database.",
    });
  } catch (error: any) {
    console.error("[POST /api/reports ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error submitting report." },
      { status: 500 }
    );
  }
}
