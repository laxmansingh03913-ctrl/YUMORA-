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

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amountInr) * 100);

    // If live/test Razorpay API credentials are configured
    if (keyId && keySecret && keyId.startsWith("rzp_")) {
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

      if (!razorpayResponse.ok) {
        console.error("[RAZORPAY ORDER ERROR]", orderData);
        return NextResponse.json(
          { error: orderData.error?.description || "Failed to initiate Razorpay order" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
        isLiveMode: true,
      });
    }

    // Development / Simulator Mode when Razorpay keys are not yet configured
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: "rzp_test_placeholder",
      isLiveMode: false,
      notice: "Razorpay simulated checkout. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for live payments.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal payment server error";
    console.error("[CREATE ORDER API ERROR]", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
