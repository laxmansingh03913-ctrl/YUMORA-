"use client";

import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { ContentType, ReportItem } from "@/lib/types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  creatorName: string;
}

export function ReportModal({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  contentType,
  creatorName,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportItem["reason"]>("Copyright Infringement");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.addReport({
      id: `rep-${Date.now()}`,
      reporterName: "Community Member",
      contentId,
      contentTitle,
      contentType,
      creatorName,
      reason,
      description,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription("");
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Report Story</h3>
              <p className="text-[11px] text-zinc-400">Yomika Trust & Safety Moderation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-zinc-100">Report Submitted</h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Our moderation editorial panel will review &ldquo;{contentTitle}&rdquo; according to our community standards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Target Story
              </label>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                <span className="font-medium truncate">{contentTitle}</span>
                <span className="text-zinc-500 text-[11px]">by {creatorName}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Violation Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportItem["reason"])}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Copyright Infringement">Copyright Infringement / Plagiarism</option>
                <option value="Inappropriate / NSFW">Inappropriate / Unmarked NSFW</option>
                <option value="Hate Speech">Hate Speech / Harassment</option>
                <option value="Spam / Scam">Spam / Deceptive Content</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Details & Evidence (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide timestamps, chapters, or original source links..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-rose-500 placeholder-zinc-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 transition"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
