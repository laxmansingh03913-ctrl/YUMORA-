"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Coins,
  Sparkles,
  X,
  CheckCircle2,
  Zap,
  ShieldCheck,
  CreditCard,
  Loader2,
  Crown,
  Gift,
} from "lucide-react";
import { dataStore, COIN_PACKAGES } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { CoinPackage } from "@/lib/types";

interface CoinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsUpdated?: (newBalance: number) => void;
}

export function CoinShopModal({ isOpen, onClose, onCoinsUpdated }: CoinShopModalProps) {
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<CoinPackage>(COIN_PACKAGES[1] || COIN_PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = user ? dataStore.getUserCoins(user.id) : 0;

  const handlePurchase = async () => {
    if (!user) return;
    setIsProcessing(true);

    // Simulate secure payment gateway transaction
    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalCoinsToAdd = selectedPack.coins + (selectedPack.bonusCoins || 0);
    const newBalance = dataStore.addCoins(user.id, totalCoinsToAdd);

    // Record notification
    dataStore.addNotification({
      id: `notif-topup-${Date.now()}`,
      userId: user.id,
      creatorName: "Yumora Treasury",
      creatorAvatar: "/hero-character.png",
      title: `🪙 +${totalCoinsToAdd.toLocaleString()} Coins Added!`,
      message: `Successfully purchased ${selectedPack.label} for $${selectedPack.priceUsd}. Your new balance is ${newBalance.toLocaleString()} Coins.`,
      contentUrl: "/library",
      type: "SYSTEM",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setIsProcessing(false);
    setSuccessMessage(`+${totalCoinsToAdd.toLocaleString()} Coins added to your wallet!`);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in non-browser environments
    }

    if (onCoinsUpdated) {
      onCoinsUpdated(newBalance);
    }

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="max-w-lg w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Yumora Coin Treasury</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-zinc-500">
                Support your favorite creators, tip chapters & unlock perks
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

        {/* Current Wallet Balance Strip */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Your Current Balance:
            </span>
          </div>
          <span className="font-black text-sm text-amber-600 dark:text-amber-400 font-mono">
            {currentCoins.toLocaleString()} Coins
          </span>
        </div>

        {/* Package Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Coin Package
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COIN_PACKAGES.map((pkg) => {
              const isSelected = selectedPack.id === pkg.id;
              const totalCoins = pkg.coins + (pkg.bonusCoins || 0);

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPack(pkg)}
                  className={`p-4 rounded-2xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="space-y-1">
                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {pkg.label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                        {totalCoins.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">Coins</span>
                      {pkg.bonusCoins > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          (+{pkg.bonusCoins} free)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      ${pkg.priceUsd}
                    </span>
                    <span className="text-[10px] text-zinc-400">₹{pkg.priceInr}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Benefits Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>100% Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Instant Coin Delivery</span>
          </div>
        </div>

        {/* Purchase Action Button */}
        <div className="space-y-2 pt-2">
          {successMessage ? (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:opacity-95 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>
                    Get {selectedPack.coins + (selectedPack.bonusCoins || 0)} Coins for ${selectedPack.priceUsd}
                  </span>
                </>
              )}
            </button>
          )}

          <p className="text-[10px] text-center text-zinc-400">
            Coins are virtual tokens used to support creators and unlock premium story perks.
          </p>
        </div>
      </div>
    </div>
  );
}
