import React from "react";
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import { TOCItem } from "@/components/legal/TableOfContents";

export const metadata: Metadata = {
  title: "Terms of Service — Muse Uploads | Yomika",
  description:
    "The terms governing Muse Uploads, a personal tool used by the site owner to upload and manage videos on their own YouTube channels.",
};

const TOC_ITEMS: TOCItem[] = [
  { id: "about", number: 1, title: "About Muse Uploads" },
  { id: "the-service", number: 2, title: "The Service" },
  { id: "youtube-terms", number: 3, title: "YouTube Terms of Service" },
  { id: "acceptable-use", number: 4, title: "Acceptable Use" },
  { id: "liability", number: 5, title: "Disclaimer & Liability" },
  { id: "contact", number: 6, title: "Changes & Contact" },
];

export default function MuseUploadsTermsPage() {
  return (
    <LegalLayout
      title="Terms of Service — Muse Uploads"
      badge="Muse Uploads"
      lastUpdated="October 2026"
      introduction="These Terms of Service govern Muse Uploads, a personal automation tool created and operated by the owner of this website to upload and manage videos on the owner's own YouTube channels."
      tocItems={TOC_ITEMS}
      disclaimer="Muse Uploads is a personal, single-user tool. It is not offered to the public, and no one other than the owner is authorised to use it."
    >
      {/* 1. ABOUT */}
      <LegalSection id="about" number={1} title="About Muse Uploads">
        <p>
          Muse Uploads (&ldquo;the tool&rdquo;) is a personal software tool created, owned,
          and operated by the owner of this website (youmika.site). These terms apply to
          the tool and to this page.
        </p>
      </LegalSection>

      {/* 2. THE SERVICE */}
      <LegalSection id="the-service" number={2} title="The Service">
        <p>
          Muse Uploads automates the upload of the owner&rsquo;s own finished videos to
          the owner&rsquo;s own YouTube channels via the YouTube Data API. The channels it
          is used with are:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li><strong>Beyond Thinking</strong> — the owner&rsquo;s news and podcast channel.</li>
          <li><strong>Time Machine Hindi</strong> — the owner&rsquo;s Hindi history-storytelling channel.</li>
        </ul>
        <p>
          The tool is for the owner&rsquo;s own channels only. It is not a public service,
          it has no other users, and it must not be used to access, upload to, or manage
          any YouTube channel or Google account that does not belong to the owner.
        </p>
      </LegalSection>

      {/* 3. YOUTUBE TERMS */}
      <LegalSection id="youtube-terms" number={3} title="YouTube Terms of Service">
        <p>
          Muse Uploads uses YouTube API Services. By using the tool, the user agrees to
          be bound by the{" "}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
          >
            YouTube Terms of Service
          </a>
          .
        </p>
        <p>
          The tool&rsquo;s use of information received from Google APIs also follows the{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
          >
            Google Privacy Policy
          </a>
          , as described in the{" "}
          <a
            href="/muse-uploads/privacy"
            className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
          >
            Muse Uploads Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      {/* 4. ACCEPTABLE USE */}
      <LegalSection id="acceptable-use" number={4} title="Acceptable Use">
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>The tool may only be used with YouTube channels and Google accounts owned by the tool&rsquo;s owner.</li>
          <li>All videos uploaded through the tool must comply with the YouTube Terms of Service and YouTube&rsquo;s Community Guidelines.</li>
          <li>The tool must not be used to upload content the owner does not own or have the rights to publish.</li>
          <li>The tool&rsquo;s stored access credentials must be kept on the owner&rsquo;s own computer and must not be shared.</li>
        </ul>
      </LegalSection>

      {/* 5. LIABILITY */}
      <LegalSection id="liability" number={5} title="Disclaimer & Liability">
        <p>
          The tool is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo;, without
          warranties of any kind. To the maximum extent permitted by applicable law, the
          owner shall not be liable for any indirect, incidental, or consequential damages
          arising from the use of the tool, including interruptions to uploads caused by
          changes to the YouTube API Services.
        </p>
      </LegalSection>

      {/* 6. CHANGES & CONTACT */}
      <LegalSection id="contact" number={6} title="Changes & Contact">
        <p>
          These terms may be updated from time to time; the current version will always be
          published on this page with a revised &ldquo;Last updated&rdquo; date.
        </p>
        <p>For questions about these terms or about Muse Uploads, contact:</p>
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Muse Uploads</p>
          <p className="text-xs font-mono text-rose-500">animerecapn@gmail.com</p>
          <p className="text-xs text-zinc-500">Website: https://youmika.site/muse-uploads</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
