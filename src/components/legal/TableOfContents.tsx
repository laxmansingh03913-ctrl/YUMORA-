"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

export interface TOCItem {
  id: string;
  number: number;
  title: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      setIsOpenMobile(false);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <aside className="w-full">
      {/* Mobile Collapsible TOC */}
      <div className="lg:hidden mb-8 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-zinc-100"
          aria-expanded={isOpenMobile}
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-rose-500" />
            <span>Table of Contents ({items.length} sections)</span>
          </span>
          {isOpenMobile ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {isOpenMobile && (
          <nav className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 max-h-80 overflow-y-auto space-y-1 text-xs">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={`block px-2.5 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <span className="font-mono text-zinc-400 mr-2">{item.number}.</span>
                  {item.title}
                </a>
              );
            })}
          </nav>
        )}
      </div>

      {/* Desktop Sticky TOC */}
      <div className="hidden lg:block sticky top-24 p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <List className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Table of Contents
          </h3>
        </div>

        <nav
          className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-0.5 text-xs pr-1 scrollbar-thin"
          aria-label="Table of Contents"
        >
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                className={`flex items-start gap-2 px-2.5 py-1.5 rounded-xl transition ${
                  isActive
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border-l-2 border-rose-500 pl-2"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                }`}
              >
                <span className="font-mono text-[11px] text-zinc-400 w-5 flex-shrink-0">
                  {item.number}.
                </span>
                <span className="leading-tight truncate">{item.title}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
