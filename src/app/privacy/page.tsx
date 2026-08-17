import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  FileText,
  Mail,
  Building,
  MapPin,
  Lock,
  Eye,
  UserCheck,
  Server,
  Globe,
  Database,
  Trash2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import { TOCItem } from "@/components/legal/TableOfContents";

export const metadata: Metadata = {
  title: "Privacy Policy | Yumora",
  description:
    "Learn how Yumora collects, uses, and protects information when you use the platform to read, write, and discover stories.",
};

const TOC_ITEMS: TOCItem[] = [
  { id: "introduction", number: 1, title: "Introduction" },
  { id: "information-we-collect", number: 2, title: "Information We Collect" },
  { id: "how-we-use-information", number: 3, title: "How We Use Information" },
  { id: "account-and-authentication", number: 4, title: "Account and Authentication" },
  { id: "creator-information", number: 5, title: "Creator Information" },
  { id: "user-generated-content", number: 6, title: "User-Generated Content" },
  { id: "reading-and-interaction-data", number: 7, title: "Reading & Interaction Data" },
  { id: "cookies-and-tracking", number: 8, title: "Cookies & Tracking Technologies" },
  { id: "analytics-and-technical-data", number: 9, title: "Analytics & Technical Data" },
  { id: "payments-and-payouts", number: 10, title: "Payments and Creator Payouts" },
  { id: "third-party-services", number: 11, title: "Third-Party Services" },
  { id: "information-sharing", number: 12, title: "Information Sharing" },
  { id: "international-transfers", number: 13, title: "International Data Transfers" },
  { id: "data-retention", number: 14, title: "Data Retention" },
  { id: "account-deletion", number: 15, title: "Account Deletion" },
  { id: "your-privacy-rights", number: 16, title: "Your Privacy Rights" },
  { id: "childrens-privacy", number: 17, title: "Children's Privacy" },
  { id: "security-safeguards", number: 18, title: "Security Safeguards" },
  { id: "changes-to-policy", number: 19, title: "Changes to This Policy" },
  { id: "contact-us", number: 20, title: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      badge="Legal & Privacy"
      lastUpdated="[EFFECTIVE DATE]"
      introduction="Yumora is a platform where readers discover and read novels, comics, manga, webtoons, and other creative works, and where creators can publish their content."
      tocItems={TOC_ITEMS}
      disclaimer="This Privacy Policy is intended to describe Yumora's privacy practices. It should be reviewed and finalized for the jurisdictions in which Yumora operates before public launch."
    >
      {/* 1. INTRODUCTION */}
      <LegalSection id="introduction" number={1} title="Introduction">
        <p>
          Welcome to Yumora. This Privacy Policy explains how Yumora (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
          collects, uses, stores, and shares personal information when you access or use our websites, applications, reader
          interfaces, creator tools, and related services (collectively, the &ldquo;Service&rdquo;).
        </p>
        <p>
          This policy applies to all individuals who interact with the Service, including registered readers, independent creators,
          community contributors, and unregistered visitors. Additional notices or supplementary terms may apply to specific features,
          promotions, or creator monetization programs.
        </p>
      </LegalSection>

      {/* 2. INFORMATION WE COLLECT */}
      <LegalSection id="information-we-collect" number={2} title="Information We Collect">
        <p>
          We organize the information we collect into three general categories depending on how you interact with the Service:
        </p>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>A. Information Users Provide Directly</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              <li><strong>Account Credentials:</strong> Display name, chosen username, and email address.</li>
              <li><strong>Profile Details:</strong> Profile picture/avatar, bio, preferred genres, and country/region where provided.</li>
              <li><strong>Communications:</strong> Inquiries, customer support messages, feedback, and form submissions.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>B. Information Creators Provide</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              <li><strong>Creator Profile:</strong> Extended biography, external social media links, and creator banner artwork.</li>
              <li><strong>Published Works & Metadata:</strong> Story titles, synopses, genre tags, cover art, chapter manuscripts, and comic page assets.</li>
              <li><strong>Monetization & Payout Data:</strong> Information required for creator verification and payout processing where monetization is enabled.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>C. Automatically Collected Technical Information</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              <li><strong>Device & Network Data:</strong> Internet Protocol (IP) address, browser type and version, operating system, and device identifiers.</li>
              <li><strong>Usage & Navigation Data:</strong> Pages viewed, features accessed, referring URLs, date/time stamps, and approximate location derived from IP address.</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* 3. HOW WE USE INFORMATION */}
      <LegalSection id="how-we-use-information" number={3} title="How We Use Information">
        <p>We process personal information for legitimate business and operational purposes, including to:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-2">
          {[
            "Create, authenticate, and manage user accounts",
            "Provide reading, chapter navigation, and discovery features",
            "Operate and display public creator profiles",
            "Store, process, and publish creator manuscripts and artwork",
            "Process social interactions (follows, likes, bookmarks, and comments)",
            "Deliver transactional updates and release notifications",
            "Provide user assistance and customer support",
            "Detect, prevent, and mitigate fraud, spam, and platform abuse",
            "Moderate content to enforce community safety rules",
            "Monitor service performance, stability, and system security",
            "Process creator royalties and payments when available",
            "Comply with applicable legal obligations and enforce our Terms of Service",
          ].map((purpose, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2"
            >
              <span className="text-rose-500 font-bold">•</span>
              <span>{purpose}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      {/* 4. ACCOUNT AND AUTHENTICATION INFORMATION */}
      <LegalSection id="account-and-authentication" number={4} title="Account and Authentication Information">
        <p>
          You may register for and authenticate your Yumora account through supported authentication methods:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li><strong>Email and Password:</strong> When you register directly with an email address, your password is encrypted using cryptographic hashing before storage. We never store or view raw plaintext passwords.</li>
          <li><strong>Third-Party OAuth Providers (Google, Apple if configured):</strong> When you sign in using a third-party authentication provider, that provider shares basic account details (such as your verified email address and public name) required to create or authenticate your Yumora account.</li>
        </ul>
      </LegalSection>

      {/* 5. CREATOR INFORMATION */}
      <LegalSection id="creator-information" number={5} title="Creator Information">
        <p>
          When you establish a creator profile on Yumora, certain information is publicly visible to readers and other platform members to foster discoverability and reader-author connections.
        </p>
        <p>Public creator information includes:</p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2">
          <li>Display name, unique @username, avatar, and banner artwork</li>
          <li>Public biography and external social media links</li>
          <li>Published novels, comics, chapters, episodes, and story descriptions</li>
          <li>Public follower counts, story ratings, likes, and community engagement metrics</li>
        </ul>
        <p>
          Participation in creator monetization programs may require additional verification and tax/payout details, which are handled confidentially and processed through authorized payment infrastructure.
        </p>
      </LegalSection>

      {/* 6. USER-GENERATED CONTENT */}
      <LegalSection id="user-generated-content" number={6} title="User-Generated Content">
        <p>
          Yumora enables creators to upload and publish diverse creative formats, including novels, manga, comics, webtoons, illustrated novels, images, manuscripts, and PDF files.
        </p>
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs sm:text-sm leading-relaxed space-y-1">
          <p className="font-bold text-rose-300">Intellectual Property & Ownership:</p>
          <p>
            Yumora does <strong>not</strong> claim ownership of creator content. Creators retain full copyright and ownership of their original works. By uploading content to Yumora, creators grant Yumora the non-exclusive license to host, store, display, moderate, format, and distribute the work on the platform in accordance with the Terms of Service and Creator Agreement.
          </p>
        </div>
      </LegalSection>

      {/* 7. READING, FOLLOWING AND INTERACTION DATA */}
      <LegalSection id="reading-and-interaction-data" number={7} title="Reading, Following and Interaction Data">
        <p>
          To deliver a seamless reading experience across devices, Yumora processes activity data related to your platform interactions:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2">
          <li>Chapters, episodes, and stories accessed</li>
          <li>Reading progress, scroll position, and font/theme display preferences</li>
          <li>Bookmarks, personal library collections, and reading history</li>
          <li>Comments, chapter reactions, reviews, and story ratings</li>
          <li>Creators followed and release notification preferences</li>
        </ul>
        <p>
          This information allows us to resume your reading where you left off, send alerts when followed authors publish new chapters, and generate relevant recommendations.
        </p>
      </LegalSection>

      {/* 8. COOKIES AND SIMILAR TECHNOLOGIES */}
      <LegalSection id="cookies-and-tracking" number={8} title="Cookies and Similar Technologies">
        <p>
          We use cookies, local storage, and similar technologies to provide core functionality, maintain authenticated user sessions, and remember reader preferences (such as dark mode, typography settings, and reading progress).
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2">
          <li><strong>Essential Cookies:</strong> Required for secure authentication, session management, and routing.</li>
          <li><strong>Preference Storage:</strong> Stores custom reader settings, language selection, and theme modes.</li>
          <li><strong>Performance & Analytics Storage:</strong> Used to understand general platform performance where active.</li>
        </ul>
        <p>
          For detailed information on how we utilize cookies and how you can manage them, please review our{" "}
          <Link href="/cookies" className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4">
            Cookies Policy
          </Link>.
        </p>
      </LegalSection>

      {/* 9. ANALYTICS AND TECHNICAL INFORMATION */}
      <LegalSection id="analytics-and-technical-data" number={9} title="Analytics and Technical Information">
        <p>
          We may collect aggregated and technical usage metrics to monitor platform health, diagnose software errors, enhance user experience, and protect platform infrastructure against automated threats.
        </p>
        <p>
          Where external analytics services are engaged, technical metrics are evaluated in aggregate without selling individualized personal data. Service providers are bound by strict data handling obligations ([ANALYTICS PROVIDER, IF USED]).
        </p>
      </LegalSection>

      {/* 10. PAYMENTS AND CREATOR PAYOUTS */}
      <LegalSection id="payments-and-payouts" number={10} title="Payments and Creator Payouts">
        <p>
          When monetization, coin purchases, paid chapters, or creator subscriptions are enabled:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li>Payments and financial transactions are processed by PCI-DSS compliant third-party payment processors.</li>
          <li>Yumora does <strong>not</strong> collect or store full credit card or debit card numbers on its servers.</li>
          <li>Yumora receives transaction confirmations, order identifiers, and settlement statuses necessary to fulfill purchases and update account balances.</li>
          <li>Creators receiving earnings or payouts may be required to complete identity verification and submit payout details directly to authorized payout partners.</li>
        </ul>
        <p>
          For terms governing refunds and digital content transactions, please see our{" "}
          <Link href="/refund-policy" className="text-rose-500 hover:text-rose-400 font-semibold underline underline-offset-4">
            Refund Policy
          </Link>.
        </p>
      </LegalSection>

      {/* 11. THIRD-PARTY SERVICES */}
      <LegalSection id="third-party-services" number={11} title="Third-Party Services">
        <p>
          We may engage trusted third-party service providers to facilitate and support core infrastructure functions. These providers process information solely on our instructions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-rose-500" /> Authentication
            </p>
            <p className="text-zinc-500 text-xs mt-1">[AUTHENTICATION PROVIDER]</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-500" /> Hosting & Edge Delivery
            </p>
            <p className="text-zinc-500 text-xs mt-1">[HOSTING PROVIDER]</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" /> Database & Storage
            </p>
            <p className="text-zinc-500 text-xs mt-1">[DATABASE PROVIDER] / [STORAGE PROVIDER]</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Payment & Payouts
            </p>
            <p className="text-zinc-500 text-xs mt-1">[PAYMENT PROVIDER]</p>
          </div>
        </div>
      </LegalSection>

      {/* 12. INFORMATION SHARING */}
      <LegalSection id="information-sharing" number={12} title="Information Sharing">
        <p>
          We do not sell, rent, or trade your personal information to third parties. We disclose personal information only in the limited circumstances described below:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li><strong>Service Providers:</strong> With contractors and service vendors who need access to perform technical, operational, or infrastructure tasks on our behalf under confidentiality agreements.</li>
          <li><strong>Legal & Regulatory Compliance:</strong> When required by law, subpoena, legal process, or lawful request by public authorities.</li>
          <li><strong>Safety, Rights & Security:</strong> To enforce platform agreements, investigate violations, detect fraud, and protect the rights, property, and safety of Yumora, our users, or the public.</li>
          <li><strong>Business Transfers:</strong> In connection with or during negotiations of any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
        </ul>
      </LegalSection>

      {/* 13. INTERNATIONAL DATA TRANSFERS */}
      <LegalSection id="international-transfers" number={13} title="International Data Transfers">
        <p>
          Yumora operates a global storytelling service. Information we collect may be transferred to, stored, and processed in jurisdictions other than your country of residence, where data protection laws may differ from those in your jurisdiction.
        </p>
        <p>
          Where cross-border data transfers occur, we implement reasonable and legally recognized administrative, contractual, and technical safeguards to protect your personal data in accordance with this Privacy Policy.
        </p>
      </LegalSection>

      {/* 14. DATA RETENTION */}
      <LegalSection id="data-retention" number={14} title="Data Retention">
        <p>
          We retain personal information for as long as your account remains active or as reasonably necessary to fulfill the purposes outlined in this Privacy Policy, provide the Service, resolve disputes, maintain accurate financial records, detect and prevent fraud, and comply with applicable statutory obligations.
        </p>
      </LegalSection>

      {/* 15. ACCOUNT DELETION */}
      <LegalSection id="account-deletion" number={15} title="Account Deletion">
        <p>
          You may request or initiate the deletion of your account and associated personal profile information:
        </p>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm space-y-2">
          <p>
            {/* TODO: Route to /settings/account once the full settings screen is finalized */}
            To request account closure and data deletion, navigate to Account Settings (or contact{" "}
            <span className="font-mono text-rose-500">[PRIVACY CONTACT EMAIL]</span>).
          </p>
          <p className="text-zinc-500">
            Upon verified deletion, your personal profile data and private reading history will be permanently erased or anonymized, subject to any retention required by law or necessary for legitimate security and fraud prevention records.
          </p>
        </div>
      </LegalSection>

      {/* 16. YOUR PRIVACY RIGHTS */}
      <LegalSection id="your-privacy-rights" number={16} title="Your Privacy Rights">
        <p>
          Depending on your location and applicable privacy laws (such as GDPR in Europe or CCPA/CPRA in California), you may have specific statutory rights regarding your personal data:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
          {[
            "Right to Access: Request a copy of personal information we maintain about you.",
            "Right to Correction: Request correction of inaccurate or incomplete data.",
            "Right to Deletion: Request erasure of your personal information.",
            "Right to Portability: Receive your data in a structured, machine-readable format.",
            "Right to Object / Restrict: Object to or restrict certain processing activities.",
            "Right to Withdraw Consent: Revoke previously granted consent at any time.",
          ].map((right, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 text-xs sm:text-sm"
            >
              {right}
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500 pt-1">
          <em>Note: Your rights depend on the laws that apply to you.</em> To exercise your privacy rights, please submit your request to{" "}
          <span className="font-mono text-rose-500 font-semibold">[PRIVACY CONTACT EMAIL]</span>.
        </p>
      </LegalSection>

      {/* 17. CHILDREN'S PRIVACY */}
      <LegalSection id="childrens-privacy" number={17} title="Children's Privacy">
        <p>
          Yumora is not directed to children under the age of [YUMORA MINIMUM AGE POLICY TO BE FINALIZED]. We do not knowingly collect or solicit personal information from children in circumstances where applicable law prohibits such collection.
        </p>
        <p>
          If you are a parent or legal guardian and believe that a child has provided us with personal information without required authorization, please contact us at{" "}
          <span className="font-mono text-rose-500">[PRIVACY CONTACT EMAIL]</span>. We will promptly take steps to delete such information from our records.
        </p>
      </LegalSection>

      {/* 18. SECURITY SAFEGUARDS */}
      <LegalSection id="security-safeguards" number={18} title="Security Safeguards">
        <p>
          We implement reasonable technical, organizational, and physical safeguards designed to protect personal information from unauthorized access, loss, misuse, disclosure, alteration, or destruction.
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Please note that no method of transmission over the Internet or electronic storage system is completely secure. While we strive to protect your personal data, we cannot guarantee absolute security against all unforeseen threats.
        </p>
      </LegalSection>

      {/* 19. CHANGES TO THIS POLICY */}
      <LegalSection id="changes-to-policy" number={19} title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our operational practices, technological developments, or applicable legal requirements.
        </p>
        <p>
          When updates occur, we will revise the &ldquo;Last updated&rdquo; date at the top of this document. For material updates, we will provide additional notice where appropriate (such as platform announcements or direct email notices).
        </p>
      </LegalSection>

      {/* 20. CONTACT US */}
      <LegalSection id="contact-us" number={20} title="Contact Us">
        <p>If you have questions, inquiries, or requests regarding this Privacy Policy or our data practices, please contact us:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>Privacy & Data Inquiries</span>
            </div>
            <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200">[PRIVACY CONTACT EMAIL]</p>
            <p className="text-zinc-500 text-xs">For data access, correction, deletion, and regulatory matters.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
              <Building className="w-4 h-4" />
              <span>General Platform Support</span>
            </div>
            <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200">[SUPPORT EMAIL]</p>
            <p className="text-zinc-500 text-xs">For reader accounts, creator inquiries, and platform feedback.</p>
          </div>

          <div className="sm:col-span-2 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Legal Entity & Business Address</span>
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">[LEGAL ENTITY NAME]</p>
            <p className="text-xs text-zinc-500 font-mono">[BUSINESS ADDRESS]</p>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
