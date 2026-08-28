"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { dbService } from "@/lib/supabase/db";
import { dataStore } from "@/lib/data/store";
import { UserProfile, Role } from "@/lib/types";
import { sanitizeRedirectPath } from "@/lib/auth-config";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [destinationPath, setDestinationPath] = useState<string>("/");

  useEffect(() => {
    let isMounted = true;

    const processAuthCallback = async () => {
      try {
        // 1. Resolve safe destination URL
        const redirectParam = searchParams.get("redirect") || searchParams.get("next");
        const targetPath = sanitizeRedirectPath(redirectParam);
        if (isMounted) {
          setDestinationPath(targetPath);
        }

        // 2. Check for OAuth error in URL query or URL hash
        let errorDescription = searchParams.get("error_description");
        let errorCode = searchParams.get("error");

        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.get("error")) errorCode = hashParams.get("error");
          if (hashParams.get("error_description")) errorDescription = hashParams.get("error_description");
        }

        if (errorCode || errorDescription) {
          throw new Error(errorDescription || errorCode || "Authentication failed.");
        }

        // 3. Handle PKCE Code exchange if 'code' is in query parameters
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("PKCE code exchange notice:", exchangeError.message);
          }
        }

        // 4. Retrieve and verify the active session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        const handleUserSession = async (session: { user: any }) => {
          const supaUser = session.user;
          const metadata = (supaUser.user_metadata || {}) as Record<string, string | undefined>;
          const rawUsername =
            metadata.username ||
            metadata.user_name ||
            supaUser.email?.split("@")[0] ||
            `user_${supaUser.id.slice(0, 6)}`;
          const username = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${Date.now() % 10000}`;

          // Establish real Supabase profile
          let profile = await dbService.getProfile(supaUser.id);

          if (!profile) {
            profile = {
              id: supaUser.id,
              name: metadata.name || metadata.full_name || metadata.user_name || username,
              username,
              email: supaUser.email || "",
              role: (metadata.role as Role) || "CREATOR",
              avatar:
                metadata.avatar_url ||
                metadata.picture ||
                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
              bio: "Reader and storyteller on Yomika.",
              country: "Global",
              isVerified: false,
              isCreatorProfileComplete: false,
              isEmailVerified: Boolean(supaUser.email_confirmed_at || supaUser.confirmed_at),
              isAgeVerified: true,
              followersCount: 0,
              followingCount: 0,
              totalReads: 0,
              createdAt: new Date().toISOString(),
            };
            await dbService.upsertProfile(profile);
          }
          dataStore.updateUserProfile(profile.id, profile);

          try {
            localStorage.setItem("yumora_active_user", JSON.stringify(profile));
          } catch {
            // ignore localStorage errors
          }

          if (isMounted) {
            setStatus("success");
          }

          // Clean sensitive tokens/hashes from URL and redirect to destination
          if (typeof window !== "undefined" && window.history?.replaceState) {
            window.history.replaceState(null, "", window.location.pathname);
          }

          setTimeout(() => {
            if (isMounted) {
              router.replace(targetPath);
            }
          }, 300);
        };

        const session = sessionData?.session;
        if (session?.user) {
          handleUserSession(session);
        } else {
          // Listen to next state change if session is still settling
          const { data: authSub } = supabase.auth.onAuthStateChange((event, nextSession) => {
            if (nextSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
              authSub.subscription.unsubscribe();
              if (isMounted) {
                handleUserSession(nextSession);
              }
            }
          });

          // Fallback timer if no session event fires
          setTimeout(() => {
            if (isMounted && status === "loading") {
              authSub.subscription.unsubscribe();
              router.replace(targetPath);
            }
          }, 2500);
        }
      } catch (err: unknown) {
        console.error("Auth callback exception:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Unable to complete sign-in. Please try again."
          );
        }
      }
    };

    processAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, status]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto text-center animate-in fade-in">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center mx-auto ring-4 ring-indigo-500/20">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              Authenticating with Yomika...
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Securing session and loading your personal reading universe
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              Authenticated Successfully
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Redirecting you to your destination...
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-200 space-y-4 shadow-xl w-full">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Sign In Issue</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {errorMessage || "Authentication could not be completed. Please try signing in again."}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={destinationPath || "/"}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Continue to Yomika</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">Loading Yomika authentication...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
