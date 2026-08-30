"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Wallet,
  Users,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Printer,
  Smartphone,
  Building2,
  Globe,
  Sparkles,
  Search,
  Filter,
  Check,
  Award,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { useAuth, isMasterAdmin, MASTER_ADMIN_EMAIL } from "@/context/AuthContext";
import { emailService } from "@/lib/email/service";
import { PayoutRequest, UserProfile } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/utils";
import { PayoutSlipModal } from "@/components/creator/PayoutSlipModal";
import { EmailNotificationTester } from "@/components/creator/EmailNotificationTester";
import { Lock, KeyRound, LogOut, Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const [adminTab, setAdminTab] = useState<"overview" | "payouts" | "users" | "emails">("overview");
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  
  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [realStats, setRealStats] = useState<{
    totalNovels: number;
    totalComics: number;
    totalStories: number;
    totalReaders: number;
    totalCreators: number;
    totalUsers: number;
    totalReads: number;
    pendingPayoutsCount: number;
    totalPendingPayoutAmount: number;
  } | null>(null);

  // Admin Gate State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminSessionVerified, setAdminSessionVerified] = useState(false);

  const isAdminAuthenticated = Boolean(
    adminSessionVerified || (user && isMasterAdmin(user.email))
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    const cleanInputEmail = adminEmail.trim().toLowerCase();

    if (adminPassword.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      setIsAuthenticating(false);
      return;
    }

    // Authenticate Master Admin credentials via secure server-side endpoint
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanInputEmail,
          password: adminPassword,
          mfaCode: mfaCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid administrator credentials. Access denied.");
        setIsAuthenticating(false);
        return;
      }

      // Clear password from memory immediately
      setAdminPassword("");
      setMfaCode("");
      setAdminSessionVerified(true);
      setIsAuthenticating(false);
      await loadData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to reach authentication server.");
      setIsAuthenticating(false);
    }
  };

  const loadData = async () => {
    try {
      const [payoutsRes, statsRes] = await Promise.all([
        fetch("/api/admin/payouts"),
        fetch("/api/admin/stats"),
      ]);

      const payoutsData = await payoutsRes.json();
      if (payoutsRes.ok && payoutsData.success && Array.isArray(payoutsData.payouts)) {
        setPayouts(payoutsData.payouts);
      } else {
        setPayouts([]);
      }

      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success && statsData.stats) {
        setRealStats(statsData.stats);
      }
    } catch (err) {
      console.warn("[ADMIN LOAD DATA ERROR]", err);
      setPayouts([]);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${usersPage}&limit=10&search=${encodeURIComponent(usersSearch)}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        setUsersCount(data.total);
      }
    } catch (err) {
      console.warn("[ADMIN LOAD USERS ERROR]", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && adminTab === "users") {
      loadUsers();
    }
  }, [usersPage, usersSearch, adminTab, isAdminAuthenticated]);

  const handleUpdateUser = async (targetUserId: string, updates: any) => {
    setUpdatingUserId(targetUserId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, updates }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(data.message || "User settings updated successfully.");
        setTimeout(() => setActionSuccessMsg(null), 4500);
        await loadUsers();
      } else {
        alert(data.error || "Failed to update user settings.");
      }
    } catch (e: any) {
      alert(e.message || "Failed to update user.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // If not master admin, render Admin Security Login Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Ambient Shimmer */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-rose-600/30 to-indigo-600/30 blur-3xl pointer-events-none" />

          {/* Shield Icon Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500/20 via-zinc-800 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <Shield className="w-8 h-8 text-[#D91E18]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D91E18] animate-pulse" />
                <span className="text-[10px] font-black text-[#D91E18] uppercase tracking-widest">
                  RESTRICTED PORTAL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Master Admin Access Only
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                Authorized access only for designated administrator.
              </p>
            </div>
          </div>

          {/* Currently logged in as non-admin warning */}
          {user && !isMasterAdmin(user.email) && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Signed in as @{user.username} ({user.email})</span>
              </p>
              <p className="text-[11px] text-amber-500/80">
                This account is not authorized as Master Admin. Please sign in with your admin credentials.
              </p>
              <button
                type="button"
                onClick={() => logout()}
                className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out current account</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Authorized Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@yomika.site"
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#D91E18] transition font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Master Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#D91E18] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  MFA / 2FA Security Code
                </label>
                <span className="text-[10px] text-zinc-500 font-medium">Optional / If enabled</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit authenticator code"
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#D91E18] transition font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/30 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock Admin Operations</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium transition"
            >
              ← Return to Yomika Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");
  const totalPendingAmount = pendingPayouts.reduce((a, b) => a + b.amountInr, 0);
  const completedPayouts = payouts.filter((p) => p.status === "COMPLETED");
  const totalDistributedAmount = completedPayouts.reduce((a, b) => a + b.amountInr, 0);

  const handleApprovePayout = async (payout: PayoutRequest) => {
    const txRef = `TXN-YOM-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payout.id,
          status: "COMPLETED",
          transactionRef: txRef,
          note: "Approved by Platform Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server rejected payout approval.");
      }

      await loadData();

      // Auto-dispatch email confirmation to creator
      await emailService.sendEmail({
        toEmail: payout.creatorEmail,
        recipientName: payout.creatorName,
        type: "BANK_WITHDRAWAL",
        data: {
          amountInr: payout.amountInr,
          payoutMethod: payout.method,
          accountDetails: payout.details,
          transactionId: txRef,
        },
      });

      setActionSuccessMsg(`Payout of ₹${payout.amountInr.toLocaleString()} approved for ${payout.creatorName} and receipt emailed.`);
      setTimeout(() => setActionSuccessMsg(null), 4500);
    } catch (e: any) {
      alert(e.message || "Failed to process payout approval.");
    }
  };

  const handleRejectPayout = async (payout: PayoutRequest) => {
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payout.id,
          status: "REJECTED",
          note: "Bank account details verification failed",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server rejected payout rejection.");
      }

      await loadData();
      setActionSuccessMsg(`Payout request rejected for ${payout.creatorName}.`);
      setTimeout(() => setActionSuccessMsg(null), 4500);
    } catch (e: any) {
      alert(e.message || "Failed to reject payout request.");
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D91E18] animate-pulse" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              ADMIN CONTROL CENTER • 管理者
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white tracking-tight">
            Platform Operations & Royalties Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage creator payouts, verify monetization eligibility, and review story analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">{user?.email}</span>
          </div>

          <Link
            href="/creator"
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition"
          >
            Creator Studio →
          </Link>

          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition cursor-pointer"
            title="Sign Out Master Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. Core Analytics Cards (Overview Tab Only) */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
                <Wallet className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-500 font-mono">
                ₹{totalPendingAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                {pendingPayouts.length} creator requests in queue
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Royalties Paid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-500 font-mono">
                ₹{totalDistributedAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                {completedPayouts.length} successful disbursements
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Stories</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                {realStats ? `${realStats.totalStories} Works` : "—"}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                {realStats
                  ? `${realStats.totalNovels} Novels • ${realStats.totalComics} Comics`
                  : "Loading..."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Reads</span>
                <TrendingUp className="w-4 h-4 text-[#D91E18]" />
              </div>
              <p className="text-2xl font-black text-[#D91E18] font-mono">
                {realStats ? formatNumber(realStats.totalReads) : "—"}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                {realStats
                  ? `${realStats.totalCreators} Creators • ${realStats.totalReaders} Readers`
                  : "Loading..."}
              </p>
            </div>
          </div>

          {/* Platform Health and Quick System Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D91E18]" />
                <span>Security & Admin Status</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Platform Owner Email</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-200 font-bold">{MASTER_ADMIN_EMAIL}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Session Verification Level</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase">
                    HMAC Crypto Signed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Role Hijack Prevention</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D91E18]/10 text-[#D91E18] font-bold text-[10px] uppercase animate-pulse">
                    Strict Demotion Active
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Actions</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-center">
                <button
                  onClick={() => setAdminTab("payouts")}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#D91E18] transition text-zinc-700 dark:text-zinc-300"
                >
                  <Wallet className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
                  <span>Approve Payouts</span>
                </button>
                <button
                  onClick={() => setAdminTab("users")}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#D91E18] transition text-zinc-700 dark:text-zinc-300"
                >
                  <Users className="w-5 h-5 mx-auto mb-1.5 text-indigo-500" />
                  <span>Manage Users</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setAdminTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${adminTab === "overview"
              ? "bg-[#D91E18] text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setAdminTab("payouts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${adminTab === "payouts"
              ? "bg-[#D91E18] text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Creator Payouts Queue ({pendingPayouts.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${adminTab === "users"
              ? "bg-[#D91E18] text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
        </button>

        <button
          onClick={() => setAdminTab("emails")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${adminTab === "emails"
              ? "bg-[#D91E18] text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email & Dispatch Engine</span>
        </button>
      </div>

      {/* 2. Payout Requests Approval Queue */}
      {adminTab === "payouts" && (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Creator Payout & Withdrawal Queue
                </h3>
                <p className="text-xs text-zinc-500">
                  Verify UPI / Bank transfers, approve payments, and generate official receipts
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
              {(["ALL", "PENDING", "COMPLETED", "REJECTED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg transition ${filterStatus === s
                      ? "bg-[#D91E18] text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="pb-3">Creator / Beneficiary</th>
                  <th className="pb-3">Amount (INR / USD)</th>
                  <th className="pb-3">Payout Method & Details</th>
                  <th className="pb-3">Requested Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-medium">
                      {filterStatus === "PENDING" || filterStatus === "ALL" && payouts.length === 0
                        ? "No pending payouts in queue."
                        : "No payout requests found for this filter."}
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                      <td className="py-3.5">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{payout.creatorName}</p>
                        <p className="text-zinc-400 text-[11px]">{payout.creatorEmail}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{payout.amountInr.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-zinc-400">${payout.amountUsd.toFixed(2)} USD</p>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                          {payout.method === "UPI" ? (
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                          ) : payout.method === "BANK" ? (
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          <span>{payout.method}</span>
                        </div>
                        <p className="font-mono text-[11px] text-zinc-500 truncate max-w-xs">{payout.details}</p>
                      </td>
                      <td className="py-3.5 text-zinc-500">{formatDate(payout.requestedAt)}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${payout.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : payout.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayout(payout);
                            setIsSlipOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                          title="View & Print Payout Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {payout.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprovePayout(payout)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition shadow-xs cursor-pointer"
                            >
                              Approve & Transfer
                            </button>
                            <button
                              onClick={() => handleRejectPayout(payout)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. User Moderation Tab */}
      {adminTab === "users" && (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  User Account Moderation & Profiles
                </h3>
                <p className="text-xs text-zinc-500">
                  Search registered users, toggle verification statuses, update roles, or suspend access
                </p>
              </div>
            </div>

            {/* Search input */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search email, username, name..."
                value={usersSearch}
                onChange={(e) => {
                  setUsersSearch(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs focus:outline-none focus:border-[#D91E18] transition text-zinc-900 dark:text-zinc-100"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* User Directory Table */}
          {usersLoading ? (
            <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#D91E18]" />
              <span className="text-xs">Fetching users from directory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">User Profile</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Platform Role</th>
                    <th className="pb-3">Status Flags</th>
                    <th className="pb-3">Registration Date</th>
                    <th className="pb-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-medium">
                        No users matching query found.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                        <td className="py-3.5">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{item.name || "Unnamed User"}</p>
                          <p className="text-zinc-400 text-[11px]">@{item.username || "username"}</p>
                        </td>
                        <td className="py-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                          {item.email}
                        </td>
                        <td className="py-3.5">
                          <select
                            value={item.role || "READER"}
                            disabled={updatingUserId === item.id || isMasterAdmin(item.email)}
                            onChange={(e) => handleUpdateUser(item.id, { role: e.target.value })}
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none"
                          >
                            <option value="READER">READER</option>
                            <option value="CREATOR">CREATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3.5 space-x-1.5 font-bold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] uppercase ${item.is_email_verified || item.isVerified
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-zinc-500/10 text-zinc-500"
                              }`}
                          >
                            {(item.is_email_verified || item.isVerified) ? "VERIFIED" : "UNVERIFIED"}
                          </span>
                          {item.is_banned && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] uppercase">
                              SUSPENDED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-zinc-500">
                          {formatDate(item.created_at || item.createdAt)}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateUser(item.id, { isVerified: !(item.is_email_verified || item.isVerified) })}
                            disabled={updatingUserId === item.id || isMasterAdmin(item.email)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-250 dark:border-zinc-700 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition font-medium text-[11px] disabled:opacity-50"
                          >
                            {(item.is_email_verified || item.isVerified) ? "Revoke Verification" : "Verify User"}
                          </button>
                          <button
                            onClick={() => handleUpdateUser(item.id, { isBanned: !item.is_banned })}
                            disabled={updatingUserId === item.id || isMasterAdmin(item.email)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition disabled:opacity-50 ${item.is_banned
                                ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                                : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                              }`}
                          >
                            {item.is_banned ? "Reactivate Account" : "Suspend Access"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              {usersCount > 10 && (
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4">
                  <span className="text-zinc-500 text-xs">
                    Showing {(usersPage - 1) * 10 + 1} - {Math.min(usersPage * 10, usersCount)} of {usersCount} users
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUsersPage((prev) => Math.max(prev - 1, 1))}
                      disabled={usersPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-750 text-xs font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition disabled:opacity-40"
                    >
                      Previous Page
                    </button>
                    <button
                      onClick={() => setUsersPage((prev) => Math.min(prev + 1, Math.ceil(usersCount / 10)))}
                      disabled={usersPage >= Math.ceil(usersCount / 10)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-750 text-xs font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition disabled:opacity-40"
                    >
                      Next Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. System Email & Dispatch Engine (Admin Exclusive) */}
      {adminTab === "emails" && (
        <div className="space-y-6">
          <EmailNotificationTester />
        </div>
      )}

      {/* Payout Slip Modal */}
      <PayoutSlipModal
        isOpen={isSlipOpen}
        onClose={() => {
          setIsSlipOpen(false);
          setSelectedPayout(null);
        }}
        payout={selectedPayout}
      />
    </div>
  );
}
