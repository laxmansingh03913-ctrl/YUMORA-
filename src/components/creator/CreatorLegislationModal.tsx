"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Bot,
  Coins,
  Scale,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface CreatorLegislationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAll?: () => void;
}

export const CreatorLegislationModal: React.FC<CreatorLegislationModalProps> = ({
  isOpen,
  onClose,
  onAcceptAll,
}) => {
  const [activeTab, setActiveTab] = useState<
    "copyright" | "ratings" | "plagiarism" | "ai" | "monetization"
  >("copyright");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Yomika Creator Code & Content Legislation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Legal v2.1
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Author intellectual property rights, age ratings, and community safety standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800/60 bg-zinc-950 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("copyright")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === "copyright"
                ? "border-indigo-500 text-white bg-zinc-900/60"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>1. IP & Copyright</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ratings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === "ratings"
                ? "border-indigo-500 text-white bg-zinc-900/60"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>2. Ratings & Safety</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plagiarism")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === "plagiarism"
                ? "border-indigo-500 text-white bg-zinc-900/60"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>3. Anti-Plagiarism & DMCA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === "ai"
                ? "border-indigo-500 text-white bg-zinc-900/60"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>4. AI Disclosure</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monetization")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === "monetization"
                ? "border-indigo-500 text-white bg-zinc-900/60"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>5. Monetization & Fair Pay</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-zinc-300">
          {/* TAB 1: COPYRIGHT & IP */}
          {activeTab === "copyright" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3 text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">
                    100% Author Ownership Guarantee
                  </h4>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    You retain 100% intellectual property rights, world rights, and copyright to your stories, characters, and artwork. Yomika does not claim ownership over any creative work published on our platform.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Key Legal Clauses
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <h5 className="font-bold text-xs text-indigo-400 uppercase tracking-wider">
                      Non-Exclusive Publishing License
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      By publishing on Yomika, you grant Yomika a non-exclusive, worldwide license to host, display, digitally format, stream, and promote your work. You are 100% free to publish your story on other websites, self-publish, or print physical editions without exclusivity restrictions.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <h5 className="font-bold text-xs text-indigo-400 uppercase tracking-wider">
                      Right of Unpublishing & Deletion
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You hold the full right to pause, unpublish, or permanently delete your story or individual episodes at any time from your Creator Studio.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <h5 className="font-bold text-xs text-indigo-400 uppercase tracking-wider">
                      Adaptation & Commercial Rights
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      All merchandising, animation, TV, movie, and video game adaptation rights remain exclusively with you. If a production studio expresses interest via Yomika, we will connect you directly or negotiate only upon your formal written consent.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <h5 className="font-bold text-xs text-indigo-400 uppercase tracking-wider">
                      Author Responsibility & Indemnity
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You represent and warrant that your work is original and does not infringe upon any third-party trademark, patent, or copyright. You are legally responsible for the content you upload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RATINGS & SAFETY */}
          {activeTab === "ratings" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white">
                  Content Ratings Classification Matrix
                </h3>
                <p className="text-xs text-zinc-400">
                  Accurate rating is mandatory to ensure reader safety and legal compliance under child protection regulations.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      EVERYONE (All Ages)
                    </span>
                    <span className="text-[11px] text-zinc-400">Default for General Audience</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Permitted:</strong> Light fantasy action, mild cartoon comedy, wholesome romance (hand-holding, hugs), clean language.
                  </p>
                  <p className="text-xs text-rose-300/80">
                    <strong className="text-rose-400">Prohibited:</strong> Any sexual content, gore, realistic violence, strong profanity, drug use.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      TEEN (13+)
                    </span>
                    <span className="text-[11px] text-zinc-400">Standard for Shonen / Fantasy</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Permitted:</strong> Stylized battle violence, mild profanity, passionate kissing / romantic tension, darker emotional themes.
                  </p>
                  <p className="text-xs text-rose-300/80">
                    <strong className="text-rose-400">Prohibited:</strong> Explicit sexual acts, detailed anatomical nudity, excessive gratuitous mutilation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      MATURE (18+)
                    </span>
                    <span className="text-[11px] text-zinc-400">Requires Age Verification Warning</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Permitted:</strong> Intense psychological horror, dark gritty storytelling, severe violence / combat gore, strong language, suggestive adult themes.
                  </p>
                  <p className="text-xs text-rose-300/80">
                    <strong className="text-rose-400">Zero-Tolerance Ban:</strong> Non-consensual sexual violence, CSAM (underage sexual exploitation), bestiality, real-world illegal acts, terror propaganda, snuff.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Misclassification Penalty
                </h5>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Deliberately marking a Mature story as &ldquo;Everyone&rdquo; to bypass filters will result in an immediate content freeze and a strike on your creator record.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PLAGIARISM & DMCA */}
          {activeTab === "plagiarism" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 flex items-start gap-3 text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-300">
                    Zero Tolerance for Stolen & Scraped Content
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-1">
                    Yomika protects original artists and storytellers. Ripping official manga/manhwa scans, posting pirated light novel translations, or stealing art without written license is strictly illegal.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white">
                  The Yomika 3-Strike Policy
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-xs text-white">Strike 1: Notice & Takedown</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        The infringing story is unpublished immediately. Creator receives a formal email notice and 7 days to submit proof of rights or counter-notice.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-xs text-white">Strike 2: Upload Suspension</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        30-day creator studio lock. Monetization and coin payouts are paused pending investigation.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-xs text-white">Strike 3: Permanent Ban & Account Termination</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Permanent forfeiture of creator account, removal of all works, and blacklisting of payout credentials.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    DMCA Notice / Counter-Notice Email
                  </h5>
                  <p className="text-xs text-zinc-400">
                    Rights owners or creators filing counter-notices can contact our 24/7 legal team at{" "}
                    <span className="text-white font-mono">legal@youmika.site</span> with proof of ownership.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI POLICY */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3 text-cyan-200">
                <Bot className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-cyan-300">
                    AI Transparency & Honest Disclosure Policy
                  </h4>
                  <p className="text-xs text-cyan-300/80 mt-1">
                    We welcome innovative technological tools, but readers have a fundamental right to know whether a story is human-authored or AI-assisted.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white">
                  Disclosure Categories
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">
                      100% Original
                    </span>
                    <h5 className="font-bold text-white">Human Crafted</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Written and illustrated entirely by human creators without generative AI synthesis.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400">
                      AI-Assisted
                    </span>
                    <h5 className="font-bold text-white">Hybrid Collaboration</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Human author utilized AI for brainstorming, grammar polish, background reference, or localization.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400">
                      Heavily AI
                    </span>
                    <h5 className="font-bold text-white">AI-Generated</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Prose or comic panels are largely synthesized via automated generative models.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Automatic Tagging
                  </h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Stories marked as AI-assisted or AI-generated will automatically receive a subtle{" "}
                    <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono text-[11px]">
                      #AI-Assisted
                    </code>{" "}
                    badge on their series page. Undisclosed generative works detected by audits will be tagged automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MONETIZATION */}
          {activeTab === "monetization" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-yellow-950/30 border border-yellow-500/20 flex items-start gap-3 text-yellow-200">
                <Coins className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-yellow-300">
                    Fair Creator Revenue & Paywall Standards
                  </h4>
                  <p className="text-xs text-yellow-300/80 mt-1">
                    Empowering authors and artists to build sustainable creative careers while maintaining a transparent ecosystem for readers.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white">
                  Paywall Rules & Reader Engagement
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h5 className="text-xs font-bold text-white">1. The Free Teaser Principle</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Every series must provide at least <strong>the first 3 episodes / chapters free</strong> to read. This builds an audience, gives readers a chance to fall in love with your world, and preserves a healthy discovery experience.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h5 className="text-xs font-bold text-white">2. Creator Revenue Split</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Creators receive a competitive revenue share on all coins spent unlocking their premium episodes, tips, and subscription passes.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h5 className="text-xs font-bold text-white">3. Payout Thresholds & Methods</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Earnings can be withdrawn via <strong>UPI (India)</strong>, <strong>Bank Wire Transfer</strong>, or <strong>PayPal (International)</strong> once reaching the minimum threshold of ₹1,000 / $15 USD.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60">
          <div className="text-xs text-zinc-400">
            By publishing on Yomika, you bind to these terms under applicable IP laws.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
            >
              Close
            </button>

            {onAcceptAll && (
              <button
                type="button"
                onClick={() => {
                  onAcceptAll();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Understand & Agree to All Terms</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
