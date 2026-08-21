"use client";

import React from "react";
import Link from "next/link";
import { Compass, BookOpen, Layers, Sparkles, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="relative max-w-xl w-full text-center space-y-8">
        {/* Glowing backdrop circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-rose-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* 404 badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Dimension Not Found • 404
        </div>

        {/* Main Title & Description */}
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">
            Lost in the <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">Multiverse</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            The story, chapter, or creator universe you are looking for has drifted into an uncharted timeline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs transition-all transform hover:-translate-y-0.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Stories</span>
          </Link>
        </div>

        {/* Quick Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-zinc-800/80 text-left">
          <Link
            href="/novels"
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-rose-400 transition">Web Novels</p>
                <p className="text-[11px] text-zinc-500">Read serialized prose stories</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/comics"
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition">Comics & Manga</p>
                <p className="text-[11px] text-zinc-500">Explore visual webtoons</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
