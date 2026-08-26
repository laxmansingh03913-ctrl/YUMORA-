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

    // Cryptographic signature verification if live secret is available
    if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("[PAYMENT SIGNATURE MISMATCH]", {
          generated: generatedSignature,
          received: razorpay_signature,
        });
        return NextResponse.json(
          { error: "Invalid payment signature verification" },
          { status: 400 }
        );
      }
    }

    const totalCoinsPurchased = Number(coins) + (Number(bonusCoins) || 0);
    const txId = razorpay_payment_id || `txn_yom_${Date.now().toString(36)}`;

    // If user has an email, dispatch automated Coin Purchase Receipt in the background
    if (userEmail) {
      emailService
        .sendEmail({
          toEmail: userEmail,
          recipientName: userName || "Storyteller & Reader",
          type: "FAN_TIP", // Uses high-conversion Coin notification template
          data: {
            coinsAmount: totalCoinsPurchased,
            senderName: "Yomika Treasury (Official Top-Up)",
            tipMessage: `Successfully purchased ${packageName || "Coins Package"} for ₹${amountInr || 0}. Transaction ID: ${txId}`,
          },
        })
        .catch((err) => console.warn("[PAYMENT RECEIPT EMAIL FAILED]", err));
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
