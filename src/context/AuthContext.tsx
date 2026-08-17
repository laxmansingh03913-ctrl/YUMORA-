"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, Role } from "../lib/types";
import { SEED_USERS } from "../lib/data/seed-data";
import { dataStore } from "../lib/data/store";
import { supabase } from "../lib/supabase/client";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize Session
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem("yumora_active_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(SEED_USERS[0]);
        }
      }

      // Check Supabase Auth Session
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const supaUser = data.session.user;
          const existing =
            dataStore.getUserById(supaUser.id) ||
            dataStore.getUserByUsername(supaUser.email?.split("@")[0] || "");
          if (existing) {
            setUser(existing);
            localStorage.setItem("yumora_active_user", JSON.stringify(existing));
          }
        }
      } catch (err) {
        console.warn("Supabase auth session sync notice:", err);
      }

      setMounted(true);
    };

    initAuth();

    // Listen to Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const supaUser = session.user;
        const metadata = supaUser.user_metadata || {};
        const username = (metadata.username || supaUser.email?.split("@")[0] || "user").toLowerCase();

        let profile = dataStore.getUserById(supaUser.id) || dataStore.getUserByUsername(username);
        if (!profile) {
          profile = {
            id: supaUser.id,
            name: metadata.name || metadata.full_name || username,
            username,
            email: supaUser.email || "",
            role: (metadata.role as Role) || "READER",
            avatar:
              metadata.avatar_url ||
              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
            bio: "New storyteller on Yumora.",
            country: "Global",
            isVerified: false,
            isCreatorProfileComplete: false,
            isEmailVerified: Boolean(supaUser.email_confirmed_at),
            isAgeVerified: true,
            followersCount: 0,
            followingCount: 0,
            totalReads: 0,
            createdAt: new Date().toISOString(),
          };
          dataStore.updateUserProfile(profile.id, profile);
        }
        setUser(profile);
        localStorage.setItem("yumora_active_user", JSON.stringify(profile));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("yumora_active_user");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const switchRole = (role: Role) => {
    let target = SEED_USERS.find((u) => u.role === role);
    if (!target) {
      target = SEED_USERS[0];
    }
    saveUser(target);
  };

  const loginAsDemo = (role: Role) => {
    switchRole(role);
    handlePostAuthRedirect();
  };

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check local data store for user
      const localUser = dataStore.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

      // Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // If Supabase says unconfirmed, log in user
        if (error.message.toLowerCase().includes("confirm") || error.message.toLowerCase().includes("email not confirmed")) {
          const username = cleanEmail.split("@")[0];
          const profile = localUser || {
            id: `usr-${Date.now()}`,
            name: username,
            username: username.replace(/[^a-z0-9_]/g, ""),
            email: cleanEmail,
            role: "CREATOR" as Role,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300`,
            bio: "Creator on Yumora",
            country: "Global",
            isVerified: false,
            isCreatorProfileComplete: false,
            isEmailVerified: true,
            isAgeVerified: true,
            monetizationTier: "NONE",
            monetizationStatus: "NOT_APPLIED",
            fraudAuditStatus: "CLEAN",
            followersCount: 0,
            followingCount: 0,
            totalReads: 0,
            createdAt: new Date().toISOString(),
          };
          dataStore.updateUserProfile(profile.id, profile);
          saveUser(profile);
          setIsLoading(false);
          handlePostAuthRedirect();
          return { success: true };
        }

        // If local user exists, log in
        if (localUser) {
          saveUser(localUser);
          setIsLoading(false);
          handlePostAuthRedirect();
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        let profile =
          dataStore.getUserById(data.user.id) ||
          dataStore.getUserByUsername(cleanEmail.split("@")[0]);

        if (!profile) {
          profile = {
            id: data.user.id,
            name: cleanEmail.split("@")[0],
            username: cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, ""),
            email: cleanEmail,
            role: "CREATOR",
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300`,
            bio: "Creator on Yumora",
            country: "Global",
            isVerified: false,
            isCreatorProfileComplete: false,
            isEmailVerified: true,
            isAgeVerified: true,
            monetizationTier: "NONE",
            monetizationStatus: "NOT_APPLIED",
            fraudAuditStatus: "CLEAN",
            followersCount: 0,
            followingCount: 0,
            totalReads: 0,
            createdAt: new Date().toISOString(),
          };
          dataStore.updateUserProfile(profile.id, profile);
        }
        saveUser(profile);
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

      // 1. Check if username taken
      const existingUser = dataStore.getUserByUsername(cleanUsername);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: `Username @${cleanUsername} is already registered.` };
      }

      // 2. Try Supabase Sign Up
      let supaUserId: string | null = null;
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name,
              username: cleanUsername,
              role,
            },
          },
        });

        if (error && error.message.includes("already registered")) {
          setIsLoading(false);
          return { success: false, error: "This email address is already registered. Please sign in." };
        }

        supaUserId = data.user?.id || null;
      } catch (e) {
        console.warn("Supabase signup notice:", e);
      }

      const newUserId = supaUserId || `usr-new-${Date.now()}`;

      // 3. Register user profile in data store
      const newProfile: UserProfile = {
        id: newUserId,
        name,
        username: cleanUsername,
        email: cleanEmail,
        role,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
        bio: `${role === "CREATOR" ? "Creator & Author" : "Avid Reader"} on Yumora.`,
        country: "Global",
        isVerified: false,
        isCreatorProfileComplete: false,
        isEmailVerified: true,
        isAgeVerified: true,
        monetizationTier: "NONE",
        monetizationStatus: "NOT_APPLIED",
        fraudAuditStatus: "CLEAN",
        followersCount: 0,
        followingCount: 0,
        totalReads: 0,
        createdAt: new Date().toISOString(),
      };

      dataStore.updateUserProfile(newProfile.id, newProfile);
      saveUser(newProfile);

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
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(intendedDestination || "/")}`
              : undefined,
        },
      });
    } catch (err) {
      console.warn("OAuth sign in notice:", err);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    saveUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = dataStore.updateUserProfile(user.id, updated);
    saveUser(newProfile);
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
