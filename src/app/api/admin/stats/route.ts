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

    // Parallel fetch all real DB stats
    const [
      novelsResult,
      comicsResult,
      usersResult,
      creatorsResult,
      readsResult,
      payoutsResult,
    ] = await Promise.allSettled([
      supabaseAdmin.from("novels").select("id, reads", { count: "exact" }),
      supabaseAdmin.from("comics").select("id, reads", { count: "exact" }),
      supabaseAdmin.from("profiles").select("id", { count: "exact" }).eq("role", "READER"),
      supabaseAdmin.from("profiles").select("id", { count: "exact" }).eq("role", "CREATOR"),
      supabaseAdmin.from("novels").select("reads").then(async (novels) => {
        const comicReads = await supabaseAdmin.from("comics").select("reads");
        const novelTotal = (novels.data || []).reduce((s: number, n: any) => s + (n.reads || 0), 0);
        const comicTotal = (comicReads.data || []).reduce((s: number, c: any) => s + (c.reads || 0), 0);
        return { total: novelTotal + comicTotal };
      }),
      supabaseAdmin
        .from("payout_requests")
        .select("amount_inr, status")
        .eq("status", "PENDING"),
    ]);

    const novels =
      novelsResult.status === "fulfilled" ? novelsResult.value : { data: [], count: 0 };
    const comics =
      comicsResult.status === "fulfilled" ? comicsResult.value : { data: [], count: 0 };
    const usersCount =
      usersResult.status === "fulfilled" ? (usersResult.value.count || 0) : 0;
    const creatorsCount =
      creatorsResult.status === "fulfilled" ? (creatorsResult.value.count || 0) : 0;
    const totalReads =
      readsResult.status === "fulfilled" ? (readsResult.value as any).total : 0;
    const pendingPayouts =
      payoutsResult.status === "fulfilled" ? (payoutsResult.value.data || []) : [];

    const totalPendingAmount = pendingPayouts.reduce(
      (s: number, p: any) => s + (p.amount_inr || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalNovels: novels.count || 0,
        totalComics: comics.count || 0,
        totalStories: (novels.count || 0) + (comics.count || 0),
        totalReaders: usersCount,
        totalCreators: creatorsCount,
        totalUsers: usersCount + creatorsCount,
        totalReads,
        pendingPayoutsCount: pendingPayouts.length,
        totalPendingPayoutAmount: totalPendingAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
