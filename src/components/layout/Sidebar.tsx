"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  BookOpen,
  Image as ImageIcon,
  Trophy,
  Users,
  Bookmark,
  Coins,
  PenTool,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Shield,
  X,
  Info,
  Layers,
  FileText,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile, openCoinShop } = useSidebar();
  const { user, role } = useAuth();

  // Hide sidebar inside immersive reader
  if (pathname.includes("/chapter/")) {
    return null;
  }

  const PRIMARY_NAV = [
    { name: "Home", href: "/", icon: Home },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Novels", href: "/novels", icon: BookOpen },
    { name: "Comics", href: "/comics", icon: ImageIcon },
    { name: "Contests", href: "/contests", icon: Trophy, badge: "$500" },
    { name: "Community", href: "/community", icon: Users },
  ];

  const SECONDARY_NAV = [
    { name: "My Library", href: "/library", icon: Bookmark },
  ];

  const CREATOR_NAV = [
    { name: "Studio Dashboard", href: "/creator", icon: PenTool },
    { name: "Upload Story", href: "/creator/upload", icon: Upload },
  ];

  const ABOUT_NAV = [
    { name: "About Us", href: "/about", icon: Info },
    { name: "Services", href: "/services", icon: Layers },
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Terms & Conditions", href: "/terms", icon: FileText },
  ];

  const renderNavItem = (
    item: { name: string; href?: string; icon: React.ElementType; badge?: string; action?: () => void },
    isAction = false
  ) => {
    const Icon = item.icon;
    const isActive = item.href ? (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) : false;

    const content = (
      <div
        className={`group relative flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer select-none ${
          isActive
            ? "bg-[#D91E18] text-white shadow-md shadow-rose-600/20"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
        } ${isCollapsed ? "justify-center px-2.5" : ""}`}
      >
        <Icon
          className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
            isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
          }`}
        />

        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  isActive
                    ? "bg-white text-[#D91E18]"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        )}

        {/* Tooltip on Collapsed Mode */}
        {isCollapsed && (
          <div className="hidden md:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 rounded-xl bg-zinc-900 text-white text-[11px] font-bold whitespace-nowrap shadow-xl border border-zinc-800 z-50 animate-in fade-in zoom-in-95 pointer-events-none items-center gap-1.5">
            <span>{item.name}</span>
            {item.badge && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </div>
    );

    if (isAction || !item.href) {
      return (
        <button key={item.name} onClick={item.action} className="w-full text-left">
          {content}
        </button>
      );
    }

    return (
      <Link key={item.name} href={item.href} onClick={closeMobile} className="block">
        {content}
      </Link>
    );
  };

  const sidebarBody = (
    <div className="flex flex-col justify-between h-full py-4 px-3 space-y-6 overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        {/* Mobile Header with Yomora Brand + Close button */}
        <div className="md:hidden flex items-center justify-between px-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D91E18] text-white flex items-center justify-center font-serif font-black text-sm">
              Y
            </div>
            <span className="font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              YOMIKA
            </span>
          </div>
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Explore
            </p>
          )}
          {PRIMARY_NAV.map((item) => renderNavItem(item))}
        </div>

        {/* 2. Library & Treasury */}
        <div className="space-y-1 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              My Space
            </p>
          )}
          {SECONDARY_NAV.map((item) => renderNavItem(item))}

          {/* Coin Shop Trigger */}
          {renderNavItem(
            {
              name: user
                ? `${dataStore.getUserCoins(user.id).toLocaleString()} Coins`
                : "Coin Treasury",
              icon: Coins,
              badge: "+ Top Up",
              action: openCoinShop,
            },
            true
          )}
        </div>

        {/* 3. Creator Corner */}
        <div className="space-y-1 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Creator Studio
            </p>
          )}
          {CREATOR_NAV.map((item) => renderNavItem(item))}
        </div>

        {/* 4. Company & Legal */}
        <div className="space-y-1 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              About & Legal
            </p>
          )}
          {ABOUT_NAV.map((item) => renderNavItem(item))}
        </div>
      </div>

      {/* Bottom: Collapse / Expand Toggle Button (Desktop only) */}
      <div className="hidden md:block pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <button
          onClick={toggleCollapse}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-xs font-bold transition cursor-pointer ${
            isCollapsed ? "justify-center px-2" : "justify-between"
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div className="flex items-center gap-3">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            )}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP STICKY SIDEBAR */}
      <aside
        className={`hidden md:block sticky top-16 h-[calc(100vh-64px)] flex-shrink-0 bg-white/70 dark:bg-[#121214]/70 backdrop-blur-xl border-r border-[#EAEAE5] dark:border-zinc-800/80 transition-all duration-300 z-30 ${
          isCollapsed ? "w-20" : "w-60"
        }`}
      >
        {sidebarBody}
      </aside>

      {/* MOBILE SLIDE-IN DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={closeMobile}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-[#121214] shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
}
