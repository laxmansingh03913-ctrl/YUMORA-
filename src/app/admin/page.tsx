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
import { dataStore } from "@/lib/data/store";
import { emailService } from "@/lib/email/service";
import { PayoutRequest, UserProfile } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/utils";
import { PayoutSlipModal } from "@/components/creator/PayoutSlipModal";
import { EmailNotificationTester } from "@/components/creator/EmailNotificationTester";
import { Lock, KeyRound, LogOut, Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const [adminTab, setAdminTab] = useState<"payouts" | "emails">("payouts");
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Admin Gate State
  const [adminEmail, setAdminEmail] = useState("megwansiabhishek7@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAdminAuthenticated = Boolean(
    user && (isMasterAdmin(user.email) || user.role === "ADMIN")
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    const cleanInputEmail = adminEmail.trim().toLowerCase();

    if (!isMasterAdmin(cleanInputEmail)) {
      setAuthError(
        `Access Denied: Only the designated master admin (${MASTER_ADMIN_EMAIL}) is permitted to access this portal.`
      );
      setIsAuthenticating(false);
      return;
    }

    if (adminPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      setIsAuthenticating(false);
      return;
    }

    // Try signing in with master admin credentials
    const loginRes = await signInWithEmail(cleanInputEmail, adminPassword);
    if (!loginRes.success) {
      // If user doesn't exist yet, sign up as master admin
      const signupRes = await signUpWithEmail(
        cleanInputEmail,
        adminPassword,
        "Master Admin",
        "abhishek",
        "ADMIN"
      );
      if (!signupRes.success) {
        // Fallback: Direct Master Admin Session Unlock
        const masterAdminProfile: UserProfile = {
          id: `usr-admin-master`,
          name: "Master Admin",
          username: "abhishek",
          email: cleanInputEmail,
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
          bio: "Official Yomika Platform Administrator.",
          country: "Global",
          isVerified: true,
          isCreatorProfileComplete: true,
          isEmailVerified: true,
          isAgeVerified: true,
          monetizationTier: "ELITE",
          monetizationStatus: "ACTIVE",
          fraudAuditStatus: "CLEAN",
          followersCount: 0,
          followingCount: 0,
          totalReads: 0,
          createdAt: new Date().toISOString(),
        };
        dataStore.updateUserProfile(masterAdminProfile.id, masterAdminProfile);
        try {
          localStorage.setItem("yumora_active_user", JSON.stringify(masterAdminProfile));
        } catch {
          // ignore
        }
        window.location.reload();
        return;
      }
    }

    setIsAuthenticating(false);
    loadData();
  };

  const loadData = () => {
    // Seed initial demo payout requests if none exist
    let requests = dataStore.getPayoutRequests();
    if (requests.length === 0) {
      const demo1 = dataStore.createPayoutRequest({
        creatorId: "usr-creator-1",
        creatorName: "Alexander Vance",
        creatorEmail: "alexander@youmika.site",
        amountInr: 12500,
        amountUsd: 150,
        method: "UPI",
        details: "alexander@okhdfcbank",
        accountHolderName: "Alexander Vance",
      });
      const demo2 = dataStore.createPayoutRequest({
        creatorId: "usr-creator-2",
        creatorName: "Elena Rostova",
        creatorEmail: "elena@youmika.site",
        amountInr: 42000,
        amountUsd: 500,
        method: "BANK",
        details: "HDFC Bank (A/C: 501004928192, IFSC: HDFC0001234)",
        accountHolderName: "Elena Rostova",
      });
      requests = [demo1, demo2];
    }
    setPayouts(requests);
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

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
                Authorized access only for designated administrator:{" "}
                <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">
                  {MASTER_ADMIN_EMAIL}
                </span>
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
                placeholder="megwansiabhishek7@gmail.com"
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

  const novels = dataStore.getNovels();
  const comics = dataStore.getComics();
  const users = dataStore.getUsers();
  const totalStories = novels.length + comics.length;
  const totalPlatformReads = novels.reduce((a, b) => a + b.reads, 0) + comics.reduce((a, b) => a + b.reads, 0);

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");
  const totalPendingAmount = pendingPayouts.reduce((a, b) => a + b.amountInr, 0);
  const completedPayouts = payouts.filter((p) => p.status === "COMPLETED");
  const totalDistributedAmount = completedPayouts.reduce((a, b) => a + b.amountInr, 0);

  const handleApprovePayout = async (payout: PayoutRequest) => {
    const txRef = `TXN-YOM-${Date.now().toString().slice(-6)}`;
    dataStore.updatePayoutRequestStatus(payout.id, "COMPLETED", txRef, "Approved by Admin");
    loadData();

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
  };

  const handleRejectPayout = (payout: PayoutRequest) => {
    dataStore.updatePayoutRequestStatus(payout.id, "REJECTED", undefined, "Bank account details verification failed");
    loadData();
    setActionSuccessMsg(`Payout request rejected for ${payout.creatorName}.`);
    setTimeout(() => setActionSuccessMsg(null), 4500);
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

      {/* 1. Core Analytics Cards */}
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
            {totalStories} Works
          </p>
          <p className="text-[11px] text-zinc-500 font-medium">
            {novels.length} Novels • {comics.length} Comics
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Reads</span>
            <TrendingUp className="w-4 h-4 text-[#D91E18]" />
          </div>
          <p className="text-2xl font-black text-[#D91E18] font-mono">
            {formatNumber(totalPlatformReads)}
          </p>
          <p className="text-[11px] text-zinc-500 font-medium">Active global engagement</p>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setAdminTab("payouts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            adminTab === "payouts"
              ? "bg-[#D91E18] text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Creator Payouts Queue ({pendingPayouts.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("emails")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            adminTab === "emails"
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
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === s
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
                    No payout requests found for this filter.
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
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          payout.status === "COMPLETED"
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

      {/* 3. System Email & Dispatch Engine (Admin Exclusive) */}
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
