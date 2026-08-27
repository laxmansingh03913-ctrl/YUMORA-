import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { Role } from "@/lib/types";

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
          role: isAdmin ? "ADMIN" : (metadata.role as Role) || "READER",
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

    return null;
  } catch (error) {
    console.error("[SERVER AUTH ERROR]", error);
    return null;
  }
}
