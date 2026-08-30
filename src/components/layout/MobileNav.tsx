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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 dark:bg-card/95 backdrop-blur-md border-t border-border px-3 py-1 flex items-center justify-around shadow-lg safe-area-pb">
      {links.map((link) => {
        const isActive = pathname === link.href;
        if (link.highlight) {
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex flex-col items-center justify-center -mt-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white shadow-md transform active:scale-95 transition">
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-accent mt-0.5 uppercase tracking-wider">{link.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center py-1 px-2 transition ${
              isActive
                ? "text-accent font-bold"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <link.icon className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">{link.name}</span>
          </Link>
        );
      })}

      {/* User profile / Login */}
      {user ? (
        <Link
          href={`/creator/${user.username}`}
          className={`flex flex-col items-center py-1 px-2 transition ${
            pathname.startsWith("/creator/")
              ? "text-accent font-bold"
              : "text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-4 h-4 rounded-full object-cover ring-1 ring-accent"
          />
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>
      ) : (
        <button
          onClick={() => openAuthModal("login")}
          className="flex flex-col items-center py-1 px-2 text-zinc-500 hover:text-black dark:hover:text-white transition"
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Sign In</span>
        </button>
      )}
    </nav>
  );
}
