import { NextRequest, NextResponse } from "next/server";

// Legacy /api/storage endpoint — previously used server-db.json file storage.
// All data is now stored in Supabase PostgreSQL. This endpoint returns an empty
// response for backward compatibility with any old client calls.
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {},
    message: "Storage migrated to Supabase. Use dedicated API endpoints.",
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Storage migrated to Supabase. Use dedicated API endpoints.",
  });
}
