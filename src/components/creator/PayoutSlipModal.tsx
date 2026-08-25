"use client";

import React from "react";
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building2, Smartphone, Globe } from "lucide-react";
import { PayoutRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PayoutSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutRequest | null;
}

export function PayoutSlipModal({ isOpen, onClose, payout }: PayoutSlipModalProps) {
  if (!isOpen || !payout) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-2xl w-full rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Actions Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Official Creator Payout Slip
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-zinc-900 dark:text-zinc-100 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D91E18] flex items-center justify-center font-black text-white text-base">
                  Y.
                </div>
                <span className="font-black text-xl tracking-tight">YOMIKA</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Yomika Global Creator Royalties & Distribution Network
              </p>
              <p className="text-[10px] text-zinc-400 font-mono">https://youmika.site • support@youmika.site</p>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  payout.status === "COMPLETED" || payout.status === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : payout.status === "PENDING"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {payout.status === "COMPLETED" ? "Payment Completed" : payout.status}
              </span>
              <p className="text-xs font-mono font-bold text-zinc-500">Ref: {payout.transactionReference}</p>
              <p className="text-[11px] text-zinc-400">{formatDate(payout.requestedAt)}</p>
            </div>
          </div>

          {/* Creator Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Beneficiary Creator</p>
              <p className="font-black text-sm text-zinc-900 dark:text-white mt-0.5">{payout.creatorName}</p>
              <p className="text-zinc-500">{payout.creatorEmail}</p>
              <p className="text-zinc-400 text-[10px]">Holder: {payout.accountHolderName || payout.creatorName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payout Destination</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {payout.method === "UPI" ? (
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                ) : payout.method === "BANK" ? (
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span className="font-bold text-xs text-zinc-900 dark:text-white">{payout.method} Transfer</span>
              </div>
              <p className="font-mono text-zinc-600 dark:text-zinc-300 text-[11px] mt-0.5">{payout.details}</p>
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <div className="space-y-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[10px] uppercase">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Amount (INR)</th>
                  <th className="pb-2 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                <tr>
                  <td className="py-3 font-medium">Story Royalties & Fan Tips Earnings Withdrawal</td>
                  <td className="py-3 text-right font-mono font-bold">₹{payout.amountInr.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-right font-mono font-bold">${payout.amountUsd.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-zinc-500">Platform Gateway Fee (Yomika 0% Promotion)</td>
                  <td className="py-2 text-right font-mono text-emerald-500">₹0.00</td>
                  <td className="py-2 text-right font-mono text-emerald-500">$0.00</td>
                </tr>
                <tr>
                  <td className="py-2 text-zinc-500">Withholding Tax / Processing Deduction</td>
                  <td className="py-2 text-right font-mono text-zinc-500">₹0.00</td>
                  <td className="py-2 text-right font-mono text-zinc-500">$0.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-300 dark:border-zinc-700">
                  <th className="pt-3 text-sm font-black">Net Transfer Amount</th>
                  <th className="pt-3 text-right text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{payout.amountInr.toLocaleString("en-IN")}
                  </th>
                  <th className="pt-3 text-right text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ${payout.amountUsd.toFixed(2)} USD
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Seal & Security Notice */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Certified Yomika Creator Royalty Dispatch</span>
            </div>
            <div className="text-right font-mono text-[10px] text-zinc-400">
              Slip ID: {payout.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
