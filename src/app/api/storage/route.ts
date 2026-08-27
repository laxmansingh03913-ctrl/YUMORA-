import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthenticatedServerUser } from "@/lib/auth/server";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "server-db.json");

// Whitelist of valid storage keys
const ALLOWED_KEYS = [
  "yumora_comics",
  "yumora_novels",
  "yumora_users",
  "yomika_contests",
  "yomika_contest_submissions",
  "yumora_community_posts",
  "yumora_reports",
  "yumora_payout_requests",
  "yumora_tips",
] as const;

type AllowedKey = (typeof ALLOWED_KEYS)[number];

// Publicly readable keys (without requiring authentication)
const PUBLIC_READ_KEYS = new Set<AllowedKey>([
  "yumora_comics",
  "yumora_novels",
  "yomika_contests",
  "yomika_contest_submissions",
  "yumora_community_posts",
]);

function getDb(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        yumora_comics: [],
        yumora_novels: [],
        yumora_users: [],
        yomika_contests: [],
        yomika_contest_submissions: [],
        yumora_community_posts: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("[STORAGE DB READ ERROR]", error);
    return {};
  }
}

function saveDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("[STORAGE DB WRITE ERROR]", error);
  }
}

// Sanitize user profile to avoid leaking passwords or sensitive internal fields to public
function sanitizeUserProfile(user: any) {
  if (!user || typeof user !== "object") return null;
  const { passwordHash, password, email, ...safe } = user;
  return {
    ...safe,
    // Only mask email if requested by unauthenticated visitor
    email: email ? `${email.slice(0, 3)}***@${email.split("@")[1] || "domain.com"}` : "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") as AllowedKey | null;
    const db = getDb();
    const user = await getAuthenticatedServerUser(req);
    const isAdmin = user?.role === "ADMIN";

    // 1. If key is specified
    if (key) {
      if (!ALLOWED_KEYS.includes(key)) {
        return NextResponse.json({ error: "Invalid or unsupported storage key" }, { status: 400 });
      }

      // Public key: allow access
      if (PUBLIC_READ_KEYS.has(key)) {
        return NextResponse.json({ data: db[key] || [] });
      }

      // Users key: if unauthenticated, return sanitized public profiles
      if (key === "yumora_users") {
        const allUsers = Array.isArray(db.yumora_users) ? db.yumora_users : [];
        if (isAdmin) {
          return NextResponse.json({ data: allUsers });
        }
        const publicUsers = allUsers.map(sanitizeUserProfile).filter(Boolean);
        return NextResponse.json({ data: publicUsers });
      }

      // Sensitive keys require authentication
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required to access requested data" },
          { status: 401 }
        );
      }

      // Payout requests / reports: normal user can only view their own
      if (key === "yumora_payout_requests" || key === "yumora_reports") {
        const records = Array.isArray(db[key]) ? db[key] : [];
        if (isAdmin) {
          return NextResponse.json({ data: records });
        }
        const userRecords = records.filter(
          (r: any) => r && (r.userId === user.id || r.creatorId === user.id || r.reporterId === user.id)
        );
        return NextResponse.json({ data: userRecords });
      }

      return NextResponse.json({ data: db[key] || null });
    }

    // 2. Full DB request: Only admin can read full database dump
    if (isAdmin) {
      return NextResponse.json({ data: db });
    }

    // Non-admin full dump: return sanitized public subset
    const safeDump: Record<string, any> = {};
    for (const k of ALLOWED_KEYS) {
      if (PUBLIC_READ_KEYS.has(k)) {
        safeDump[k] = db[k] || [];
      }
    }
    safeDump.yumora_users = (Array.isArray(db.yumora_users) ? db.yumora_users : [])
      .map(sanitizeUserProfile)
      .filter(Boolean);

    return NextResponse.json({ data: safeDump });
  } catch (error: any) {
    console.error("[STORAGE GET ERROR]", error);
    return NextResponse.json({ error: "Failed to retrieve storage data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedServerUser(req);
    const isAdmin = user?.role === "ADMIN";

    const body = await req.json();
    const { key, data } = body;

    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid or unsupported storage key" }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Missing payload data" }, { status: 400 });
    }

    // 1. Require authentication for all storage writes
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to modify storage" },
        { status: 401 }
      );
    }

    const db = getDb();

    // 2. Admin has full write access to all keys
    if (isAdmin) {
      db[key] = data;
      saveDb(db);
      return NextResponse.json({ success: true, authorizedAs: "ADMIN" });
    }

    // 3. Non-admin write permissions:
    // Disallow modifying administrative keys (users, payouts, admin settings)
    if (key === "yumora_users") {
      // Normal user can only update their own profile; cannot promote themselves to ADMIN
      const usersList: any[] = Array.isArray(db.yumora_users) ? db.yumora_users : [];
      if (Array.isArray(data)) {
        // Find if user is only updating their own record
        const incomingSelf = data.find((u: any) => u && u.id === user.id);
        if (incomingSelf) {
          // Prevent privilege escalation
          if (incomingSelf.role === "ADMIN") {
            incomingSelf.role = "CREATOR";
          }
          const existingIdx = usersList.findIndex((u) => u.id === user.id);
          if (existingIdx >= 0) {
            usersList[existingIdx] = { ...usersList[existingIdx], ...incomingSelf };
          } else {
            usersList.push(incomingSelf);
          }
          db.yumora_users = usersList;
          saveDb(db);
          return NextResponse.json({ success: true });
        }
      }
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to modify other user records." },
        { status: 403 }
      );
    }

    if (key === "yumora_payout_requests") {
      // Normal user can only add payout requests for themselves
      const existing = Array.isArray(db.yumora_payout_requests) ? db.yumora_payout_requests : [];
      if (Array.isArray(data)) {
        // Verify all new items belong to the authenticated user
        const safeItems = data.filter((item: any) => item && (item.creatorId === user.id || item.userId === user.id));
        const otherItems = existing.filter((item: any) => item && item.creatorId !== user.id && item.userId !== user.id);
        db.yumora_payout_requests = [...otherItems, ...safeItems];
        saveDb(db);
        return NextResponse.json({ success: true });
      }
    }

    // For novels & comics: users can only manage their own series
    if (key === "yumora_novels" || key === "yumora_comics") {
      const existingList: any[] = Array.isArray(db[key]) ? db[key] : [];
      if (Array.isArray(data)) {
        // Keep other users' items intact; replace/update own items
        const userItems = data.filter((item: any) => item && item.creatorId === user.id);
        const otherItems = existingList.filter((item: any) => item && item.creatorId !== user.id);
        db[key] = [...otherItems, ...userItems];
        saveDb(db);
        return NextResponse.json({ success: true });
      }
    }

    // Community posts
    if (key === "yumora_community_posts" && Array.isArray(data)) {
      db.yumora_community_posts = data;
      saveDb(db);
      return NextResponse.json({ success: true });
    }

    // Contest submissions
    if (key === "yomika_contest_submissions" && Array.isArray(data)) {
      db.yomika_contest_submissions = data;
      saveDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Forbidden: You lack permission to perform this storage modification" },
      { status: 403 }
    );
  } catch (error: any) {
    console.error("[STORAGE POST ERROR]", error);
    return NextResponse.json({ error: "Internal server error saving data" }, { status: 500 });
  }
}
