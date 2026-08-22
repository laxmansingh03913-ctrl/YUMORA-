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
  Clock,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { formatNumber, formatDate } from "@/lib/utils";

const SEEDED_CONTENDERS = [
  {
    id: "contender-1",
    title: "Shadow's Ascent",
    slug: "shadows-ascent",
    author: "@ryu_writer",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    genre: "Action / Martial Arts",
    chaptersCount: 14,
    rating: 4.9,
    votes: 428,
  },
  {
    id: "contender-2",
    title: "The Last Star",
    slug: "bound-by-blood",
    author: "@solar_kai",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    genre: "Sci-Fi / Cyberpunk",
    chaptersCount: 12,
    rating: 4.8,
    votes: 382,
  },
  {
    id: "contender-3",
    title: "Path of the Wind",
    slug: "path-of-the-wind",
    author: "@kenji_tales",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    genre: "Wuxia / Fantasy",
    chaptersCount: 9,
    rating: 4.7,
    votes: 294,
  },
  {
    id: "contender-4",
    title: "Blood Moon Chronicles",
    slug: "letters-unsent",
    author: "@elena_dark",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    genre: "Dark Fantasy",
    chaptersCount: 8,
    rating: 4.7,
    votes: 215,
  },
  {
    id: "contender-5",
    title: "Re:Awakening 2099",
    slug: "re-awakening",
    author: "@neo_story",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    genre: "Sci-Fi / Mecha",
    chaptersCount: 6,
    rating: 4.6,
    votes: 189,
  },
];

export default function ContestsPage() {
  const { user, requireAuth } = useAuth();
  const contests = dataStore.getContests();
  const novels = dataStore.getNovels();

  const contest = contests[0] || {
    id: "contest-monthly-active",
    title: "Yomika Monthly Story Challenge — Sci-Fi & Fantasy",
    slug: "monthly-challenge",
    description: "Write an original serialized story with captivating characters, adrenaline-fueled pacing, and immersive world-building. Open to all creators worldwide.",
    prizePool: "$850 USD",
    prizeStructure: [
      { place: "Grand Prize", reward: "$500 USD", desc: "Official Feature & Publishing Review" },
      { place: "Runner Up", reward: "$200 USD", desc: "Verified Badge & Banner Spotlight" },
      { place: "3rd Place", reward: "$100 USD", desc: "Community Spotlight & Verified Badge" },
      { place: "Reader Choice", reward: "$50 USD", desc: "Audience Favorite Badge & Promo" },
    ],
    rules: [
      "Minimum 2 published chapters at submission time",
      "Original work owned 100% by the publishing author",
      "Submissions evaluated based on reader engagement, originality, and storytelling pace",
      "No plagiarized content or unauthorized intellectual property",
    ],
    judgingCriteria: [
      { title: "WORLD BUILDING & LORE", weight: "35%", percentage: 35, desc: "Rich universe rules, immersive setting, and distinct creative premise" },
      { title: "CHARACTER ARCS & VOICE", weight: "30%", percentage: 30, desc: "Compelling protagonist motives, believable dialogue, and emotional resonance" },
      { title: "PACING & ORIGINALITY", weight: "20%", percentage: 20, desc: "Addictive narrative hooks, unexpected twists, and polished prose flow" },
      { title: "READER IMPACT & ENGAGEMENT", weight: "15%", percentage: 15, desc: "Audience comments, community votes, and chapter read-through rate" },
    ],
    endDate: new Date(Date.now() + 23 * 86400000).toISOString(),
    submissionCount: 128 + novels.length,
  };

  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedNovelId, setSelectedNovelId] = useState(novels[0]?.id || "");
  const [submissionStep, setSubmissionStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Combine user novels with tournament entries
  const allEntries = [
    ...novels.map((n, idx) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      author: `@${n.creator.username || n.creator.name.toLowerCase().replace(/\s+/g, "_")}`,
      coverUrl: n.coverUrl,
      genre: n.genre,
      chaptersCount: n.chaptersCount || 3,
      rating: n.rating || 4.8,
      votes: (votes[n.id] || 0) + (100 - idx * 15),
    })),
    ...SEEDED_CONTENDERS,
  ].sort((a, b) => (votes[b.id] || b.votes) - (votes[a.id] || a.votes));

  const selectedStory = novels.find((n) => n.id === selectedNovelId) || novels[0];

  const handleVote = (entryId: string) => {
    if (votedIds.includes(entryId)) return;
    setVotes((prev) => ({ ...prev, [entryId]: (prev[entryId] || 0) + 1 }));
    setVotedIds((prev) => [...prev, entryId]);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsSubmitModalOpen(false);
      setIsSubmitted(false);
      setSubmissionStep(1);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#FAFAF7] dark:bg-[#121214] min-h-screen text-[#111111] dark:text-zinc-100">
      
      {/* ========================================================================= */}
      {/* 1. HERO: MANGA TOURNAMENT POSTER */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-700 p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Tournament Details & Headlines */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-xs text-[11px] font-black bg-[#D91E18] text-white uppercase tracking-widest shadow-xs">
                CONTEST #08 • 月例物語大賞
              </span>
              <span className="px-2.5 py-1 rounded-xs text-[11px] font-black bg-[#111111] text-white uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#D91E18]" />
                <span>23 DAYS REMAINING</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] text-[#111111] dark:text-white">
              STORY BATTLE{" "}
              <span className="text-[#D91E18]">TOURNAMENT</span>
              <br />
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#555555] dark:text-zinc-400 block mt-1">
                Sci-Fi & Fantasy Edition
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 leading-relaxed max-w-xl font-medium">
              Step into the arena. Submit your original serialized novel, battle for community reader votes, and win from the official prize pool with guaranteed publishing exposure.
            </p>

            {/* Giant Prize Callout Badge */}
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <div className="px-4 py-2 rounded-lg bg-[#D91E18] text-white shadow-md inline-flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-black tracking-tight">$850 USD</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-100">TOTAL PRIZE POOL</span>
              </div>
              <span className="text-xs font-bold text-[#555555] dark:text-zinc-400">
                ● 128 Authors Already Entered
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (requireAuth("/contests")) {
                    setIsSubmitModalOpen(true);
                  }
                }}
                className="px-8 py-3.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>ENTER TOURNAMENT NOW →</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dramatic Poster Artwork Composition */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[320px] sm:min-h-[380px]">
            {/* Japanese Red Sun */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#D91E18] absolute top-1/2 -translate-y-1/2 right-4 -z-10 shadow-2xl shadow-red-600/20" />

            {/* Ink Ring Motif */}
            <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 border-dashed border-[#111111] dark:border-zinc-500 absolute top-1/2 -translate-y-1/2 right-0 -z-10 opacity-30" />

            {/* Character Artwork */}
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-end justify-center select-none pointer-events-none">
              <img
                src="/hero-character.png"
                alt="Tournament Battle Hero"
                className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=90";
                }}
              />
            </div>

            {/* Vertical Kanji Banner */}
            <div className="absolute right-0 top-2 bottom-6 hidden sm:flex flex-col items-center justify-between text-zinc-400 select-none pointer-events-none z-10">
              <span className="text-[11px] font-bold [writing-mode:vertical-rl] tracking-widest text-[#111111] dark:text-zinc-200 drop-shadow-xs">
                頂点を目指せ、物語の戦士たち。
              </span>
              <span className="w-6 h-6 border-2 border-[#D91E18] text-[#D91E18] text-[10px] font-black flex items-center justify-center rounded-xs bg-white/90 dark:bg-zinc-900/90 shadow-xs">
                覇者
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIZE BREAKDOWN (Manga Battle Rewards) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
          <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
          <h2 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white uppercase tracking-tight">
            TOURNAMENT PRIZES & GLORY • 賞金と特典
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1st Place - Grand Prize */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#D91E18] relative shadow-md space-y-2 group hover:translate-y-[-2px] transition">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white uppercase">
                大賞 • 1ST PLACE
              </span>
              <Trophy className="w-5 h-5 text-[#D91E18]" />
            </div>
            <p className="text-3xl font-black text-[#D91E18] pt-1">$500 USD</p>
            <h3 className="font-black text-sm text-[#111111] dark:text-white">GRAND CHAMPION</h3>
            <p className="text-xs text-[#555555] dark:text-zinc-400 font-medium leading-relaxed">
              Official Homepage Hero Feature + Verified Creator Gold Badge + Yomika Publishing Contract Review.
            </p>
          </div>

          {/* 2nd Place - Runner Up */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 relative shadow-2xs space-y-2 hover:border-[#111111] dark:hover:border-white transition">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-zinc-800 text-white uppercase">
                優秀賞 • 2ND PLACE
              </span>
              <Award className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-3xl font-black text-[#111111] dark:text-white pt-1">$200 USD</p>
            <h3 className="font-black text-sm text-[#111111] dark:text-white">RUNNER UP</h3>
            <p className="text-xs text-[#555555] dark:text-zinc-400 font-medium leading-relaxed">
              Official Category Banner Spotlight + Verified Author Badge + Community Newsletter Feature.
            </p>
          </div>

          {/* 3rd Place */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 relative shadow-2xs space-y-2 hover:border-[#111111] dark:hover:border-white transition">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-amber-700 text-white uppercase">
                特別賞 • 3RD PLACE
              </span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-[#111111] dark:text-white pt-1">$100 USD</p>
            <h3 className="font-black text-sm text-[#111111] dark:text-white">THIRD PLACE</h3>
            <p className="text-xs text-[#555555] dark:text-zinc-400 font-medium leading-relaxed">
              Community Spotlight Placement + Tournament Finalist Badge + Yomika Discover Boost.
            </p>
          </div>

          {/* Reader's Choice */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 relative shadow-2xs space-y-2 hover:border-[#111111] dark:hover:border-white transition">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-[#D91E18] text-white uppercase">
                読者人気賞 • READER CHOICE
              </span>
              <Flame className="w-5 h-5 text-[#D91E18]" />
            </div>
            <p className="text-3xl font-black text-[#D91E18] pt-1">$50 USD</p>
            <h3 className="font-black text-sm text-[#111111] dark:text-white">AUDIENCE FAVORITE</h3>
            <p className="text-xs text-[#555555] dark:text-zinc-400 font-medium leading-relaxed">
              Awarded to the story with the highest community vote count + Audience Favorite Ribbon.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCORING MATRIX & JUDGING CRITERIA (Manga Progress Meter) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Visual Progress Bar Matrix */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
            <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
            <h3 className="text-sm font-black text-[#111111] dark:text-white uppercase">
              HOW YOUR STORY WILL BE JUDGED • 審査配点
            </h3>
          </div>

          <div className="space-y-4">
            {contest.judgingCriteria.map((crit) => (
              <div key={crit.title} className="space-y-1.5">
                <div className="flex justify-between text-xs font-black text-[#111111] dark:text-white">
                  <span>{crit.title}</span>
                  <span className="text-[#D91E18]">{crit.weight}</span>
                </div>
                
                {/* Manga Bar Visual */}
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xs overflow-hidden flex">
                  <div
                    className="h-full bg-[#D91E18] transition-all duration-1000"
                    style={{ width: crit.weight }}
                  />
                </div>
                <p className="text-[11px] text-[#555555] dark:text-zinc-400">{crit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tournament Rules & Requirements */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-2">
            <span className="w-1.5 h-4 bg-[#D91E18] rounded-2xs" />
            <h3 className="text-sm font-black text-[#111111] dark:text-white uppercase">
              ENTRY ELIGIBILITY • 参加資格
            </h3>
          </div>

          <ul className="space-y-3 text-xs text-[#555555] dark:text-zinc-300">
            {contest.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-xs bg-red-100 dark:bg-red-950/60 text-[#D91E18] flex items-center justify-center font-black text-[10px] mt-0.5 flex-shrink-0">
                  ✓
                </span>
                <span className="font-medium leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-[#EAEAE5] dark:border-zinc-800">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[11px] text-[#555555] dark:text-zinc-400 leading-relaxed font-medium">
              💡 <strong>Creator Tip:</strong> Early chapter hooks and engaging world concepts score highest during reader evaluation cycles.
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. LEADERBOARD: TOP CONTENDERS (頂上決戦) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#D91E18] rounded-2xs" />
            <h2 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white uppercase">
              TOP CONTENDERS • 頂上決戦 (TOP 3 PODIUM)
            </h2>
          </div>
          <span className="text-xs font-bold text-[#D91E18]">
            ● Real-time Live Votes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allEntries.slice(0, 3).map((entry, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const currentVotes = votes[entry.id] || entry.votes;
            const hasVoted = votedIds.includes(entry.id);

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 ${
                  isFirst
                    ? "border-[#D91E18] shadow-lg"
                    : isSecond
                    ? "border-zinc-400 shadow-sm"
                    : "border-amber-600 shadow-sm"
                } flex flex-col justify-between space-y-4 relative group`}
              >
                {/* Podium Rank Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-xs text-[10px] font-black uppercase text-white ${
                      isFirst ? "bg-[#D91E18]" : isSecond ? "bg-zinc-700" : "bg-amber-700"
                    }`}
                  >
                    {isFirst ? "🥇 RANK #01 LEADER" : isSecond ? "🥈 RANK #02" : "🥉 RANK #03"}
                  </span>
                  <span className="text-xs font-black text-[#D91E18] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {currentVotes} VOTES
                  </span>
                </div>

                {/* Cover & Story Meta */}
                <div className="flex gap-3.5 items-center">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                    <img
                      src={entry.coverUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <Link href={`/novels/${entry.slug}`}>
                      <h4 className="font-black text-sm sm:text-base text-[#111111] dark:text-white hover:text-[#D91E18] transition line-clamp-1">
                        {entry.title}
                      </h4>
                    </Link>
                    <p className="text-xs font-bold text-[#D91E18]">{entry.author}</p>
                    <p className="text-[11px] text-[#555555] dark:text-zinc-400">
                      {entry.genre} • {entry.chaptersCount} Chapters
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{entry.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Vote CTA */}
                <button
                  onClick={() => handleVote(entry.id)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                    hasVoted
                      ? "bg-emerald-600 text-white"
                      : "bg-[#D91E18] hover:bg-[#B71813] text-white shadow-xs"
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>{hasVoted ? "VOTED! ✓" : "CAST VOTE →"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CURRENT ENTRIES (128 STORIES ENTERED) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#111111] dark:bg-white rounded-2xs" />
            <h2 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white uppercase">
              CURRENT ENTRIES ({allEntries.length} STORIES ENTERED • 参加作品)
            </h2>
          </div>
          <span className="text-xs text-[#555555] dark:text-zinc-400 font-medium">
            Daily community votes determine the monthly winners
          </span>
        </div>

        {/* Large Horizontal Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allEntries.map((entry, index) => {
            const currentVotes = votes[entry.id] || entry.votes;
            const hasVoted = votedIds.includes(entry.id);
            const rankFormatted = `#${String(index + 1).padStart(2, "0")}`;

            return (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 flex items-center justify-between gap-4 shadow-2xs hover:border-[#111111] dark:hover:border-white transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Stamp */}
                  <span className="text-lg sm:text-xl font-black text-[#D91E18] w-8 text-center flex-shrink-0 font-serif">
                    {rankFormatted}
                  </span>

                  {/* Cover */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img
                      src={entry.coverUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  {/* Story Meta */}
                  <div className="space-y-0.5 min-w-0">
                    <Link href={`/novels/${entry.slug}`}>
                      <h4 className="font-black text-sm sm:text-base text-[#111111] dark:text-white hover:text-[#D91E18] transition line-clamp-1">
                        {entry.title}
                      </h4>
                    </Link>
                    <p className="text-xs font-bold text-zinc-500">By {entry.author}</p>
                    <p className="text-[11px] text-[#555555] dark:text-zinc-400">
                      {entry.genre} • {entry.chaptersCount} Ch • <span className="text-amber-600 font-bold">★ {entry.rating}</span>
                    </p>
                  </div>
                </div>

                {/* Vote Action */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-black text-[#D91E18]">
                    {currentVotes} votes
                  </span>
                  <button
                    onClick={() => handleVote(entry.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1 ${
                      hasVoted
                        ? "bg-emerald-600 text-white"
                        : "bg-[#D91E18] hover:bg-[#B71813] text-white shadow-xs"
                    }`}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>{hasVoted ? "Voted" : "Vote"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. 3-STEP INTERACTIVE SUBMISSION MODAL (✦ ENTER THE TOURNAMENT) */}
      {/* ========================================================================= */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-zinc-900 border-2 border-[#111111] dark:border-zinc-700 rounded-2xl p-6 sm:p-8 text-[#111111] dark:text-zinc-100 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAE5] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-xs bg-[#D91E18] text-white flex items-center justify-center font-black text-xs">
                  ✦
                </span>
                <h3 className="font-black text-base uppercase text-[#111111] dark:text-white">
                  ENTER THE STORY TOURNAMENT
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* 3-Step Progress Indicator */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase">
              <div className={`p-1.5 rounded-md border ${submissionStep >= 1 ? "bg-[#D91E18] text-white border-[#D91E18]" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>
                01 — SELECT
              </div>
              <div className={`p-1.5 rounded-md border ${submissionStep >= 2 ? "bg-[#D91E18] text-white border-[#D91E18]" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>
                02 — REVIEW
              </div>
              <div className={`p-1.5 rounded-md border ${submissionStep >= 3 ? "bg-[#D91E18] text-white border-[#D91E18]" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>
                03 — SUBMIT
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-[#111111] dark:text-white">
                  Tournament Entry Confirmed!
                </h4>
                <p className="text-xs text-[#555555] dark:text-zinc-400 max-w-sm mx-auto">
                  Your story has been officially entered into Contest #08. Reader voting is now active!
                </p>
              </div>
            ) : (
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                {/* STEP 1: Story Selection */}
                {submissionStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-[#111111] dark:text-white uppercase">
                      Select Your Published Story
                    </label>

                    {novels.length > 0 ? (
                      <select
                        value={selectedNovelId}
                        onChange={(e) => setSelectedNovelId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                      >
                        {novels.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title} ({n.chaptersCount || 3} Chapters) — {n.genre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-[#EAEAE5] text-center space-y-2">
                        <p className="text-xs font-bold text-zinc-500">You haven&apos;t published a story yet.</p>
                        <Link
                          href="/creator/upload"
                          className="inline-block px-4 py-1.5 rounded-md bg-[#D91E18] text-white text-xs font-black uppercase"
                        >
                          Create Story First →
                        </Link>
                      </div>
                    )}

                    {/* Live Preview Card */}
                    {selectedStory && (
                      <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] dark:border-zinc-800 flex items-center gap-3">
                        <div className="w-14 h-18 rounded-md overflow-hidden bg-zinc-200 flex-shrink-0">
                          <img
                            src={selectedStory.coverUrl}
                            alt={selectedStory.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-black text-sm text-[#111111] dark:text-white">{selectedStory.title}</p>
                          <p className="text-xs text-[#D91E18] font-bold">{selectedStory.genre}</p>
                          <p className="text-[11px] text-zinc-500">{selectedStory.chaptersCount || 3} Published Chapters • ★ {selectedStory.rating || 5.0}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSubmitModalOpen(false)}
                        className="px-4 py-2 rounded-lg border border-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmissionStep(2)}
                        className="px-5 py-2 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider"
                      >
                        Next: Review Entry →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Review & Verification */}
                {submissionStep === 2 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-[#111111] dark:text-white uppercase">
                      Confirm Contest Eligibility
                    </h4>

                    <div className="space-y-2 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] text-xs text-[#555555] dark:text-zinc-300">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Check className="w-4 h-4" />
                        <span>Meets 2+ published chapter requirement</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Check className="w-4 h-4" />
                        <span>100% original creator-owned work</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Check className="w-4 h-4" />
                        <span>Eligible for $850 Tournament prize pool</span>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSubmissionStep(1)}
                        className="px-4 py-2 rounded-lg border border-zinc-300 text-xs font-bold"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider shadow-md"
                      >
                        Confirm & Submit Entry →
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
