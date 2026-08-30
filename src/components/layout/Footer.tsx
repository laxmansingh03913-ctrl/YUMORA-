import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  BookOpen,
  Compass,
  Trophy,
  Users,
  Shield,
  ArrowUpRight,
  Info,
  Layers,
  FileText,
  Home,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card dark:bg-card text-zinc-600 dark:text-zinc-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition border border-zinc-800/80">
                <img
                  src="/logo.png"
                  alt="Yomika Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-[#111111] dark:text-white">
                  YOMIKA
                </span>
                <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 -mt-1 tracking-wider">
                  物語を、世界へ。
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Yomika is a global storytelling universe where writers, manga artists, and passionate readers come together to create, discover, and experience original serial novels and webtoons.
            </p>
            <div className="p-3 rounded-lg bg-muted dark:bg-muted border border-border text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                Creative Pipeline: <strong>Novel → Webtoon Manga → Multimedia</strong>
              </span>
            </div>
          </div>

          {/* Navigation & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Platform & Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-zinc-400" /> Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-400" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" /> Services & Features
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-zinc-400" /> Discover All
                </Link>
              </li>
              <li>
                <Link href="/novels" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" /> Serial Novels
                </Link>
              </li>
              <li>
                <Link href="/comics" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Webtoon Comics
                </Link>
              </li>
            </ul>
          </div>

          {/* Creators & Contests */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Creator Studio
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/creator" className="hover:text-rose-500 transition flex items-center gap-1">
                  Creator Dashboard <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </Link>
              </li>
              <li>
                <Link href="/creator/upload" className="hover:text-rose-500 transition">
                  Publish Your Story
                </Link>
              </li>
              <li>
                <Link href="/contests" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-zinc-400" /> Monthly Contests
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" /> Community Forums
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <span className="text-xs text-zinc-500 block mt-2 leading-relaxed">
                  100% Original IP Protection & Transparent Creator Revenue Sharing.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <p>© 2026 Yomika. All rights reserved.</p>
            <Link href="/" className="hover:text-rose-500 transition">
              Home
            </Link>
            <Link href="/about" className="hover:text-rose-500 transition">
              About
            </Link>
            <Link href="/services" className="hover:text-rose-500 transition">
              Services
            </Link>
            <Link href="/privacy" className="hover:text-rose-500 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-rose-500 transition">
              Terms & Conditions
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for global storytellers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
