import { emailService } from "@/lib/email/service";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "megwansiabhishek7@gmail.com";

export interface SystemErrorAlertPayload {
  errorType: string;
  errorMessage: string;
  endpoint?: string;
  userId?: string;
  userEmail?: string;
  storyTitle?: string;
  chapterNumber?: number;
  metadata?: Record<string, any>;
}

export async function sendAdminErrorAlert(payload: SystemErrorAlertPayload) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "Yomika System <onboarding@resend.dev>";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #18181b; border: 1px solid #ef4444; border-radius: 16px; overflow: hidden; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; font-weight: 900; font-size: 18px; text-transform: uppercase; }
    .content { padding: 24px; }
    .alert-box { background: #450a0a; border: 1px solid #991b1b; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #fca5a5; word-break: break-all; margin-bottom: 20px; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    .table td { padding: 8px 0; border-bottom: 1px solid #27272a; }
    .table td:first-child { color: #a1a1aa; width: 140px; }
    .table td:last-child { color: #ffffff; font-weight: bold; }
    .footer { text-align: center; font-size: 11px; color: #71717a; padding: 14px; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">⚠️ Yomika System Alert: Critical Error</div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #d4d4d8;">
        An unexpected error or upload exception occurred on <strong>youmika.site</strong>:
      </p>

      <div class="alert-box">
        ${payload.errorMessage || "Unknown system error"}
      </div>

      <table class="table">
        <tr>
          <td>Error Type</td>
          <td style="color: #ef4444;">${payload.errorType}</td>
        </tr>
        <tr>
          <td>Timestamp</td>
          <td>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
        </tr>
        ${payload.endpoint ? `<tr><td>Endpoint</td><td>${payload.endpoint}</td></tr>` : ""}
        ${payload.storyTitle ? `<tr><td>Story Title</td><td>${payload.storyTitle}</td></tr>` : ""}
        ${payload.chapterNumber ? `<tr><td>Chapter / Episode</td><td>#${payload.chapterNumber}</td></tr>` : ""}
        ${payload.userId ? `<tr><td>User ID</td><td>${payload.userId}</td></tr>` : ""}
        ${payload.userEmail ? `<tr><td>User Email</td><td>${payload.userEmail}</td></tr>` : ""}
      </table>
    </div>
    <div class="footer">
      Automated Error Dispatch • Yomika Infrastructure
    </div>
  </div>
</body>
</html>
    `;

    if (resendApiKey && resendApiKey.startsWith("re_")) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: ADMIN_EMAIL,
          subject: `🚨 [Yomika Error Alert] ${payload.errorType}: ${payload.errorMessage.slice(0, 50)}`,
          html,
        }),
      });
    }
  } catch (e) {
    console.error("[ADMIN ERROR ALERT DISPATCH FAILED]", e);
  }
}
