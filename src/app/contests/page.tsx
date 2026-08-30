"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  PenTool,
  FileText,
  Layers,
  Palette,
  Compass,
  MessageSquare,
  Gift,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { formatNumber, formatDate } from "@/lib/utils";
import { Contest } from "@/lib/types";
import { useContestCountdown } from "@/hooks/useContestCountdown";
import { formatContestDeadline, getContestStatus } from "@/lib/utils/contest";
import { dbService } from "@/lib/supabase/db";
import dynamic from "next/dynamic";

const InteractiveTrophy = dynamic(
  () => import("@/components/ui/InteractiveTrophy").then((mod) => mod.InteractiveTrophy),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-[11px] animate-pulse">
        Initializing 3D Scene...
      </div>
    ),
  }
);

const SEEDED_CONTENDERS: any[] = [];

const TOURNAMENT_CATEGORIES = [
  {
    title: "WEB NOVEL",
    desc: "Long-form written stories in chapters.",
    icon: BookOpen,
    color: "#3B82F6",
    bgLight: "bg-blue-50/70 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-900/30",
    textClass: "text-blue-600 dark:text-blue-400",
    link: "/discover?category=web-novel",
  },
  {
    title: "LIGHT NOVEL",
    desc: "Fiction for young adult readers.",
    icon: FileText,
    color: "#10B981",
    bgLight: "bg-emerald-50/70 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    link: "/discover?category=light-novel",
  },
  {
    title: "MANGA",
    desc: "Black & white manga stories.",
    icon: Layers,
    color: "#8B5CF6",
    bgLight: "bg-purple-50/70 border-purple-200/60 dark:bg-purple-950/20 dark:border-purple-900/30",
    textClass: "text-purple-600 dark:text-purple-400",
    link: "/discover?category=manga",
  },
  {
    title: "WEBTOON",
    desc: "Vertical, scrollable comic stories.",
    icon: Palette,
    color: "#F59E0B",
    bgLight: "bg-amber-50/70 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30",
    textClass: "text-amber-600 dark:text-amber-400",
    link: "/discover?category=webtoon",
  },
  {
    title: "COMIC",
    desc: "All style comics and graphic novels.",
    icon: Sparkles,
    color: "#EF4444",
    bgLight: "bg-red-50/70 border-red-200/60 dark:bg-red-950/20 dark:border-red-900/30",
    textClass: "text-red-600 dark:text-red-400",
    link: "/discover?category=comic",
  },
];

export default function ContestsPage() {
  const { user, requireAuth } = useAuth();
  const [contest, setContest] = useState<Contest>(() => dataStore.getActiveContest());
  const [novels, setNovels] = useState(() => dataStore.getNovels());
  
  // Real-time live submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  // Real-time live countdown hook
  const countdown = useContestCountdown(contest);

  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [submissionStep, setSubmissionStep] = useState<1 | 2 | 3>(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Faction Wars State
  const [userFaction, setUserFaction] = useState<string | null>(null);
  const [submitFaction, setSubmitFaction] = useState<"SHADOW" | "LIGHT" | "CYBER">("SHADOW");

  useEffect(() => {
    const active = dataStore.getActiveContest();
    setContest(active);
    const allNovels = dataStore.getNovels();
    setNovels(allNovels);
    if (allNovels.length > 0) {
      setSelectedNovelId(allNovels[0].id);
    }

    // Fetch real-time live contest directly from Supabase Database
    dbService.getContests().then((supabaseContests) => {
      if (supabaseContests && supabaseContests.length > 0) {
        const live = supabaseContests[0];
        setContest(live);
        dataStore.saveContest(live);

        // Fetch entries submitted to this active contest from Supabase Postgres
        fetch(`/api/contests/submissions?contestId=${live.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSubmissions(data.submissions);
            }
          })
          .catch((err) => console.error("[FETCH SUBMISSIONS ERROR]", err))
          .finally(() => setLoadingSubmissions(false));
      } else {
        setLoadingSubmissions(false);
      }
    });
  }, []);

  // Filter user's published stories if logged in, otherwise all novels
  const userStories = user ? novels.filter((n) => n.creatorId === user.id) : novels;
  const selectedStory = novels.find((n) => n.id === selectedNovelId) || userStories[0] || novels[0];

  // Classifier helper for Faction assignment
  const getEntryFaction = (genre: string, id: string): "SHADOW" | "LIGHT" | "CYBER" => {
    const lower = genre.toLowerCase();
    if (lower.includes("dark") || lower.includes("action") || lower.includes("martial") || lower.includes("shadow")) return "SHADOW";
    if (lower.includes("fantasy") || lower.includes("romance") || lower.includes("wuxia") || lower.includes("light") || lower.includes("angel")) return "LIGHT";
    if (lower.includes("sci-fi") || lower.includes("cyber") || lower.includes("mech") || lower.includes("rebels") || lower.includes("apocalypse")) return "CYBER";
    const charCode = id.charCodeAt(id.length - 1) || 0;
    if (charCode % 3 === 0) return "SHADOW";
    if (charCode % 3 === 1) return "LIGHT";
    return "CYBER";
  };

  // useEffect to automatically suggest faction alignment on selecting a story
  useEffect(() => {
    if (selectedStory) {
      setSubmitFaction(getEntryFaction(selectedStory.genre, selectedStory.id));
    }
  }, [selectedNovelId, selectedStory]);

  // Combine user novels/submissions with tournament entries
  const allEntries = [
    ...submissions.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      author: n.author,
      authorName: n.authorName,
      avatar: n.avatar,
      coverUrl: n.coverUrl,
      genre: n.genre,
      chaptersCount: n.chaptersCount,
      rating: n.rating,
      votes: (votes[n.id] || 0) + n.votes,
    })),
    ...SEEDED_CONTENDERS.filter(sc => !submissions.some(sub => sub.id === sc.id)),
  ].sort((a, b) => (votes[b.id] || b.votes) - (votes[a.id] || a.votes));

  // Compute live faction scores dynamically based on the active vote counts
  const getFactionScores = () => {
    let shadow = 12450;
    let light = 9620;
    let cyber = 5540;

    allEntries.forEach((entry) => {
      const faction = getEntryFaction(entry.genre, entry.id);
      const activeVotes = votes[entry.id] || 0;
      if (faction === "SHADOW") shadow += activeVotes * 8;
      else if (faction === "LIGHT") light += activeVotes * 8;
      else if (faction === "CYBER") cyber += activeVotes * 8;
    });

    return { shadow, light, cyber };
  };

  const factionScores = getFactionScores();
  const totalFactionVotes = factionScores.shadow + factionScores.light + factionScores.cyber || 1;
  const pctShadow = Math.round((factionScores.shadow / totalFactionVotes) * 100);
  const pctLight = Math.round((factionScores.light / totalFactionVotes) * 100);
  const pctCyber = 100 - pctShadow - pctLight;

  const joinFaction = (faction: string) => {
    setUserFaction(faction);
    localStorage.setItem("yomika_user_faction", faction);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleVote = async (entryId: string) => {
    if (votedIds.includes(entryId)) return;

    // Optimistic UI update
    setVotes((prev) => ({ ...prev, [entryId]: (prev[entryId] || 0) + 1 }));
    setVotedIds((prev) => [...prev, entryId]);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    try {
      await fetch("/api/contests/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId: contest.id,
          novelId: entryId,
        }),
      });
    } catch (err) {
      console.error("[VOTE SYNC ERROR]", err);
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!selectedStory) {
      setSubmissionError("Please select a story to submit.");
      return;
    }

    const creatorId = user?.id || selectedStory.creatorId || "creator-current";

    try {
      const res = await fetch("/api/contests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId: contest.id,
          novelId: selectedStory.id,
          creatorId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmissionError(data.error || "Submission failed.");
        return;
      }

      setIsSubmitted(true);
      try {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setIsSubmitted(false);
        setSubmissionStep(1);
        
        // Reload submissions list
        fetch(`/api/contests/submissions?contestId=${contest.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              setSubmissions(d.submissions);
            }
          })
          .catch((err) => console.error(err));
      }, 2500);
    } catch (err: any) {
      console.error("[SUBMIT ENTRY ERROR]", err);
      setSubmissionError("Network error during submission. Please try again.");
    }
  };

  const authorAvatars = [
    { name: "Arion Vale", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { name: "DystopiaX", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { name: "Eldrith", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { name: "StarGazer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { name: "MysticPen", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-white dark:bg-zinc-950 min-h-screen text-[#111111] dark:text-zinc-100 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: CLEAN, PROFESSIONAL YOMIKA CONTEST BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Contest Title & Stats */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#D91E18]">
                YOMIKA MONTHLY CHALLENGE
              </span>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111111] dark:text-white leading-[1.1] uppercase">
                {contest.title || "SCI-FI & FANTASY STORY BATTLE"}
              </h1>

              {/* Tournament Divider */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <span className="w-6 h-[1.5px] bg-[#D91E18]" />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#D91E18] uppercase">
                  TOURNAMENT #{contest.contestNumber || "08"}
                </span>
                <span className="w-6 h-[1.5px] bg-[#D91E18]" />
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xl">
              {contest.description || "Where imagination meets competition. Write your best story. Compete with creators. Win glory, recognition and exciting rewards."}
            </p>

            {/* 3 Metric Badges in a Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1 max-w-lg">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#D91E18] flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-black text-[#111111] dark:text-white">
                    {contest.prizePool || "$850 USD"}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Total Prize Pool</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#D91E18] flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-black text-[#111111] dark:text-white">
                    {contest.submissionCount || allEntries.length || 14}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Authors Entered</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#D91E18] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-black text-[#111111] dark:text-white">
                    {formatContestDeadline(contest.endDate, contest.timezone).split(" ")[0]} {formatContestDeadline(contest.endDate, contest.timezone).split(" ")[1]}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Submission Deadline</p>
                </div>
              </div>
            </div>

            {/* Clickable CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (requireAuth("/contests")) {
                    setIsSubmitModalOpen(true);
                  }
                }}
                className="group px-8 py-3.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-red-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2"
              >
                <span>ENTER TOURNAMENT NOW</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
              </button>
            </div>

          </div>

          {/* Right Column: Photorealistic Seamless 3D Trophy Integration (No Box Framing) */}
          <div className="lg:col-span-6 relative flex items-center justify-center select-none pointer-events-none">
            {/* Subtle Radiant Atmospheric Glow Behind Trophy */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-600/20 blur-3xl absolute top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2 -z-10 animate-pulse-red pointer-events-none" />

            {/* Seamless 3D Trophy Visual Asset */}
            <div className="relative w-full max-w-[580px] flex items-center justify-center animate-float-slow">
              <img
                src="/contest-trophy.png"
                alt="Yomika Tournament Trophy"
                className="w-full h-auto object-contain max-h-[460px] sm:max-h-[520px] mix-blend-multiply dark:mix-blend-lighten filter contrast-[1.03] drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_20px_35px_rgba(217,30,24,0.25)] transition duration-700 hover:scale-105"
                style={{
                  WebkitMaskImage: "radial-gradient(circle at center, black 38%, transparent 64%)",
                  maskImage: "radial-gradient(circle at center, black 38%, transparent 64%)"
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/contest-trophy.jpg";
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW 1: HOW IT WORKS & AUTHORS ENTERED */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: HOW IT WORKS (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#D91E18]" />
            <h2 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-widest">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            
            {/* Step 01 */}
            <div className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-300 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D91E18] group-hover:text-white transition duration-300">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-zinc-400">01</span>
              </div>
              <h3 className="text-xs font-black text-[#111111] dark:text-white leading-snug">
                Create or Choose Your Story
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Write a new story or pick an existing one.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-300 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D91E18] group-hover:text-white transition duration-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-zinc-400">02</span>
              </div>
              <h3 className="text-xs font-black text-[#111111] dark:text-white leading-snug">
                Submit Your Entry
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Fill the details and submit your story.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-300 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D91E18] group-hover:text-white transition duration-300">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-zinc-400">03</span>
              </div>
              <h3 className="text-xs font-black text-[#111111] dark:text-white leading-snug">
                Community & Judges Review
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Stories are reviewed fairly on multiple criteria.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-300 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D91E18] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D91E18] group-hover:text-white transition duration-300">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-zinc-400">04</span>
              </div>
              <h3 className="text-xs font-black text-[#111111] dark:text-white leading-snug">
                Winners Announced
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Top stories win amazing prizes and recognition.
              </p>
            </div>

          </div>
        </div>

        {/* Right Card: AUTHORS ENTERED (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-widest">
              {contest.submissionCount || allEntries.length || 14} AUTHORS ENTERED
            </h2>
            <Link href="/community" className="text-xs font-black text-[#D91E18] hover:underline inline-flex items-center gap-1 group">
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-200" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
            {authorAvatars.map((author) => (
              <div key={author.name} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm bg-zinc-200 group-hover:scale-110 group-hover:border-[#D91E18] transition duration-300">
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 max-w-[50px] truncate text-center">
                  {author.name}
                </span>
              </div>
            ))}

            {/* +9 More Pill */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 group-hover:scale-110 group-hover:border-[#D91E18] group-hover:text-[#D91E18] transition duration-300">
                +9
              </div>
              <span className="text-[10px] font-bold text-zinc-400">More</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 font-medium pt-1">
            Join other creators in the monthly creative storytelling challenge.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: TOURNAMENT CATEGORIES, PRIZE POOL & JUDGING CRITERIA */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TOURNAMENT CATEGORIES (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#D91E18]" />
            <h2 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-widest">
              TOURNAMENT CATEGORIES
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOURNAMENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className={`p-3.5 rounded-xl border ${cat.bgLight} space-y-2 flex flex-col justify-between hover-lift glow-card group transition`}
                >
                  <div className="space-y-1.5">
                    <Icon className={`w-5 h-5 ${cat.textClass} group-hover:scale-110 transition duration-300`} />
                    <h3 className="text-xs font-black text-[#111111] dark:text-white uppercase">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                  <Link href={cat.link} className={`text-[10px] font-bold ${cat.textClass} hover:underline inline-flex items-center gap-0.5 group/link`}>
                    <span>Learn more</span>
                    <span className="group-hover/link:translate-x-0.5 transition">→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRIZE POOL (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <h2 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-widest text-center">
            PRIZE POOL — {contest.prizePool || "$850 USD"}
          </h2>

          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="space-y-1">
              <div className="text-amber-500 flex justify-center"><Trophy className="w-6 h-6" /></div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">1st Place</p>
              <p className="text-sm sm:text-base font-black text-[#111111] dark:text-white">$500</p>
            </div>
            <div className="space-y-1">
              <div className="text-zinc-400 flex justify-center"><Trophy className="w-6 h-6" /></div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">2nd Place</p>
              <p className="text-sm sm:text-base font-black text-[#111111] dark:text-white">$250</p>
            </div>
            <div className="space-y-1">
              <div className="text-amber-700 flex justify-center"><Trophy className="w-6 h-6" /></div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">3rd Place</p>
              <p className="text-sm sm:text-base font-black text-[#111111] dark:text-white">$100</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Special Mentions & Features</span>
            </span>
          </div>
        </div>

        {/* JUDGING CRITERIA (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-2xs space-y-4">
          <h2 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-widest">
            JUDGING CRITERIA
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Story & Originality</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
              <PenTool className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Writing Quality</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
              <Users className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Characters</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
              <Compass className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>World Building</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Reader Engagement</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. LEADERBOARD: TOP 3 PODIUM */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <h2 className="text-base sm:text-lg font-black text-[#111111] dark:text-white uppercase">
              TOP CONTENDERS • TOURNAMENT LEADERBOARD
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
                    ? "border-[#D91E18] shadow-md"
                    : isSecond
                    ? "border-zinc-300 dark:border-zinc-700 shadow-2xs"
                    : "border-amber-600 shadow-2xs"
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
      {/* 5. CURRENT ENTRIES LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAE5] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-5 bg-[#111111] dark:bg-white rounded-2xs" />
            <h2 className="text-base sm:text-lg font-black text-[#111111] dark:text-white uppercase">
              CURRENT ENTRIES ({allEntries.length} STORIES ENTERED)
            </h2>
          </div>
          <span className="text-xs text-[#555555] dark:text-zinc-400 font-medium">
            Daily community votes determine the monthly winners
          </span>
        </div>

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
                  <span className="text-lg sm:text-xl font-black text-[#D91E18] w-8 text-center flex-shrink-0 font-serif">
                    {rankFormatted}
                  </span>

                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img
                      src={entry.coverUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

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
      {/* 6. BOTTOM MOTIVATION CTA BANNER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#D91E18] flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#111111] dark:text-white">
              YOUR STORY. YOUR WORLD. YOUR VICTORY.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Every great story begins with a brave creator.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (requireAuth("/contests")) {
              setIsSubmitModalOpen(true);
            }
          }}
          className="group px-8 py-3.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-red-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2 flex-shrink-0"
        >
          <span>ENTER TOURNAMENT NOW</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 7. 3-STEP SUBMISSION MODAL */}
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
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAE5] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-xs bg-[#D91E18] text-white flex items-center justify-center font-black text-xs">
                  ✦
                </span>
                <h3 className="font-black text-base uppercase text-[#111111] dark:text-white">
                  ENTER {contest.title}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

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

            {submissionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#D91E18] text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-[#111111] dark:text-white">
                  Tournament Entry Confirmed!
                </h4>
                <p className="text-xs text-[#555555] dark:text-zinc-400 max-w-sm mx-auto">
                  Your story has been officially entered into Contest #{contest.contestNumber || "08"}. Reader voting is now active!
                </p>
              </div>
            ) : (
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                {submissionStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-[#111111] dark:text-white uppercase">
                      Select Your Published Story
                    </label>

                    {userStories.length > 0 ? (
                      <>
                        <select
                          value={selectedNovelId}
                          onChange={(e) => setSelectedNovelId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#D91E18]"
                        >
                          {userStories.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.title} ({n.chaptersCount || 3} Chapters) — {n.genre}
                            </option>
                          ))}
                        </select>

                        {selectedStory && (() => {
                          const recommended = getEntryFaction(selectedStory.genre, selectedStory.id);
                          return (
                            <div className="space-y-4">
                              {/* Selected Novel Details */}
                              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] dark:border-zinc-800 flex items-center gap-3">
                                <div className="w-14 h-18 rounded-md overflow-hidden bg-zinc-200 flex-shrink-0">
                                  <img
                                    src={selectedStory.coverUrl}
                                    alt={selectedStory.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-black text-sm text-[#111111] dark:text-white truncate">{selectedStory.title}</p>
                                  <p className="text-xs text-[#D91E18] font-bold">{selectedStory.genre}</p>
                                  <p className="text-[11px] text-zinc-500">{selectedStory.chaptersCount || 3} Published Chapters • ★ {selectedStory.rating || 5.0}</p>
                                </div>
                              </div>

                              {/* Faction Recommendation Alert & Choice */}
                              <div className="space-y-2.5">
                                <label className="block text-xs font-black text-[#111111] dark:text-white uppercase tracking-wider">
                                  Choose Faction Alliance
                                </label>
                                
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-550 flex items-center gap-1.5 leading-snug">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-pulse flex-shrink-0" />
                                  <span>
                                    Recommended: <strong className={
                                      recommended === "SHADOW"
                                        ? "text-[#00F0FF]"
                                        : recommended === "LIGHT"
                                        ? "text-[#FFB300]"
                                        : "text-[#FF007A]"
                                    }>
                                      {recommended === "SHADOW" ? "Shadow Syndicate 🕶️" : recommended === "LIGHT" ? "Light Vanguard 🛡️" : "Cyber Rebels ⚡"}
                                    </strong> (based on genre &apos;{selectedStory.genre}&apos;)
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  {["SHADOW", "LIGHT", "CYBER"].map((fac) => {
                                    const isActive = submitFaction === fac;
                                    const theme =
                                      fac === "SHADOW"
                                        ? { text: "Shadow", color: "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/5" }
                                        : fac === "LIGHT"
                                        ? { text: "Light", color: "border-[#FFB300] text-[#FFB300] bg-[#FFB300]/5" }
                                        : { text: "Rebels", color: "border-[#FF007A] text-[#FF007A] bg-[#FF007A]/5" };
                                    
                                    return (
                                      <button
                                        key={fac}
                                        type="button"
                                        onClick={() => setSubmitFaction(fac as any)}
                                        className={`p-2.5 rounded-lg border-2 text-[10px] font-black uppercase text-center transition duration-200 ${
                                          isActive
                                            ? `${theme.color} shadow-md`
                                            : "border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-650 hover:border-zinc-400"
                                        }`}
                                      >
                                        {theme.text}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsSubmitModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmissionStep(2)}
                            className="px-5 py-2 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider shadow-xs"
                          >
                            Next: Review Entry →
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] dark:border-zinc-800 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 text-[#D91E18] flex items-center justify-center mx-auto">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-sm text-[#111111] dark:text-white">
                            You haven&apos;t published a story yet
                          </p>
                          <p className="text-xs text-[#555555] dark:text-zinc-400 max-w-xs mx-auto">
                            To enter the monthly Tournament, publish your first novel or comic on Yomika.
                          </p>
                        </div>
                        <Link
                          href="/creator/upload"
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D91E18] hover:bg-[#B71813] text-white text-xs font-black uppercase tracking-wider shadow-xs transition"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>CREATE STORY FIRST →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {submissionStep === 2 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-[#111111] dark:text-white uppercase">
                      Confirm Contest Eligibility
                    </h4>

                    <div className="space-y-2 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-[#EAEAE5] text-xs text-[#555555] dark:text-zinc-300">
                      <div className="flex items-center gap-2 text-emerald-650 font-bold">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>Meets {contest.minChapters || 2}+ published chapter requirement</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-650 font-bold">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>100% original creator-owned work</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-650 font-bold">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Alliance: representing{" "}
                          <strong className={
                            submitFaction === "SHADOW"
                              ? "text-[#00F0FF]"
                              : submitFaction === "LIGHT"
                              ? "text-[#FFB300]"
                              : "text-[#FF007A]"
                          }>
                            {submitFaction === "SHADOW" ? "Shadow Syndicate" : submitFaction === "LIGHT" ? "Light Vanguard" : "Cyber Rebels"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-650 font-bold">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>Eligible for {contest.prizePool} Tournament prize pool</span>
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
