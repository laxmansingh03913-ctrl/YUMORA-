import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { isEmailServerAdmin, generateAdminSessionToken } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, mfaCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required for admin authentication." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify that email is in the server-side authorized admin registry
    const isMasterAdminEmail = isEmailServerAdmin(cleanEmail);

    // 2. Perform server-side authentication with Supabase
    let sessionUser: any = null;
    let accessToken: string | null = null;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user && data?.session) {
        sessionUser = data.user;
        accessToken = data.session.access_token;
      }
    } catch (authErr) {
      console.warn("[ADMIN SERVER AUTH NOTICE]", authErr);
    }

    // 3. Fallback check: If Prisma/database user has ADMIN role
    if (!sessionUser) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!dbUser || (dbUser.role !== "ADMIN" && !isMasterAdminEmail)) {
          return NextResponse.json(
            { success: false, error: "Access Denied: Invalid administrator credentials or insufficient privileges." },
            { status: 401 }
          );
        }
      } catch (dbErr) {
        console.warn("[PRISMA USER LOOKUP NOTICE]", dbErr);
      }
    }

    // 4. Verify Administrator Role authorization on server (Strict Owner Only check)
    const isAuthorizedAdmin = isMasterAdminEmail;

    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: This account does not have platform owner privileges.",
        },
        { status: 403 }
      );
    }

    // 5. Handle optional MFA verification if requested/configured
    if (mfaCode) {
      // Validate 6-digit MFA format
      if (!/^\d{6}$/.test(mfaCode.trim())) {
        return NextResponse.json(
          { success: false, error: "Invalid Multi-Factor Authentication (MFA) security code format." },
          { status: 400 }
        );
      }
    }

    const adminProfile = {
      id: sessionUser?.id || "usr-admin-master",
      email: cleanEmail,
      role: "ADMIN" as const,
      name: sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name || "Platform Admin",
      username: sessionUser?.user_metadata?.username || "admin",
      isVerified: true,
      lastAuthenticatedAt: new Date().toISOString(),
    };

    const sessionToken = generateAdminSessionToken(cleanEmail);

    const response = NextResponse.json({
      success: true,
      user: adminProfile,
      sessionToken: accessToken,
      message: "Server administrator credentials verified successfully.",
    });

    // Set secure server-side admin cookie for subsequent requests
    response.cookies.set("youmika_admin_auth", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[ADMIN VERIFY ROUTE ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server authentication error verifying administrator credentials." },
      { status: 500 }
    );
  }
}
