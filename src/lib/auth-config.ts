/**
 * Centralized Site URL & OAuth Redirect Configuration for Yumora
 * Supports both Localhost (Development) and Deployed Vercel/Custom Domains (Production).
 */

/**
 * Returns the base site URL for the current environment.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Recommended environment variable)
 * 2. NEXT_PUBLIC_APP_URL (Fallback existing env var)
 * 3. Browser origin (window.location.origin) when running client-side
 * 4. NEXTAUTH_URL (Server-side auth fallback)
 * 5. Vercel System URL (VERCEL_URL / NEXT_PUBLIC_VERCEL_URL)
 * 6. http://localhost:3000 (Default development fallback)
 */
export function getSiteUrl(): string {
  // 1. Client-side browser runtime origin (always accurate to the current deployed URL / localhost)
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  // 2. Explicit Site URL from environment (server-side fallback)
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "";

  // 3. Vercel deployment automatic URL
  if (!url) {
    const vercelUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
    if (vercelUrl) {
      url = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    }
  }

  // 4. Fallback to default local development
  if (!url) {
    url = "http://localhost:3000";
  }

  // Clean trailing slash
  return url.replace(/\/+$/, "");
}

/**
 * Generates the standardized OAuth callback URL for Yumora.
 * Works seamlessly across both Development (localhost:3000) and Production (Vercel / custom domain).
 *
 * @param destination Optional path to redirect the user after successful authentication (e.g. "/creator/upload")
 * @returns Fully-qualified redirect URL (e.g. "http://localhost:3000/auth/callback?redirect=%2Fcreator%2Fupload")
 */
export function getAuthCallbackUrl(destination?: string): string {
  const baseUrl = getSiteUrl();
  const callbackPath = `${baseUrl}/auth/callback`;

  if (!destination || destination === "/") {
    return callbackPath;
  }

  // Sanitize destination to ensure it is a safe relative path
  const safeDestination = destination.startsWith("/")
    ? destination
    : `/${destination}`;

  return `${callbackPath}?redirect=${encodeURIComponent(safeDestination)}`;
}

/**
 * Validates and sanitizes a destination redirect path to prevent open redirect vulnerabilities.
 */
export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path) return "/";

  // Must be a relative path starting with / and not // (protocol-relative)
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }

  return "/";
}
