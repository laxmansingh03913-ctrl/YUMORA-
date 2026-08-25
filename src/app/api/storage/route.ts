import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "server-db.json");

function getDb(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        yumora_comics: [],
        yumora_novels: [],
        yumora_users: [],
        yumora_contests: [],
        yumora_community_posts: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("Failed to read server DB:", error);
    return {};
  }
}

function saveDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to server DB:", error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const db = getDb();

    if (key) {
      return NextResponse.json({ data: db[key] || null });
    }
    return NextResponse.json({ data: db });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, data } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const db = getDb();
    db[key] = data;
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
