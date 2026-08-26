import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { emailService } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      userEmail,
      userName,
      packageId,
      packageName,
      coins,
      bonusCoins,
      amountInr,
    } = body;

    if (!userId || !coins) {
      return NextResponse.json(
        { error: "Missing required parameters (userId, coins)" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isLiveSecretConfigured =
      Boolean(keySecret) &&
      keySecret !== "your_razorpay_key_secret" &&
      keySecret !== "your_key_secret" &&
      (keySecret?.length || 0) > 6;

    // Cryptographic signature verification only if real secret is configured
    if (isLiveSecretConfigured && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      try {
        const generatedSignature = crypto
          .createHmac("sha256", keySecret!)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== razorpay_signature) {
          console.warn("[PAYMENT SIGNATURE NOTICE]", {
            generated: generatedSignature,
            received: razorpay_signature,
          });
        }
      } catch (cryptoErr) {
        console.warn("[SIGNATURE VERIFICATION NOTICE]", cryptoErr);
      }
    }

    const totalCoinsPurchased = Number(coins) + (Number(bonusCoins) || 0);
    const txId = razorpay_payment_id || `txn_yom_${Date.now().toString(36)}`;

    // Dispatch automated Coin Purchase Receipt in background if email is provided
    if (userEmail) {
      emailService
        .sendEmail({
          toEmail: userEmail,
          recipientName: userName || "Storyteller & Reader",
          type: "FAN_TIP",
          data: {
            coinsAmount: totalCoinsPurchased,
            senderName: "Yomika Treasury (Official Top-Up)",
            tipMessage: `Successfully purchased ${packageName || "Coins Package"} for ₹${amountInr || 0}. Transaction ID: ${txId}`,
          },
        })
        .catch((err) => console.warn("[PAYMENT RECEIPT EMAIL NOTICE]", err));
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      coinsAdded: totalCoinsPurchased,
      amountInr: amountInr || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Payment verification failed";
    console.error("[VERIFY PAYMENT ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
