"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { CommunityPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const CATEGORIES = [
  "All Categories",
  "General",
  "Creator Lounge",
  "Story Feedback",
  "Writing Prompts",
  "Announcements",
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(() => dataStore.getCommunityPosts());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // New post form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"]>("Creator Lounge");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Upvoted post IDs
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

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
        avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        badge: user?.role === "ADMIN" ? "Official Team" : user?.role === "CREATOR" ? "Author" : "Reader",
      },
      category,
      title: title.trim(),
      content: content.trim(),
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-200/50 dark:border-indigo-900/40 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Community Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Storytellers & Readers Forum
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Discuss world-building techniques, share feedback, and connect with global readers
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPost(!isCreatingPost)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition flex items-center gap-2 transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Discussion</span>
        </button>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
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
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Create a Discussion Thread
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 mb-1">Thread Title *</label>
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
                onChange={(e) => setCategory(e.target.value as CommunityPost["category"])}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
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
            <label className="block text-xs font-bold text-zinc-400 mb-1">Tags (Comma-separated)</label>
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
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
            >
              Publish Thread
            </button>
          </div>
        </form>
      )}

      {/* Discussion Threads List or Empty State */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isUpvoted = upvotedIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition ${
                  post.isPinned
                    ? "border-rose-500/40 bg-rose-950/10 dark:bg-rose-950/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-700"
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
                      <p className="text-[11px] text-zinc-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                        <Pin className="w-3 h-3" /> PINNED
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="mt-3 space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Thread Footer: Upvote, Comments */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                        isUpvoted
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments?.length || post.commentsCount} Comments</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-400">{post.views} views</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Threads in this Category</h3>
              <p className="text-xs text-zinc-400">
                Start the discussion, share story prompts, or seek constructive feedback!
              </p>
            </div>
            <button
              onClick={() => setIsCreatingPost(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Thread</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
