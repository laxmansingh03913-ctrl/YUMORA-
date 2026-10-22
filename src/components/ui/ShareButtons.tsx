"use client";

import React, { useEffect, useState } from "react";
import { Share2, Link2, Check, Facebook, Send, MessageCircle } from "lucide-react";

/**
 * ShareButtons — social share row for story/comic pages.
 * Shares the CURRENT page URL (read from window.location on mount, so it
 * works on detail pages, chapters and episodes alike). Uses the native
 * share sheet on devices that support it, plus WhatsApp / X / Facebook /
 * Telegram links and a copy-link button.
 */
export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const text = `Read "${title}" on Yomika — free!`;
  const enc = encodeURIComponent;

  const targets = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
      icon: <Send className="w-4 h-4" />,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (permissions) — no-op, links above still work
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // user dismissed the share sheet — no-op
    }
  };

  const pill =
    "px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 hover:border-rose-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 mr-1">
        <Share2 className="w-3.5 h-3.5" />
        Share
      </span>
      {targets.map((t) => (
        <a
          key={t.name}
          href={url ? t.href : undefined}
          target="_blank"
          rel="noreferrer"
          className={pill}
          title={`Share on ${t.name}`}
        >
          {t.icon}
          <span>{t.name}</span>
        </a>
      ))}
      <button type="button" onClick={handleCopy} className={pill} title="Copy link">
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        <span>{copied ? "Copied!" : "Copy Link"}</span>
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="px-3.5 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold transition flex items-center gap-1.5 hover:opacity-85 cursor-pointer"
          title="Share…"
        >
          <Share2 className="w-4 h-4" />
          <span>Share…</span>
        </button>
      )}
    </div>
  );
}
