"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, PenTool, Trophy, Bookmark, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileNav() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  // Don't show mobile nav inside distraction-free chapter reader
  if (pathname.includes("/chapter/")) {
    return null;
  }

  const links = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Create", href: "/creator/upload", icon: PenTool, highlight: true },
    { name: "Contests", href: "/contests", icon: Trophy },
    { name: "Library", href: "/library", icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {links.map((link) => {
        const isActive = pathname === link.href;
        if (link.highlight) {
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 transform active:scale-95 transition">
                <link.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-rose-500 mt-1">{link.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive
                ? "text-rose-600 dark:text-rose-400 font-semibold"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{link.name}</span>
          </Link>
        );
      })}

      {/* User profile / Login */}
      {user ? (
        <Link
          href={`/creator/${user.username}`}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            pathname.startsWith("/creator/")
              ? "text-rose-600 dark:text-rose-400 font-semibold"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-rose-500/40"
          />
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>
      ) : (
        <button
          onClick={() => openAuthModal("login")}
          className="flex flex-col items-center py-1 px-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sign In</span>
        </button>
      )}
    </nav>
  );
}
