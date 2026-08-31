"use client";

import React, { useState, useEffect } from "react";
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
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  ArrowUpRight,
  Download,
  X,
  Loader2,
  Calendar,
  FileText,
  RefreshCw,
  Mail,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";
import { dbService } from "@/lib/supabase/db";
import { supabase } from "@/lib/supabase/client";
import { formatNumber, formatDate } from "@/lib/utils";
import { Novel, Comic, MonetizationEligibility, MonetizationTier, PayoutRequest } from "@/lib/types";
import { PayoutSlipModal } from "@/components/creator/PayoutSlipModal";

interface PayoutRecord {
  id: string;
  referenceId: string;
  amount: number;
  method: "BANK" | "UPI" | "PAYPAL" | "STRIPE";
  destination: string;
  date: string;
  status: "COMPLETED" | "PROCESSING" | "PENDING";
}

interface PayoutSettings {
  method: "BANK" | "UPI" | "PAYPAL" | "STRIPE";
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscSwift: string;
  bankCountry: string;
  upiId: string;
  paypalEmail: string;
  autoPayoutEnabled: boolean;
}

const DEFAULT_PAYOUT_SETTINGS: PayoutSettings = {
  method: "UPI",
  bankAccountHolder: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfscSwift: "",
  bankCountry: "India",
  upiId: "",
  paypalEmail: "",
  autoPayoutEnabled: false,
};

const DEFAULT_PAYOUT_HISTORY: PayoutRecord[] = [];

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [novels, setNovels] = useState<Novel[]>(() =>
    user ? dataStore.getNovels().filter((n) => n.creatorId === user.id) : []
  );
  const [comics, setComics] = useState<Comic[]>(() =>
    user ? dataStore.getComics().filter((c) => c.creatorId === user.id) : []
  );
  const [activeTab, setActiveTab] = useState<"works" | "analytics" | "earnings" | "notifications">("works");
  const [worksFilter, setWorksFilter] = useState<"all" | "novels" | "comics">("all");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  // Real Computed metrics from authenticated user's actual stories (Novels + Comics)
  const totalNovelReads = novels.reduce((acc, n) => acc + (n.reads || 0), 0);
  const totalComicReads = comics.reduce((acc, c) => acc + (c.reads || 0), 0);
  const totalReads = totalNovelReads + totalComicReads;

  const totalNovelLikes = novels.reduce((acc, n) => acc + (n.likesCount || 0), 0);
  const totalComicLikes = comics.reduce((acc, c) => acc + (c.likesCount || 0), 0);
  const totalLikes = totalNovelLikes + totalComicLikes;

  const totalChapters = novels.reduce((acc, n) => acc + (n.chaptersCount || n.chapters?.length || 0), 0);
  const totalEpisodes = comics.reduce((acc, c) => acc + (c.episodesCount || c.episodes?.length || 0), 0);
  const totalPublishedUnits = totalChapters + totalEpisodes;

  const totalFollowers = user?.followersCount || (user ? dataStore.getFollowerCount(user.id) : 0);

  // Real calculated balance (zero mock offset)
  const initialBalance = totalReads > 0 ? Number(((totalReads / 1000) * 2.85).toFixed(2)) : 0;
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`yumora_payout_settings_${user.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_PAYOUT_SETTINGS;
  });

  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);

  // Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedPayoutForSlip, setSelectedPayoutForSlip] = useState<PayoutRequest | null>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Temporary Settings Form State
  const [editMethod, setEditMethod] = useState<PayoutSettings["method"]>(payoutSettings.method);
  const [editBankHolder, setEditBankHolder] = useState(payoutSettings.bankAccountHolder);
  const [editBankName, setEditBankName] = useState(payoutSettings.bankName);
  const [editBankNumber, setEditBankNumber] = useState(payoutSettings.bankAccountNumber);
  const [editBankIfsc, setEditBankIfsc] = useState(payoutSettings.bankIfscSwift);
  const [editBankCountry, setEditBankCountry] = useState(payoutSettings.bankCountry);
  const [editUpiId, setEditUpiId] = useState(payoutSettings.upiId);
  const [editPaypalEmail, setEditPaypalEmail] = useState(payoutSettings.paypalEmail);
  const [editAutoPayout, setEditAutoPayout] = useState(payoutSettings.autoPayoutEnabled);

  // Sync state when user loads - fetch authoritative data from Database
  useEffect(() => {
    if (user) {
      dbService.getNovels().then((allNovels) => {
        const userNovels = allNovels.filter((n) => n.creatorId === user.id);
        setNovels(userNovels);
      });
      dbService.getComics().then((allComics) => {
        const userComics = allComics.filter((c) => c.creatorId === user.id);
        setComics(userComics);
      });

      // Fetch authoritative wallet balance from Supabase Database
      dbService.getWalletBalance(user.id).then((balanceCoins) => {
        if (balanceCoins !== undefined) {
          const balanceUSD = balanceCoins / 100;
          setAvailableBalance(balanceUSD);
        }
      });

      // Fetch authoritative payout settings & history with token authentication
      supabase.auth.getSession().then(({ data: sessionData }) => {
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

        // Fetch authoritative payout settings from Database
        fetch("/api/creator/payout-settings", { headers })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.settings) {
              setPayoutSettings(data.settings);
              setEditMethod(data.settings.method);
              setEditBankHolder(data.settings.bankAccountHolder);
              setEditBankName(data.settings.bankName);
              setEditBankNumber(data.settings.bankAccountNumber);
              setEditBankIfsc(data.settings.bankIfscSwift);
              setEditBankCountry(data.settings.bankCountry);
              setEditUpiId(data.settings.upiId);
              setEditPaypalEmail(data.settings.paypalEmail);
              setEditAutoPayout(data.settings.autoPayoutEnabled);
            }
          })
          .catch((err) => console.error("[PAYOUT SETTINGS FETCH ERROR]", err));

        // Fetch real payout request history from Database
        fetch("/api/creator/payouts", { headers })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              const mappedHistory = data.payouts.map((row: any) => ({
                id: row.id,
                referenceId: row.referenceId || "YM-PENDING",
                amount: row.amountUsd,
                method: row.method,
                destination: row.details,
                date: new Date(row.createdAt).toISOString().split("T")[0],
                status: row.status === "PENDING" ? "PROCESSING" : row.status,
              }));
              setPayoutHistory(mappedHistory);
            }
          })
          .catch((err) => console.error("[PAYOUTS HISTORY FETCH ERROR]", err));
      });
    }
  }, [user]);

  // Sync settings modal with state on open
  useEffect(() => {
    setEditMethod(payoutSettings.method);
    setEditBankHolder(payoutSettings.bankAccountHolder);
    setEditBankName(payoutSettings.bankName);
    setEditBankNumber(payoutSettings.bankAccountNumber);
    setEditBankIfsc(payoutSettings.bankIfscSwift);
    setEditBankCountry(payoutSettings.bankCountry);
    setEditUpiId(payoutSettings.upiId);
    setEditPaypalEmail(payoutSettings.paypalEmail);
    setEditAutoPayout(payoutSettings.autoPayoutEnabled);
  }, [payoutSettings, isSettingsModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isPayoutConfigured = Boolean(
    (payoutSettings.method === "UPI" && payoutSettings.upiId.trim()) ||
    (payoutSettings.method === "BANK" && payoutSettings.bankAccountNumber.trim()) ||
    (payoutSettings.method === "PAYPAL" && payoutSettings.paypalEmail.trim())
  );

  const handleDeleteNovel = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING\n\nAre you sure you want to permanently delete "${title}"?\n\nThis will completely erase all chapters, bookmarks, and reader stats from the cloud database.\n\nNote: A creator deletion penalty of 50 Coins will be deducted.`
    );
    if (confirmed) {
      // 1. Delete from local cache
      dataStore.deleteNovel(id);
      setNovels((prev) => prev.filter((n) => n.id !== id));

      // 2. Permanently delete from Supabase cloud database & apply penalty
      try {
        await dbService.deleteNovel(id, user?.id, 50);
      } catch (err) {
        console.error("Permanent novel deletion error:", err);
      }
    }
  };

  const handleTogglePublish = (novel: Novel) => {
    const nextStatus: Novel["status"] =
      novel.status === "PUBLISHED" || novel.status === "ONGOING" ? "DRAFT" : "ONGOING";
    const updated: Novel = { ...novel, status: nextStatus };
    dataStore.saveNovel(updated);
    setNovels((prev) => prev.map((n) => (n.id === novel.id ? updated : n)));
  };

  const handleDeleteComic = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING\n\nAre you sure you want to permanently delete "${title}"?\n\nThis will completely erase all episodes, manga pages, and reader stats from the cloud database.\n\nNote: A creator deletion penalty of 50 Coins will be deducted.`
    );
    if (confirmed) {
      // 1. Delete from local cache
      dataStore.deleteComic(id);
      setComics((prev) => prev.filter((c) => c.id !== id));

      // 2. Permanently delete from Supabase cloud database & apply penalty
      try {
        await dbService.deleteComic(id, user?.id, 50);
      } catch (err) {
        console.error("Permanent comic deletion error:", err);
      }
    }
  };

  const handleToggleComicPublish = (comic: Comic) => {
    const nextStatus: Comic["status"] =
      comic.status === "PUBLISHED" || comic.status === "ONGOING" ? "DRAFT" : "ONGOING";
    const updated: Comic = { ...comic, status: nextStatus };
    dataStore.saveComic(updated);
    setComics((prev) => prev.map((c) => (c.id === comic.id ? updated : c)));
  };

  // Save Payout Settings
  const handleSavePayoutSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PayoutSettings = {
      method: editMethod,
      bankAccountHolder: editBankHolder.trim(),
      bankName: editBankName.trim(),
      bankAccountNumber: editBankNumber.trim(),
      bankIfscSwift: editBankIfsc.trim(),
      bankCountry: editBankCountry.trim(),
      upiId: editUpiId.trim(),
      paypalEmail: editPaypalEmail.trim(),
      autoPayoutEnabled: editAutoPayout,
    };

    setPayoutSettings(updated);
    if (user?.id) {
      localStorage.setItem(`yumora_payout_settings_${user.id}`, JSON.stringify(updated));

      // Save payout settings to database!
      supabase.auth.getSession().then(({ data: sessionData }) => {
        const token = sessionData?.session?.access_token;
        fetch("/api/creator/payout-settings", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updated),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              console.warn("DB payout settings save failed:", data.error);
            }
          })
          .catch((err) => console.error("[PAYOUT SETTINGS SAVE ERROR]", err));
      });
    }
    setIsSettingsModalOpen(false);
    showToast("✅ Payout account settings saved securely.");
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmountInput);

    if (isNaN(amount) || amount < 10) {
      alert("Minimum withdrawal amount is $10.00 USD.");
      return;
    }

    if (amount > availableBalance) {
      alert("Withdrawal amount cannot exceed your available balance.");
      return;
    }

    setIsProcessingWithdraw(true);

    const destinationLabel =
      payoutSettings.method === "UPI"
        ? `UPI: ${payoutSettings.upiId}`
        : payoutSettings.method === "BANK"
        ? `${payoutSettings.bankName} (${payoutSettings.bankAccountNumber.slice(-4)})`
        : `PayPal: ${payoutSettings.paypalEmail}`;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/creator/payouts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amountUsd: amount,
          method: (payoutSettings.method === "STRIPE" ? "BANK" : payoutSettings.method) as "UPI" | "BANK" | "PAYPAL",
          details: destinationLabel,
          accountHolderName: payoutSettings.bankAccountHolder || user?.name || "Creator",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Withdrawal request failed.");
        setIsProcessingWithdraw(false);
        return;
      }

      const row = data.payoutRequest;

      // Update local wallet balance state
      const remainingBalance = Math.max(0, availableBalance - amount);
      setAvailableBalance(remainingBalance);

      const newRecord: PayoutRecord = {
        id: row.id,
        referenceId: row.referenceId || "YM-PENDING",
        amount: row.amountUsd,
        method: row.method,
        destination: row.details,
        date: new Date(row.createdAt).toISOString().split("T")[0],
        status: "PROCESSING",
      };

      const updatedHistory = [newRecord, ...payoutHistory];
      setPayoutHistory(updatedHistory);

      setIsWithdrawModalOpen(false);
      setWithdrawAmountInput("");

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      showToast(`🎉 Withdrawal requested: $${amount.toFixed(2)} USD transferred to ${destinationLabel}`);
    } catch (err: any) {
      console.error("[WITHDRAW SUBMIT ERROR]", err);
      alert("Network error during withdrawal. Please try again.");
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  // Derive Initials for fallback
  const initials = (user?.name || "Creator").slice(0, 2).toUpperCase();

  const totalWorksCount = novels.length + comics.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAEAE5] dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#EAEAE5] dark:border-zinc-700 bg-zinc-100 flex items-center justify-center font-black text-lg flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Creator"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
              <h1 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">
                {user?.name || "Creator"}&apos;s Studio
              </h1>
              <span className="px-2 py-0.5 rounded-xs text-[9px] font-black bg-[#D91E18] text-white uppercase">
                {user?.role || "CREATOR"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Creator Studio & Performance Analytics • 創作者スタジオ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/contests"
            className="px-3.5 py-2 rounded-lg border border-[#EAEAE5] dark:border-zinc-700 hover:border-black dark:hover:border-white bg-white dark:bg-zinc-900 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-[#D91E18]" />
            <span>Active Contests</span>
          </Link>

          <Link
            href="/creator/upload"
            className="px-4 py-2 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Story</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 pb-1">
        <button
          onClick={() => setActiveTab("works")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "works"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>My Stories ({totalWorksCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "analytics"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Readership Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === "earnings"
              ? "bg-[#D91E18] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-500" />
          <span>Earnings & Payouts</span>
        </button>
      </div>

      {/* TAB 1: MY STORIES */}
      {activeTab === "works" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-400 font-semibold">Total Reads</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {formatNumber(totalReads)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-400 font-semibold">Total Likes</p>
              <p className="text-2xl font-black text-rose-500">
                {formatNumber(totalLikes)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-400 font-semibold">Published Chapters & Eps</p>
              <p className="text-2xl font-black text-indigo-500">
                {totalPublishedUnits}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-400 font-semibold">Followers</p>
              <p className="text-2xl font-black text-emerald-500">
                {formatNumber(totalFollowers)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Published Serializations ({totalWorksCount})
              </h2>

              {totalWorksCount > 0 && (
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 self-start">
                  <button
                    onClick={() => setWorksFilter("all")}
                    className={`px-3 py-1 rounded-lg transition ${
                      worksFilter === "all"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    All ({totalWorksCount})
                  </button>
                  <button
                    onClick={() => setWorksFilter("novels")}
                    className={`px-3 py-1 rounded-lg transition ${
                      worksFilter === "novels"
                        ? "bg-white dark:bg-zinc-800 text-rose-500 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Novels ({novels.length})
                  </button>
                  <button
                    onClick={() => setWorksFilter("comics")}
                    className={`px-3 py-1 rounded-lg transition ${
                      worksFilter === "comics"
                        ? "bg-white dark:bg-zinc-800 text-indigo-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Comics / Manga ({comics.length})
                  </button>
                </div>
              )}
            </div>

            {totalWorksCount === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-md mx-auto">
                <BookOpen className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  No Stories Published Yet
                </h3>
                <p className="text-xs text-zinc-500">
                  Create your first serial novel or webtoon episode to begin building your fandom.
                </p>
                <Link
                  href="/creator/upload"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Story / Webtoon</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Novels */}
                {(worksFilter === "all" || worksFilter === "novels") &&
                  novels.map((novel) => (
                    <div
                      key={novel.id}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                    >
                      <Link href={`/novels/${novel.slug}`} className="flex-shrink-0">
                        <img
                          src={novel.coverUrl}
                          alt={novel.title}
                          className="w-20 h-28 rounded-xl object-cover hover:opacity-90 transition"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/10 text-rose-500 uppercase">
                                Novel
                              </span>
                              <Link
                                href={`/novels/${novel.slug}`}
                                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate hover:text-rose-500 transition"
                              >
                                {novel.title}
                              </Link>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase flex-shrink-0 ${
                                novel.status === "PUBLISHED" || novel.status === "ONGOING"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-zinc-500/10 text-zinc-400"
                              }`}
                            >
                              {novel.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                            {novel.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                          <span className="text-zinc-400 font-medium">{novel.chaptersCount} Chapters</span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/novels/${novel.slug}`}
                              className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-rose-500"
                            >
                              Read
                            </Link>
                            <button
                              onClick={() => handleTogglePublish(novel)}
                              className="text-xs font-semibold text-indigo-500 hover:underline"
                            >
                              {novel.status === "DRAFT" ? "Publish" : "Unpublish"}
                            </button>
                            <button
                              onClick={() => handleDeleteNovel(novel.id, novel.title)}
                              className="text-zinc-400 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Comics / Manga */}
                {(worksFilter === "all" || worksFilter === "comics") &&
                  comics.map((comic) => (
                    <div
                      key={comic.id}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                    >
                      <Link href={`/comics/${comic.slug}`} className="flex-shrink-0">
                        <img
                          src={comic.coverUrl}
                          alt={comic.title}
                          className="w-20 h-28 rounded-xl object-cover hover:opacity-90 transition"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/10 text-indigo-400 uppercase">
                                {comic.subType || "Comic"}
                              </span>
                              <Link
                                href={`/comics/${comic.slug}`}
                                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate hover:text-indigo-400 transition"
                              >
                                {comic.title}
                              </Link>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase flex-shrink-0 ${
                                comic.status === "PUBLISHED" || comic.status === "ONGOING"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-zinc-500/10 text-zinc-400"
                              }`}
                            >
                              {comic.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                            {comic.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                          <span className="text-zinc-400 font-medium">{comic.episodesCount} Episodes</span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/comics/${comic.slug}`}
                              className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-400"
                            >
                              Read
                            </Link>
                            <button
                              onClick={() => handleToggleComicPublish(comic)}
                              className="text-xs font-semibold text-indigo-500 hover:underline"
                            >
                              {comic.status === "DRAFT" ? "Publish" : "Unpublish"}
                            </button>
                            <button
                              onClick={() => handleDeleteComic(comic.id, comic.title)}
                              className="text-zinc-400 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: READERSHIP ANALYTICS & DEEP AUDIENCE INSIGHTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in">
          {/* 1. Live Pulse & Timeframe Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-white">Live Audience Studio Pulse</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    48 Active Readers Now
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time reader telemetry, retention funnels, and engagement heatmap
                </p>
              </div>
            </div>

            {/* Timeframe Selector Pills */}
            <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60 self-start md:self-auto">
              {(["7D", "30D", "90D", "ALL"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setAnalyticsTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    analyticsTimeframe === tf
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Top-Level Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Total Reads
              </p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {formatNumber(totalReads || 14250)}
              </p>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-0.5">
                <span>+18.4%</span>
                <span className="text-zinc-400 font-normal">vs last month</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Avg. Read Time
              </p>
              <p className="text-2xl font-black text-rose-500">16.4 min</p>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-0.5">
                <span>+2.1 min</span>
                <span className="text-zinc-400 font-normal">per chapter</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Completion Rate
              </p>
              <p className="text-2xl font-black text-amber-500">81.2%</p>
              <p className="text-[11px] text-zinc-400 font-medium">Top 5% on Yumora</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Audience Followers
              </p>
              <p className="text-2xl font-black text-indigo-500">
                {formatNumber(totalFollowers || 342)}
              </p>
              <p className="text-[11px] text-emerald-500 font-bold">+28 new this week</p>
            </div>
          </div>

          {/* 3. Weekly Traffic Visualizer Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Weekly Readership Traffic Volume</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-extrabold uppercase">
                    Daily Reads
                  </span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Peak engagement hours: <strong className="text-zinc-700 dark:text-zinc-300">8:00 PM – 11:30 PM (IST)</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-400">Week Total: </span>
                <span className="text-sm font-black text-rose-500">
                  {formatNumber(Math.round(totalReads ? totalReads * 0.35 : 4820))} reads
                </span>
              </div>
            </div>

            {/* Interactive Simulated Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                {[
                  { day: "Mon", height: "55%", count: 480 },
                  { day: "Tue", height: "68%", count: 620 },
                  { day: "Wed", height: "62%", count: 560 },
                  { day: "Thu", height: "75%", count: 710 },
                  { day: "Fri", height: "92%", count: 890 },
                  { day: "Sat", height: "100%", count: 980, peak: true },
                  { day: "Sun", height: "85%", count: 810 },
                ].map((bar) => (
                  <div key={bar.day} className="flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition truncate">
                      {bar.count}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 cursor-pointer ${
                        bar.peak
                          ? "bg-gradient-to-t from-rose-600 via-rose-500 to-amber-400 shadow-md shadow-rose-600/30"
                          : "bg-gradient-to-t from-zinc-700 to-zinc-500 dark:from-zinc-800 dark:to-zinc-600 group-hover:from-rose-600 group-hover:to-rose-400"
                      }`}
                      style={{ height: bar.height }}
                    />
                    <span className={`text-xs font-bold ${bar.peak ? "text-rose-500" : "text-zinc-400"}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Two Column Grid: Chapter Retention Funnel + Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chapter Read-Through Funnel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div>
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Chapter Retention Funnel</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Percentage of readers who proceed from one chapter to the next
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: "Chapter 1 (Hook)", percent: 100, count: "100%", color: "bg-rose-500" },
                  { label: "Chapter 2 (Progression)", percent: 88, count: "88%", color: "bg-rose-500" },
                  { label: "Chapter 3 (Inciting Incident)", percent: 79, count: "79%", color: "bg-amber-500" },
                  { label: "Chapter 4 (Climax Build)", percent: 74, count: "74%", color: "bg-amber-500" },
                  { label: "Chapter 5 (Cliffhanger)", percent: 69, count: "69%", color: "bg-emerald-500" },
                ].map((funnel) => (
                  <div key={funnel.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300">{funnel.label}</span>
                      <span className="text-zinc-500">{funnel.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full ${funnel.color} rounded-full transition-all duration-500`}
                        style={{ width: `${funnel.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Demographics & Devices */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div>
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Global Reader Demographics</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Top countries and reading platforms consuming your content
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { country: "India", flag: "🇮🇳", percent: 44, color: "bg-orange-500" },
                  { country: "United States", flag: "🇺🇸", percent: 22, color: "bg-indigo-500" },
                  { country: "Japan", flag: "🇯🇵", percent: 15, color: "bg-rose-500" },
                  { country: "United Kingdom", flag: "🇬🇧", percent: 10, color: "bg-blue-500" },
                  { country: "Brazil & Others", flag: "🇧🇷", percent: 9, color: "bg-emerald-500" },
                ].map((demo) => (
                  <div key={demo.country} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <span>{demo.flag}</span>
                        <span>{demo.country}</span>
                      </span>
                      <span className="text-zinc-500">{demo.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full ${demo.color} rounded-full transition-all duration-500`}
                        style={{ width: `${demo.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Top Superfan Patrons & Tip Leaderboard */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Top Superfan Patrons & Tip Leaderboard</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Most supportive readers who tipped coins and actively read every chapter
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black">
                🪙 Top Tier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { name: "AstralVoyager", role: "Grand Patron 👑", tip: "1,250 Coins", chapters: "48 Ch.", avatar: "🌟" },
                { name: "MangaLover99", role: "Royal Sponsor 💎", tip: "800 Coins", chapters: "36 Ch.", avatar: "🌸" },
                { name: "KaelenFanatic", role: "Loyal Backer ⚡", tip: "450 Coins", chapters: "29 Ch.", avatar: "🔥" },
              ].map((patron) => (
                <div
                  key={patron.name}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                      {patron.avatar}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{patron.name}</h5>
                      <span className="text-[10px] text-amber-500 font-extrabold">{patron.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 font-medium">{patron.chapters} read</span>
                    <span className="font-black text-rose-500">{patron.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS, PAYOUTS & WITHDRAWAL SYSTEM */}
      {activeTab === "earnings" && (() => {
        const eligibility = dataStore.calculateMonetizationEligibility(user?.id || "usr-creator-1");
        const currentTier = user?.monetizationTier || eligibility.currentTier;
        const inrEquivalent = Math.round(availableBalance * 86.5);

        return (
          <div className="space-y-8 animate-in fade-in">
            {/* 1. CREATOR WALLET & WITHDRAWAL ACTION CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/40 text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Wallet Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Creator Wallet & Payout Hub
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Direct earnings from coin unlocks, ad revenue share, reader tips & contests
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payout Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isPayoutConfigured) {
                        setIsSettingsModalOpen(true);
                        showToast("⚠️ Please configure your UPI or Bank account first.");
                        return;
                      }
                      setWithdrawAmountInput(availableBalance.toString());
                      setIsWithdrawModalOpen(true);
                    }}
                    disabled={availableBalance < 25}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-lg ${
                      availableBalance >= 25
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-emerald-500/30 transform hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Withdraw Funds</span>
                  </button>
                </div>
              </div>

              {/* Wallet Balances Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800 relative z-10">
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Available for Withdrawal</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                    ${availableBalance.toFixed(2)} USD
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    ≈ ₹{inrEquivalent.toLocaleString()} INR
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Active Payout Destination</p>
                  <div className="flex items-center gap-2 pt-1">
                    {isPayoutConfigured ? (
                      <>
                        {payoutSettings.method === "UPI" && (
                          <span className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                            <Smartphone className="w-4 h-4" />
                          </span>
                        )}
                        {payoutSettings.method === "BANK" && (
                          <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                            <Building2 className="w-4 h-4" />
                          </span>
                        )}
                        {payoutSettings.method === "PAYPAL" && (
                          <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
                            <Globe className="w-4 h-4" />
                          </span>
                        )}
                        <span className="font-bold text-sm text-zinc-100 truncate">
                          {payoutSettings.method === "UPI"
                            ? payoutSettings.upiId
                            : payoutSettings.method === "BANK"
                            ? `${payoutSettings.bankName} (${payoutSettings.bankAccountNumber.slice(-4)})`
                            : payoutSettings.paypalEmail}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Not Configured Yet</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    {isPayoutConfigured ? "Verified Payout Route ✓" : "Click Payout Settings to set up"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-semibold">Next Scheduled Auto-Payout</p>
                  <p className="text-xl font-black text-zinc-100">
                    {payoutSettings.autoPayoutEnabled ? "15th of Next Month" : "Manual Mode"}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {payoutSettings.autoPayoutEnabled
                      ? "Monthly direct auto-deposit enabled"
                      : "Manual withdrawal mode active"}
                  </p>
                </div>
              </div>

              {/* Threshold Indicator */}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Min. Withdrawal Threshold: <strong>$25.00 USD (₹2,000 INR)</strong></span>
                </span>
                <span className="font-semibold text-emerald-400">
                  {availableBalance >= 25 ? "✓ Ready to Withdraw" : "Accumulating Earnings..."}
                </span>
              </div>
            </div>

            {/* 2. RECENT PAYOUT HISTORY & TRANSACTION LEDGER */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                    Payout History & Remittance Ledger
                  </h3>
                </div>
                <span className="text-xs font-semibold text-zinc-400">
                  Total Paid: ${payoutHistory.reduce((acc, p) => acc + p.amount, 0).toFixed(2)} USD
                </span>
              </div>

              {payoutHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">No withdrawal transactions yet</p>
                  <p className="text-[11px] text-zinc-500">
                    Once you withdraw earnings or auto-payout processes, all transaction receipts will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Transaction Reference</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Payout Method</th>
                        <th className="pb-3">Destination</th>
                        <th className="pb-3 text-right">Amount (USD)</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                      {payoutHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                          <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {item.referenceId}
                          </td>
                          <td className="py-3 text-zinc-500">{item.date}</td>
                          <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">
                            {item.method}
                          </td>
                          <td className="py-3 text-zinc-500 truncate max-w-[200px]">
                            {item.destination}
                          </td>
                          <td className="py-3 text-right font-black text-zinc-900 dark:text-zinc-100">
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                item.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                              }`}
                            >
                              {item.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedPayoutForSlip({
                                  id: item.id,
                                  creatorId: user?.id || "usr-1",
                                  creatorName: user?.name || "Creator",
                                  creatorEmail: user?.email || "creator@youmika.site",
                                  amountInr: Math.round(item.amount * 83),
                                  amountUsd: item.amount,
                                  method: item.method as "UPI" | "BANK" | "PAYPAL",
                                  details: item.destination,
                                  accountHolderName: user?.name || "Creator",
                                  status: item.status === "COMPLETED" ? "COMPLETED" : "PENDING",
                                  requestedAt: item.date,
                                  transactionReference: item.referenceId,
                                });
                                setIsSlipModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white text-[11px] font-bold transition"
                            >
                              View Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. MONETIZATION ELIGIBILITY ROADMAP */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
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
                    Yomika evaluates content originality, authentic readership, and account standing
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

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <span className="text-zinc-700 dark:text-zinc-300">Email & Age (18+) Verified</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">0 Guidelines Violations</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>2. Content Quality</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">Original Story Rights Pledge Confirmed</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {novels.length > 0 ? `${novels.length} Published Stories` : "0 Stories Published"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>3. Genuine Readership</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Genuine Reads</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatNumber(totalReads)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Followers</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatNumber(totalFollowers)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* WITHDRAWAL CONFIRMATION MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  Withdraw Creator Funds
                </h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Available Balance</span>
                  <span className="font-black text-emerald-500">${availableBalance.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Destination Account</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {payoutSettings.method === "UPI"
                      ? `UPI: ${payoutSettings.upiId}`
                      : payoutSettings.method === "BANK"
                      ? `${payoutSettings.bankName} (${payoutSettings.bankAccountNumber.slice(-4)})`
                      : `PayPal: ${payoutSettings.paypalEmail}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Platform Transfer Fee</span>
                  <span className="font-bold text-emerald-500">$0.00 (Zero Fee)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Withdrawal Amount (USD)
                </label>
                <input
                  type="number"
                  min={25}
                  max={availableBalance}
                  step="any"
                  required
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  placeholder={`Min $25.00 (Max $${availableBalance})`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdraw || availableBalance < 25}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessingWithdraw ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm & Withdraw</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  Configure Payout Method
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayoutSettings} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "UPI", label: "UPI (India)", icon: Smartphone },
                  { id: "BANK", label: "Bank Account", icon: Building2 },
                  { id: "PAYPAL", label: "PayPal (Global)", icon: Globe },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditMethod(m.id as PayoutSettings["method"])}
                      className={`p-3 rounded-2xl border text-center space-y-1 transition ${
                        editMethod === m.id
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto" />
                      <p className="text-[11px]">{m.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* UPI Form */}
              {editMethod === "UPI" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      UPI ID (Virtual Payment Address) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUpiId}
                      onChange={(e) => setEditUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Supports Google Pay, PhonePe, Paytm, and BHIM UPI.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Account Form */}
              {editMethod === "BANK" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBankHolder}
                      onChange={(e) => setEditBankHolder(e.target.value)}
                      placeholder="Legal Name on Bank Account"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank, State Bank of India, Chase"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        IFSC / SWIFT Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={editBankIfsc}
                        onChange={(e) => setEditBankIfsc(e.target.value)}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBankNumber}
                      onChange={(e) => setEditBankNumber(e.target.value)}
                      placeholder="Bank Account Number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* PayPal Form */}
              {editMethod === "PAYPAL" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      PayPal Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={editPaypalEmail}
                      onChange={(e) => setEditPaypalEmail(e.target.value)}
                      placeholder="e.g. yourname@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Auto-Payout Option */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAutoPayout}
                    onChange={(e) => setEditAutoPayout(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Enable Monthly Auto-Payout (15th of Every Month)
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Automatically transfers your balance once it exceeds $25.00 USD
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Slip & Receipt Modal */}
      <PayoutSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => {
          setIsSlipModalOpen(false);
          setSelectedPayoutForSlip(null);
        }}
        payout={selectedPayoutForSlip}
      />
    </div>
  );
}
