import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Video, Upload, Shield, FileText, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Muse Uploads | Yomika",
  description:
    "Muse Uploads is a personal tool used by the owner of this site to upload and manage their own YouTube videos on their own channels via the YouTube API.",
};

export default function MuseUploadsPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* HERO HEADER */}
      <section className="relative pt-12 pb-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden">
        {/* Glow ambient effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <Video className="w-3 h-3" />
                <span>Personal YouTube Tool</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Muse Uploads
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Muse Uploads is a private, personal automation tool used by the owner of this
              website to upload and manage their own videos on their own YouTube channels,
              using the official YouTube API.
            </p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-4xl space-y-10">
          {/* WHAT IT DOES */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-rose-500" />
              <span>What Muse Uploads Does</span>
            </h2>
            <div className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-3">
              <p>
                The owner of this site publishes videos on YouTube every day. Muse Uploads
                connects to YouTube through the YouTube Data API so that finished videos can
                be uploaded on a schedule, with their titles, descriptions, tags, and
                thumbnails set automatically, instead of uploading each video by hand.
              </p>
              <p>
                It also reads back basic information about the owner&rsquo;s own channels and
                uploads — such as upload status and video IDs — to confirm that each upload
                completed successfully and to avoid uploading the same video twice.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
              {[
                "Uploads the owner's own finished videos to YouTube",
                "Sets video titles, descriptions, tags, and thumbnails",
                "Checks upload and processing status after each upload",
                "Helps prevent accidental duplicate uploads",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CHANNELS */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" />
              <span>Channels It Manages</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              Muse Uploads works only with YouTube channels owned by the same person who owns
              this website. It is not a public service, it is not offered to other users, and
              it never accesses anyone else&rsquo;s YouTube account. The channels it manages
              are:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  <span>Beyond Thinking</span>
                </p>
                <p className="text-xs text-zinc-500">
                  A news and podcast channel featuring &ldquo;The Daily Brief with Alex &amp;
                  Jordan&rdquo;.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  <span>Time Machine Hindi</span>
                </p>
                <p className="text-xs text-zinc-500">
                  A Hindi history-storytelling channel with daily Shorts and long-form
                  videos.
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" />
              <span>How It Connects to YouTube</span>
            </h2>
            <div className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-3">
              <p>
                Muse Uploads uses <strong>YouTube API Services</strong> and signs in with
                Google OAuth, using only the permissions it needs: uploading videos and
                reading the owner&rsquo;s own channel and video information. The access token
                is stored only on the owner&rsquo;s own computer, and the owner can revoke
                the tool&rsquo;s access at any time from their Google account settings.
              </p>
              <p>
                By using YouTube, the owner agrees to be bound by the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
                >
                  YouTube Terms of Service
                </a>
                . YouTube is a trademark of Google LLC.
              </p>
            </div>
          </section>

          {/* LEGAL LINKS */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Privacy &amp; Terms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/muse-uploads/privacy"
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 block hover:border-rose-500/40 transition"
              >
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  What data Muse Uploads accesses, how it is used, how long it is kept, and
                  how access can be revoked.
                </p>
                <p className="text-xs font-semibold text-rose-500 underline underline-offset-4">
                  Read the Privacy Policy
                </p>
              </Link>

              <Link
                href="/muse-uploads/terms"
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 block hover:border-rose-500/40 transition"
              >
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  The terms that govern Muse Uploads, including that use of the tool is
                  bound by the YouTube Terms of Service.
                </p>
                <p className="text-xs font-semibold text-rose-500 underline underline-offset-4">
                  Read the Terms of Service
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
