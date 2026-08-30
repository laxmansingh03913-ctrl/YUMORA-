import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { Role } from "@/lib/types";
import crypto from "crypto";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: Role;
  name?: string;
  username?: string;
}

export const SERVER_ADMIN_EMAILS = [
  (process.env.ADMIN_EMAIL || "megwansiabhishek7@gmail.com").toLowerCase().trim(),
];

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "default-secret-youmika-123456";

export function generateAdminSessionToken(email: string): string {
  const payload = JSON.stringify({ email: email.toLowerCase().trim(), expires: Date.now() + 1000 * 60 * 60 * 12 });
  const signature = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${signature}`;
}

export function verifyAdminSessionToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payload = Buffer.from(parts[0], "base64").toString();
    const signature = parts[1];
    const expectedSignature = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
    if (signature !== expectedSignature) return null;
    
    const data = JSON.parse(payload);
    if (data.expires > Date.now()) {
      return data.email;
    }
  } catch {
    // ignore
  }
  return null;
}

export function isEmailServerAdmin(email?: string | null): boolean {
  if (!email) return false;
  return SERVER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function getAuthenticatedServerUser(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // 1. Check Bearer Token in Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        const supaUser = data.user;
        const isAdmin = isEmailServerAdmin(supaUser.email);
        const metadata = (supaUser.user_metadata || {}) as Record<string, unknown>;

        return {
          id: supaUser.id,
          email: supaUser.email,
          role: isAdmin ? "ADMIN" : (metadata.role === "ADMIN" ? "READER" : (metadata.role as Role) || "READER"),
          name: (metadata.name as string) || (metadata.full_name as string) || "User",
          username: (metadata.username as string) || supaUser.email?.split("@")[0] || supaUser.id.slice(0, 8),
        };
      }
    }

    // 2. Check X-Admin-Key header for server-to-server operations
    const adminKey = req.headers.get("x-admin-key");
    const configuredKey = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (adminKey && configuredKey && adminKey === configuredKey) {
      return {
        id: "usr-admin-system",
        email: SERVER_ADMIN_EMAILS[0],
        role: "ADMIN",
        name: "System Administrator",
        username: "system_admin",
      };
    }

    // 3. Fallback: Parse user from secure header if populated by middleware
    const forwardUserId = req.headers.get("x-user-id");
    const forwardUserEmail = req.headers.get("x-user-email");
    if (forwardUserId) {
      const isAdmin = isEmailServerAdmin(forwardUserEmail);
      return {
        id: forwardUserId,
        email: forwardUserEmail || undefined,
        role: isAdmin ? "ADMIN" : "READER",
      };
    }

    // 4. Check secure server-side admin cookie
    const adminCookie = req.cookies.get("youmika_admin_auth")?.value;
    if (adminCookie) {
      const adminEmail = verifyAdminSessionToken(adminCookie);
      if (adminEmail && isEmailServerAdmin(adminEmail)) {
        return {
          id: "usr-admin-master",
          email: adminEmail,
          role: "ADMIN",
          name: "Master Admin",
          username: "abhishek",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("[SERVER AUTH ERROR]", error);
    return null;
  }
}
