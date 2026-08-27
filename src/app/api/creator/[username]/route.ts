import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SEED_USERS } from "@/lib/data/seed-data";
import { dbService } from "@/lib/supabase/db";
import { UserProfile, Comic, Novel } from "@/lib/types";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "server-db.json");

function getServerDb(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_FILE)) return {};
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("Failed to read server DB:", error);
    return {};
  }
}

function synthesizeCreatorProfile(creator: any, fallbackId?: string, fallbackGenre?: string): UserProfile {
  const id = String(creator?.id || fallbackId || `creator-${Date.now()}`);
  const name = String(creator?.name || "Storyteller");
  const username = String(creator?.username || `creator_${id.slice(0, 6)}`);
  return {
    id,
    name,
    username,
    email: creator?.email || "",
    role: (creator?.role as any) || "CREATOR",
    avatar:
      creator?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    banner: creator?.banner || "",
    bio: creator?.bio || "Storyteller on Youmika.",
    country: creator?.country || "Global",
    website: creator?.website || "",
    twitter: creator?.twitter || "",
    preferredTypes: Array.isArray(creator?.preferredTypes) ? creator.preferredTypes : [],
    primaryGenres: Array.isArray(creator?.primaryGenres)
      ? creator.primaryGenres
      : [fallbackGenre || "Fantasy", "Action"],
    isVerified: Boolean(creator?.isVerified),
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "NONE",
    monetizationStatus: "NOT_APPLIED",
    fraudAuditStatus: "CLEAN",
    followersCount: typeof creator?.followersCount === "number" ? creator.followersCount : 0,
    followingCount: typeof creator?.followingCount === "number" ? creator.followingCount : 0,
    totalReads: typeof creator?.totalReads === "number" ? creator.totalReads : 0,
    createdAt: creator?.createdAt || new Date().toISOString(),
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const rawParams = await (typeof (context.params as any)?.then === "function"
      ? (context.params as Promise<{ username: string }>)
      : Promise.resolve(context.params as { username: string }));

    const rawUsername = rawParams?.username || "";
    const cleanUsername = decodeURIComponent(rawUsername).trim().toLowerCase().replace(/^@/, "");

    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    // 1. Check Server DB Users
    const db = getServerDb();
    const serverUsers: UserProfile[] = Array.isArray(db.yumora_users) ? db.yumora_users : [];
    const fromServerUsers = serverUsers.find(
      (u) =>
        u &&
        ((u.username && u.username.trim().toLowerCase().replace(/^@/, "") === cleanUsername) ||
          (u.id && u.id.trim().toLowerCase() === cleanUsername))
    );
    if (fromServerUsers) {
      return NextResponse.json({ success: true, creator: fromServerUsers });
    }

    // 2. Check Seed Users
    const fromSeed = SEED_USERS.find(
      (u) =>
        u &&
        ((u.username && u.username.trim().toLowerCase().replace(/^@/, "") === cleanUsername) ||
          (u.id && u.id.trim().toLowerCase() === cleanUsername))
    );
    if (fromSeed) {
      return NextResponse.json({ success: true, creator: fromSeed });
    }

    // 3. Check Server DB Comics creators
    const serverComics: Comic[] = Array.isArray(db.yumora_comics) ? db.yumora_comics : [];
    for (const c of serverComics) {
      if (
        c?.creator?.username &&
        c.creator.username.trim().toLowerCase().replace(/^@/, "") === cleanUsername
      ) {
        return NextResponse.json({
          success: true,
          creator: synthesizeCreatorProfile(c.creator, c.creatorId, c.genre),
        });
      }
      if (c?.creatorId && c.creatorId.trim().toLowerCase() === cleanUsername) {
        return NextResponse.json({
          success: true,
          creator: synthesizeCreatorProfile(c.creator || { id: c.creatorId, name: "Storyteller", username: cleanUsername }, c.creatorId, c.genre),
        });
      }
    }

    // 4. Check Server DB Novels creators
    const serverNovels: Novel[] = Array.isArray(db.yumora_novels) ? db.yumora_novels : [];
    for (const n of serverNovels) {
      if (
        n?.creator?.username &&
        n.creator.username.trim().toLowerCase().replace(/^@/, "") === cleanUsername
      ) {
        return NextResponse.json({
          success: true,
          creator: synthesizeCreatorProfile(n.creator, n.creatorId, n.genre),
        });
      }
      if (n?.creatorId && n.creatorId.trim().toLowerCase() === cleanUsername) {
        return NextResponse.json({
          success: true,
          creator: synthesizeCreatorProfile(n.creator || { id: n.creatorId, name: "Storyteller", username: cleanUsername }, n.creatorId, n.genre),
        });
      }
    }

    // 5. Query Supabase Database
    try {
      const cloud = await dbService.getProfileByUsername(cleanUsername);
      if (cloud) {
        return NextResponse.json({ success: true, creator: cloud });
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: false, error: "Creator not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("API creator lookup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
