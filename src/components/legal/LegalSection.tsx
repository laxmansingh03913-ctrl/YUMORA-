"use client";

import React from "react";
import { Hash } from "lucide-react";

interface LegalSectionProps {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 pt-8 pb-10 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-b-0 space-y-4"
    >
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
          {number}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 group">
          <span>{title}</span>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-rose-500"
            aria-label={`Link to section ${title}`}
          >
            <Hash className="w-4 h-4" />
          </a>
        </h2>
      </div>

      <div className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
        {children}
      </div>
    </section>
  );
}
