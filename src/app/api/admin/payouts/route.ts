import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { dbService } from "@/lib/supabase/db";
import { PayoutRequest } from "@/lib/types";

// Convert Prisma database row to Frontend PayoutRequest shape
function mapPrismaPayoutToDto(row: any): PayoutRequest {
  return {
    id: row.id,
    creatorId: row.userId,
    creatorName: row.creatorName || row.user?.name || "Creator",
    creatorEmail: row.creatorEmail || row.user?.email || "",
    amountInr: row.amountInr,
    amountUsd: typeof row.amountUsd === "number" ? row.amountUsd : Math.round((row.amountInr / 83) * 100) / 100,
    method: (row.method as "UPI" | "BANK" | "PAYPAL") || "UPI",
    details: row.details,
    accountHolderName: row.accountHolderName || row.creatorName || "",
    status: (row.status as "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED") || "PENDING",
    requestedAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    processedAt: row.processedAt ? new Date(row.processedAt).toISOString() : undefined,
    transactionReference: row.referenceId || undefined,
    notes: row.note || undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize: Server-side RBAC check
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator privileges required to view payout records." },
        { status: 403 }
      );
    }

    // 2. Fetch real payout requests from Database
    try {
      const payouts = await dbService.getPayoutRequests();
      if (payouts && payouts.length > 0) {
        return NextResponse.json({ success: true, payouts, count: payouts.length });
      }

      // Try Prisma if available
      try {
        const records = await prisma.payoutRequest.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const prismaPayouts = records.map(mapPrismaPayoutToDto);
        return NextResponse.json({ success: true, payouts: prismaPayouts, count: prismaPayouts.length });
      } catch {
        return NextResponse.json({ success: true, payouts: [], count: 0 });
      }
    } catch (dbErr: any) {
      console.warn("[PAYOUTS FETCH NOTICE]", dbErr?.message || dbErr);
      return NextResponse.json({ success: true, payouts: [], count: 0 });
    }
  } catch (error: any) {
    console.error("[GET /api/admin/payouts ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve payout records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize: Server-side RBAC check
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator privileges required to manage payouts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { payoutId, status, transactionRef, note } = body;

    // 2. Validate input parameters
    if (!payoutId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (payoutId, status)" },
        { status: 400 }
      );
    }

    const validStatuses = ["COMPLETED", "APPROVED", "REJECTED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Look up existing payout request in Database
    let existingPayout: any = null;
    try {
      existingPayout = await prisma.payoutRequest.findUnique({
        where: { id: payoutId },
        include: { user: true },
      });
    } catch (dbFindErr) {
      console.warn("[PRISMA FIND PAYOUT NOTICE]", dbFindErr);
    }

    if (!existingPayout) {
      return NextResponse.json(
        { success: false, error: "Payout request not found in production database." },
        { status: 404 }
      );
    }

    // 4. Idempotency & State Protection: Check if already processed
    if (existingPayout.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Idempotency protection: This payout request has already been processed (Current status: ${existingPayout.status}).`,
          currentStatus: existingPayout.status,
        },
        { status: 400 }
      );
    }

    // 5. Atomic State Transition using Prisma Transaction
    const resolvedStatus = status === "APPROVED" ? "COMPLETED" : status;
    const processedAtDate = new Date();

    const updatedRow = await prisma.$transaction(async (tx) => {
      return await tx.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: resolvedStatus,
          referenceId: transactionRef || undefined,
          note: note || (resolvedStatus === "COMPLETED" ? "Approved by Platform Admin" : "Rejected by Platform Admin"),
          processedAt: processedAtDate,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
        },
      });
    });

    const dto = mapPrismaPayoutToDto(updatedRow);

    return NextResponse.json({
      success: true,
      updatedPayout: dto,
      message: `Payout request of ₹${dto.amountInr.toLocaleString()} ${dto.status.toLowerCase()} successfully on server.`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/payouts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payout request on server." },
      { status: 500 }
    );
  }
}
