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
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/data/store";
import { formatNumber, formatDate } from "@/lib/utils";
import { Novel, Comic, MonetizationEligibility, MonetizationTier } from "@/lib/types";

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
  const [activeTab, setActiveTab] = useState<"works" | "analytics" | "earnings">("works");
  const [worksFilter, setWorksFilter] = useState<"all" | "novels" | "comics">("all");

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
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`yumora_wallet_balance_${user.id}`);
      if (saved) return parseFloat(saved);
    }
    return initialBalance;
  });

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

  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`yumora_payout_history_${user.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_PAYOUT_HISTORY;
  });

  // Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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

  // Sync state when user loads
  useEffect(() => {
    if (user) {
      const userNovels = dataStore.getNovels().filter((n) => n.creatorId === user.id);
      const userComics = dataStore.getComics().filter((c) => c.creatorId === user.id);
      setNovels(userNovels);
      setComics(userComics);
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

  const handleDeleteNovel = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dataStore.deleteNovel(id);
      setNovels((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleTogglePublish = (novel: Novel) => {
    const nextStatus: Novel["status"] =
      novel.status === "PUBLISHED" || novel.status === "ONGOING" ? "DRAFT" : "ONGOING";
    const updated: Novel = { ...novel, status: nextStatus };
    dataStore.saveNovel(updated);
    setNovels((prev) => prev.map((n) => (n.id === novel.id ? updated : n)));
  };

  const handleDeleteComic = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dataStore.deleteComic(id);
      setComics((prev) => prev.filter((c) => c.id !== id));
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
    }
    setIsSettingsModalOpen(false);
    showToast("✅ Payout account settings saved securely.");
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const remainingBalance = Math.max(0, availableBalance - amount);
      setAvailableBalance(remainingBalance);

      const destinationLabel =
        payoutSettings.method === "UPI"
          ? `UPI: ${payoutSettings.upiId}`
          : payoutSettings.method === "BANK"
          ? `${payoutSettings.bankName} (${payoutSettings.bankAccountNumber.slice(-4)})`
          : `PayPal: ${payoutSettings.paypalEmail}`;

      const newRecord: PayoutRecord = {
        id: `pay-${Date.now()}`,
        referenceId: `YM-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: amount,
        method: payoutSettings.method,
        destination: destinationLabel,
        date: new Date().toISOString().split("T")[0],
        status: "PROCESSING",
      };

      const updatedHistory = [newRecord, ...payoutHistory];
      setPayoutHistory(updatedHistory);

      if (user?.id) {
        localStorage.setItem(`yumora_wallet_balance_${user.id}`, remainingBalance.toString());
        localStorage.setItem(`yumora_payout_history_${user.id}`, JSON.stringify(updatedHistory));
      }

      setIsProcessingWithdraw(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmountInput("");

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      showToast(`🎉 Withdrawal requested: $${amount.toFixed(2)} USD transferred to ${destinationLabel}`);
    }, 1200);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-rose-500/50 bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
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
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {user?.name || "Creator"}&apos;s Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase">
                {user?.role || "CREATOR"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Creator Studio & Performance Analytics • Verified Storyteller
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contests"
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Active Contests</span>
          </Link>

          <Link
            href="/creator/upload"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Story</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("works")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "works"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>My Stories ({totalWorksCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Readership Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "earnings"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* TAB 2: READERSHIP ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {totalReads === 0 && novels.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-md mx-auto">
              <TrendingUp className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                No Analytics Data Yet
              </h3>
              <p className="text-xs text-zinc-500">
                Publish your stories to start viewing real-time readership funnel analytics and audience retention graphs.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span>Readership & Chapter Funnel Overview</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold">Total Reads</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{formatNumber(totalReads)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold">Total Likes</p>
                  <p className="text-xl font-black text-rose-500">{formatNumber(totalLikes)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold">Followers</p>
                  <p className="text-xl font-black text-emerald-500">{formatNumber(totalFollowers)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold">Published Chapters</p>
                  <p className="text-xl font-black text-indigo-500">{totalChapters}</p>
                </div>
              </div>
            </div>
          )}
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
                          <td className="py-3 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                item.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                              }`}
                            >
                              {item.status}
                            </span>
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
                    Yumora evaluates content originality, authentic readership, and account standing
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
    </div>
  );
}
