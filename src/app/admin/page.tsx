"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Eye,
  Trash2,
  Check,
  RotateCcw,
  Trophy,
  Calendar,
  Clock,
  Edit,
  Copy,
  Plus,
  ArrowRight,
  ExternalLink,
  Flame,
  Globe,
  Sliders,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { ReportItem, Novel, Contest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  getContestStatus,
  getContestCountdown,
  formatContestDeadline,
  calculateContestDuration,
  validateContestSchedule,
  DEFAULT_TIMEZONE,
  SUPPORTED_TIMEZONES,
} from "@/lib/utils/contest";

export default function AdminModerationPage() {
  const { role, switchRole } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeTab, setActiveTab] = useState<"contests" | "curation" | "queue">("contests");

  // Contest Modal state
  const [isEditingContest, setIsEditingContest] = useState(false);
  const [editingContest, setEditingContest] = useState<Partial<Contest> | null>(null);
  const [contestFormError, setContestFormError] = useState<string | null>(null);
  const [contestSuccessMsg, setContestSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setReports(dataStore.getReports());
    setNovels(dataStore.getNovels());
    setContests(dataStore.getContests());
  }, []);

  const refreshContests = () => {
    setContests(dataStore.getContests());
  };

  const handleUpdateReport = (id: string, status: ReportItem["status"]) => {
    dataStore.updateReportStatus(id, status);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleToggleFeatured = (novelId: string) => {
    const target = novels.find((n) => n.id === novelId);
    if (!target) return;
    const updated = { ...target, isFeatured: !target.isFeatured };
    dataStore.saveNovel(updated);
    setNovels((prev) => prev.map((n) => (n.id === novelId ? updated : n)));
  };

  // --- CONTEST ACTIONS ---
  const handleOpenCreateContest = () => {
    const now = new Date();
    const nextMonth = new Date(Date.now() + 30 * 86400000);
    const padNum = String(contests.length + 1).padStart(2, "0");

    setEditingContest({
      id: `contest-${Date.now()}`,
      contestNumber: padNum,
      title: `Story Battle Tournament #${padNum}`,
      subtitle: `Sci-Fi & Fantasy Edition`,
      description: `Write an original serialized story with captivating characters, adrenaline-fueled pacing, and immersive world-building.`,
      slug: `tournament-${padNum}-${Date.now().toString().slice(-4)}`,
      category: "Sci-Fi & Fantasy",
      bannerUrl: "/hero-character.png",
      heroCoverUrl: "/hero-character.png",
      prizePool: "$850 USD",
      startDate: now.toISOString().slice(0, 16),
      endDate: nextMonth.toISOString().slice(0, 16),
      timezone: DEFAULT_TIMEZONE,
      isPublished: true,
      minChapters: 2,
      prizeStructure: [
        { place: "Grand Prize", reward: "$500 USD", desc: "Homepage Feature & Verified Badge" },
        { place: "Runner Up", reward: "$200 USD", desc: "Category Banner Spotlight" },
        { place: "3rd Place", reward: "$100 USD", desc: "Community Spotlight" },
        { place: "Reader Choice", reward: "$50 USD", desc: "Audience Favorite Badge" },
      ],
      rules: [
        "Minimum 2 published chapters at submission time",
        "Original work owned 100% by the publishing author",
        "Submissions evaluated based on reader engagement, originality, and storytelling pace",
      ],
      judgingCriteria: [
        { title: "WORLD BUILDING & LORE", weight: "35%", percentage: 35, desc: "Universe rules & premise" },
        { title: "CHARACTER ARCS & VOICE", weight: "30%", percentage: 30, desc: "Protagonist depth & motives" },
        { title: "PACING & ORIGINALITY", weight: "20%", percentage: 20, desc: "Addictive pacing & twists" },
        { title: "READER IMPACT & ENGAGEMENT", weight: "15%", percentage: 15, desc: "Community votes & comments" },
      ],
    });
    setContestFormError(null);
    setIsEditingContest(true);
  };

  const handleOpenEditContest = (c: Contest) => {
    // Format dates to YYYY-MM-DDTHH:mm for datetime-local input
    const startDateFormatted = c.startDate ? new Date(c.startDate).toISOString().slice(0, 16) : "";
    const endDateFormatted = c.endDate ? new Date(c.endDate).toISOString().slice(0, 16) : "";

    setEditingContest({
      ...c,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      timezone: c.timezone || DEFAULT_TIMEZONE,
    });
    setContestFormError(null);
    setIsEditingContest(true);
  };

  const handleSaveContestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContest) return;

    if (!editingContest.title?.trim()) {
      setContestFormError("Contest Name is required.");
      return;
    }

    const validation = validateContestSchedule(
      editingContest.startDate || "",
      editingContest.endDate || ""
    );

    if (!validation.valid) {
      setContestFormError(validation.error || "Invalid schedule.");
      return;
    }

    const startIso = new Date(editingContest.startDate || "").toISOString();
    const endIso = new Date(editingContest.endDate || "").toISOString();

    const fullContest: Contest = {
      id: editingContest.id || `contest-${Date.now()}`,
      contestNumber: editingContest.contestNumber || "01",
      title: editingContest.title.trim(),
      slug: editingContest.slug || `contest-${Date.now()}`,
      subtitle: editingContest.subtitle || "",
      description: editingContest.description || "",
      bannerUrl: editingContest.bannerUrl || "/hero-character.png",
      heroCoverUrl: editingContest.heroCoverUrl || "/hero-character.png",
      category: editingContest.category || "All Categories",
      prizePool: editingContest.prizePool || "$500 USD",
      prizeStructure: editingContest.prizeStructure || [
        { place: "Grand Prize", reward: "$500 USD", desc: "Top Feature" },
      ],
      startDate: startIso,
      endDate: endIso,
      timezone: editingContest.timezone || DEFAULT_TIMEZONE,
      status: editingContest.isPublished === false ? "DRAFT" : "LIVE",
      isPublished: editingContest.isPublished ?? true,
      rules: editingContest.rules || [
        "Minimum 2 published chapters at submission time",
        "Original work owned 100% by publishing author",
      ],
      judgingCriteria: editingContest.judgingCriteria || [
        { title: "WORLD BUILDING", weight: "35%", percentage: 35, desc: "Lore and premise" },
        { title: "CHARACTER ARCS", weight: "35%", percentage: 35, desc: "Character voice" },
        { title: "ORIGINALITY", weight: "30%", percentage: 30, desc: "Pacing and hooks" },
      ],
      eligibleGenres: editingContest.eligibleGenres || ["All"],
      minChapters: editingContest.minChapters || 2,
      submissionCount: editingContest.submissionCount || 0,
      createdAt: editingContest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.saveContest(fullContest);
    refreshContests();
    setIsEditingContest(false);
    setEditingContest(null);
    setContestSuccessMsg(`Contest "${fullContest.title}" updated successfully.`);
    setTimeout(() => setContestSuccessMsg(null), 4000);
  };

  const handleTogglePublish = (contest: Contest) => {
    const updated = {
      ...contest,
      isPublished: !contest.isPublished,
      status: contest.isPublished ? ("DRAFT" as const) : ("LIVE" as const),
    };
    dataStore.saveContest(updated);
    refreshContests();
  };

  const handleDuplicate = (id: string) => {
    dataStore.duplicateContest(id);
    refreshContests();
    setContestSuccessMsg("Contest duplicated successfully as Draft.");
    setTimeout(() => setContestSuccessMsg(null), 4000);
  };

  const handleEndContestNow = (contest: Contest) => {
    if (!confirm(`Are you sure you want to end "${contest.title}" right now? Submissions will close immediately.`)) {
      return;
    }
    const updated = {
      ...contest,
      endDate: new Date().toISOString(),
    };
    dataStore.saveContest(updated);
    refreshContests();
    setContestSuccessMsg(`Contest "${contest.title}" has been ended.`);
    setTimeout(() => setContestSuccessMsg(null), 4000);
  };

  const handleDeleteContest = (id: string) => {
    if (!confirm("Are you sure you want to delete this contest?")) return;
    dataStore.deleteContest(id);
    refreshContests();
  };

  const pendingReports = reports.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#FAFAF7] dark:bg-[#121214] min-h-screen text-[#111111] dark:text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAEAE5] dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#D91E18] text-white flex items-center justify-center font-black shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white">
                FOUNDER & ADMIN DASHBOARD
              </h1>
              <span className="px-2 py-0.5 rounded-xs text-[9px] font-black bg-[#D91E18] text-white uppercase">
                {role || "ADMIN"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Control tournament schedules, curate featured stories, and enforce guidelines • 管理者コンソール
            </p>
          </div>
        </div>

        {role !== "ADMIN" && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3 font-semibold">
            <span>Viewing as {role}.</span>
            <button
              onClick={() => switchRole("ADMIN")}
              className="px-3 py-1 rounded-md bg-[#D91E18] text-white font-black text-xs shadow-xs hover:bg-[#B71813] transition"
            >
              Switch to Admin Mode
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {contestSuccessMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{contestSuccessMsg}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("contests")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "contests"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Contests & Tournaments ({contests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("curation")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "curation"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Homepage Curation ({novels.filter((n) => n.isFeatured).length} Featured)</span>
        </button>

        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "queue"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Moderation Queue ({pendingReports.length} Pending)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTESTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "contests" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111111] dark:text-white uppercase tracking-tight">
                Tournament Scheduling & Prize Management
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Founder controls for tournament start/end dates, timezone calculations, and live statuses.
              </p>
            </div>

            <button
              onClick={handleOpenCreateContest}
              className="px-4 py-2 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Tournament</span>
            </button>
          </div>

          {/* Contests Table */}
          <div className="bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-[#EAEAE5] dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  <tr>
                    <th className="p-3.5">Contest</th>
                    <th className="p-3.5">Start (Timezone Aware)</th>
                    <th className="p-3.5">End (Deadline)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Live Countdown</th>
                    <th className="p-3.5">Entries</th>
                    <th className="p-3.5">Prize Pool</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAE5] dark:divide-zinc-800 font-medium">
                  {contests.map((c) => {
                    const status = getContestStatus(c);
                    const countdown = getContestCountdown(c);

                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                        {/* Title & Number */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-xs bg-[#D91E18] text-white font-black text-[10px] flex items-center justify-center font-serif">
                              #{c.contestNumber || "01"}
                            </span>
                            <div>
                              <p className="font-black text-xs text-[#111111] dark:text-white line-clamp-1">{c.title}</p>
                              <p className="text-[10px] text-zinc-400">{c.category || "Sci-Fi & Fantasy"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Start Date */}
                        <td className="p-3.5 text-zinc-600 dark:text-zinc-300">
                          {formatContestDeadline(c.startDate, c.timezone)}
                        </td>

                        {/* End Date */}
                        <td className="p-3.5 font-bold text-[#111111] dark:text-white">
                          {formatContestDeadline(c.endDate, c.timezone)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider ${
                              status === "LIVE"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300"
                                : status === "SCHEDULED"
                                ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-300"
                                : status === "DRAFT"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300"
                            }`}
                          >
                            ● {status}
                          </span>
                        </td>

                        {/* Countdown */}
                        <td className="p-3.5">
                          <span className="font-black text-[11px] text-[#D91E18]">
                            {countdown.badgeText}
                          </span>
                        </td>

                        {/* Entries */}
                        <td className="p-3.5 font-bold">
                          {c.submissionCount || 0}
                        </td>

                        {/* Prize Pool */}
                        <td className="p-3.5 font-black text-[#D91E18]">
                          {c.prizePool}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditContest(c)}
                              title="Edit Tournament"
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleTogglePublish(c)}
                              title={c.isPublished ? "Unpublish to Draft" : "Publish to Live/Scheduled"}
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition text-[11px] font-bold"
                            >
                              {c.isPublished ? "Draft" : "Publish"}
                            </button>

                            <button
                              onClick={() => handleDuplicate(c.id)}
                              title="Duplicate Tournament"
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {status === "LIVE" && (
                              <button
                                onClick={() => handleEndContestNow(c)}
                                title="End Contest Immediately"
                                className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-black text-red-600 transition"
                              >
                                End Now
                              </button>
                            )}

                            <Link
                              href="/contests"
                              target="_blank"
                              title="View Public Contest Page"
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteContest(c.id)}
                              title="Delete"
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOMEPAGE CURATION */}
      {/* ========================================================================= */}
      {activeTab === "curation" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            Toggle the featured spotlight status for novels appearing in the homepage top hero carousel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={novel.coverUrl}
                    alt={novel.title}
                    className="w-10 h-14 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-[#111111] dark:text-white line-clamp-1">
                      {novel.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{novel.genre} • ★ {novel.rating}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFeatured(novel.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex-shrink-0 ${
                    novel.isFeatured
                      ? "bg-[#D91E18] text-white shadow-xs"
                      : "bg-white dark:bg-zinc-800 border border-zinc-300 text-zinc-600 dark:text-zinc-300 hover:border-black"
                  }`}
                >
                  {novel.isFeatured ? "Featured" : "Feature"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MODERATION QUEUE */}
      {/* ========================================================================= */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800">
              No reports in moderation queue. Everything is clear!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-xs text-[10px] font-black uppercase ${
                          report.reason.includes("Copyright")
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {report.reason}
                      </span>
                      <span className="text-xs font-bold text-[#111111] dark:text-white">
                        {report.contentTitle}
                      </span>
                      <span className="text-[11px] text-zinc-400">by {report.creatorName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                        report.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : report.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#555555] dark:text-zinc-300 leading-relaxed">
                    <strong>Reporter Notes:</strong> &ldquo;{report.description}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAEAE5] dark:border-zinc-800 text-xs">
                    <span className="text-[11px] text-zinc-400">
                      Reported by {report.reporterName} on {formatDate(report.createdAt)}
                    </span>

                    {report.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateReport(report.id, "DISMISSED")}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleUpdateReport(report.id, "RESOLVED")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black shadow-xs transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Action & Resolve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEST CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isEditingContest && editingContest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsEditingContest(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-700 rounded-2xl p-6 sm:p-8 text-[#111111] dark:text-zinc-100 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAE5] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-xs bg-[#D91E18] text-white flex items-center justify-center font-black text-xs">
                  🏆
                </span>
                <h3 className="font-black text-base uppercase text-[#111111] dark:text-white">
                  {editingContest.id?.startsWith("contest-") && !editingContest.updatedAt
                    ? "CREATE TOURNAMENT"
                    : "EDIT TOURNAMENT SCHEDULE & DETAILS"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingContest(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {contestFormError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#D91E18] text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{contestFormError}</span>
              </div>
            )}

            {/* Form Fields Body */}
            <form onSubmit={handleSaveContestForm} className="space-y-4 overflow-y-auto flex-1 pr-1">
              
              {/* Row 1: Number & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                    Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingContest.contestNumber || ""}
                    onChange={(e) => setEditingContest({ ...editingContest, contestNumber: e.target.value })}
                    placeholder="08"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingContest.title || ""}
                    onChange={(e) => setEditingContest({ ...editingContest, title: e.target.value })}
                    placeholder="Yomika Monthly Story Challenge — Sci-Fi & Fantasy"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                  />
                </div>
              </div>

              {/* Row 2: Subtitle & Prize Pool */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                    Subtitle / Edition
                  </label>
                  <input
                    type="text"
                    value={editingContest.subtitle || ""}
                    onChange={(e) => setEditingContest({ ...editingContest, subtitle: e.target.value })}
                    placeholder="Story Battle Tournament #08"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                    Total Prize Pool *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingContest.prizePool || ""}
                    onChange={(e) => setEditingContest({ ...editingContest, prizePool: e.target.value })}
                    placeholder="$850 USD"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-black text-[#D91E18] focus:outline-none focus:border-[#D91E18]"
                  />
                </div>
              </div>

              {/* Row 3: SCHEDULE CONFIGURATION (Start Date, End Date, Timezone) */}
              <div className="p-4 rounded-xl bg-red-50/50 dark:bg-zinc-950 border border-red-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D91E18]" />
                  <h4 className="text-xs font-black uppercase text-[#111111] dark:text-white">
                    Schedule & Timezone Control (Real-Time Countdown Engine)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingContest.startDate || ""}
                      onChange={(e) => setEditingContest({ ...editingContest, startDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                      End Date & Time (Deadline) *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingContest.endDate || ""}
                      onChange={(e) => setEditingContest({ ...editingContest, endDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                      Timezone (Default: IST)
                    </label>
                    <select
                      value={editingContest.timezone || DEFAULT_TIMEZONE}
                      onChange={(e) => setEditingContest({ ...editingContest, timezone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                    >
                      {SUPPORTED_TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto Calculated Duration & Status Preview */}
                {editingContest.startDate && editingContest.endDate && (
                  <div className="pt-2 border-t border-red-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Duration: <strong className="text-[#111111] dark:text-white">{calculateContestDuration(editingContest.startDate, editingContest.endDate)}</strong>
                    </span>
                    <span className="text-[#D91E18]">
                      Status Preview: <strong>{getContestStatus(editingContest)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingContest.description || ""}
                  onChange={(e) => setEditingContest({ ...editingContest, description: e.target.value })}
                  placeholder="Write an original serialized story with captivating characters..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-[#D91E18] leading-relaxed"
                />
              </div>

              {/* Row 5: Published Status Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={editingContest.isPublished !== false}
                  onChange={(e) => setEditingContest({ ...editingContest, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D91E18] focus:ring-[#D91E18]"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-bold text-[#111111] dark:text-white cursor-pointer select-none">
                  Published (Make available to public based on schedule)
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#EAEAE5] dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditingContest(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Save Tournament →
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
