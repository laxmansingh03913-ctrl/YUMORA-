"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Pin,
  Sparkles,
  Plus,
  Send,
  Tag,
  CheckCircle2,
  Filter,
  Radio,
  HelpCircle,
  Heart,
  Share2,
  Flame,
  Award,
  BookOpen,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Shield,
  Bot,
} from "lucide-react";
import confetti from "canvas-confetti";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { CommunityPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type CommunityTab = "discussions" | "ama" | "fanclubs" | "art";

interface AmaQuestion {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge: string;
  question: string;
  upvotes: number;
  time: string;
  answer?: {
    creatorName: string;
    creatorAvatar: string;
    answerText: string;
    answeredAt: string;
  };
}

interface FanClub {
  id: string;
  title: string;
  storyTitle: string;
  storySlug: string;
  coverUrl: string;
  membersCount: number;
  description: string;
  badge: string;
  isJoined?: boolean;
}

interface FanArtItem {
  id: string;
  title: string;
  artistName: string;
  artistAvatar: string;
  storyTitle: string;
  imageUrl: string;
  likes: number;
}

const CATEGORIES = [
  "All Categories",
  "General",
  "Creator Lounge",
  "Story Feedback",
  "Writing Prompts",
  "Announcements",
];

const INITIAL_AMA_QUESTIONS: AmaQuestion[] = [
  {
    id: "ama-1",
    authorName: "KaelenFanatic",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    authorBadge: "Superfan",
    question: "Will the Sovereign unlock his secondary bloodline in the upcoming tournament arc?",
    upvotes: 42,
    time: "2 hours ago",
    answer: {
      creatorName: "Aria Thorne",
      creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      answerText: "Great catch! Let's just say Chapter 14 will reveal a secret ancient trial that tests both of his ancestral bloodlines simultaneously. Keep an eye on the sword runes! 😉",
      answeredAt: "45 mins ago",
    },
  },
  {
    id: "ama-2",
    authorName: "AstralVoyager",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    authorBadge: "Grand Patron",
    question: "How long did it take you to design the Astral Magic System and the cultivation tiers?",
    upvotes: 28,
    time: "4 hours ago",
    answer: {
      creatorName: "Aria Thorne",
      creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      answerText: "It took almost 3 months of worldbuilding! I wanted a hard magic system where every astral constellation gives distinct martial abilities rather than generic power-ups.",
      answeredAt: "1 hour ago",
    },
  },
];

const INITIAL_FAN_CLUBS: FanClub[] = [
  {
    id: "club-1",
    title: "Astral Monarchs Sanctuary",
    storyTitle: "The Starfall Sovereign",
    storySlug: "the-starfall-sovereign",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    membersCount: 1420,
    description: "Official discussion guild for theory crafters, realm power balancers, and fan artists of Starfall Sovereign.",
    badge: "Official Guild",
  },
  {
    id: "club-2",
    title: "Sector 7 Vanguard Society",
    storyTitle: "Tokyo Neon Shinobi",
    storySlug: "tokyo-neon-shinobi",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    membersCount: 980,
    description: "Cyberpunk enthusiasts breaking down episode easter eggs, weapon schematics, and neon aesthetic edits.",
    badge: "Trending",
  },
  {
    id: "club-3",
    title: "Valkyrie High Command",
    storyTitle: "Echoes of the Valkyrie",
    storySlug: "echoes-of-the-valkyrie",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    membersCount: 650,
    description: "Deep dive into Norse mythology adaptations, character shipping, and soundtrack discussions.",
    badge: "Featured",
  },
];

const INITIAL_FAN_ART: FanArtItem[] = [
  {
    id: "art-1",
    title: "The Sovereign's Awakening",
    artistName: "KuroYuki_Art",
    artistAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    storyTitle: "The Starfall Sovereign",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80",
    likes: 342,
  },
  {
    id: "art-2",
    title: "Neon Rain on Shibuya Rooftops",
    artistName: "CyberPulse",
    artistAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    storyTitle: "Tokyo Neon Shinobi",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80",
    likes: 289,
  },
  {
    id: "art-3",
    title: "Valkyrie Wings in the Storm",
    artistName: "MythicVisions",
    artistAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    storyTitle: "Echoes of the Valkyrie",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=900&auto=format&fit=crop&q=80",
    likes: 195,
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CommunityTab>("discussions");

  // Discussions State
  const [posts, setPosts] = useState<CommunityPost[]>(() => dataStore.getCommunityPosts());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"]>("Creator Lounge");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState<{ [postId: string]: string }>({});

  // AMA State
  const [amaQuestions, setAmaQuestions] = useState<AmaQuestion[]>(INITIAL_AMA_QUESTIONS);
  const [amaInput, setAmaInput] = useState("");
  const [upvotedAmaIds, setUpvotedAmaIds] = useState<string[]>([]);

  // Fan Clubs State
  const [fanClubs, setFanClubs] = useState<FanClub[]>(INITIAL_FAN_CLUBS);

  // Fan Art State
  const [fanArt, setFanArt] = useState<FanArtItem[]>(INITIAL_FAN_ART);
  const [likedArtIds, setLikedArtIds] = useState<string[]>([]);

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === "All Categories") return true;
    return p.category === selectedCategory;
  });

  const handleUpvote = (postId: string) => {
    const isUpvoted = upvotedIds.includes(postId);
    const delta = isUpvoted ? -1 : 1;
    setUpvotedIds((prev) =>
      isUpvoted ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + delta } : p))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user?.id || `usr-${Date.now()}`,
      user: {
        name: user?.name || "Storyteller",
        username: user?.username || "storyteller",
        avatar:
          user?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge:
          user?.role === "ADMIN"
            ? "Official Team"
            : user?.role === "CREATOR"
            ? "Author"
            : "Reader",
      },
      category,
      title: title.trim(),
      content: content.trim(),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      upvotes: 1,
      commentsCount: 0,
      views: 1,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    dataStore.addCommunityPost(newPost);
    setPosts([newPost, ...posts]);
    setTitle("");
    setContent("");
    setTagsInput("");
    setIsCreatingPost(false);
  };

  // Submit Question to AMA
  const handleAskAma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amaInput.trim()) return;

    const newQ: AmaQuestion = {
      id: `ama-${Date.now()}`,
      authorName: user?.name || "StoryEnthusiast",
      authorAvatar:
        user?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      authorBadge: "Community Reader",
      question: amaInput.trim(),
      upvotes: 1,
      time: "Just now",
    };

    setAmaQuestions([newQ, ...amaQuestions]);
    setAmaInput("");
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const handleUpvoteAma = (id: string) => {
    const isUp = upvotedAmaIds.includes(id);
    setUpvotedAmaIds((prev) => (isUp ? prev.filter((x) => x !== id) : [...prev, id]));
    setAmaQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + (isUp ? -1 : 1) } : q))
    );
  };

  const handleToggleJoinClub = (clubId: string) => {
    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          const nextJoined = !c.isJoined;
          if (nextJoined) {
            try {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
          }
          return {
            ...c,
            isJoined: nextJoined,
            membersCount: c.membersCount + (nextJoined ? 1 : -1),
          };
        }
        return c;
      })
    );
  };

  const handleToggleLikeArt = (artId: string) => {
    const isLiked = likedArtIds.includes(artId);
    setLikedArtIds((prev) => (isLiked ? prev.filter((id) => id !== artId) : [...prev, artId]));
    setFanArt((prev) =>
      prev.map((a) => (a.id === artId ? { ...a, likes: a.likes + (isLiked ? -1 : 1) } : a))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EAEAE5] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-[#D91E18] rounded-2xs" />
            <span className="text-[11px] font-black text-[#D91E18] tracking-widest uppercase">
              COMMUNITY FORUM • コミュニティ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
            Storytellers & Readers Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-zinc-400 mt-1 font-medium">
            Join story fan clubs, ask authors anything in live AMAs, and discuss lore with global fans
          </p>
        </div>

        {activeTab === "discussions" && (
          <button
            onClick={() => setIsCreatingPost(!isCreatingPost)}
            className="px-5 py-2.5 rounded-xl bg-[#D91E18] hover:bg-[#B71813] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </button>
        )}
      </div>

      {/* Main Community Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {[
          { id: "discussions", label: "Discussions & Forums", icon: MessageSquare },
          { id: "ama", label: "Creator Live AMA", icon: Radio, badge: "LIVE" },
          { id: "fanclubs", label: "Story Fan Clubs", icon: Users, badge: "Hot" },
          { id: "art", label: "Fan Art Gallery", icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CommunityTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#D91E18] text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                    isActive
                      ? "bg-white text-[#D91E18]"
                      : "bg-rose-500/20 text-rose-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================= TAB 1: DISCUSSIONS & FORUMS ======================= */}
      {activeTab === "discussions" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#D91E18] text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-[#EAEAE5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* New Post Creation Drawer */}
          {isCreatingPost && (
            <form
              onSubmit={handleCreatePost}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 animate-in fade-in"
            >
              <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                Create a Discussion Thread
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Thread Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What would you like to discuss or ask?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as CommunityPost["category"])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Creator Lounge">Creator Lounge</option>
                    <option value="Story Feedback">Story Feedback</option>
                    <option value="Writing Prompts">Writing Prompts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details, character dilemmas, or prompts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="WorldBuilding, Magic, Feedback"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Publish Thread
                </button>
              </div>
            </form>
          )}

          {/* Discussion Threads List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isUpvoted = upvotedIds.includes(post.id);
              const isExpanded = expandedThreadId === post.id;

              return (
                <div
                  key={post.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition ${
                    post.isPinned
                      ? "border-rose-500/40 bg-rose-950/10 dark:bg-rose-950/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {post.user.name}
                          </span>
                          {post.user.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                              {post.user.badge}
                            </span>
                          )}
                          <span className="text-xs text-zinc-400">@{post.user.username}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {formatDate(post.createdAt)} in{" "}
                          <strong className="text-rose-500">{post.category}</strong>
                        </span>
                      </div>
                    </div>

                    {post.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Upvote */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleUpvote(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition cursor-pointer ${
                          isUpvoted
                            ? "text-rose-500"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isUpvoted ? "fill-current" : ""}`} />
                        <span>{post.upvotes} Upvotes</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedThreadId(isExpanded ? null : post.id)
                        }
                        className="flex items-center gap-1.5 font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount || 0} Replies</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-zinc-400">
                      {post.views || 1} Views
                    </span>
                  </div>

                  {/* Inline Thread Reply Expansion */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-500 text-center">
                        No replies yet. Be the first to start the conversation!
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={threadReplyInput[post.id] || ""}
                          onChange={(e) =>
                            setThreadReplyInput({
                              ...threadReplyInput,
                              [post.id]: e.target.value,
                            })
                          }
                          placeholder="Write a constructive reply..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                        />
                        <button
                          onClick={() => {
                            if (!threadReplyInput[post.id]?.trim()) return;
                            alert("Reply posted successfully!");
                            setThreadReplyInput({ ...threadReplyInput, [post.id]: "" });
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: CREATOR LIVE AMA ======================= */}
      {activeTab === "ama" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Live AMA Stage Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-zinc-900 to-zinc-950 border border-rose-500/40 text-white shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-rose-400">
                    FEATURED CREATOR LIVE AMA
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Aria Thorne • Author of &quot;The Starfall Sovereign&quot;
                </h2>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Ask me about world-building, upcoming tournament arcs, magic power scaling, or character inspirations!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/90 px-4 py-2 rounded-2xl border border-zinc-800 self-start sm:self-auto">
                <Users className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">128 Fans in Room</span>
              </div>
            </div>

            {/* AMA Question Submit Form */}
            <form onSubmit={handleAskAma} className="pt-2 flex gap-2">
              <input
                type="text"
                required
                value={amaInput}
                onChange={(e) => setAmaInput(e.target.value)}
                placeholder="Ask the author anything (e.g. Will there be a romance arc?)..."
                className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Author</span>
              </button>
            </form>
          </div>

          {/* Q&A List */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Answered & Trending Questions</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold">
                {amaQuestions.length} Questions
              </span>
            </h3>

            {amaQuestions.map((q) => {
              const isUp = upvotedAmaIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                >
                  {/* Fan Question */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={q.authorAvatar}
                        alt={q.authorName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-700"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {q.authorName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-400">
                            {q.authorBadge}
                          </span>
                          <span className="text-[11px] text-zinc-400">{q.time}</span>
                        </div>
                        <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpvoteAma(q.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                        isUp
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUp ? "fill-current" : ""}`} />
                      <span>{q.upvotes}</span>
                    </button>
                  </div>

                  {/* Verified Creator Answer */}
                  {q.answer && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={q.answer.creatorAvatar}
                          alt={q.answer.creatorName}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-zinc-900 dark:text-zinc-100">
                            {q.answer.creatorName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase">
                            Author Answer ✓
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {q.answer.answeredAt}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif pl-9">
                        {q.answer.answerText}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: STORY FAN CLUBS ======================= */}
      {activeTab === "fanclubs" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
              Official Story Fan Clubs & Lore Guilds
            </h3>
            <p className="text-xs text-zinc-500">
              Join clubs dedicated to your favorite novels & comics to unlock fan discussions and exclusive badges
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fanClubs.map((club) => (
              <div
                key={club.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full overflow-hidden relative bg-zinc-950">
                    <img
                      src={club.coverUrl}
                      alt={club.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase shadow-sm">
                      {club.badge}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {club.storyTitle}
                    </span>
                    <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                      {club.title}
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {club.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{club.membersCount.toLocaleString()} Members</span>
                  </span>

                  <button
                    onClick={() => handleToggleJoinClub(club.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      club.isJoined
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : "bg-[#D91E18] hover:bg-[#B71813] text-white shadow-xs"
                    }`}
                  >
                    {club.isJoined ? "✓ Joined" : "+ Join Club"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: FAN ART GALLERY ======================= */}
      {activeTab === "art" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
                Community Fan Art Showcase
              </h3>
              <p className="text-xs text-zinc-500">
                Artwork and visual creations inspired by Yomika stories
              </p>
            </div>

            <button
              onClick={() => alert("Fan Art upload portal opened! Choose story & artwork.")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
            >
              + Submit Fan Art
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fanArt.map((art) => {
              const isLiked = likedArtIds.includes(art.id);

              return (
                <div
                  key={art.id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition flex flex-col justify-between group"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950 relative">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-bold text-rose-400 uppercase">
                        {art.storyTitle}
                      </span>
                      <h4 className="font-black text-sm text-white">{art.title}</h4>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={art.artistAvatar}
                        alt={art.artistName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {art.artistName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleLikeArt(art.id)}
                      className={`flex items-center gap-1 text-xs font-black transition cursor-pointer ${
                        isLiked ? "text-rose-500" : "text-zinc-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      <span>{art.likes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
