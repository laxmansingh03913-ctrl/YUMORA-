import { NextRequest, NextResponse } from "next/server";
import { sendAdminErrorAlert } from "@/lib/email/alert";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { errorType, errorMessage, endpoint, userId, userEmail, storyTitle, chapterNumber, metadata } = body;

    await sendAdminErrorAlert({
      errorType: errorType || "CLIENT_ERROR",
      errorMessage: errorMessage || "Unknown error reported from client",
      endpoint,
      userId,
      userEmail,
      storyTitle,
      chapterNumber,
      metadata,
    });

    return NextResponse.json({ success: true, message: "Admin alerted successfully." });
  } catch (error: any) {
    console.error("[ERROR REPORT API FAILED]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
