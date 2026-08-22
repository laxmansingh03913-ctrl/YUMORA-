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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { dataStore } from "@/lib/data/store";
import { formatDate } from "@/lib/utils";
import { SearchModal } from "../ui/SearchModal";
import { AuthModal } from "../ui/AuthModal";
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
  const { user, role, switchRole, openAuthModal, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en");

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
      <header className="sticky top-0 z-40 w-full border-b border-[#EAEAE5] dark:border-zinc-800 bg-[#FFFFFF]/95 dark:bg-[#121214]/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* ZONE 1: LEFT - Logo & Desktop Navigation */}
          <div className="flex items-center gap-4 lg:gap-8 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              {/* Red Square Y. Logo */}
              <div className="w-8 h-8 rounded-lg bg-[#D91E18] flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 transition transform">
                Y.
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 text-xs lg:text-sm font-semibold transition flex items-center gap-1.5 relative whitespace-nowrap ${
                      isActive
                        ? "text-[#111111] dark:text-white font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#D91E18]" : "text-zinc-400"}`} />
                    <span className="whitespace-nowrap">{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#D91E18] text-white">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#D91E18] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ZONE 2: CENTER / FLEXIBLE - Dedicated Search Zone */}
          <div className="hidden sm:flex flex-1 items-center justify-center max-w-xs lg:max-w-sm px-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between gap-2 h-9 px-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition text-xs shadow-2xs"
              title="Search stories (⌘K)"
            >
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className="truncate text-zinc-400 text-xs">Search stories...</span>
              </div>
              <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
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
              {resolvedTheme === "dark" ? (
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
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {mounted && unreadCount > 0 && (
                      <span className="absolute top-1 right-1 px-1 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-950">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifsOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in space-y-3 origin-top-right"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-zinc-900 dark:text-zinc-100">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => dataStore.markAllNotificationsRead(user.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-400 font-bold"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {notifs.length === 0 ? (
                          <p className="py-6 text-center text-xs text-zinc-400">No notifications yet.</p>
                        ) : (
                          notifs.map((n) => (
                            <Link
                              key={n.id}
                              href={n.contentUrl}
                              onClick={() => {
                                dataStore.markNotificationRead(n.id);
                                setIsNotifsOpen(false);
                              }}
                              className={`pt-2.5 first:pt-0 pb-1 flex items-start gap-3 rounded-xl transition ${
                                !n.isRead ? "opacity-100" : "opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={n.creatorAvatar}
                                alt={n.creatorName}
                                className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0 mt-0.5"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                                <p className="text-[9px] text-zinc-400 pt-0.5">
                                  {formatDate(n.createdAt)}
                                </p>
                              </div>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                              )}
                            </Link>
                          ))
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
                    className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition"
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
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase hidden sm:inline ${
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

                      {/* Fast Role Switcher */}
                      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Switch Demo Role
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["READER", "CREATOR", "ADMIN"] as Role[]).map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                switchRole(r);
                                setIsUserMenuOpen(false);
                              }}
                              className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition text-center ${
                                role === r
                                  ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-xs"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
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

                        {role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Admin Moderation</span>
                          </Link>
                        )}

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
      <AuthModal />
    </>
  );
}
