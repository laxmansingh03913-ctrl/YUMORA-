import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to view payout settings." },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        payout_method: true,
        payout_bank_holder: true,
        payout_bank_name: true,
        payout_bank_number: true,
        payout_bank_ifsc: true,
        payout_bank_country: true,
        payout_upi_id: true,
        payout_paypal_email: true,
        payout_auto_enabled: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: "User profile not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: {
        method: userProfile.payout_method || "UPI",
        bankAccountHolder: userProfile.payout_bank_holder || "",
        bankName: userProfile.payout_bank_name || "",
        bankAccountNumber: userProfile.payout_bank_number || "",
        bankIfscSwift: userProfile.payout_bank_ifsc || "",
        bankCountry: userProfile.payout_bank_country || "",
        upiId: userProfile.payout_upi_id || "",
        paypalEmail: userProfile.payout_paypal_email || "",
        autoPayoutEnabled: Boolean(userProfile.payout_auto_enabled),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/creator/payout-settings ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You must be logged in to update payout settings." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      method,
      bankAccountHolder,
      bankName,
      bankAccountNumber,
      bankIfscSwift,
      bankCountry,
      upiId,
      paypalEmail,
      autoPayoutEnabled,
    } = body;

    const updatedProfile = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        payout_method: method || "UPI",
        payout_bank_holder: bankAccountHolder || "",
        payout_bank_name: bankName || "",
        payout_bank_number: bankAccountNumber || "",
        payout_bank_ifsc: bankIfscSwift || "",
        payout_bank_country: bankCountry || "",
        payout_upi_id: upiId || "",
        payout_paypal_email: paypalEmail || "",
        payout_auto_enabled: Boolean(autoPayoutEnabled),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout settings saved to database successfully.",
      settings: {
        method: updatedProfile.payout_method,
        bankAccountHolder: updatedProfile.payout_bank_holder,
        bankName: updatedProfile.payout_bank_name,
        bankAccountNumber: updatedProfile.payout_bank_number,
        bankIfscSwift: updatedProfile.payout_bank_ifsc,
        bankCountry: updatedProfile.payout_bank_country,
        upiId: updatedProfile.payout_upi_id,
        paypalEmail: updatedProfile.payout_paypal_email,
        autoPayoutEnabled: updatedProfile.payout_auto_enabled,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/creator/payout-settings ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error updating settings." },
      { status: 500 }
    );
  }
}
