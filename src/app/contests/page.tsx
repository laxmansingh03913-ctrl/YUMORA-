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
import { formatNumber, formatDate } from "@/lib/utils";

export default function ContestsPage() {
  const contests = dataStore.getContests();
  const novels = dataStore.getNovels();

  const contest = contests[0] || {
    id: "contest-monthly-active",
    title: "Yomika Monthly Story Challenge — Sci-Fi & Fantasy",
    slug: "monthly-challenge",
    description: "Write an original serialized story with captivating characters and immersive world-building. Open to all creators worldwide.",
    prizePool: "$850 USD",
    prizeStructure: [
      { place: "1st Place", reward: "$500 USD", perks: "Official Feature & Promotion" },
      { place: "2nd Place", reward: "$200 USD", perks: "Verified Creator Badge" },
      { place: "3rd Place", reward: "$100 USD", perks: "Community Spotlight" },
      { place: "Reader Choice", reward: "$50 USD", perks: "Audience Favorite Badge" },
    ],
    rules: [
      "Minimum 2 published chapters at submission time",
      "Original work owned 100% by the publishing author",
      "Submissions evaluated based on reader engagement, originality, and storytelling pace",
    ],
    judgingCriteria: [
      { title: "World-Building & Originality", weight: "35%", desc: "Rich universe rules and distinct creative premise" },
      { title: "Character Arcs & Voice", weight: "30%", desc: "Compelling motives and emotional depth" },
      { title: "Pacing & Readability", weight: "20%", desc: "Addictive hook and polished narrative flow" },
      { title: "Reader Community Engagement", weight: "15%", desc: "Comments, votes, and chapter read completion rate" },
    ],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    submissionCount: novels.length,
  };

  const [votes, setVotes] = useState<Record<string, number>>({});
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. HERO CONTEST BANNER (Neo-Japan Editorial Poster) */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-700 p-6 sm:p-10 text-[#111111] dark:text-white shadow-md">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white uppercase tracking-wider">
                OFFICIAL YOMIKA CONTEST • 公式コンテスト
              </span>
              <span className="text-xs font-bold text-[#D91E18]">
                {contest.prizePool} PRIZE POOL
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {contest.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 leading-relaxed max-w-2xl font-medium">
              {contest.description}
            </p>

            {/* Prize Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {contest.prizeStructure.map((prize) => (
                <div
                  key={prize.place}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-[#EAEAE5] dark:border-zinc-700 text-center space-y-0.5"
                >
                  <p className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">{prize.place}</p>
                  <p className="text-base font-black text-[#D91E18]">{prize.reward}</p>
                  <p className="text-[9px] text-zinc-400 truncate">{prize.perks}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
            <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-[#EAEAE5] dark:border-zinc-700 text-center w-full max-w-xs space-y-2">
              <span className="text-[10px] font-black text-[#D91E18] uppercase tracking-wider">
                SUBMISSIONS OPEN
              </span>
              <p className="text-2xl font-black text-[#111111] dark:text-white">
                {contest.submissionCount} Entries
              </p>
              <p className="text-xs text-zinc-500 font-semibold">
                Deadline: {formatDate(contest.endDate)}
              </p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full max-w-xs py-3 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider text-center shadow-xs transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Story Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RULES & JUDGING CRITERIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
            <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
            <h3 className="text-sm font-black text-[#111111] dark:text-white uppercase">
              Eligibility & Guidelines
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-[#555555] dark:text-zinc-300">
            {contest.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D91E18] mt-1.5 flex-shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
            <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
            <h3 className="text-sm font-black text-[#111111] dark:text-white uppercase">
              Scoring & Evaluation Matrix
            </h3>
          </div>
          <div className="space-y-2.5">
            {contest.judgingCriteria.map((crit) => (
              <div key={crit.title} className="space-y-0.5">
                <div className="flex justify-between text-xs font-black text-[#111111] dark:text-zinc-200">
                  <span>{crit.title}</span>
                  <span className="text-[#D91E18]">{crit.weight}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{crit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONTEST SUBMISSIONS & LEADERBOARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <h2 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white uppercase">
              Current Submissions & Live Leaderboard
            </h2>
          </div>
        </div>

        {novels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {novels.slice(0, 4).map((novel, index) => {
              const currentVotes = votes[novel.id] || 0;
              const hasVoted = votedIds.includes(novel.id);

              return (
                <div
                  key={novel.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 flex flex-col justify-between space-y-3 shadow-2xs relative group"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <img
                      src={novel.coverUrl}
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white">
                      RANK #{index + 1}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                      {novel.genre}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <Link href={`/novels/${novel.slug}`}>
                      <h4 className="font-black text-sm text-[#111111] dark:text-white group-hover:text-[#D91E18] transition line-clamp-1">
                        {novel.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-zinc-500">By {novel.creator.name}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EAEAE5] dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-black text-[#D91E18]">{currentVotes}</span>
                      <span className="text-zinc-500 text-[11px] ml-1">votes</span>
                    </div>

                    <button
                      onClick={() => handleVote(novel.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                        hasVoted
                          ? "bg-emerald-600 text-white"
                          : "bg-[#D91E18] hover:bg-[#B71813] text-white shadow-xs"
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
        ) : (
          <div className="text-center py-16 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#111111] dark:text-white">Submissions Open Now</h3>
              <p className="text-xs text-zinc-500">
                Be the first author to submit an original novel and claim 1st place!
              </p>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Story Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. SUBMIT STORY ENTRY MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 rounded-xl p-6 text-[#111111] dark:text-zinc-100 shadow-2xl space-y-4"
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
