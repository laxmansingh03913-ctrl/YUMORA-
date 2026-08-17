"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  Users,
  Flame,
  ArrowRight,
  Vote,
  Star,
  BookOpen,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { formatNumber } from "@/lib/utils";

export default function ContestsPage() {
  const contests = dataStore.getContests();
  const contest = contests[0];
  const novels = dataStore.getNovels();

  const [votes, setVotes] = useState<Record<string, number>>({
    "novel-1": 342,
    "novel-2": 289,
    "novel-3": 241,
    "novel-4": 185,
  });
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedNovelId, setSelectedNovelId] = useState(novels[0]?.id || "");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleVote = (novelId: string) => {
    if (votedIds.includes(novelId)) return;
    setVotes((prev) => ({ ...prev, [novelId]: (prev[novelId] || 0) + 1 }));
    setVotedIds((prev) => [...prev, novelId]);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsSubmitModalOpen(false);
      setIsSubmitted(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO CONTEST BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-950 border border-amber-500/40 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-zinc-950 shadow-md flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> OFFICIAL YUMORA CHALLENGE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300">
                Active Competition
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {contest.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {contest.description}
            </p>

            {/* Prize Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-center">
                <p className="text-[11px] font-bold text-amber-400">1st Place</p>
                <p className="text-xl font-black text-white">$500 USD</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Adaptation Review</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                <p className="text-[11px] font-bold text-zinc-300">2nd Place</p>
                <p className="text-xl font-black text-white">$200 USD</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Verified Badge</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                <p className="text-[11px] font-bold text-zinc-300">3rd Place</p>
                <p className="text-xl font-black text-white">$100 USD</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Homepage Feature</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-rose-500/30 text-center">
                <p className="text-[11px] font-bold text-rose-400">Community Choice</p>
                <p className="text-xl font-black text-white">$50 USD</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Most Reader Votes</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
            <div className="p-5 rounded-3xl bg-zinc-900/95 border border-zinc-800 text-center w-full max-w-xs space-y-2">
              <p className="text-[11px] uppercase font-bold text-zinc-400">Submission Window</p>
              <p className="text-2xl font-black text-white">Open Now</p>
              <p className="text-xs text-amber-400 font-semibold">Ends March 31, 2026</p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-zinc-950 font-black text-sm text-center shadow-xl shadow-amber-500/20 transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Story Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RULES & JUDGING CRITERIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Eligibility & Rules</span>
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            {contest.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Scoring & Judging Matrix</span>
          </h3>
          <div className="space-y-3">
            {contest.judgingCriteria.map((crit) => (
              <div key={crit.title} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <span>{crit.title}</span>
                  <span className="text-amber-500">{crit.weight}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{crit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONTEST SUBMISSIONS & LEADERBOARD */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Flame className="w-6 h-6 text-rose-500" />
              <span>Current Submissions & Live Leaderboard</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Cast your daily community vote for your favorite stories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {novels.slice(0, 4).map((novel, index) => {
            const currentVotes = votes[novel.id] || 120;
            const hasVoted = votedIds.includes(novel.id);

            return (
              <div
                key={novel.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-sm relative group"
              >
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-black/80 text-amber-400 z-10 backdrop-blur-md">
                  RANK #{index + 1}
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 relative">
                  <img
                    src={novel.coverUrl}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                    {novel.genre}
                  </span>
                </div>

                <div className="space-y-1">
                  <Link href={`/novels/${novel.slug}`}>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition line-clamp-1">
                      {novel.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-zinc-400">By {novel.creator.name}</p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-rose-500">{currentVotes}</span>
                    <span className="text-zinc-400 text-[11px] ml-1">community votes</span>
                  </div>

                  <button
                    onClick={() => handleVote(novel.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      hasVoted
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
                    }`}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>{hasVoted ? "Voted!" : "Vote"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SUBMIT STORY ENTRY MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Submit to Challenge</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-base">Submission Confirmed!</h4>
                <p className="text-xs text-zinc-400">
                  Your story has been entered into the $1,000 Challenge leaderboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                    Select Your Published Story
                  </label>
                  <select
                    value={selectedNovelId}
                    onChange={(e) => setSelectedNovelId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold focus:outline-none focus:border-amber-500 text-zinc-200"
                  >
                    {novels.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title} ({n.chaptersCount} Chapters)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                  By submitting, you confirm that your story meets the 2+ chapter requirement and adheres to community originality standards.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold hover:bg-zinc-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-black text-xs shadow-md transition"
                  >
                    Confirm Submission
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
