"use client";

import React from "react";
import Link from "next/link";
import { Shield, Clock, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { TableOfContents, TOCItem } from "./TableOfContents";

interface LegalLayoutProps {
  title: string;
  badge: string;
  lastUpdated: string;
  introduction: string;
  tocItems: TOCItem[];
  disclaimer?: string;
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  badge,
  lastUpdated,
  introduction,
  tocItems,
  disclaimer,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen pb-24">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 pb-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden">
        {/* Glow ambient effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>{badge}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdated}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {introduction}
            </p>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT + TABLE OF CONTENTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Table of Contents Column */}
          <div className="lg:col-span-4 xl:col-span-3">
            <TableOfContents items={tocItems} />
          </div>

          {/* Main Legal Content Column (Max width 900-1000px for optimal readability) */}
          <main className="lg:col-span-8 xl:col-span-9 max-w-4xl">
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-xs">
              {children}

              {/* 3. LEGAL DISCLAIMER NOTICE */}
              {disclaimer && (
                <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Legal Notice & Jurisdiction Disclaimer
                    </p>
                    <p>{disclaimer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Related Policies Navigation */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Related Platform Policies:
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/terms"
                  className="hover:text-rose-500 transition underline underline-offset-4"
                >
                  Terms of Service
                </Link>
                <span>•</span>
                <Link
                  href="/community-guidelines"
                  className="hover:text-rose-500 transition underline underline-offset-4"
                >
                  Community Guidelines
                </Link>
                <span>•</span>
                <Link
                  href="/creator-terms"
                  className="hover:text-rose-500 transition underline underline-offset-4"
                >
                  Creator Agreement
                </Link>
                <span>•</span>
                <Link
                  href="/cookies"
                  className="hover:text-rose-500 transition underline underline-offset-4"
                >
                  Cookies Policy
                </Link>
                <span>•</span>
                <Link
                  href="/refund-policy"
                  className="hover:text-rose-500 transition underline underline-offset-4"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
