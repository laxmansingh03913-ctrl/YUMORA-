import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Minimal privacy-friendly visit counter: stores only the page path + timestamp.
// No IP address, cookie, fingerprint, or user id is recorded.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path : "";
    if (!path.startsWith("/") || path.length > 500) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }
    await prisma.$executeRaw`INSERT INTO page_visits (path) VALUES (${path})`;
    return NextResponse.json({ success: true });
  } catch {
    // Never break page rendering because analytics failed.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
