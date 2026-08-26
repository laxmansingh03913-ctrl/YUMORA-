"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Search } from "lucide-react";

export default function CreatorPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Creator page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto animate-in fade-in">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-lg">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
          Unable to Load Creator Profile
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
          We encountered an issue while loading this creator&apos;s page. Please try refreshing or explore other storytellers.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/discover"
          className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition flex items-center gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Discover Stories</span>
        </Link>
      </div>
    </div>
  );
}
