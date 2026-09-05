import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Bot,
  Coins,
  Scale,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Code of Conduct & Content Legislation | Yomika",
  description:
    "Official Yomika publishing guidelines, intellectual property ownership terms, age ratings standard, anti-plagiarism laws, and AI disclosure requirements.",
};

export default function CreatorPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Nav Breadcrumb */}
      <header className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6 flex items-center justify-between border-b border-zinc-800/80">
        <Link
          href="/creator/upload"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Creator Studio</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Legal v2.1 • Updated 2026
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Yomika Creator Code & Content Legislation
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Our commitment to author intellectual property protection, reader safety, honest ratings, and fair creator compensation.
          </p>
        </div>

        {/* Quick Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">100% You Own Your IP</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You retain all copyright, world rights, and adaptation rights to your novels, comics, and art.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-amber-500/30 space-y-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Accurate Age Ratings</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mandatory classification (Everyone, Teen 13+, Mature 18+) to protect readers and child safety.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-rose-500/30 space-y-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <h3 className="font-extrabold text-sm text-white">Zero-Tolerance Piracy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scraped webtoons, ripped scans, or unauthorized translations are removed with a strict 3-strike rule.
            </p>
          </div>
        </div>

        {/* ARTICLE 1: INTELLECTUAL PROPERTY */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              §1
            </div>
            <h2 className="text-xl font-black text-white">
              Intellectual Property & Author Ownership
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              <strong>1.1 Retention of Copyright:</strong> When you publish a novel, comic, manga, or webtoon on Yomika, you remain the sole owner of all copyright, characters, plotlines, dialogues, and illustrations. Yomika does not acquire, transfer, or claim copyright ownership over your creative output.
            </p>
            <p>
              <strong>1.2 Non-Exclusive License:</strong> You grant Yomika an irrevocable, non-exclusive, royalty-free, worldwide digital license solely for the purpose of hosting, caching, displaying, formatting, and promoting your work on our web and mobile applications. You are entirely free to publish your work on other platforms or pursue traditional print publishing.
            </p>
            <p>
              <strong>1.3 Right to Unpublish:</strong> You retain the absolute right to unpublish individual chapters or your entire series at any point via your Creator Studio.
            </p>
          </div>
        </section>

        {/* ARTICLE 2: CONTENT RATINGS */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
              §2
            </div>
            <h2 className="text-xl font-black text-white">
              Content Rating Standards & Prohibited Material
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Creators must select the appropriate content rating during upload. Misrepresenting mature content as family-friendly is a violation of platform trust and subject to immediate strikes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                  EVERYONE
                </span>
                <p className="text-xs text-zinc-300">
                  Clean adventure, wholesome comedy, mild action, hand-holding, family-friendly humor. Zero profanity or graphic gore.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400">
                  TEEN (13+)
                </span>
                <p className="text-xs text-zinc-300">
                  Fantasy battle violence, mild profanity, kissing and romantic tension, darker emotional themes without explicit sexual acts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400">
                  MATURE (18+)
                </span>
                <p className="text-xs text-zinc-300">
                  Intense psychological horror, dark gritty drama, combat gore, strong profanity, suggestive adult themes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 space-y-1">
              <strong>Strictly Prohibited & Zero-Tolerance:</strong> Child Sexual Abuse Material (CSAM), non-consensual sexual violence, terror incitement, self-harm encouragement, doxxing, or real-life threats will result in immediate permanent account termination and referral to law enforcement.
            </div>
          </div>
        </section>

        {/* ARTICLE 3: COPYRIGHT & DMCA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-sm">
              §3
            </div>
            <h2 className="text-xl font-black text-white">
              Anti-Plagiarism, Scans & 3-Strike Penalty
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Yomika operates under a strict anti-piracy framework. If an account is found to be re-uploading copyrighted manga scans from commercial publishers or unauthorized webtoon rips:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
              <li>
                <strong className="text-zinc-200">Strike 1:</strong> Content removed instantly. Creator given formal notice with 7 days to file counter-notice.
              </li>
              <li>
                <strong className="text-zinc-200">Strike 2:</strong> Creator studio upload privileges locked for 30 days. Payouts frozen.
              </li>
              <li>
                <strong className="text-zinc-200">Strike 3:</strong> Permanent account termination, permanent IP blacklist, and forfeiture of unpaid balances.
              </li>
            </ul>

            <p className="text-xs text-zinc-400 pt-2">
              To submit a DMCA Copyright Takedown Notice, please email:{" "}
              <a href="mailto:legal@youmika.site" className="text-indigo-400 underline font-mono">
                legal@youmika.site
              </a>
            </p>
          </div>
        </section>

        {/* ARTICLE 4: AI DISCLOSURE */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
              §4
            </div>
            <h2 className="text-xl font-black text-white">
              AI Transparency & Disclosure Requirements
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Creators using AI tools (such as generative prose engines or image generation systems) must declare their usage during the upload step. Readers deserve full transparency regarding human vs AI-assisted content.
            </p>
            <p>
              Works disclosed as AI-assisted will carry an official <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400">#AI-Assisted</code> tag on their title page.
            </p>
          </div>
        </section>

        {/* CTA Back to Studio */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 text-center space-y-4">
          <h3 className="text-xl font-black text-white">
            Ready to Share Your Masterpiece with the World?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your rights are protected, your stories are cherished, and your audience is waiting.
          </p>
          <Link
            href="/creator/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition"
          >
            <span>Proceed to Creator Upload Studio</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
