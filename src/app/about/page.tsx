import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  PenTool,
  Trophy,
  Users,
  Shield,
  Heart,
  Globe2,
  Zap,
  ArrowRight,
  Flame,
  Star,
  Layers,
  Palette,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Yomika",
  description:
    "Discover Yomika — the next-generation global storytelling universe connecting web novel authors, manga & webtoon artists, and passionate readers worldwide.",
};

const PILLARS = [
  {
    icon: BookOpen,
    title: "100% Creator IP Ownership",
    description:
      "Creators retain all intellectual property and copyright rights over their stories, characters, illustrations, and original worlds.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: Zap,
    title: "The Novel-to-Manga Pipeline",
    description:
      "A revolutionary ecosystem that bridges serial web novels directly into serialized manga, webtoons, and multimedia adaptations.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Heart,
    title: "Transparent Creator Economy",
    description:
      "Direct reader tipping, virtual gifts, coin purchases, and fair revenue sharing empower creators to earn from their passion.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: Globe2,
    title: "Global Multilingual Reach",
    description:
      "Breaking language barriers with multi-language story support, danmaku live reactions, and worldwide fan communities.",
    color: "from-emerald-500 to-teal-600",
  },
];

const MILESTONES = [
  { year: "Phase 1", title: "Web Novel Studio", desc: "Launched serial web novel publishing with seamless reader tools and rich text editors." },
  { year: "Phase 2", title: "Manga & Webtoon Engine", desc: "Integrated high-speed webtoon vertical scroll, RTL manga reading, and PDF exports." },
  { year: "Phase 3", title: "Danmaku & Audio Dubbing", desc: "Pioneered real-time floating bullet comments (Danmaku) and multi-character voice audio dubbing." },
  { year: "Phase 4", title: "Creator Monetization", desc: "Introduced Razorpay virtual coin shop, instant creator tipping, and monthly $1,000+ writing contests." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black tracking-widest uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OUR STORY & MISSION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#111111] dark:text-white">
            EMPOWERING THE NEXT ERA OF{" "}
            <span className="text-[#D91E18]">GLOBAL STORYTELLERS</span>.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            Yomika is a next-generation creative platform built for authors, manga artists, and story enthusiasts. We believe every imagination deserves an audience and every creator deserves fair rewards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/discover"
              className="px-7 py-3 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 transition transform hover:scale-105"
            >
              Explore Stories
            </Link>
            <Link
              href="/creator/upload"
              className="px-7 py-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-700 text-[#111111] dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-black text-xs uppercase tracking-wider transition transform hover:scale-105"
            >
              Start Publishing
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-rose-500">10,000+</p>
            <p className="text-xs text-zinc-400 font-medium">Monthly Active Readers</p>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <p className="text-3xl sm:text-4xl font-black text-amber-400">1,500+</p>
            <p className="text-xs text-zinc-400 font-medium">Original Stories & Comics</p>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <p className="text-3xl sm:text-4xl font-black text-indigo-400">$1,000+</p>
            <p className="text-xs text-zinc-400 font-medium">Monthly Contest Prizes</p>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">100%</p>
            <p className="text-xs text-zinc-400 font-medium">Creator IP Retention</p>
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] dark:text-white">
            Why Storytellers Choose Yomika
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            From the initial chapter draft to comic serialization and global monetization, we provide the full creative stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-sm hover:shadow-xl transition duration-300 group flex items-start gap-5"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-110 transition duration-300`}
              >
                <pillar.icon className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM ROADMAP / MILESTONES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white">
              The Evolution of Yomika
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Continuously pushing the boundaries of online reading and publishing technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
                  {item.year}
                </span>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white pt-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-indigo-950 text-white border border-rose-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Begin Your Story?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of writers and readers on Yomika today. Publish your first chapter or discover your next obsession.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/creator/upload"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition transform hover:scale-105"
            >
              Start Creating Today
            </Link>
            <Link
              href="/services"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm border border-white/20 transition"
            >
              Explore Services & Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
