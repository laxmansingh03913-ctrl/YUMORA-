"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Coins,
  Heart,
  Sparkles,
  X,
  CheckCircle2,
  Coffee,
  Pizza,
  Star,
  Crown,
  Send,
  Loader2,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { TipTransaction } from "@/lib/types";

interface TipCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  content?: {
    id: string;
    title: string;
    type?: "NOVEL" | "COMIC";
  };
  onOpenCoinShop?: () => void;
  onTipSent?: (amount: number) => void;
}

const TIP_TIERS = [
  {
    amount: 20,
    title: "Buy a Coffee",
    icon: Coffee,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  {
    amount: 50,
    title: "Energy Snack",
    icon: Pizza,
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  },
  {
    amount: 100,
    title: "Super Patron",
    icon: Star,
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  },
  {
    amount: 500,
    title: "Royal Sponsor",
    icon: Crown,
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
  },
];

export function TipCreatorModal({
  isOpen,
  onClose,
  creator,
  content,
  onOpenCoinShop,
  onTipSent,
}: TipCreatorModalProps) {
  const { user, openAuthModal } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = user ? dataStore.getUserCoins(user.id) : 0;
  const tipAmount = isCustom ? parseInt(customAmount) || 0 : selectedAmount;
  const hasEnoughCoins = currentCoins >= tipAmount && tipAmount > 0;

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("signup");
      return;
    }

    if (tipAmount <= 0) {
      setErrorMessage("Please select or enter a valid coin tip amount.");
      return;
    }

    if (currentCoins < tipAmount) {
      setErrorMessage(`Insufficient Coins balance. You have ${currentCoins} coins.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulate quick network confirmation
    await new Promise((resolve) => setTimeout(resolve, 600));

    const tier = TIP_TIERS.find((t) => t.amount === tipAmount);

    const transaction: TipTransaction = {
      id: `tip-${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserAvatar: user.avatar,
      toCreatorId: creator.id,
      toCreatorName: creator.name,
      contentId: content?.id,
      contentTitle: content?.title,
      amount: tipAmount,
      tierTitle: tier?.title || "Custom Tip",
      message: message.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const res = dataStore.sendTip(transaction);

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to send tip. Please try again.");
      return;
    }

    setSuccessMessage(`🎉 You sent ${tipAmount} Coins to ${creator.name}!`);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in non-browser environments
    }

    if (onTipSent) {
      onTipSent(tipAmount);
    }

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                Support Story Creator
              </h3>
              <p className="text-xs text-zinc-500">
                Directly tip & empower your favorite author
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator Info Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar || "/hero-character.png"}
              alt={creator.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-rose-500/30"
            />
            <div>
              <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {creator.name}
              </p>
              <p className="text-[11px] text-zinc-400">@{creator.username}</p>
            </div>
          </div>

          {content && (
            <span className="px-2 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-bold truncate max-w-[120px]">
              {content.title}
            </span>
          )}
        </div>

        {/* Wallet Balance Strip with Top-Up Trigger */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Balance:</span>
            <span className="font-black text-zinc-900 dark:text-zinc-100">
              {currentCoins.toLocaleString()} Coins
            </span>
          </div>

          {onOpenCoinShop && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCoinShop();
              }}
              className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Get Coins</span>
            </button>
          )}
        </div>

        {/* Preset Tip Tier Grid */}
        <form onSubmit={handleSendTip} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Select Tip Amount
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIP_TIERS.map((tier) => {
                const isSelected = !isCustom && selectedAmount === tier.amount;
                const Icon = tier.icon;

                return (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedAmount(tier.amount);
                    }}
                    className={`p-3 rounded-2xl text-left border transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0 ${tier.badgeColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-zinc-900 dark:text-zinc-100">
                        {tier.amount} Coins
                      </p>
                      <p className="text-[10px] text-zinc-400">{tier.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Button / Input Toggle */}
            <div className="pt-1">
              {!isCustom ? (
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className="w-full py-2 rounded-xl text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 transition cursor-pointer"
                >
                  + Custom Amount
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter coins (e.g. 250)..."
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-rose-500 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      autoFocus
                    />
                    <Coins className="w-4 h-4 text-amber-500 absolute right-3 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setCustomAmount("");
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Encouragement Message Note */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Personal Encouragement Note (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Loved the plot twist in Chapter 3! Keep going!"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Error / Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Box */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          {!successMessage && (
            <button
              type="submit"
              disabled={isSubmitting || !hasEnoughCoins}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Tip...</span>
                </>
              ) : !hasEnoughCoins ? (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Not Enough Coins ({tipAmount} Needed)</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Tip {tipAmount} Coins to {creator.name.split(" ")[0]}</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
