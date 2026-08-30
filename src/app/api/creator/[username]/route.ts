import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/supabase/db";
import { UserProfile } from "@/lib/types";

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
  context: { params: Promise<{ username: string }> }
) {
  try {
    const rawParams = await context.params;

    const rawUsername = rawParams?.username || "";
    const cleanUsername = decodeURIComponent(rawUsername).trim().toLowerCase().replace(/^@/, "");

    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    // Query Supabase profiles table (sole source of truth)
    try {
      const cloud =
        (await dbService.getProfileByUsername(cleanUsername)) ||
        (await dbService.getProfile(cleanUsername));
      if (cloud) {
        return NextResponse.json({ success: true, creator: cloud });
      }
    } catch (e) {
      console.warn("Supabase creator lookup notice:", e);
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
