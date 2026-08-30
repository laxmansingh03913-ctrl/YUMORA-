import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedServerUser } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedServerUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("profiles").select("*", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }

    const { data: users, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Omit sensitive fields
    const safeUsers = (users || []).map((u: any) => {
      const { password_hash, ...rest } = u;
      return rest;
    });

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total: count || 0,
      page,
      limit,
    });
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
    const { targetUserId, updates } = body;

    if (!targetUserId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Missing targetUserId or updates object" },
        { status: 400 }
      );
    }

    // Only allow updating safe administrative fields
    const safeUpdates: Record<string, any> = {};
    if (typeof updates.isVerified === "boolean") safeUpdates.is_email_verified = updates.isVerified;
    if (updates.role && ["READER", "CREATOR", "ADMIN"].includes(updates.role)) {
      safeUpdates.role = updates.role;
    }
    if (updates.monetizationStatus) safeUpdates.monetization_status = updates.monetizationStatus;
    if (updates.monetizationTier) safeUpdates.monetization_tier = updates.monetizationTier;
    if (updates.fraudAuditStatus) safeUpdates.fraud_audit_status = updates.fraudAuditStatus;
    if (typeof updates.isBanned === "boolean") safeUpdates.is_banned = updates.isBanned;

    safeUpdates.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabaseAdmin
      .from("profiles")
      .update(safeUpdates)
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "User administrative settings updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
