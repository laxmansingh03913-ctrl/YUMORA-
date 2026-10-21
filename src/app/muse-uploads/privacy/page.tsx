import React from "react";
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import { TOCItem } from "@/components/legal/TableOfContents";

export const metadata: Metadata = {
  title: "Privacy Policy — Muse Uploads | Yomika",
  description:
    "How Muse Uploads, a personal YouTube upload tool, accesses, uses, stores, and deletes data obtained through YouTube API Services.",
};

const TOC_ITEMS: TOCItem[] = [
  { id: "introduction", number: 1, title: "Introduction" },
  { id: "youtube-api-services", number: 2, title: "YouTube API Services" },
  { id: "information-we-access", number: 3, title: "Information We Access" },
  { id: "how-we-use-information", number: 4, title: "How We Use Information" },
  { id: "information-sharing", number: 5, title: "Information Sharing" },
  { id: "limited-use", number: 6, title: "Limited Use Disclosure" },
  { id: "cookies", number: 7, title: "Cookies" },
  { id: "data-retention-deletion", number: 8, title: "Data Storage, Retention & Deletion" },
  { id: "revoking-access", number: 9, title: "Revoking Access" },
  { id: "changes-to-policy", number: 10, title: "Changes to This Policy" },
  { id: "contact", number: 11, title: "Contact" },
];

export default function MuseUploadsPrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy — Muse Uploads"
      badge="Muse Uploads"
      lastUpdated="October 2026"
      introduction="This Privacy Policy describes how Muse Uploads — a personal tool used by the owner of this website to upload and manage their own YouTube videos — accesses, uses, stores, and deletes information obtained through Google and YouTube APIs."
      tocItems={TOC_ITEMS}
      disclaimer="Muse Uploads is a personal, single-user tool. It is not a public service and is never operated on behalf of, or for the data of, any other person."
    >
      {/* 1. INTRODUCTION */}
      <LegalSection id="introduction" number={1} title="Introduction">
        <p>
          Muse Uploads (&ldquo;the tool&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is a personal
          automation tool created and operated solely by the owner of this website
          (youmika.site). The tool uploads the owner&rsquo;s own finished videos to the
          owner&rsquo;s own YouTube channels — <strong>Beyond Thinking</strong> and{" "}
          <strong>Time Machine Hindi</strong> — and helps manage those uploads.
        </p>
        <p>
          This policy explains what information the tool accesses through YouTube API
          Services, how that information is used, and how it is stored, retained, and
          deleted.
        </p>
      </LegalSection>

      {/* 2. YOUTUBE API SERVICES */}
      <LegalSection id="youtube-api-services" number={2} title="YouTube API Services">
        <p>
          Muse Uploads uses <strong>YouTube API Services</strong> to upload videos and to
          read information about the owner&rsquo;s own channels and uploads.
        </p>
        <p>
          By using Muse Uploads, the user agrees to be bound by the{" "}
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
          The tool&rsquo;s handling of information received from Google APIs is also
          described by the{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
          >
            Google Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      {/* 3. INFORMATION WE ACCESS */}
      <LegalSection id="information-we-access" number={3} title="Information We Access">
        <p>
          Muse Uploads accesses only the channel owner&rsquo;s own YouTube data, obtained
          with the owner&rsquo;s explicit consent through Google OAuth. Specifically:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>
            <strong>Channel information:</strong> the owner&rsquo;s channel ID and channel
            title, used to confirm the tool is connected to the correct channels.
          </li>
          <li>
            <strong>Video metadata for the owner&rsquo;s own uploads:</strong> video IDs,
            titles, descriptions, tags, thumbnails, and upload/processing status, used to
            set metadata on new uploads and to verify that uploads completed.
          </li>
          <li>
            <strong>Upload functionality:</strong> the tool sends the owner&rsquo;s own
            video files and their metadata to YouTube through the YouTube Data API.
          </li>
          <li>
            <strong>OAuth refresh token:</strong> when the owner grants access, Google
            issues an OAuth refresh token. This token is stored{" "}
            <strong>locally, on the owner&rsquo;s own computer only</strong>, in an
            access-restricted file. It is never uploaded to any server, shared, or sent to
            any third party.
          </li>
        </ul>
        <p>
          The tool does not access any other person&rsquo;s YouTube data, does not collect
          data about viewers or subscribers, and does not request any Google user data
          beyond the YouTube permissions described above.
        </p>
      </LegalSection>

      {/* 4. HOW WE USE INFORMATION */}
      <LegalSection id="how-we-use-information" number={4} title="How We Use Information">
        <p>
          Information accessed through YouTube API Services is used for one purpose only:
          operating the owner&rsquo;s own YouTube channels. That means:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>Uploading the owner&rsquo;s own videos to the owner&rsquo;s own channels.</li>
          <li>
            Setting and updating metadata (title, description, tags, thumbnail) on the
            owner&rsquo;s own videos.
          </li>
          <li>
            Checking upload and processing status to confirm that scheduled uploads
            completed successfully.
          </li>
          <li>Preventing duplicate uploads of the same video.</li>
        </ul>
        <p>The data is not used for any other purpose.</p>
      </LegalSection>

      {/* 5. INFORMATION SHARING */}
      <LegalSection id="information-sharing" number={5} title="Information Sharing">
        <p>
          Data obtained through YouTube API Services is <strong>never shared</strong> with
          any third party. It is:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>Not sold or rented to anyone.</li>
          <li>Not used for advertising, and no advertising or third-party content is served through the tool.</li>
          <li>Not transferred to any other application, service, or person.</li>
        </ul>
        <p>
          The only transfers that occur are the tool&rsquo;s own direct communications with
          Google and YouTube APIs, which are necessary for the uploads themselves.
        </p>
      </LegalSection>

      {/* 6. LIMITED USE */}
      <LegalSection id="limited-use" number={6} title="Limited Use Disclosure">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm leading-relaxed">
          <p>
            Muse Uploads&rsquo; use and transfer of information received from Google APIs
            adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </div>
      </LegalSection>

      {/* 7. COOKIES */}
      <LegalSection id="cookies" number={7} title="Cookies">
        <p>
          Muse Uploads is a local automation tool, not a web service. It does not place,
          read, or use cookies or any similar tracking technologies.
        </p>
      </LegalSection>

      {/* 8. DATA STORAGE, RETENTION & DELETION */}
      <LegalSection id="data-retention-deletion" number={8} title="Data Storage, Retention & Deletion">
        <p>
          The OAuth refresh token and any channel or video data the tool works with are
          stored <strong>only on the owner&rsquo;s own computer</strong>, in
          access-restricted files. Nothing is stored on external servers.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>
            YouTube API data the tool caches (such as upload records and video metadata)
            is refreshed or deleted in line with YouTube&rsquo;s policies, and is not
            retained for more than 30 days.
          </li>
          <li>
            When the owner revokes the tool&rsquo;s access (see the next section), the
            stored refresh token stops working and is deleted from the owner&rsquo;s
            computer.
          </li>
          <li>
            Because the tool&rsquo;s only user is the owner, deletion requests are handled
            directly: the owner can delete the stored token and cached data at any time,
            which immediately and permanently removes them.
          </li>
        </ul>
      </LegalSection>

      {/* 9. REVOKING ACCESS */}
      <LegalSection id="revoking-access" number={9} title="Revoking Access">
        <p>
          The owner can revoke Muse Uploads&rsquo; access to their Google and YouTube
          accounts at any time through Google&rsquo;s security settings page:
        </p>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm space-y-2">
          <p>
            <a
              href="https://security.google.com/settings/security/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4 break-all"
            >
              https://security.google.com/settings/security/permissions
            </a>
          </p>
          <p className="text-zinc-500">
            Find &ldquo;Muse Uploads&rdquo; in the list of third-party apps with account
            access and remove it. Revoking access immediately invalidates the stored
            refresh token.
          </p>
        </div>
      </LegalSection>

      {/* 10. CHANGES */}
      <LegalSection id="changes-to-policy" number={10} title="Changes to This Policy">
        <p>
          If this policy changes, the updated version will be published on this page and
          the &ldquo;Last updated&rdquo; date above will be revised. Material changes to
          how YouTube API data is handled will not take effect until they are published
          here.
        </p>
      </LegalSection>

      {/* 11. CONTACT */}
      <LegalSection id="contact" number={11} title="Contact">
        <p>
          For any questions or complaints about this Privacy Policy or about how Muse
          Uploads handles YouTube API data, contact:
        </p>
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Muse Uploads</p>
          <p className="text-xs font-mono text-rose-500">animerecapn@gmail.com</p>
          <p className="text-xs text-zinc-500">Website: https://youmika.site/muse-uploads</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
