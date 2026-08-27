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
    console.error("[ADMIN USERS DB SAVE ERROR]", err);
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
    const users = Array.isArray(db.yumora_users) ? db.yumora_users : [];
    // Omit sensitive password fields if any
    const safeUsers = users.map((u: any) => {
      const { passwordHash, password, ...rest } = u || {};
      return rest;
    });

    return NextResponse.json({ success: true, users: safeUsers });
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

    const db = getDb();
    const users = Array.isArray(db.yumora_users) ? db.yumora_users : [];
    const targetIdx = users.findIndex((u: any) => u && u.id === targetUserId);

    if (targetIdx < 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Only allow updating safe administrative fields
    const safeUpdates: Record<string, any> = {};
    if (typeof updates.isVerified === "boolean") safeUpdates.isVerified = updates.isVerified;
    if (updates.role && ["READER", "CREATOR", "ADMIN"].includes(updates.role)) safeUpdates.role = updates.role;
    if (updates.monetizationStatus) safeUpdates.monetizationStatus = updates.monetizationStatus;
    if (updates.monetizationTier) safeUpdates.monetizationTier = updates.monetizationTier;
    if (updates.fraudAuditStatus) safeUpdates.fraudAuditStatus = updates.fraudAuditStatus;

    users[targetIdx] = {
      ...users[targetIdx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    db.yumora_users = users;
    saveDb(db);

    return NextResponse.json({
      success: true,
      user: users[targetIdx],
      message: "User administrative settings updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
