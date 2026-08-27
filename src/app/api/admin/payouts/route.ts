import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedServerUser } from "@/lib/auth/server";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "server-db.json");

function getDb(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_FILE)) return {};
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}

function saveDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[ADMIN DB SAVE ERROR]", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }

    const db = getDb();
    const payouts = Array.isArray(db.yumora_payout_requests) ? db.yumora_payout_requests : [];
    return NextResponse.json({ success: true, payouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { payoutId, status, transactionRef, note } = body;

    if (!payoutId || !status) {
      return NextResponse.json(
        { error: "Missing required fields (payoutId, status)" },
        { status: 400 }
      );
    }

    const validStatuses = ["APPROVED", "REJECTED", "PROCESSED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();
    const payouts = Array.isArray(db.yumora_payout_requests) ? db.yumora_payout_requests : [];
    const targetIdx = payouts.findIndex((p: any) => p && p.id === payoutId);

    if (targetIdx < 0) {
      return NextResponse.json({ error: "Payout request not found." }, { status: 404 });
    }

    payouts[targetIdx] = {
      ...payouts[targetIdx],
      status,
      transactionRef: transactionRef || payouts[targetIdx].transactionRef,
      adminNote: note || payouts[targetIdx].adminNote,
      processedAt: status === "PROCESSED" || status === "APPROVED" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    db.yumora_payout_requests = payouts;
    saveDb(db);

    return NextResponse.json({
      success: true,
      updatedPayout: payouts[targetIdx],
      message: `Payout request ${status.toLowerCase()} successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
