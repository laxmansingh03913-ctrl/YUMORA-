"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, Role } from "../lib/types";
import { dataStore } from "../lib/data/store";
import { supabase } from "../lib/supabase/client";
import { dbService } from "../lib/supabase/db";
import { getAuthCallbackUrl } from "../lib/auth-config";

interface AuthContextType {
  user: UserProfile | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  intendedDestination: string | null;
  openAuthModal: (tab?: "login" | "signup", destination?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (destination?: string, onAuthenticated?: () => void) => boolean;
  switchRole: (role: Role) => void;
  loginAsDemo: (role: Role) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    username: string,
    role?: Role
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: "google" | "github" | "apple") => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

export const MASTER_ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "megwansiabhishek7@gmail.com"
)
  .toLowerCase()
  .trim();

export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === MASTER_ADMIN_EMAIL;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper to extract or fetch profile from Supabase database
  const syncSupabaseProfile = useCallback(async (supaUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    email_confirmed_at?: string;
    confirmed_at?: string;
  }): Promise<UserProfile> => {
    const metadata = (supaUser.user_metadata || {}) as Record<string, string | undefined>;
    const rawUsername =
      metadata.username ||
      metadata.user_name ||
      supaUser.email?.split("@")[0] ||
      `user_${supaUser.id.slice(0, 6)}`;
    const username = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${Date.now() % 10000}`;

    const isAdminUser = isMasterAdmin(supaUser.email);
    const resolvedRole: Role = isAdminUser
      ? "ADMIN"
      : (metadata.role as Role) === "ADMIN"
      ? "CREATOR"
      : (metadata.role as Role) || "CREATOR";

    // 1. Fetch live profile directly from Supabase PostgreSQL
    let profile: UserProfile | null = null;
    try {
      profile = await dbService.getProfile(supaUser.id);
    } catch (err) {
      console.warn("Notice fetching Supabase profile:", err);
    }

    if (profile) {
      // Merge with any locally cached edits the user may have just saved
      // (protects against TOKEN_REFRESHED overwriting recent profile updates)
      try {
        const cached = localStorage.getItem("yumora_active_user");
        if (cached) {
          const cachedProfile: UserProfile = JSON.parse(cached);
          // Only merge if it's the same user and cached data is more recent
          if (cachedProfile.id === supaUser.id) {
            // Prefer cached values for user-editable fields
            profile = {
              ...profile,
              name: cachedProfile.name || profile.name,
              bio: cachedProfile.bio ?? profile.bio,
              avatar: cachedProfile.avatar || profile.avatar,
              banner: cachedProfile.banner ?? profile.banner,
              country: cachedProfile.country || profile.country,
              website: cachedProfile.website ?? profile.website,
              twitter: cachedProfile.twitter ?? profile.twitter,
              primaryGenres: cachedProfile.primaryGenres?.length ? cachedProfile.primaryGenres : profile.primaryGenres,
              preferredTypes: cachedProfile.preferredTypes?.length ? cachedProfile.preferredTypes : profile.preferredTypes,
            };
          }
        }
      } catch {
        // ignore localStorage errors
      }

      // Keep admin authorization in sync
      if (isAdminUser && profile.role !== "ADMIN") {
        profile = { ...profile, role: "ADMIN", isVerified: true };
        await dbService.upsertProfile(profile);
      }
      dataStore.updateUserProfile(profile.id, profile);
    } else {
      // 2. Create authoritative profile in Supabase
      profile = {
        id: supaUser.id,
        name: metadata.name || metadata.full_name || metadata.user_name || username,
        username,
        email: supaUser.email || "",
        role: resolvedRole,
        avatar:
          metadata.avatar_url ||
          metadata.picture ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
        bio: isAdminUser ? "Official Yomika Platform Administrator." : "Storyteller & reader on Yomika.",
        country: "Global",
        isVerified: isAdminUser,
        isCreatorProfileComplete: false,
        isEmailVerified: Boolean(supaUser.email_confirmed_at || supaUser.confirmed_at),
        isAgeVerified: true,
        monetizationTier: "NONE",
        monetizationStatus: "NOT_APPLIED",
        fraudAuditStatus: "CLEAN",
        followersCount: 0,
        followingCount: 0,
        totalReads: 0,
        createdAt: new Date().toISOString(),
      };
      await dbService.upsertProfile(profile);
      dataStore.updateUserProfile(profile.id, profile);
    }
    return profile;
  }, []);

  // Initialize Session authoritatively from Supabase Auth
  useEffect(() => {
    let isSubscribed = true;

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user && isSubscribed) {
          const profile = await syncSupabaseProfile(data.session.user);
          if (isSubscribed) {
            setUser(profile);
            try {
              localStorage.setItem("yumora_active_user", JSON.stringify(profile));
            } catch {
              // ignore cache errors
            }
          }
        } else if (isSubscribed) {
          setUser(null);
          try {
            localStorage.removeItem("yumora_active_user");
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn("Supabase auth session sync notice:", err);
      } finally {
        if (isSubscribed) {
          setMounted(true);
        }
      }
    };

    initAuth();

    // Listen to authoritative Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        const profile = await syncSupabaseProfile(session.user);
        if (isSubscribed) {
          setUser(profile);
          try {
            localStorage.setItem("yumora_active_user", JSON.stringify(profile));
          } catch {
            // ignore
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (isSubscribed) {
          setUser(null);
          try {
            localStorage.removeItem("yumora_active_user");
          } catch {
            // ignore
          }
        }
      }
    });

    return () => {
      isSubscribed = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncSupabaseProfile]);

  const saveUser = useCallback((u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("yumora_active_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("yumora_active_user");
    }
  }, []);

  // Post-Authentication Redirect Resolver
  const handlePostAuthRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    if (intendedDestination) {
      const destination = intendedDestination;
      setIntendedDestination(null);
      router.push(destination);
    }
  }, [intendedDestination, router]);

  const openAuthModal = useCallback((tab: "login" | "signup" = "login", destination?: string) => {
    setAuthModalTab(tab);
    if (destination) {
      setIntendedDestination(destination);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Centralized Authentication Guard
  const requireAuth = useCallback(
    (destination?: string, onAuthenticated?: () => void): boolean => {
      if (user) {
        if (onAuthenticated) {
          onAuthenticated();
        } else if (destination) {
          router.push(destination);
        }
        return true;
      }

      // Not authenticated -> Preserve destination and open Auth Modal
      if (destination) {
        setIntendedDestination(destination);
      }
      setAuthModalTab("signup");
      setIsAuthModalOpen(true);
      return false;
    },
    [user, router]
  );

  const switchRole = (newRole: Role) => {
    if (user) {
      updateProfile({ role: newRole });
    }
  };

  const loginAsDemo = (_role: Role) => {
    // Demo login removed in favor of real authentication
  };

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Authenticate directly with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await syncSupabaseProfile(data.user);
        setUser(profile);
        try {
          localStorage.setItem("yumora_active_user", JSON.stringify(profile));
        } catch {
          // ignore
        }
      }

      setIsLoading(false);
      handlePostAuthRedirect();
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Sign in error";
      return { success: false, error: msg };
    }
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    username: string,
    role: Role = "CREATOR"
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const isAdminEmail = isMasterAdmin(cleanEmail);
      const resolvedRole: Role = isAdminEmail ? "ADMIN" : role === "ADMIN" ? "CREATOR" : role;

      // 1. Check if username taken in Supabase
      const existingProfile = await dbService.getProfileByUsername(cleanUsername);
      if (existingProfile) {
        setIsLoading(false);
        return { success: false, error: `Username @${cleanUsername} is already registered.` };
      }

      // 2. Perform Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name,
            username: cleanUsername,
            role: resolvedRole,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await syncSupabaseProfile(data.user);
        setUser(profile);
        try {
          localStorage.setItem("yumora_active_user", JSON.stringify(profile));
        } catch {
          // ignore
        }
      }

      setIsLoading(false);
      handlePostAuthRedirect();
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Sign up error";
      return { success: false, error: msg };
    }
  };

  // Sign In with OAuth (Google, GitHub, Apple)
  const signInWithOAuth = async (provider: "google" | "github" | "apple") => {
    setIsLoading(true);
    try {
      const callbackUrl = getAuthCallbackUrl(intendedDestination || undefined);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) {
        console.error("OAuth sign in error:", error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.warn("OAuth sign in notice:", err);
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    try {
      localStorage.removeItem("yumora_active_user");
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    const merged: UserProfile = { ...user, ...updated };
    // 1. Optimistically update local state + localStorage immediately
    setUser(merged);
    try {
      localStorage.setItem("yumora_active_user", JSON.stringify(merged));
    } catch {
      // ignore
    }
    // 2. Persist to DB using correct snake_case column mapping
    console.log("[updateProfile] Saving to DB:", updated);
    const saved = await dbService.updateProfile(user.id, updated);
    console.log("[updateProfile] DB save result:", saved);
    if (!saved) {
      console.warn("[updateProfile] updateProfile failed, trying upsert fallback...");
      const upserted = await dbService.upsertProfile(merged);
      console.log("[updateProfile] upsert result:", upserted);
    }
    dataStore.updateUserProfile(user.id, merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        role: mounted ? user?.role || null : null,
        isAuthenticated: !!(mounted && user),
        isLoading,
        isAuthModalOpen,
        authModalTab,
        intendedDestination,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        switchRole,
        loginAsDemo,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
