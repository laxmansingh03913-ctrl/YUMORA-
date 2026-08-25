"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Eye, Sparkles, Trophy, Gift, BookOpen, CreditCard } from "lucide-react";
import { emailService, EmailNotificationPayload } from "@/lib/email/service";

export function EmailNotificationTester() {
  const [templateType, setTemplateType] = useState<EmailNotificationPayload["type"]>("TOURNAMENT_WIN");
  const [toEmail, setToEmail] = useState("creator@youmika.site");
  const [recipientName, setRecipientName] = useState("Alexander Vance");
  const [storyTitle, setStoryTitle] = useState("Bound by Blood");
  const [amountInr, setAmountInr] = useState(42000);
  const [coinsAmount, setCoinsAmount] = useState(500);
  const [fanMessage, setFanMessage] = useState("Amazing chapter! Keep up the brilliant work!");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; simulated?: boolean } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const currentPayload: EmailNotificationPayload = {
    toEmail,
    recipientName,
    type: templateType,
    data: {
      amountInr,
      amountUsd: Math.round(amountInr / 83),
      contestTitle: "Yomika Sci-Fi & Fantasy Tournament",
      rank: 1,
      storyTitle,
      senderName: "Sakura_Reader99",
      coinsAmount,
      fanMessage,
      chapterNumber: 24,
      chapterTitle: "The Eclipse Protocol",
      payoutMethod: "UPI",
      accountDetails: "creator@okhdfcbank",
      transactionId: `YOM-${Date.now().toString().slice(-6)}`,
    },
  };

  const getHtmlPreview = () => {
    switch (templateType) {
      case "TOURNAMENT_WIN":
        return emailService.generateTournamentWinHtml(currentPayload);
      case "FAN_TIP":
        return emailService.generateFanTipHtml(currentPayload);
      case "CHAPTER_PUBLISHED":
        return emailService.generateChapterPublishedHtml(currentPayload);
      case "BANK_WITHDRAWAL":
        return emailService.generatePayoutHtml(currentPayload);
      case "WELCOME":
        return emailService.generateWelcomeHtml(currentPayload);
      default:
        return "<p>No preview</p>";
    }
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await emailService.sendEmail(currentPayload);
      setResult({
        success: res.success,
        message: res.simulated
          ? `Simulated Dispatch Successful! (Message ID: ${res.messageId})`
          : `Live Email Dispatched via Resend! (ID: ${res.messageId})`,
        simulated: res.simulated,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch email";
      setResult({
        success: false,
        message: msg,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D91E18]/10 text-[#D91E18] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Automated Email Dispatch Engine
            </h3>
            <p className="text-xs text-zinc-500">
              Live Resend API delivery & high-conversion transactional email templates
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition"
        >
          <Eye className="w-4 h-4" />
          <span>{showPreview ? "Hide HTML Preview" : "Live HTML Preview"}</span>
        </button>
      </div>

      {/* Template Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Select Email Notification Template
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { type: "TOURNAMENT_WIN", label: "Tournament Win", icon: Trophy },
            { type: "FAN_TIP", label: "Fan Coin Tip", icon: Gift },
            { type: "CHAPTER_PUBLISHED", label: "Chapter Release", icon: BookOpen },
            { type: "BANK_WITHDRAWAL", label: "Creator Payout", icon: CreditCard },
            { type: "WELCOME", label: "Welcome User", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = templateType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => setTemplateType(item.type as EmailNotificationPayload["type"])}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition text-left ${
                  isSelected
                    ? "bg-[#D91E18] text-white border-[#D91E18] shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Recipient Email</label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#D91E18]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Recipient Name</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#D91E18]"
          />
        </div>

        {templateType === "TOURNAMENT_WIN" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Prize Amount (INR)</label>
            <input
              type="number"
              value={amountInr}
              onChange={(e) => setAmountInr(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#D91E18]"
            />
          </div>
        )}

        {templateType === "FAN_TIP" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Tip Coins Amount</label>
            <input
              type="number"
              value={coinsAmount}
              onChange={(e) => setCoinsAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#D91E18]"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Story Title</label>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#D91E18]"
          />
        </div>
      </div>

      {/* Action Button & Status Feedback */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs transition shadow-sm disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{sending ? "Dispatching..." : "Send Test Notification"}</span>
        </button>

        {result && (
          <div
            className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl ${
              result.success
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            }`}
          >
            {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{result.message}</span>
          </div>
        )}
      </div>

      {/* Live HTML Preview IFrame */}
      {showPreview && (
        <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Responsive Email HTML Render</span>
            <span className="text-[10px] uppercase font-mono">600px Standard Container</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#09090b] p-4 overflow-hidden">
            <iframe
              srcDoc={getHtmlPreview()}
              title="Email Template Live Preview"
              className="w-full h-96 border-0 rounded-xl bg-[#09090b]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
