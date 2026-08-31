import { NextRequest, NextResponse } from "next/server";
import { getPackageById } from "@/lib/payment/packages";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId } = body;

    // 1. Validate Coin Package from trusted server-side catalog
    const packageConfig = getPackageById(packageId);
    if (!packageConfig) {
      return NextResponse.json(
        { error: "Invalid coin package selected. Please select a valid package." },
        { status: 400 }
      );
    }

    // 2. Identify Authenticated User
    const authUser = await getAuthenticatedServerUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to initiate payment order. Please log in." },
        { status: 401 }
      );
    }
    const userId = authUser.id;
    const userEmail = authUser.email || "";
    const userName = authUser.name || "Yomika Storyteller";

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Server-determined amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(packageConfig.priceInr * 100);

    const isLiveConfigured =
      Boolean(keySecret) &&
      keySecret !== "your_razorpay_key_secret" &&
      keySecret !== "your_key_secret" &&
      Boolean(keyId) &&
      (keyId?.startsWith("rzp_") || false);

    // 3. Create Real Razorpay Order on Razorpay Servers
    if (isLiveConfigured) {
      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

        const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${userId.slice(0, 8)}_${Date.now() % 100000}`,
            notes: {
              userId,
              packageId: packageConfig.id,
              packageName: packageConfig.label,
              coins: packageConfig.coins,
              bonusCoins: packageConfig.bonusCoins,
              userEmail,
              userName,
            },
          }),
        });

        const orderData = await razorpayResponse.json();

        if (razorpayResponse.ok && orderData.id) {
          return NextResponse.json({
            success: true,
            orderId: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            keyId,
            packageName: packageConfig.label,
            totalCoins: packageConfig.coins + packageConfig.bonusCoins,
            isLiveMode: true,
          });
        } else {
          console.error("[RAZORPAY GATEWAY ERROR]", orderData);
          return NextResponse.json(
            { error: "Payment gateway error creating order. Please try again." },
            { status: 502 }
          );
        }
      } catch (apiErr) {
        console.error("[RAZORPAY API FETCH ERROR]", apiErr);
        return NextResponse.json(
          { error: "Unable to connect to payment gateway. Please check your network." },
          { status: 503 }
        );
      }
    }

    // 4. In Production: If Razorpay keys are not configured, reject safely
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Live payment gateway is currently undergoing scheduled maintenance. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    // 5. Development Mode ONLY fallback
    const devOrderId = `order_dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return NextResponse.json({
      success: true,
      orderId: devOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_dev",
      packageName: packageConfig.label,
      totalCoins: packageConfig.coins + packageConfig.bonusCoins,
      isLiveMode: false,
      notice: "Development test mode order generated.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal payment server error";
    console.error("[CREATE ORDER API ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
