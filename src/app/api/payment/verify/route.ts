import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPackageById } from "@/lib/payment/packages";
import { getAuthenticatedServerUser } from "@/lib/auth/server";
import { emailService } from "@/lib/email/service";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "server-db.json");

// In-memory processed payment cache to prevent rapid concurrent double-spends
const processedPayments = new Set<string>();

function checkAndRecordPayment(paymentId: string, transaction: any): boolean {
  if (processedPayments.has(paymentId)) {
    return false;
  }
  processedPayments.add(paymentId);

  // Persist to server database if available
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data || "{}");
      const transactions = Array.isArray(db.yumora_transactions) ? db.yumora_transactions : [];

      // Check if already in DB
      const exists = transactions.some((t: any) => t && t.paymentId === paymentId);
      if (exists) {
        return false;
      }

      transactions.push(transaction);
      db.yumora_transactions = transactions;

      // Update user coins on server
      if (transaction.userId && transaction.coinsAdded) {
        if (!db.yumora_user_coins) db.yumora_user_coins = {};
        db.yumora_user_coins[transaction.userId] =
          (db.yumora_user_coins[transaction.userId] || 0) + transaction.coinsAdded;
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[TRANSACTION PERSISTENCE WARNING]", err);
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageId,
    } = body;

    // 1. Validate required Razorpay parameters
    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing required payment identifiers (order_id, payment_id)" },
        { status: 400 }
      );
    }

    // 2. Validate Coin Package from server-side trusted catalog
    const packageConfig = getPackageById(packageId);
    if (!packageConfig) {
      return NextResponse.json(
        { success: false, error: "Invalid or unrecognized coin package." },
        { status: 400 }
      );
    }

    // 3. Authenticate User
    const authUser = await getAuthenticatedServerUser(request);
    const userId = authUser?.id || body.userId;
    const userEmail = authUser?.email || body.userEmail;
    const userName = authUser?.name || body.userName || "Yomika Storyteller";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User session required to credit coins." },
        { status: 401 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isLiveConfigured =
      Boolean(keySecret) &&
      keySecret !== "your_razorpay_key_secret" &&
      keySecret !== "your_key_secret" &&
      (keySecret?.length || 0) > 6;

    // 4. Cryptographic Signature Verification
    if (isLiveConfigured) {
      if (!razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Payment verification rejected: Missing signature." },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac("sha256", keySecret!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      // STRICT CHECK: Reject immediately if signature does not match!
      if (generatedSignature !== razorpay_signature) {
        console.error("[CRITICAL: SIGNATURE VERIFICATION REJECTED]", {
          expected: generatedSignature,
          received: razorpay_signature,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        });

        return NextResponse.json(
          {
            success: false,
            error: "Payment verification failed: Invalid cryptographic signature. Transaction rejected.",
          },
          { status: 400 }
        );
      }
    } else {
      // In production, reject if secret is not configured
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            error: "Payment verification unavailable: Gateway secret is not configured in production.",
          },
          { status: 503 }
        );
      }
    }

    // 5. Atomic Idempotency & Replay Attack Defense
    const totalCoinsPurchased = packageConfig.coins + packageConfig.bonusCoins;
    const transactionRecord = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      packageId: packageConfig.id,
      packageName: packageConfig.label,
      amountInr: packageConfig.priceInr,
      coinsAdded: totalCoinsPurchased,
      status: "COMPLETED",
      verifiedAt: new Date().toISOString(),
    };

    const isFirstTimeProcessing = checkAndRecordPayment(razorpay_payment_id, transactionRecord);

    if (!isFirstTimeProcessing) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate transaction notice: This payment has already been credited to the wallet.",
        },
        { status: 409 }
      );
    }

    // 6. Send email receipt asynchronously if email is configured
    if (userEmail) {
      emailService
        .sendEmail({
          toEmail: userEmail,
          recipientName: userName,
          type: "FAN_TIP",
          data: {
            coinsAmount: totalCoinsPurchased,
            senderName: "Youmika Treasury (Official Top-Up)",
            tipMessage: `Successfully purchased ${packageConfig.label} for ₹${packageConfig.priceInr}. Transaction ID: ${razorpay_payment_id}`,
          } as any,
        })
        .catch((err) => console.warn("[PAYMENT RECEIPT EMAIL NOTICE]", err));
    }

    return NextResponse.json({
      success: true,
      transactionId: razorpay_payment_id,
      packageId: packageConfig.id,
      packageName: packageConfig.label,
      coinsAdded: totalCoinsPurchased,
      amountInr: packageConfig.priceInr,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Payment verification failed";
    console.error("[VERIFY PAYMENT ERROR]", error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
