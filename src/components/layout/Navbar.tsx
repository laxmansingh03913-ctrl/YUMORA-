"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  BookOpen,
  Image as ImageIcon,
  Trophy,
  Users,
  PenTool,
  Bookmark,
  Search,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut,
  Shield,
  Layers,
  Globe,
  CheckCircle2,
  Heart,
  X,
  Coins,
  Plus,
  Menu,
} from "lucide-react";
import { useAuth, isMasterAdmin } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { dataStore } from "@/lib/data/store";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { SearchModal } from "../ui/SearchModal";
import { AuthModal } from "../ui/AuthModal";
import { CoinShopModal } from "../ui/CoinShopModal";
import { Role, LanguageCode, NotificationItem } from "@/lib/types";

const NAV_LINKS = [
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Novels", href: "/novels", icon: BookOpen },
  { name: "Comics", href: "/comics", icon: ImageIcon },
  { name: "Contests", href: "/contests", icon: Trophy, badge: "$500" },
  { name: "Community", href: "/community", icon: Users },
];

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, role, openAuthModal, requireAuth, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const {
    toggleCollapse,
    toggleMobile,
    isCoinShopOpen: isSidebarCoinShopOpen,
    closeCoinShop: closeSidebarCoinShop,
  } = useSidebar();

  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en");
  const [dbCoins, setDbCoins] = useState<number | null>(null);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifsRef = React.useRef<HTMLDivElement>(null);
  const langRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotifsOpen(false);
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("coin_wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(
          ({ data }) => {
            setDbCoins(data?.balance ?? 0);
          },
          () => {}
        );
    }
  }, [user, isCoinShopOpen, isSidebarCoinShopOpen]);

  // Don't render full navbar on pure reading chapter route for maximum immersion
  const isReadingChapter = pathname.includes("/chapter/");

  if (isReadingChapter) {
    return (
      <>
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 dark:bg-card/95 backdrop-blur-md transition-colors">
        <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* ZONE 1: LEFT - Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  toggleMobile();
                } else {
                  toggleCollapse();
                }
              }}
              className="p-2 -ml-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Toggle Navigation Menu"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              {/* Official Yomika Logo */}
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition transform border border-zinc-800/80">
                <img
                  src="/logo.png"
                  alt="Yomika Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#111111] dark:text-white">
                  YOMIKA
                </span>
                <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 -mt-1 tracking-wider">
                  物語を、世界へ。
                </span>
              </div>
            </Link>
          </div>

          {/* ZONE 2: CENTER - Wide Prominent Spotlight Search */}
          <div className="hidden sm:flex flex-1 items-center justify-center max-w-md lg:max-w-xl px-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between gap-2 h-10 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition text-xs shadow-2xs cursor-pointer group"
              title="Global Spotlight Search (Ctrl + K)"
            >
              <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                <Search className="w-4 h-4 text-zinc-400 group-hover:text-[#D91E18] transition flex-shrink-0" />
                <span className="truncate text-zinc-400 text-xs font-medium">Search stories, webtoons, authors, genres...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-500 border border-zinc-300 dark:border-zinc-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* ZONE 3: RIGHT - Language, Theme, Notifications, Studio, Profile / Auth */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5 flex-shrink-0">
            {/* Mobile Search Trigger Icon (<640px) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              title="Search stories"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1"
                title="Select Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">{currentLang}</span>
              </button>

              {isLangOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-40 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in"
                  onClick={() => setIsLangOpen(false)}
                >
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Story Language
                  </p>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ${
                        currentLang === lang.code
                          ? "font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              title="Toggle Theme"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Notifications (Logged in only) */}
            {user && (() => {
              const notifs = mounted ? dataStore.getNotifications(user.id) : [];
              const unreadCount = mounted ? notifs.filter((n) => !n.isRead).length : 0;

              return (
                <div className="relative" ref={notifsRef}>
                  <button
                    onClick={() => setIsNotifsOpen(!isNotifsOpen)}
                    aria-label="Notifications"
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition relative cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {mounted && unreadCount > 0 && (
                      <span className="absolute top-1 right-1 px-1 min-w-4 h-4 rounded-full bg-[#D91E18] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifsOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in space-y-3 origin-top-right"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            Activity & Alerts
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D91E18]/10 text-[#D91E18]">
                              {unreadCount} new
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                dataStore.markAllNotificationsRead(user.id);
                                // Trigger re-render
                                setMounted((prev) => !prev);
                                setTimeout(() => setMounted(true), 10);
                              }}
                              className="text-[10px] text-[#D91E18] hover:text-[#B71813] font-bold flex items-center gap-1 cursor-pointer"
                              title="Mark all as read"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark all read</span>
                            </button>
                          )}
                          {notifs.length > 0 && (
                            <button
                              onClick={() => {
                                dataStore.clearAllNotifications(user.id);
                                setMounted((prev) => !prev);
                                setTimeout(() => setMounted(true), 10);
                              }}
                              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium cursor-pointer"
                              title="Clear all notifications"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notification Items List */}
                      <div className="max-h-80 overflow-y-auto space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/60 scrollbar-thin">
                        {notifs.length === 0 ? (
                          <div className="py-8 text-center space-y-2">
                            <Bell className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                              No notifications yet
                            </p>
                            <p className="text-[11px] text-zinc-500 max-w-[200px] mx-auto">
                              Follow creators or stories to get instant updates on new chapters & discussions.
                            </p>
                          </div>
                        ) : (
                          notifs.map((n) => {
                            // Badge Icon by type
                            let badgeColor = "bg-rose-500 text-white";
                            let BadgeIcon = Sparkles;
                            if (n.type === "CHAPTER_RELEASE" || n.type === "EPISODE_RELEASE") {
                              badgeColor = "bg-indigo-600 text-white";
                              BadgeIcon = BookOpen;
                            } else if (n.type === "NEW_FOLLOWER") {
                              badgeColor = "bg-emerald-600 text-white";
                              BadgeIcon = Users;
                            } else if (n.type === "LIKE") {
                              badgeColor = "bg-rose-600 text-white";
                              BadgeIcon = Heart;
                            }

                            return (
                              <div
                                key={n.id}
                                className={`pt-2.5 first:pt-0 pb-1 flex items-start gap-3 rounded-2xl p-2 transition group ${
                                  !n.isRead
                                    ? "bg-zinc-50 dark:bg-zinc-800/40"
                                    : "opacity-75 hover:opacity-100 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
                                }`}
                              >
                                {/* Creator Avatar with Badge */}
                                <div className="relative flex-shrink-0 mt-0.5">
                                  <img
                                    src={n.creatorAvatar || "/hero-character.png"}
                                    alt={n.creatorName || "Alert"}
                                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                                  />
                                  <span
                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 ${badgeColor}`}
                                  >
                                    <BadgeIcon className="w-2.5 h-2.5" />
                                  </span>
                                </div>

                                <Link
                                  href={n.contentUrl || "/"}
                                  onClick={() => {
                                    dataStore.markNotificationRead(n.id);
                                    setIsNotifsOpen(false);
                                  }}
                                  className="min-w-0 flex-1 space-y-0.5"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                      {n.title}
                                    </p>
                                    {!n.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-[#D91E18] flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                    {n.message}
                                  </p>
                                  <p className="text-[9px] text-zinc-400 font-medium pt-0.5">
                                    {formatDate(n.createdAt)}
                                  </p>
                                </Link>

                                {/* Delete / Dismiss single notif */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dataStore.deleteNotification(n.id);
                                    setMounted((prev) => !prev);
                                    setTimeout(() => setMounted(true), 10);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                                  title="Dismiss notification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* User Profile / Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Coins Counter Button */}
                <button
                  onClick={() => setIsCoinShopOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs transition transform active:scale-95 cursor-pointer shadow-xs"
                  title="Yumora Coin Treasury (Click to get more coins)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                   <span>{(dbCoins ?? 0).toLocaleString()}</span>
                  <Plus className="w-3 h-3 text-amber-500 ml-0.5" />
                </button>

                <Link
                  href="/creator/upload"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs shadow-xs transition transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  title="Create new story or episode"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Create</span>
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="User account menu"
                    className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-500/50"
                    />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hidden 2xl:inline max-w-[90px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase hidden sm:inline whitespace-nowrap flex-shrink-0 ${
                        role === "ADMIN"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                          : role === "CREATOR"
                          ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {role || "READER"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 mr-0.5" />
                  </button>

                  {/* Account Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden"
                    >
                      {/* User Header */}
                      <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/40 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {user.name}
                            </p>
                            <span
                              className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                                role === "ADMIN"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : role === "CREATOR"
                                  ? "bg-indigo-500/10 text-indigo-400"
                                  : "bg-rose-500/10 text-rose-500"
                              }`}
                            >
                              {role || "READER"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {/* Coins Wallet Card */}
                      <div className="mx-2 my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                            <Coins className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Your Balance</p>
                            <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                              {(dbCoins ?? 0).toLocaleString()} Coins
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsCoinShopOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-black transition shadow-xs cursor-pointer"
                        >
                          + Top Up
                        </button>
                      </div>

                      {/* Navigation Links */}
                      <div className="p-1.5 text-xs space-y-0.5">
                        <Link
                          href="/creator"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                          <PenTool className="w-4 h-4 text-indigo-400" />
                          <span>Creator Studio Dashboard</span>
                        </Link>

                        <Link
                          href="/creator/upload"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                          <Sparkles className="w-4 h-4 text-rose-400" />
                          <span>Upload New Story / Comic</span>
                        </Link>

                        <Link
                          href={`/creator/${user.username}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                          <Layers className="w-4 h-4 text-zinc-400" />
                          <span>My Public Profile</span>
                        </Link>

                        <Link
                          href="/library"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                          <Bookmark className="w-4 h-4 text-rose-400" />
                          <span>My Library & Reading History</span>
                        </Link>

                        {isMasterAdmin(user?.email) && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                          >
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span>Admin Control Center</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => requireAuth("/creator/upload")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs shadow-xs transition transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-black dark:hover:border-white font-bold text-xs transition whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CoinShopModal
        isOpen={isCoinShopOpen || isSidebarCoinShopOpen}
        onClose={() => {
          setIsCoinShopOpen(false);
          closeSidebarCoinShop();
        }}
      />
      <AuthModal />
    </>
  );
}
