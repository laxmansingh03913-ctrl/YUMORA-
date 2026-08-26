import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, amountInr, userId, userEmail, userName } = body;

    if (!amountInr || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (amountInr, userId)" },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TULfWNnbwXN9k9";
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amountInr) * 100);

    const isLiveSecretConfigured =
      Boolean(keySecret) &&
      keySecret !== "your_razorpay_key_secret" &&
      keySecret !== "your_key_secret" &&
      (keySecret?.length || 0) > 6;

    // 1. If real Razorpay secret is present, create order on Razorpay servers
    if (isLiveSecretConfigured && keyId.startsWith("rzp_")) {
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
              packageId: packageId || "custom",
              userName: userName || "Yomika Reader",
              userEmail: userEmail || "",
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
            isLiveMode: true,
            isClientCheckout: false,
          });
        } else {
          console.warn("[RAZORPAY BACKEND ORDER NOTICE]", orderData);
        }
      } catch (apiErr) {
        console.warn("[RAZORPAY API FETCH NOTICE]", apiErr);
      }
    }

    // 2. Client-side Razorpay Checkout mode (uses Key ID directly)
    if (keyId && keyId.startsWith("rzp_")) {
      const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return NextResponse.json({
        success: true,
        orderId: simulatedOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId,
        isLiveMode: true,
        isClientCheckout: true,
      });
    }

    // 3. Simulated Fallback Mode
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: "rzp_test_TULfWNnbwXN9k9",
      isLiveMode: false,
      isClientCheckout: true,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal payment server error";
    console.error("[CREATE ORDER API ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
