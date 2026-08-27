import { NextRequest, NextResponse } from "next/server";
import { emailService, EmailNotificationPayload } from "@/lib/email/service";

// Simple in-memory rate limiting map for email dispatch (max 10 emails per minute per IP)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(identifier, { count: 1, expiresAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many email requests. Please slow down." },
        { status: 429 }
      );
    }

    const payload: EmailNotificationPayload = await request.json();

    if (!payload.toEmail || !payload.type) {
      return NextResponse.json(
        { error: "Missing required fields (toEmail, type)" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.toEmail)) {
      return NextResponse.json(
        { error: "Invalid recipient email address format" },
        { status: 400 }
      );
    }

    // Determine subject and HTML body based on template type
    let subject = "Youmika Notification";
    let htmlContent = "";

    switch (payload.type) {
      case "TOURNAMENT_WIN":
        subject = `🏆 Congratulations! You won ${payload.data.amountInr ? `₹${payload.data.amountInr.toLocaleString()}` : "the Tournament"} on Youmika!`;
        htmlContent = emailService.generateTournamentWinHtml(payload);
        break;
      case "FAN_TIP":
        subject = `🎁 You received a ${payload.data.coinsAmount || 100} Coins Tip from ${payload.data.senderName || "a reader"}!`;
        htmlContent = emailService.generateFanTipHtml(payload);
        break;
      case "CHAPTER_PUBLISHED":
        subject = `📖 New Chapter Released: "${payload.data.storyTitle}" by ${payload.recipientName}`;
        htmlContent = emailService.generateChapterPublishedHtml(payload);
        break;
      case "BANK_WITHDRAWAL":
        subject = `💳 Payout Processed: ₹${payload.data.amountInr?.toLocaleString() || "0"} has been sent to your ${payload.data.payoutMethod || "Account"}`;
        htmlContent = emailService.generatePayoutHtml(payload);
        break;
      case "WELCOME":
        subject = `✨ Welcome to Youmika — Stories. Comics. Worlds.`;
        htmlContent = emailService.generateWelcomeHtml(payload);
        break;
      default:
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><h2>Hello ${payload.recipientName}</h2><p>You have a new update on Youmika.</p></div>`;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "Youmika <notifications@youmika.site>";

    // If Resend API key is configured, send via Resend API
    if (resendApiKey && resendApiKey.startsWith("re_")) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: payload.toEmail,
          subject,
          html: htmlContent,
        }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error("[RESEND API ERROR]", resendData);
        return NextResponse.json(
          {
            success: false,
            error: resendData.message || "Failed to send email via Resend",
            simulated: false,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        messageId: resendData.id,
        provider: "resend",
        simulated: false,
      });
    }

    // In development or when API key is not configured, simulate successful dispatch
    const simulatedMessageId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return NextResponse.json({
      success: true,
      messageId: simulatedMessageId,
      provider: "simulator",
      simulated: true,
      notice: "Email simulated successfully. Set RESEND_API_KEY in .env to send live emails.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[EMAIL ROUTE ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
