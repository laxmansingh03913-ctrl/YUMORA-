import { NextRequest, NextResponse } from "next/server";
import { emailService, EmailNotificationPayload } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const payload: EmailNotificationPayload = await request.json();

    if (!payload.toEmail || !payload.type) {
      return NextResponse.json(
        { error: "Missing required fields (toEmail, type)" },
        { status: 400 }
      );
    }

    // Determine subject and HTML body based on template type
    let subject = "Yomika Notification";
    let htmlContent = "";

    switch (payload.type) {
      case "TOURNAMENT_WIN":
        subject = `🏆 Congratulations! You won ${payload.data.amountInr ? `₹${payload.data.amountInr.toLocaleString()}` : "the Tournament"} on Yomika!`;
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
        subject = `✨ Welcome to Yomika — Stories. Comics. Worlds.`;
        htmlContent = emailService.generateWelcomeHtml(payload);
        break;
      default:
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><h2>Hello ${payload.recipientName}</h2><p>You have a new update on Yomika.</p></div>`;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "Yomika <onboarding@resend.dev>";

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
    console.log(`[EMAIL DISPATCH SIMULATED] 📬 To: ${payload.toEmail} | Subject: "${subject}" | Type: ${payload.type}`);

    return NextResponse.json({
      success: true,
      messageId: simulatedMessageId,
      provider: "simulator",
      simulated: true,
      notice: "Email simulated successfully. Set RESEND_API_KEY in .env.local to send live emails.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[EMAIL ROUTE ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
