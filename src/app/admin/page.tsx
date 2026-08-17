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
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { ReportItem, Novel } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminModerationPage() {
  const { role, switchRole } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "curation" | "creators">("queue");

  useEffect(() => {
    setReports(dataStore.getReports());
    setNovels(dataStore.getNovels());
  }, []);

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

  const pendingReports = reports.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Editorial & Moderation Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Review copyright claims, enforce safety guidelines, and curate featured stories
            </p>
          </div>
        </div>

        {role !== "ADMIN" && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-3">
            <span>Viewing as {role}.</span>
            <button
              onClick={() => switchRole("ADMIN")}
              className="px-3 py-1 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-sm hover:bg-amber-400 transition"
            >
              Switch to Admin
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "queue"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Moderation Queue ({pendingReports.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab("curation")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "curation"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Homepage Hero Curation ({novels.filter((n) => n.isFeatured).length} Featured)</span>
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 rounded-3xl bg-zinc-900 border border-zinc-800">
              No reports in moderation queue. Everything is clear!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          report.reason.includes("Copyright")
                            ? "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                            : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                        }`}
                      >
                        {report.reason}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {report.contentTitle}
                      </span>
                      <span className="text-[11px] text-zinc-400">by {report.creatorName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        report.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : report.status === "RESOLVED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <strong>Reporter Notes:</strong> &ldquo;{report.description}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                    <span className="text-[11px] text-zinc-400">
                      Reported by {report.reporterName} on {formatDate(report.createdAt)}
                    </span>

                    {report.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateReport(report.id, "DISMISSED")}
                          className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-semibold transition"
                        >
                          Dismiss (False Report)
                        </button>
                        <button
                          onClick={() => handleUpdateReport(report.id, "RESOLVED")}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1"
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

      {/* TAB 2: HOMEPAGE CURATION */}
      {activeTab === "curation" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            Toggle the featured spotlight status for novels appearing in the homepage top hero carousel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={novel.coverUrl}
                    alt={novel.title}
                    className="w-10 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {novel.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{novel.genre} • ★ {novel.rating}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFeatured(novel.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    novel.isFeatured
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {novel.isFeatured ? "Featured" : "Feature"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
