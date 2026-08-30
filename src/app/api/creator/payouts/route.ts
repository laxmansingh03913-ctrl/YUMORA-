import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dbService } from "@/lib/supabase/db";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to view payout history." },
        { status: 401 }
      );
    }

    // 2. Fetch payout requests from database
    const payouts = await prisma.payoutRequest.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payouts });
  } catch (error: any) {
    console.error("[GET /api/creator/payouts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching payouts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to request a payout." },
        { status: 401 }
      );
    }

    // 2. Parse body parameters
    const body = await req.json();
    const { amountUsd, method, details, accountHolderName } = body;

    const amount = parseFloat(amountUsd);
    if (isNaN(amount) || amount < 10) {
      return NextResponse.json(
        { success: false, error: "Minimum withdrawal amount is $10.00 USD." },
        { status: 400 }
      );
    }

    if (!method || !details) {
      return NextResponse.json(
        { success: false, error: "Missing required payment fields (method, details)." },
        { status: 400 }
      );
    }

    // 3. Convert USD amount to coins
    const coinsToDeduct = Math.round(amount * 100);

    // 4. Query current coin balance in database
    const currentCoinBalance = await dbService.getWalletBalance(authUser.id);
    if (currentCoinBalance < coinsToDeduct) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance: You requested $${amount} USD (${coinsToDeduct} coins), but only have ${currentCoinBalance} coins.` },
        { status: 400 }
      );
    }

    // 5. Deduct coins from creator's wallet (also inserts a coin transaction log)
    const deductSuccess = await dbService.recordCoinTransaction({
      userId: authUser.id,
      amount: -coinsToDeduct,
      type: "PAYOUT_WITHDRAWAL",
      description: `Withdrew $${amount.toFixed(2)} USD (₹${Math.round(amount * 83)} INR) via ${method}`,
    });

    if (!deductSuccess) {
      return NextResponse.json(
        { success: false, error: "Failed to deduct coins from wallet." },
        { status: 500 }
      );
    }

    // 6. Create the payout request in database
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        userId: authUser.id,
        amountInr: Math.round(amount * 83),
        amountUsd: amount,
        method: method,
        details: details,
        accountHolderName: accountHolderName || authUser.name,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout withdrawal request successfully submitted.",
      payoutRequest,
    });
  } catch (error: any) {
    console.error("[POST /api/creator/payouts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error submitting payout request." },
      { status: 500 }
    );
  }
}
