import React from "react";
import Link from "next/link";
import { Sparkles, Heart, BookOpen, Compass, Trophy, Users, Shield, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-zinc-200 dark:border-zinc-800/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-rose-500/20">
                Y
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                Yumora
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              The global home for independent storytelling. Empowering authors and artists to publish novels, serialize webtoons, build passionate fandoms, and bring worlds to life.
            </p>
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Creator Ecosystem: <strong>Novel → Comic → Animation</strong>
              </span>
            </div>
          </div>

          {/* Explore Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
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

          {/* Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Popular Genres
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover?genre=Sci-Fi" className="hover:text-rose-500 transition">
                  Sci-Fi & Space Opera
                </Link>
              </li>
              <li>
                <Link href="/discover?genre=Fantasy" className="hover:text-rose-500 transition">
                  Dark & High Fantasy
                </Link>
              </li>
              <li>
                <Link href="/discover?genre=Cyberpunk" className="hover:text-rose-500 transition">
                  Cyberpunk & Tech Noir
                </Link>
              </li>
              <li>
                <Link href="/discover?genre=Mystery" className="hover:text-rose-500 transition">
                  Mystery & Thriller
                </Link>
              </li>
              <li>
                <Link href="/discover?genre=Romance" className="hover:text-rose-500 transition">
                  Romance & Drama
                </Link>
              </li>
            </ul>
          </div>

          {/* Creators & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Creators & Safety
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/creator" className="hover:text-rose-500 transition flex items-center gap-1">
                  Creator Studio <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </Link>
              </li>
              <li>
                <Link href="/creator/upload" className="hover:text-rose-500 transition">
                  Publish Your Story
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-500 transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Content Moderation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-rose-500 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-zinc-500 block mt-2">
                  100% Original IP Protection & Creator Revenue Sharing
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <p>© 2026 Yumora Platform. All rights reserved.</p>
            <Link href="/privacy" className="hover:text-rose-500 transition underline underline-offset-4">
              Privacy Policy
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
