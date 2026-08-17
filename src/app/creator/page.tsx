"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PenTool,
  BookOpen,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Zap,
  AlertTriangle,
  Circle,
  Check,
  Sliders,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";
import { formatNumber, formatDate } from "@/lib/utils";
import { Novel, MonetizationEligibility, MonetizationTier } from "@/lib/types";

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [novels, setNovels] = useState<Novel[]>(() => dataStore.getNovels());
  const [activeTab, setActiveTab] = useState<"works" | "analytics" | "earnings">("works");

  // Computed metrics
  const totalReads = novels.reduce((acc, n) => acc + n.reads, 0);
  const totalLikes = novels.reduce((acc, n) => acc + n.likesCount, 0);
  const totalChapters = novels.reduce((acc, n) => acc + n.chaptersCount, 0);
  const totalFollowers = user?.followersCount || 14850;
  const estimatedEarnings = Math.round((totalReads / 1000) * 2.85 + 450); // $2.85 RPM model demo

  const handleDeleteNovel = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = novels.filter((n) => n.id !== id);
      setNovels(updated);
      localStorage.setItem("yumora_novels", JSON.stringify(updated));
    }
  };

  const handleTogglePublish = (novel: Novel) => {
    const nextStatus: Novel["status"] =
      novel.status === "PUBLISHED" || novel.status === "ONGOING" ? "DRAFT" : "ONGOING";
    const updated: Novel = { ...novel, status: nextStatus };
    dataStore.saveNovel(updated);
    setNovels((prev) => prev.map((n) => (n.id === novel.id ? updated : n)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
            alt={user?.name || "Creator"}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-500/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {user?.name || "Aria Thorne"}&apos;s Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                CREATOR
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Creator Studio & Performance Analytics • Level 4 Verified Author
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contests"
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Monthly $500 Contest</span>
          </Link>

          <Link
            href="/creator/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5 transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Story</span>
          </Link>
        </div>
      </div>

      {/* Creator Profile Incomplete Alert */}
      {(() => {
        const completion = dataStore.calculateProfileCompletion(user || undefined);
        if (completion.percentage >= 100) return null;
        return (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Creator Profile Verification Incomplete ({completion.percentage}%)
                </p>
                <p className="text-[11px] text-zinc-400">
                  Please complete the remaining {completion.missingFields.length} mandatory creator fields to enable publishing.
                </p>
              </div>
            </div>
            <Link
              href="/creator/upload"
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition text-center flex-shrink-0"
            >
              Complete Profile (100%)
            </Link>
          </div>
        );
      })()}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Total Reads</span>
            <BookOpen className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {formatNumber(totalReads)}
          </p>
          <p className="text-[10px] text-emerald-500 font-bold">+18.4% this month</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Followers</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {formatNumber(totalFollowers)}
          </p>
          <p className="text-[10px] text-emerald-500 font-bold">+342 new</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Total Likes</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {formatNumber(totalLikes)}
          </p>
          <p className="text-[10px] text-zinc-400">across all stories</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Total Chapters</span>
            <PenTool className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{totalChapters}</p>
          <p className="text-[10px] text-zinc-400">published serials</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Read Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">74.2%</p>
          <p className="text-[10px] text-emerald-500 font-bold">Top 5% author</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold">Estimated Payout</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-500">${estimatedEarnings}</p>
          <p className="text-[10px] text-zinc-400">Ready for Stripe</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: "works", label: `My Works (${novels.length})` },
          { id: "analytics", label: "📈 Deep Analytics & Demographics" },
          { id: "earnings", label: "💰 Royalties & Monetization" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MY WORKS MANAGEMENT */}
      {activeTab === "works" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Story & Title</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Chapters</th>
                  <th className="p-4">Reads</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {novels.map((novel) => (
                  <tr
                    key={novel.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={novel.coverUrl}
                          alt={novel.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-xs flex-shrink-0"
                        />
                        <div>
                          <Link
                            href={`/novels/${novel.slug}`}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-rose-500 transition line-clamp-1"
                          >
                            {novel.title}
                          </Link>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            Last updated {formatDate(novel.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        {novel.genre}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(novel)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          novel.status === "ONGOING" || novel.status === "PUBLISHED"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                        }`}
                        title="Click to toggle Draft / Published"
                      >
                        {novel.status}
                      </button>
                    </td>

                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {novel.chaptersCount} Chapters
                    </td>

                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatNumber(novel.reads)}
                    </td>

                    <td className="p-4 font-bold text-amber-500">★ {novel.rating}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/novels/${novel.slug}`}
                          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:text-rose-500 transition"
                          title="View Live Story"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href="/creator/upload"
                          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:text-indigo-500 transition"
                          title="Add / Edit Chapters"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteNovel(novel.id, novel.title)}
                          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:text-rose-600 transition"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & DEMOGRAPHICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Retention Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span>Chapter Read Completion Rate (Retention Funnel)</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Percentage of readers who finish each subsequent chapter
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { ch: "Chapter 1: The Broken Loom of Orion", percent: 96, count: "194,200 reads" },
                  { ch: "Chapter 2: Stardust in the Wounds", percent: 88, count: "172,400 reads" },
                  { ch: "Chapter 3: The Black Market of Nebula Row", percent: 81, count: "158,100 reads" },
                  { ch: "Chapter 4: The Song of the Dying Giants", percent: 76, count: "148,800 reads" },
                ].map((item) => (
                  <div key={item.ch} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-300">
                      <span className="truncate">{item.ch}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-indigo-600 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reader Geography Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Global Reader Reach</span>
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                {[
                  { country: "🇺🇸 United States", share: "38%", reads: "74K" },
                  { country: "🇨🇦 Canada", share: "18%", reads: "35K" },
                  { country: "🇩🇪 Germany & EU", share: "16%", reads: "31K" },
                  { country: "🇬🇧 United Kingdom", share: "14%", reads: "27K" },
                  { country: "🇯🇵 Japan & Asia", share: "14%", reads: "27K" },
                ].map((c) => (
                  <div key={c.country} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                    <span className="font-medium text-zinc-300">{c.country}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500">{c.reads}</span>
                      <span className="font-bold text-rose-400">{c.share}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Follower Growth & Audience Retention Metrics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Follower Growth & Retention Analytics</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Tracking reader-to-follower conversion, release notification engagement, and churn
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/30">
                +342 Net Followers This Month
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-[11px] text-zinc-400 font-semibold">Total Followers</p>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">14,850</p>
                <p className="text-[10px] text-emerald-500 font-bold">+12.8% vs last month</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-[11px] text-zinc-400 font-semibold">Weekly Active Readers</p>
                <p className="text-xl font-black text-indigo-500">10,120</p>
                <p className="text-[10px] text-zinc-400">68.1% active engagement</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-[11px] text-zinc-400 font-semibold">Notification Open Rate</p>
                <p className="text-xl font-black text-rose-500">62.4%</p>
                <p className="text-[10px] text-emerald-500 font-bold">Top 3% platform</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-[11px] text-zinc-400 font-semibold">Monthly Unfollows</p>
                <p className="text-xl font-black text-zinc-400">12</p>
                <p className="text-[10px] text-emerald-500 font-bold">0.08% low churn rate</p>
              </div>
            </div>

            {/* Follower Growth Trendline */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300">Follower Growth Curve (Last 6 Months)</span>
                <span className="text-[11px] text-indigo-400 font-mono">+2,450 new fans</span>
              </div>

              <div className="h-28 flex items-end justify-between gap-3 pt-2">
                {[
                  { month: "Sep", count: "12.4K", height: "45%" },
                  { month: "Oct", count: "12.9K", height: "54%" },
                  { month: "Nov", count: "13.5K", height: "66%" },
                  { month: "Dec", count: "14.1K", height: "78%" },
                  { month: "Jan", count: "14.5K", height: "88%" },
                  { month: "Feb", count: "14.8K", height: "100%" },
                ].map((bar) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition">{bar.count}</span>
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-indigo-700 to-rose-500 group-hover:from-indigo-500 group-hover:to-rose-400 transition-all duration-300"
                      style={{ height: bar.height }}
                    />
                    <span className="text-[10px] font-semibold text-zinc-400">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS & MULTI-TIER MONETIZATION ELIGIBILITY */}
      {activeTab === "earnings" && (() => {
        const eligibility = dataStore.calculateMonetizationEligibility(user?.id || "usr-creator-1");
        const currentTier = user?.monetizationTier || eligibility.currentTier;

        const handleApply = (tier: MonetizationTier) => {
          if (!user) return;
          const res = dataStore.applyForMonetization(user.id, tier);
          if (res.success) {
            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
            alert(`🎉 Monetization Approved! Your account is now upgraded to ${tier.replace("_", " ")}.`);
            window.location.reload();
          } else {
            alert(`Application Notice: ${res.error}`);
          }
        };

        return (
          <div className="space-y-8 animate-in fade-in">
            {/* Top Monetization Status Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-zinc-950 border border-emerald-500/30 text-white space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-zinc-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {currentTier === "LEVEL_3_VERIFIED"
                        ? "LEVEL 3 — PREMIER VERIFIED CREATOR"
                        : currentTier === "LEVEL_2_ESTABLISHED"
                        ? "LEVEL 2 — ESTABLISHED CREATOR"
                        : currentTier === "LEVEL_1_ELIGIBLE"
                        ? "LEVEL 1 — MONETIZATION ELIGIBLE"
                        : "MONETIZATION ONBOARDING"}
                    </span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-emerald-300">
                    Status: {eligibility.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fraud & Bot Audit: <strong>{eligibility.fraudAuditStatus}</strong></span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Creator Revenue & Royalties Suite
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed mt-1">
                    Yumora combines chapter read completion time, reader tips, volume sales, and premium subscriptions with multi-factor fraud filtering.
                  </p>
                </div>

                {eligibility.canApplyLevel1 && (
                  <button
                    onClick={() => handleApply("LEVEL_1_ELIGIBLE")}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 self-start md:self-auto flex-shrink-0 transform hover:scale-105"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Apply for Level 1 Monetization</span>
                  </button>
                )}
              </div>

              {/* Payout Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Available for Payout</p>
                  <p className="text-2xl font-black text-emerald-400">${estimatedEarnings}.00</p>
                  <p className="text-[10px] text-zinc-500">Auto-calculated from genuine reads & tips</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Next Payout Cycle</p>
                  <p className="text-2xl font-black text-white">March 1, 2026</p>
                  <p className="text-[10px] text-zinc-500">Monthly direct deposit</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Payout Gateway</p>
                  <p className="text-2xl font-black text-emerald-400">Stripe Connected</p>
                  <p className="text-[10px] text-emerald-500 font-bold">100% Verified Account</p>
                </div>
              </div>
            </div>

            {/* Holistic Eligibility Progress & Quality Gate */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                      Monetization Eligibility Gate
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                      Multi-Factor Quality Engine
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Yumora evaluates content originality, authentic readership, account age, and community standing to prevent follower botting
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-500">
                    {eligibility.overallPercentage}%
                  </span>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Eligibility Score</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${eligibility.overallPercentage}%` }}
                  />
                </div>
              </div>

              {/* Multi-Factor Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Account Standing */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>1. Account Integrity</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Creator Profile 100% Complete</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Email & Legal Age (18+) Verified</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Account Age ≥ 30 Days ({eligibility.accountAgeDays}d)</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">0 Guidelines Violations</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Content & Chapters */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>2. Content & Chapters</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Original Story Rights Pledge Confirmed</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">At least 1 Approved Published Story</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {eligibility.publishedChaptersOrEpisodes} Published Chapters / Episodes (Min. 5 / 3)
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Zero AI-Spam / Scraped Content</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Authentic Audience */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>3. Authentic Readership</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Followers Threshold</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatNumber(eligibility.followersCount)} / {formatNumber(eligibility.followersThreshold)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Genuine Reads (Bot-Filtered)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatNumber(eligibility.genuineReadsCount)} / {formatNumber(eligibility.genuineReadsThreshold)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Meaningful Engagements</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatNumber(eligibility.engagementsCount)} / {eligibility.engagementsThreshold}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Bot / Fraud Audit</span>
                      <span className="font-bold text-emerald-500">Passed ✓</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3-Tier Creator Monetization Roadmap */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                    Yumora 3-Level Creator Monetization Model
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Transparent progression pathway from debut author to global franchise partner
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level 1 */}
                <div className={`p-6 rounded-3xl border space-y-4 relative ${
                  currentTier === "LEVEL_1_ELIGIBLE" || currentTier === "LEVEL_2_ESTABLISHED" || currentTier === "LEVEL_3_VERIFIED"
                    ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-zinc-950">
                      🟢 LEVEL 1 — ELIGIBLE
                    </span>
                    {(currentTier === "LEVEL_1_ELIGIBLE" || currentTier === "LEVEL_2_ESTABLISHED" || currentTier === "LEVEL_3_VERIFIED") && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100">Debut Monetization</h4>
                    <p className="text-xs text-zinc-500 mt-1">Meets basic quality & originality requirements</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Unlocked Features:</p>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                      <li className="flex items-center gap-2">✓ Reader Tips & Digital Gifts</li>
                      <li className="flex items-center gap-2">✓ Paid Chapters & Coin Unlocks</li>
                      <li className="flex items-center gap-2">✓ Paid Volumes & PDF Book Sales</li>
                    </ul>
                  </div>
                </div>

                {/* Level 2 */}
                <div className={`p-6 rounded-3xl border space-y-4 relative ${
                  currentTier === "LEVEL_2_ESTABLISHED" || currentTier === "LEVEL_3_VERIFIED"
                    ? "bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/30"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500 text-white">
                      🔵 LEVEL 2 — ESTABLISHED
                    </span>
                    {(currentTier === "LEVEL_2_ESTABLISHED" || currentTier === "LEVEL_3_VERIFIED") ? (
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> 2.5K+ Followers
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100">Recurring Fandom</h4>
                    <p className="text-xs text-zinc-500 mt-1">High read-completion rate + consistent publishing history</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Unlocked Features:</p>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                      <li className="flex items-center gap-2">✓ Monthly Reader Memberships / VIP Tiers</li>
                      <li className="flex items-center gap-2">✓ Ad Revenue Share Pool ($2.85 RPM)</li>
                      <li className="flex items-center gap-2">✓ Yumora+ Creator Fund Grants</li>
                      <li className="flex items-center gap-2">✓ Discovery Feed Algorithm Boost</li>
                    </ul>
                  </div>
                </div>

                {/* Level 3 */}
                <div className={`p-6 rounded-3xl border space-y-4 relative ${
                  currentTier === "LEVEL_3_VERIFIED"
                    ? "bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/30"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white">
                      🟣 LEVEL 3 — PREMIER
                    </span>
                    {currentTier === "LEVEL_3_VERIFIED" ? (
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> 10K+ Followers
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100">Franchise & IP Studio</h4>
                    <p className="text-xs text-zinc-500 mt-1">Top 1% commercial storytelling performance</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Unlocked Features:</p>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                      <li className="flex items-center gap-2">✓ Webtoon / Manga Adaptation Funding</li>
                      <li className="flex items-center gap-2">✓ Animation Studio Production Consideration</li>
                      <li className="flex items-center gap-2">✓ Direct Physical Publishing & Merch Rights</li>
                      <li className="flex items-center gap-2">✓ Dedicated Editorial & Legal IP Management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Anti-Fraud & Security Audit Protocol */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm">Yumora Anti-Fraud & Traffic Integrity Protocol</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400">Real-Time Protection Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <p className="font-bold text-zinc-200">Bot & Follower Farm Defense</p>
                  <p className="text-[11px] leading-relaxed">
                    Automated filtering detects sudden unnatural follower spikes, temporary burner accounts, and proxy clusters.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <p className="font-bold text-zinc-200">Genuine Read-Time Verification</p>
                  <p className="text-[11px] leading-relaxed">
                    Read counts require genuine chapter scroll depth and dwell time; scripted self-views and page-refresh bots are discarded.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <p className="font-bold text-zinc-200">Automatic Audit Holds</p>
                  <p className="text-[11px] leading-relaxed">
                    If suspicious engagement is detected, earnings are placed on safety hold while our moderation team completes a 24-hour review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
