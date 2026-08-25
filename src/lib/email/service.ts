/**
 * Yomika Automated Creator Email & Notification Dispatch Engine
 * Supports Tournament Wins, Fan Tips, Bank Payouts, Chapter Releases, and Welcome Onboarding
 */

export interface EmailNotificationPayload {
  toEmail: string;
  recipientName: string;
  type: "TOURNAMENT_WIN" | "FAN_TIP" | "BANK_WITHDRAWAL" | "CHAPTER_PUBLISHED" | "WELCOME";
  data: {
    amountInr?: number;
    amountUsd?: number;
    contestTitle?: string;
    rank?: number;
    storyTitle?: string;
    chapterNumber?: number;
    chapterTitle?: string;
    senderName?: string;
    coinsAmount?: number;
    fanMessage?: string;
    payoutMethod?: "UPI" | "BANK_TRANSFER" | "PAYPAL";
    accountDetails?: string;
    transactionId?: string;
    coverUrl?: string;
  };
}

export const emailService = {
  /**
   * Generates a sleek, high-conversion HTML email template for Tournament Winners
   */
  generateTournamentWinHtml(payload: EmailNotificationPayload): string {
    const { recipientName, data } = payload;
    const rankBadge =
      data.rank === 1
        ? "🥇 1st Place Grand Champion"
        : data.rank === 2
        ? "🥈 2nd Place Runner Up"
        : "🥉 3rd Place Finalist";
    const inrStr = data.amountInr ? `₹${data.amountInr.toLocaleString("en-IN")}` : "₹42,000";
    const usdStr = data.amountUsd ? `$${data.amountUsd} USD` : "$500 USD";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #d91e18 0%, #b71813 50%, #7f1d1d 100%); padding: 36px 24px; text-align: center; color: white; }
    .trophy { font-size: 48px; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .card { background-color: #09090b; border: 1px solid #3f3f46; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: center; }
    .amount { font-size: 36px; font-weight: 900; color: #22c55e; margin: 8px 0; }
    .badge { display: inline-block; background: #eab308; color: #000; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; text-align: left; font-size: 13px; }
    .details-table td { padding: 8px 0; border-bottom: 1px solid #27272a; }
    .details-table td:last-child { text-align: right; font-weight: bold; color: #ffffff; }
    .btn { display: block; width: 220px; margin: 24px auto 0; padding: 14px 20px; background-color: #d91e18; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 13px; text-align: center; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="trophy">🏆</div>
      <h1 class="title">Congratulations ${recipientName}!</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">You have won the Story Battle Tournament!</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; line-height: 1.5; color: #d4d4d8;">
        Dear <strong>${recipientName}</strong>, your story <em>&ldquo;${data.storyTitle || "Your Masterpiece"}&rdquo;</em> has secured the top rank in the <strong>${data.contestTitle || "Yomika Monthly Story Challenge"}</strong>!
      </p>

      <div class="card">
        <div class="badge">${rankBadge}</div>
        <div style="font-size: 12px; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Prize Money Awarded</div>
        <div class="amount">${inrStr} <span style="font-size: 16px; color: #a1a1aa;">(${usdStr})</span></div>
        <p style="margin: 0; font-size: 12px; color: #22c55e; font-weight: bold;">● Credited to your Yomika Creator Wallet</p>
      </div>

      <table class="details-table">
        <tr>
          <td style="color: #a1a1aa;">Tournament</td>
          <td>${data.contestTitle || "Sci-Fi & Fantasy Challenge"}</td>
        </tr>
        <tr>
          <td style="color: #a1a1aa;">Winning Rank</td>
          <td>#${data.rank || 1} Winner</td>
        </tr>
        <tr>
          <td style="color: #a1a1aa;">Payout ID</td>
          <td style="font-family: monospace;">${data.transactionId || `YOM-WIN-${Date.now().toString().slice(-6)}`}</td>
        </tr>
        <tr>
          <td style="color: #a1a1aa;">Withdrawal Status</td>
          <td style="color: #22c55e;">Ready to Transfer (UPI / Bank)</td>
        </tr>
      </table>

      <a href="https://youmika.site/creator" class="btn">Go To Creator Studio →</a>
    </div>
    <div class="footer">
      <p style="margin: 0;">Sent with ❤️ by <strong>Yomika Creator Network</strong></p>
      <p style="margin: 4px 0 0;">Empowering Manga & Story Creators Worldwide.</p>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Generates a notification email for Fan Tipping & Coin Gifts
   */
  generateFanTipHtml(payload: EmailNotificationPayload): string {
    const { recipientName, data } = payload;
    const coins = data.coinsAmount || 100;
    const inrValue = `₹${(coins * 0.79).toFixed(0)}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; margin: 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 28px; }
    .amount { font-size: 32px; font-weight: 900; color: #eab308; }
    .quote { background: #09090b; border-left: 3px solid #eab308; padding: 14px; border-radius: 8px; font-style: italic; color: #d4d4d8; margin: 16px 0; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 20px; background-color: #d91e18; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 10px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 36px; margin-bottom: 8px;">🎁</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">You received a Fan Tip!</h2>
    <p style="color: #d4d4d8; font-size: 14px;">Hi <strong>${recipientName}</strong>,</p>
    <p style="color: #a1a1aa; font-size: 14px;">Reader <strong>${data.senderName || "A loyal reader"}</strong> just sent you a tip on <em>${data.storyTitle || "your story"}</em>:</p>
    <div style="background: #09090b; padding: 20px; border-radius: 16px; text-align: center; border: 1px solid #3f3f46; margin: 16px 0;">
      <div class="amount">🪙 ${coins} Coins</div>
      <div style="font-size: 13px; color: #22c55e; font-weight: bold; margin-top: 4px;">≈ ${inrValue} INR Creator Royalty</div>
    </div>
    ${data.fanMessage ? `<div class="quote">&ldquo;${data.fanMessage}&rdquo;</div>` : ""}
    <p style="font-size: 13px; color: #a1a1aa;">This has been credited directly to your Yomika Creator Wallet.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://youmika.site/creator" class="btn">View Creator Wallet →</a>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Generates a chapter release email for followers
   */
  generateChapterPublishedHtml(payload: EmailNotificationPayload): string {
    const { recipientName, data } = payload;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; margin: 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px 24px; text-align: center; color: white; }
    .content { padding: 24px; }
    .btn { display: block; width: 200px; margin: 20px auto 0; padding: 12px 20px; background-color: #d91e18; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 13px; text-align: center; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 36px; margin-bottom: 8px;">📖</div>
      <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px;">New Chapter Released!</h2>
    </div>
    <div class="content">
      <p style="color: #d4d4d8; font-size: 14px;">Hi reader,</p>
      <p style="color: #a1a1aa; font-size: 14px;"><strong>${recipientName}</strong> just published a brand new chapter for <strong>${data.storyTitle}</strong>:</p>
      <div style="background: #09090b; border: 1px solid #3f3f46; border-radius: 16px; padding: 16px; margin: 16px 0;">
        <div style="font-size: 12px; font-weight: bold; color: #d91e18; text-transform: uppercase;">Chapter ${data.chapterNumber || 1}</div>
        <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">${data.chapterTitle || "The Journey Continues"}</div>
      </div>
      <a href="https://youmika.site" class="btn">Read Chapter Now →</a>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Generates payout / withdrawal confirmation email
   */
  generatePayoutHtml(payload: EmailNotificationPayload): string {
    const { recipientName, data } = payload;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; margin: 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 28px; }
    .amount { font-size: 32px; font-weight: 900; color: #22c55e; }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 36px; margin-bottom: 8px;">💳</div>
    <h2 style="color: #ffffff; margin-top: 0;">Creator Payout Initiated</h2>
    <p style="color: #d4d4d8; font-size: 14px;">Hi <strong>${recipientName}</strong>,</p>
    <p style="color: #a1a1aa; font-size: 14px;">Your earnings withdrawal request has been received and processed:</p>
    <div style="background: #09090b; padding: 20px; border-radius: 16px; text-align: center; border: 1px solid #3f3f46; margin: 16px 0;">
      <div class="amount">₹${data.amountInr?.toLocaleString() || "0"} INR</div>
      <div style="font-size: 12px; color: #a1a1aa; margin-top: 6px;">Transfer Method: <strong>${data.payoutMethod || "UPI"}</strong> (${data.accountDetails || "Verified Account"})</div>
      <div style="font-size: 11px; color: #71717a; margin-top: 4px; font-family: monospace;">Ref: ${data.transactionId || `PAY-${Date.now()}`}</div>
    </div>
    <p style="font-size: 13px; color: #a1a1aa;">The funds should reflect in your account within 1-3 business hours.</p>
  </div>
</body>
</html>
    `;
  },

  /**
   * Generates welcome onboarding email
   */
  generateWelcomeHtml(payload: EmailNotificationPayload): string {
    const { recipientName } = payload;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; margin: 0; }
    .container { max-width: 560px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #d91e18 0%, #991b1b 100%); padding: 32px 24px; text-align: center; color: white; }
    .content { padding: 28px 24px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #d91e18; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; font-weight: 900; margin-bottom: 4px;">YOMIKA</div>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Stories. Comics. Worlds.</p>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; margin-top: 0;">Welcome, ${recipientName}! 🎉</h2>
      <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
        Welcome to Yomika, the global home for original storytelling, manga, webtoons, and serialized fiction.
      </p>
      <ul style="color: #a1a1aa; font-size: 14px; line-height: 1.8; padding-left: 20px;">
        <li>📖 Discover thousands of novel chapters & comic episodes.</li>
        <li>✍️ Publish your own stories and build a loyal audience.</li>
        <li>🏆 Participate in monthly Story Tournaments to win cash prizes.</li>
        <li>🪙 Support your favorite creators with tips and coin unlocks.</li>
      </ul>
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://youmika.site/discover" class="btn">Start Exploring Stories →</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Main dispatch function (Calls Next.js API route and updates local notification cache)
   */
  async sendEmail(
    payload: EmailNotificationPayload
  ): Promise<{ success: boolean; messageId: string; simulated?: boolean; error?: string }> {
    try {
      // 1. Send via Next.js Email API route
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 2. Store in browser local notification cache for in-app alert
      if (typeof window !== "undefined") {
        try {
          const notifications = JSON.parse(
            localStorage.getItem("creator-inbox-notifications") || "[]"
          );
          notifications.unshift({
            id: data.messageId || `msg_${Date.now()}`,
            type: payload.type,
            title:
              payload.type === "TOURNAMENT_WIN"
                ? `🏆 Won ₹${payload.data.amountInr?.toLocaleString() || "42,000"} in ${payload.data.contestTitle || "Tournament"}`
                : payload.type === "FAN_TIP"
                ? `🎁 Received 🪙 ${payload.data.coinsAmount} Coins Tip from ${payload.data.senderName || "Reader"}`
                : payload.type === "CHAPTER_PUBLISHED"
                ? `📖 New Chapter published for ${payload.data.storyTitle}`
                : `💳 Payout of ₹${payload.data.amountInr?.toLocaleString() || "0"} processed`,
            data: payload.data,
            timestamp: new Date().toISOString(),
            isRead: false,
          });
          localStorage.setItem(
            "creator-inbox-notifications",
            JSON.stringify(notifications.slice(0, 20))
          );
        } catch {
          // ignore localStorage errors
        }
      }

      return {
        success: data.success ?? true,
        messageId: data.messageId || `msg_${Date.now()}`,
        simulated: data.simulated ?? true,
      };
    } catch (err: unknown) {
      console.warn("[EMAIL CLIENT NOTICE]", err);
      return {
        success: true,
        messageId: `offline_${Date.now()}`,
        simulated: true,
      };
    }
  },
};
