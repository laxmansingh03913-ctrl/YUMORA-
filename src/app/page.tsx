"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen, PenTool, Star, Eye, ChevronLeft, ChevronRight,
  Play, Plus, Clock, Users, ArrowRight, CheckCircle2,
  Mail, Lock, User, AtSign, AlertCircle, Loader2, Sparkles, Check
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { ContinueReadingWidget } from "@/components/home/ContinueReadingWidget";
import { formatNumber, formatDate } from "@/lib/utils";
import { formatContestDeadline, getContestStatus } from "@/lib/utils/contest";
import { Role } from "@/lib/types";


// ─────────────────────────────────────────────────────────────────────────────
// STATIC HERO FALLBACKS
// ─────────────────────────────────────────────────────────────────────────────
const HERO_FALLBACKS: any[] = [];

const FORMATS = [
  { name: "Web Novels",   href: "/discover?format=web_novels",  emoji: "📖", desc: "480+ stories" },
  { name: "Light Novels", href: "/discover?format=light_novels", emoji: "✨", desc: "210+ stories" },
  { name: "Manga",        href: "/discover?format=manga",         emoji: "🖤", desc: "190+ stories" },
  { name: "Webtoons",     href: "/discover?format=webtoons",      emoji: "📱", desc: "140+ stories" },
  { name: "Comics",       href: "/comics",                         emoji: "🎨", desc: "80+ stories"  },
];

const EDITORIAL: any[] = [];

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, href, linkLabel = "View All" }: {
  eyebrow?: string; title: string; href?: string; linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 sm:mb-8">
      <div>
        {eyebrow && <p className="text-[11px] font-black tracking-widest text-[#D91E18] uppercase mb-0.5">{eyebrow}</p>}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-450 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white transition group">
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// ─── Story Card ───────────────────────────────────────────────────────────────
function StoryCard({ cover, title, genre, rating, views, slug, isOriginal = false }: {
  cover: string; title: string; genre: string;
  rating?: string; views?: string; slug: string; isOriginal?: boolean;
}) {
  return (
    <Link href={`/novels/${slug}`} className="group flex-shrink-0 w-36 sm:w-44 lg:w-48 block snap-start space-y-2 select-none">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-150 dark:border-white/6 group-hover:border-[#D91E18]/45 transition-all duration-300 shadow-lg">
        <img src={cover} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 pointer-events-none">
          {rating && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-white">{rating}</span>
            </div>
          )}
          {views && (
            <div className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/5 text-[9px] font-bold text-white/80">{views}</div>
          )}
        </div>
        {isOriginal && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-[#D91E18] text-white uppercase tracking-wider shadow-md pointer-events-none">ORIGINAL</span>
        )}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-sm border border-white/5 pointer-events-none">
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">👑 Weekly Top 5</span>
        </div>
      </div>
      <div className="px-1 text-left">
        <p className="text-[10px] font-black text-[#D91E18] uppercase tracking-wider">{genre}</p>
        <h3 className="text-xs sm:text-sm font-black text-zinc-800 dark:text-white group-hover:text-[#D91E18] transition-colors leading-tight line-clamp-1 mt-0.5">{title}</h3>
      </div>
    </Link>
  );
}

// ─── Horizontal Shelf ─────────────────────────────────────────────────────────
function HorizontalShelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

export default function IndexPage() {
  const { user, isLoading, signInWithEmail, signUpWithEmail, signInWithOAuth, requireAuth } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Welcome Landing / Credentials form states
  const [authView, setAuthView] = useState<"landing" | "login" | "signup">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [creatorRole, setCreatorRole] = useState<Role>("CREATOR");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check onboarding triggers when authenticated
  useEffect(() => {
    if (!mounted || isLoading) return;
    if (user) {
      const onboardingDone = localStorage.getItem(`yomika_onboarding_done_${user.id}`);
      if (!onboardingDone) {
        setShowOnboarding(true);
      }
    }
  }, [user, isLoading, mounted]);

  const novels = dataStore.getNovels();
  const creators = dataStore.getUsers().filter((u) => u.role === "CREATOR" || u.role === "ADMIN");
  const activeContest = dataStore.getActiveContest();
  const followingFeed = mounted && user ? dataStore.getFollowingFeed() : [];

  const heroSlides = [
    ...novels.slice(0, 4).map((n, i) => ({
      id: n.id, title: n.title, slug: n.slug,
      description: n.description || HERO_FALLBACKS[i % 4]?.description || "",
      coverUrl: n.coverUrl, genre: n.genre,
      rating: String(n.rating), views: formatNumber(n.reads),
      tags: [n.genre, "Web Novel"],
    })),
    ...HERO_FALLBACKS.slice(novels.slice(0, 4).length),
  ].slice(0, 4);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setSlideIndex(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const next = useCallback(() => {
    if (heroSlides.length === 0) return;
    goTo((slideIndex + 1) % heroSlides.length);
  }, [goTo, slideIndex, heroSlides.length]);

  const prev = useCallback(() => {
    if (heroSlides.length === 0) return;
    goTo((slideIndex - 1 + heroSlides.length) % heroSlides.length);
  }, [goTo, slideIndex, heroSlides.length]);

  useEffect(() => {
    if (paused || !user) return;
    timerRef.current = setInterval(next, 6500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, user]);

  const pauseAndResume = () => {
    setPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setPaused(false), 14000);
  };
  const handleNav = (fn: () => void) => { pauseAndResume(); fn(); };

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) { pauseAndResume(); if (dx < 0) next(); else prev(); }
    touchX.current = null;
  };

  useEffect(() => {
    if (!user) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNav(next);
      if (e.key === "ArrowLeft")  handleNav(prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authView === "login") {
      if (!email.trim() || !password) {
        setErrorMsg("Please fill in all credentials.");
        return;
      }
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || "Invalid credentials. Please verify your details.");
      }
    } else {
      if (!name.trim()) {
        setErrorMsg("Please enter your display name.");
        return;
      }
      if (!username.trim() || username.length < 3) {
        setErrorMsg("Username must be at least 3 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      const res = await signUpWithEmail(email, password, name, cleanUsername, creatorRole);
      if (!res.success) {
        setErrorMsg(res.error || "Sign up failed. Please try again.");
      }
    }
  };

  const toggleFormat = (f: string) => {
    setSelectedFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleOnboardingComplete = () => {
    if (user?.id) {
      localStorage.setItem(`yomika_onboarding_done_${user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  const slide = heroSlides[slideIndex] ?? heroSlides[0];
  const trendingList  = novels.length >= 4 ? novels : [...novels, ...EDITORIAL.slice(novels.length)];
  const originalsList = novels.length >= 6 ? novels.slice(0, 6) : [...novels, ...EDITORIAL.slice(novels.length)].slice(0, 6);
  const newChaps      = novels.slice(0, 5);

  // ─── 1. LOADING STATE ───
  if (!mounted || (isLoading && authView === "landing")) {
    return (
      <div className="w-full min-h-screen bg-[#070707] flex flex-col items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#D91E18] flex items-center justify-center animate-pulse shadow-[0_0_24px_rgba(217,30,24,0.5)]">
            <span className="text-white font-black text-lg">Y</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold tracking-widest uppercase">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D91E18]" />
            <span>Synchronizing Yomika...</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. UNAUTHENTICATED LANDING / AUTH SCREEN ───
  if (!user) {
    return (
      <div className="relative w-full min-h-screen bg-[#070707] text-white flex flex-col justify-between overflow-x-hidden font-sans select-none">
        
        {/* Background Artwork */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
            alt="Immersive landscape background"
            className="w-full h-full object-cover scale-105 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/30 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient-vignette opacity-70 pointer-events-none" />
        </div>

        {/* Header */}
        <header className="relative z-10 w-full px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D91E18] flex items-center justify-center shadow-[0_0_15px_rgba(217,30,24,0.5)]">
              <span className="text-white font-black text-sm">Y</span>
            </div>
            <span className="text-white font-black text-lg tracking-tight">YOMIKA</span>
          </div>
          {authView === "landing" && (
            <button
              onClick={() => setAuthView("login")}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black text-white border border-white/20 hover:bg-white/10 hover:border-white/40 transition"
            >
              LOG IN
            </button>
          )}
        </header>

        {/* Center Grid */}
        <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-16 xl:px-24 py-12 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
            
            {/* Left Copy block */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-px bg-[#D91E18]" />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#D91E18] uppercase">
                  Yomika Platform
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.0] tracking-tight uppercase text-white">
                Stories<br />
                worth getting<br />
                <span className="text-[#D91E18]">lost in.</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/50 leading-relaxed max-w-md">
                Discover web novels, light novels, manga, webtoons and comics created for readers who want something different. Join the global home of original storytelling.
              </p>

              {authView === "landing" && (
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setAuthView("signup")}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-sm sm:text-base tracking-wide transition shadow-[0_0_24px_rgba(217,30,24,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    GET STARTED
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAuthView("login")}
                    className="px-8 py-4 rounded-xl border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold text-sm sm:text-base tracking-wide transition"
                  >
                    LOG IN
                  </button>
                </div>
              )}
            </div>

            {/* Right Form Card */}
            {authView !== "landing" && (
              <div className="lg:col-span-5 w-full max-w-[430px] mx-auto lg:ml-auto bg-black/45 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Tabs */}
                <div className="flex border-b border-white/8 mb-6 pb-2">
                  <button
                    type="button"
                    onClick={() => { setAuthView("login"); setErrorMsg(null); }}
                    className={`flex-1 text-center font-black pb-2 text-xs sm:text-sm transition-all border-b-2 ${
                      authView === "login"
                        ? "text-white border-[#D91E18]"
                        : "text-white/40 border-transparent hover:text-white/70"
                    }`}
                  >
                    LOG IN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthView("signup"); setErrorMsg(null); }}
                    className={`flex-1 text-center font-black pb-2 text-xs sm:text-sm transition-all border-b-2 ${
                      authView === "signup"
                        ? "text-white border-[#D91E18]"
                        : "text-white/40 border-transparent hover:text-white/70"
                    }`}
                  >
                    SIGN UP
                  </button>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-in shake duration-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {authView === "signup" && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Display Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm focus:border-[#D91E18] focus:bg-white/8 outline-none transition text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Username</label>
                        <div className="relative">
                          <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm focus:border-[#D91E18] focus:bg-white/8 outline-none transition text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm focus:border-[#D91E18] focus:bg-white/8 outline-none transition text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Password</label>
                      {authView === "login" && (
                        <button type="button" className="text-[10px] font-bold text-white/30 hover:text-white/60 transition">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm focus:border-[#D91E18] focus:bg-white/8 outline-none transition text-white"
                      />
                    </div>
                  </div>

                  {authView === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm focus:border-[#D91E18] focus:bg-white/8 outline-none transition text-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D91E18] hover:bg-[#B71813] disabled:bg-zinc-800 disabled:text-white/40 text-white font-black text-sm sm:text-base tracking-wide transition shadow-lg mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : authView === "login" ? (
                      "LOG IN"
                    ) : (
                      "CREATE ACCOUNT"
                    )}
                  </button>
                </form>

                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-white/8"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-white/35 uppercase">OR</span>
                  <div className="flex-grow border-t border-white/8"></div>
                </div>

                <button
                  type="button"
                  onClick={() => signInWithOAuth("google")}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setAuthView("landing")}
                    className="text-xs font-bold text-white/35 hover:text-white/60 transition"
                  >
                    ← Back to welcome page
                  </button>
                </div>

              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-6 text-center text-[10px] text-white/30 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>&copy; 2026 Yomika Global. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="/terms" className="hover:text-white transition">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  // ─── 3. AUTHENTICATED HOMEPAGE SCREEN ───
  return (
    <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white overflow-x-hidden">

      {/* Hero Carousel */}
      {/* Hero Carousel */}
      {heroSlides.length > 0 ? (
        <section
          className="relative w-full overflow-hidden"
          style={{ minHeight: "calc(100vh - 64px)" }}
          aria-label="Featured stories"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Background slides */}
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === slideIndex ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== slideIndex}
            >
              <img
                src={s.coverUrl} alt=""
                className="w-full h-full object-cover"
                style={{ transform: "scale(1.04)" }}
                loading={i === 0 ? "eager" : "lazy"}
              />
              {/* Theme responsive gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#070707] dark:via-[#070707]/80 dark:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#070707] dark:via-[#070707]/40 dark:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent dark:from-black/50 dark:to-transparent" />
            </div>
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-screen-2xl mx-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
            <div className="max-w-xl xl:max-w-2xl pt-12 pb-28 sm:pb-36">

              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <span className="w-8 h-px bg-[#D91E18]" />
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#D91E18] uppercase">
                  Yomika Original · {slide?.genre}
                </span>
              </div>

              <h1
                className="font-black leading-none tracking-tight text-zinc-900 dark:text-white uppercase mb-4 sm:mb-5"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)", lineHeight: 1.0, textShadow: "none" }}
              >
                {slide?.title}
              </h1>

              <p className="text-sm sm:text-base lg:text-[17px] text-zinc-650 dark:text-white/55 leading-relaxed mb-5 sm:mb-6 max-w-md">
                {slide?.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-7 sm:mb-8">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{slide?.rating}</span>
                </div>
                <span className="w-px h-3 bg-zinc-200 dark:bg-white/20" />
                <div className="flex items-center gap-1.5 text-xs text-zinc-450 dark:text-white/35">
                  <Eye className="w-3.5 h-3.5" />{slide?.views} reads
                </div>
                {slide?.tags?.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-white/12 text-zinc-550 dark:text-white/50">{tag}</span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => requireAuth(`/novels/${slide?.slug}`)}
                  className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-sm sm:text-[15px] tracking-wide transition-all shadow-[0_0_24px_rgba(217,30,24,0.45)] hover:shadow-[0_0_40px_rgba(217,30,24,0.65)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Read Now
                </button>
                <button
                  onClick={() => requireAuth("/library")}
                  className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-zinc-250 hover:bg-zinc-50 text-zinc-800 dark:border-white/22 dark:hover:bg-white/8 dark:text-white font-bold text-sm sm:text-[15px] tracking-wide transition-all"
                >
                  <Plus className="w-4 h-4" />
                  My Library
                </button>
              </div>
            </div>
          </div>

          {/* Slide controls */}
          <div className="absolute bottom-10 sm:bottom-12 right-4 sm:right-8 lg:right-16 xl:right-24 z-20 flex items-center gap-4">
            <div className="flex gap-2">
              {([prev, next] as const).map((fn, i) => (
                <button
                  key={i}
                  onClick={() => handleNav(fn)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 dark:border-white/22 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white flex items-center justify-center transition backdrop-blur-sm"
                  aria-label={i === 0 ? "Previous" : "Next"}
                >
                  {i === 0 ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-24 lg:w-36 h-px bg-zinc-200 dark:bg-white/15 relative overflow-hidden rounded-full">
                <div className="absolute left-0 top-0 h-full bg-zinc-800 dark:bg-white transition-all duration-700 rounded-full" style={{ width: `${((slideIndex + 1) / heroSlides.length) * 100}%` }} />
              </div>
              <span className="text-sm font-black text-zinc-405 dark:text-white/45 tabular-nums">{String(slideIndex + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex sm:hidden gap-1.5">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => handleNav(() => goTo(i))} aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${i === slideIndex ? "w-5 h-1.5 bg-zinc-800 dark:bg-white" : "w-1.5 h-1.5 bg-zinc-300 dark:bg-white/30"}`} />
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10 bg-gradient-to-t from-white to-transparent dark:from-[#070707] dark:to-transparent" />
        </section>
      ) : (
        <section
          className="relative w-full h-[400px] flex items-center justify-center bg-zinc-950 text-white text-center border-b border-zinc-800"
        >
          <div className="space-y-4 px-6">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Welcome to Yomika</h1>
            <p className="text-sm text-white/50 max-w-md mx-auto">Discover web novels, comics, and world-class creator stories originating from our platform authors.</p>
          </div>
        </section>
      )}

      {/* Dynamic shelves */}
      <div className="bg-white dark:bg-[#070707] space-y-16 sm:space-y-20 pb-24">

        {/* Continue Reading */}
        {mounted && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <div className="[&_section]:!bg-transparent [&_h2]:!text-zinc-900 dark:[&_h2]:!text-white [&_p]:!text-zinc-500 dark:[&_p]:!text-white/45 [&_.border-b]:!border-zinc-100 dark:[&_.border-b]:!border-white/8 [&_.bg-white]:!bg-zinc-50/60 dark:[&_.bg-white]:!bg-white/5 [&_.dark\\:bg-zinc-900]:!bg-zinc-950/40 [&_.border]:!border-zinc-150 dark:[&_.border]:!border-white/8 [&_.text-zinc-900]:!text-zinc-900 dark:[&_.text-zinc-900]:!text-white [&_.text-zinc-800]:!text-zinc-850 dark:[&_.text-zinc-800]:!text-white [&_.text-zinc-600]:!text-zinc-600 dark:[&_.text-zinc-600]:!text-white/60 [&_.text-zinc-500]:!text-zinc-450 dark:[&_.text-zinc-500]:!text-white/40 [&_.text-zinc-400]:!text-zinc-400 dark:[&_.text-zinc-400]:!text-white/35">
              <ContinueReadingWidget />
            </div>
          </div>
        )}

        {/* Trending */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Most Read" title="Trending Now" href="/novels" />
          <HorizontalShelf>
            {trendingList.slice(0, 10).map((n) => (
              <StoryCard key={n.id} cover={n.coverUrl} title={n.title} genre={n.genre} rating={String(n.rating)} views={formatNumber(n.reads)} slug={n.slug} />
            ))}
          </HorizontalShelf>
        </div>

        {/* Originals */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Exclusive" title="Yomika Originals" href="/novels" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {originalsList.map((n) => (
              <StoryCard key={n.id} cover={n.coverUrl} title={n.title} genre={n.genre} rating={String(n.rating)} views={formatNumber(n.reads)} slug={n.slug} isOriginal />
            ))}
          </div>
        </div>

        {/* Fresh updates */}
        {newChaps.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <SectionHeader eyebrow="Fresh Updates" title="New Chapters" href="/novels" />
            <div className="space-y-2.5">
              {newChaps.map((n, idx) => (
                <Link key={n.id} href={`/novels/${n.slug}`}
                  className="flex items-center gap-4 p-3.5 sm:p-4 rounded-xl bg-zinc-50/60 hover:bg-zinc-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] border border-zinc-100 hover:border-zinc-200 dark:border-white/6 dark:hover:border-white/15 transition-all group"
                >
                  <img src={n.coverUrl} alt={n.title} className="w-12 h-16 sm:w-14 sm:h-[72px] rounded-lg object-cover flex-shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-[#D91E18] uppercase tracking-wider">{n.genre}</span>
                    <h3 className="text-sm sm:text-base font-black text-zinc-800 dark:text-white group-hover:text-[#D91E18] transition-colors truncate">{n.title}</h3>
                    <p className="text-xs text-zinc-400 dark:text-white/35 mt-0.5">Chapter {idx + 1} · Updated recently</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-white/25 flex-shrink-0">
                    <Eye className="w-3.5 h-3.5" />{formatNumber(n.reads)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-350 dark:text-white/15 group-hover:text-zinc-650 dark:group-hover:text-white/40 transition flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Explore Formats */}
        <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
          <SectionHeader eyebrow="Browse" title="Explore Formats" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {FORMATS.map((f) => (
              <Link key={f.name} href={f.href}
                className="group relative flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-zinc-50/60 hover:bg-zinc-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-zinc-100 hover:border-zinc-200 dark:border-white/7 dark:hover:border-white/18 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at top left, rgba(217,30,24,0.08), transparent 70%)" }} />
                <span className="text-2xl sm:text-3xl mb-3 relative z-10">{f.emoji}</span>
                <h3 className="text-sm sm:text-base font-black text-zinc-800 dark:text-white relative z-10">{f.name}</h3>
                <p className="text-[11px] text-zinc-400 dark:text-white/30 mt-0.5 relative z-10">{f.desc}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-zinc-400 dark:text-white/0 group-hover:text-zinc-900 dark:group-hover:text-white/35 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Following Feed */}
        {followingFeed.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <SectionHeader eyebrow="From Your List" title="Following Feed" href="/library" linkLabel="Manage" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {followingFeed.slice(0, 3).map((item) => (
                <Link key={item.id} href={item.contentType === "NOVEL" ? `/novels/${item.contentSlug}/chapter/${item.releaseNumber}` : `/comics/${item.contentSlug}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-50/60 hover:bg-zinc-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] border border-zinc-100 dark:border-white/6 hover:border-zinc-200 dark:hover:border-white/14 transition group"
                >
                  <img src={item.coverUrl} alt={item.contentTitle} className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <img src={item.creatorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-[11px] text-zinc-500 dark:text-white/45 truncate">{item.creatorName}</span>
                      {item.isVerified && <CheckCircle2 className="w-3 h-3 text-[#D91E18] flex-shrink-0" />}
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-800 dark:text-white truncate">{item.contentTitle}</h4>
                    <p className="text-[11px] font-bold text-[#D91E18] truncate">{item.releaseTitle}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 dark:text-white/25">
                      <Clock className="w-3 h-3" />{formatDate(item.releasedAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Rising Creators */}
        {creators.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <SectionHeader eyebrow="Creator Ecosystem" title="Rising Creators" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {creators.slice(0, 6).map((c) => (
                <Link key={c.id} href={`/creator/${c.username}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50/60 hover:bg-zinc-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] border border-zinc-100 dark:border-white/6 hover:border-zinc-200 dark:hover:border-white/14 transition-all group"
                >
                  <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-zinc-800 dark:text-white group-hover:text-[#D91E18] transition-colors truncate">{c.name}</h4>
                      {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#D91E18] flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-white/35">@{c.username}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 dark:text-white/25">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(c.followersCount)}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{formatNumber(c.totalReads)}</span>
                    </div>
                  </div>
                  <button onClick={(e) => e.preventDefault()}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/12 hover:border-[#D91E18]/50 hover:text-[#D91E18] text-xs font-bold text-zinc-500 hover:text-[#D91E18] dark:text-white/40 transition"
                    aria-label={`Follow ${c.name}`}
                  >Follow</button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contest banner */}
        {activeContest ? (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-100 dark:border-white/7" style={{ background: "linear-gradient(135deg, rgba(217,30,24,0.03), rgba(217,30,24,0.04))" }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=30')", backgroundSize: "cover" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#070707] dark:via-[#070707]/70 dark:to-transparent" />
              <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div>
                    <p className="text-[11px] font-black text-[#D91E18] uppercase tracking-widest mb-3">Official Yomika Contest</p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-tight mb-4">{activeContest.title}</h2>
                    <p className="text-sm sm:text-base text-zinc-550 dark:text-white/45 leading-relaxed mb-6 max-w-lg">{activeContest.description}</p>
                    {activeContest.prizeStructure?.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-7">
                        {activeContest.prizeStructure.map((p) => (
                          <div key={p.place} className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/8 text-center">
                            <p className="text-[10px] text-zinc-400 dark:text-white/35 font-bold">{p.place}</p>
                            <p className="text-sm font-black text-[#D91E18]">{p.reward}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href="/contests" className="px-6 py-3 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-sm tracking-wide transition shadow-[0_0_20px_rgba(217,30,24,0.4)]">
                        Enter Contest →
                      </Link>
                      <span className="text-xs text-zinc-400 dark:text-white/25">Deadline: {formatContestDeadline(activeContest.endDate, activeContest.timezone)}</span>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col items-end gap-4">
                    <div className="text-right">
                      <p className="text-[11px] text-[#D91E18] font-black uppercase tracking-widest mb-1">Prize Pool</p>
                      <p className="text-5xl xl:text-6xl font-black text-zinc-900 dark:text-white">{activeContest.prizePool}</p>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/8 text-right">
                      <p className="text-[10px] font-black text-[#D91E18] uppercase tracking-wider">
                        {getContestStatus(activeContest) === "LIVE" ? "● LIVE NOW" : "⏳ UPCOMING"}
                      </p>
                      <p className="text-2xl font-black text-zinc-800 dark:text-white">{activeContest.submissionCount ?? 0} Entries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6 lg:px-10 max-w-screen-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-150 dark:border-white/7 p-8 sm:p-12 lg:p-16 text-center"
              style={{ background: "linear-gradient(135deg, rgba(217,30,24,0.03), rgba(217,30,24,0.04))" }}
            >
              <p className="text-[11px] font-black text-[#D91E18] uppercase tracking-widest mb-5">Creator Platform</p>
              <h2 className="font-black text-zinc-900 dark:text-white leading-tight mb-4" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
                Create. Publish.<br /><span className="text-[#D91E18]">Get Discovered.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-white/35 max-w-xl mx-auto mb-8 leading-relaxed">
                Turn your story into something people remember. Yomika gives independent creators the tools to publish, grow an audience, and monetize their work.
              </p>
              <button
                type="button"
                onClick={() => requireAuth("/creator/upload")}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-base tracking-wide transition-all shadow-[0_0_28px_rgba(217,30,24,0.4)] hover:shadow-[0_0_40px_rgba(217,30,24,0.65)] hover:scale-[1.02]"
              >
                <PenTool className="w-5 h-5" /> Start Creating
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-[550px] bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative my-auto">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D91E18] flex items-center justify-center font-black text-white text-base">
                Y
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-wide">WELCOME TO YOUMIKA</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Onboarding Experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-base font-black text-white">What do you want to read?</h4>
                <p className="text-xs text-white/45">Select the formats you are interested in</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Web Novels", "Light Novels", "Manga", "Webtoons", "Comics"].map((f) => {
                    const isSelected = selectedFormats.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleFormat(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#D91E18] border-[#D91E18] text-white"
                            : "bg-white/5 border-white/8 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-base font-black text-white">Select genres you like</h4>
                <p className="text-xs text-white/45">Help us personalize your discover feed</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Sci-Fi", "Fantasy", "Cyberpunk", "Action", "Mystery", "Romance", "Adventure", "Supernatural"].map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#D91E18] border-[#D91E18] text-white"
                            : "bg-white/5 border-white/8 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-white/8">
              <button
                onClick={handleOnboardingComplete}
                className="flex-1 py-3 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-sm tracking-wide transition shadow-lg"
              >
                CONTINUE
              </button>
              <button
                onClick={handleOnboardingComplete}
                className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 text-white/50 hover:text-white font-bold text-xs tracking-wide transition"
              >
                Skip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
