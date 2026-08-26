import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Volume2,
  Coins,
  Trophy,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Flame,
  FileText,
  Smartphone,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services & Features | Yomika",
  description:
    "Explore Yomika's full suite of creator publishing tools, web novel studio, webtoon manga engine, audio dubbing, and monetization services.",
};

const SERVICES = [
  {
    icon: BookOpen,
    title: "Serial Web Novel Publishing",
    category: "Writing & Storytelling",
    description:
      "A complete authoring suite with scheduled chapter releases, genre tagging, content warning filters, and customized typography for serial light novels and web fiction.",
    features: [
      "Custom cover & promotional banner uploads",
      "Chapter drafts, instant previews & scheduled publishing",
      "Dynamic word counts & estimated read-time calculation",
      "Multi-genre & sub-genre classification (Fantasy, Sci-Fi, Wuxia, etc.)",
    ],
    badge: "Core Service",
    href: "/creator/upload",
  },
  {
    icon: ImageIcon,
    title: "Webtoon & Manga Studio",
    category: "Visual Storytelling",
    description:
      "Advanced comic serialization engine supporting Korean webtoon vertical scrolling, traditional Japanese Right-to-Left (RTL) manga, and multi-page comic layouts.",
    features: [
      "High-speed image batch uploads with WebP optimization",
      "Reading mode switch: Continuous Scroll vs. Page-by-Page",
      "Episode thumbnail & episode likes engagement tracker",
      "Integrated PDF download & offline export support",
    ],
    badge: "Popular",
    href: "/comics",
  },
  {
    icon: MessageSquare,
    title: "Danmaku Live Bullet Screen Reactions",
    category: "Interactive Reading",
    description:
      "Bring stories to life with real-time floating bullet comments (Danmaku) flying across comic panels and novel chapters, creating a shared communal theater experience.",
    features: [
      "Live floating on-screen comments while reading",
      "Color-coded reaction bullets with custom styling",
      "Toggle Danmaku overlay ON/OFF with 1-click controls",
      "Chapter and paragraph-level timestamped discussions",
    ],
    badge: "Interactive",
    href: "/novels",
  },
  {
    icon: Volume2,
    title: "Manga Dubbing & Audiobooks",
    category: "Multimedia Audio",
    description:
      "Transform visual comics and novels into rich auditory experiences with character voice dubbing, panel synchronization, and background atmospheric soundscapes.",
    features: [
      "Voice track synchronization per manga panel",
      "Audio play/pause controls with speed adjustments",
      "Background soundtrack & ambient sound integration",
      "Mobile-friendly lock-screen audio playback support",
    ],
    badge: "Next-Gen",
    href: "/comics",
  },
  {
    icon: Coins,
    title: "Creator Monetization & Tipping",
    category: "Creator Economy",
    description:
      "Empower your creative career with direct reader tipping, virtual coin packages, paid early-access chapters, and instant creator revenue payouts.",
    features: [
      "Razorpay instant payment gateway (UPI, GPay, PhonePe, Cards)",
      "Tiered coin packs with bonus multiplier rewards",
      "Direct creator tipping modal with personalized messages",
      "Transparent revenue tracking & payout processing",
    ],
    badge: "Monetization",
    href: "/creator",
  },
  {
    icon: Trophy,
    title: "Writing Contests & Editorial Spotlight",
    category: "Awards & Discovery",
    description:
      "Compete in monthly themed writing competitions, win cash prizes up to $1,000+, and gain official editorial verification and banner promotions.",
    features: [
      "Monthly themed writing challenges with cash prize pools",
      "Reader leaderboard rankings & community vote tallies",
      "Editorial 'Editor's Choice' and 'Featured' badges",
      "Guaranteed publishing opportunities for top-ranked stories",
    ],
    badge: "$1,000+ Prizes",
    href: "/contests",
  },
  {
    icon: Users,
    title: "Community Circles & Discussion Forums",
    category: "Fan Engagement",
    description:
      "Dedicated community spaces where fans, theorists, artists, and creators discuss lore, share character illustrations, and organize fan projects.",
    features: [
      "Category channels (General, Writing Advice, Art, Lore)",
      "Thread voting, reply trees, and pinned author announcements",
      "Direct follow alerts for new story releases",
      "Creator profile verification and custom badges",
    ],
    badge: "Community",
    href: "/community",
  },
  {
    icon: ShieldCheck,
    title: "IP Protection & Content Safety",
    category: "Security & Legal",
    description:
      "Industry-standard digital copyright protection, anti-scraping measures, and responsive content moderation to keep your works safe.",
    features: [
      "100% creator copyright retention guarantee",
      "Automated image protection & content safety filters",
      "Rapid DMCA takedown & copyright reporting system",
      "Full compliance with international privacy laws",
    ],
    badge: "Safety",
    href: "/privacy",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#121214] text-[#111111] dark:text-zinc-100 transition-colors pb-24">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black tracking-widest uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PLATFORM CAPABILITIES & SERVICES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#111111] dark:text-white">
            THE COMPLETE STACK FOR{" "}
            <span className="text-[#D91E18]">STORY CREATION & DISCOVERY</span>.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Whether you are a novelist writing your epic serialized saga, a webtoon artist crafting breathtaking panels, or an avid reader seeking new worlds — Yomika provides the tools to power your journey.
          </p>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[#D91E18] group-hover:scale-110 transition duration-300">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    {service.badge}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {service.category}
                  </p>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white pt-0.5">
                    {service.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {service.description}
                </p>

                <div className="pt-2 space-y-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                    Key Features:
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-xs font-black text-[#D91E18] hover:text-[#B71813] uppercase tracking-wider group/link"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. READY TO GET STARTED BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        <div className="p-10 sm:p-14 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start Publishing Your Work Today
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Join the creators and storytellers taking their novels and webtoons to a global audience.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/creator/upload"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition transform hover:scale-105"
            >
              Publish Now
            </Link>
            <Link
              href="/contests"
              className="px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 transition"
            >
              Join Monthly Contest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
