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
  Coins,
  Scale,
} from "lucide-react";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import { TOCItem } from "@/components/legal/TableOfContents";

export const metadata: Metadata = {
  title: "Terms & Conditions | Yomika",
  description:
    "Read the terms and conditions governing the use of the Yomika platform, including account rules, content policies, virtual coins, creator monetization, and copyright protection.",
};

const TOC_ITEMS: TOCItem[] = [
  { id: "acceptance", number: 1, title: "Acceptance of Terms" },
  { id: "eligibility", number: 2, title: "Eligibility & Accounts" },
  { id: "creator-ip", number: 3, title: "Creator IP & Content License" },
  { id: "content-guidelines", number: 4, title: "Community & Content Guidelines" },
  { id: "coins-and-payments", number: 5, title: "Virtual Coins & Payments" },
  { id: "tipping-and-monetization", number: 6, title: "Creator Tipping & Earnings" },
  { id: "danmaku-and-comments", number: 7, title: "Danmaku & Interactive Conduct" },
  { id: "contests-and-events", number: 8, title: "Contests & Monthly Prizes" },
  { id: "dmca-and-copyright", number: 9, title: "DMCA & Copyright Takedowns" },
  { id: "termination", number: 10, title: "Suspension & Account Termination" },
  { id: "disclaimers", number: 11, title: "Warranty Disclaimers" },
  { id: "limitation-of-liability", number: 12, title: "Limitation of Liability" },
  { id: "governing-law", number: 13, title: "Governing Law & Disputes" },
  { id: "contact-legal", number: 14, title: "Contact Information" },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      badge="Terms of Service"
      lastUpdated="August 2026"
      introduction="These Terms of Service govern your access to and use of Yomika's website, mobile experiences, creator studio, and storytelling reader."
      tocItems={TOC_ITEMS}
      disclaimer="Please read these terms carefully before accessing or using Yomika. By creating an account or using the platform, you agree to be bound by these terms."
    >
      {/* 1. ACCEPTANCE */}
      <LegalSection id="acceptance" number={1} title="Acceptance of Terms">
        <p>
          By creating an account, accessing, or browsing Yomika (the &ldquo;Platform&rdquo;, &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), you agree to comply with and be legally bound by these Terms and Conditions and our Privacy Policy.
        </p>
        <p>
          If you do not agree to these terms in their entirety, you must discontinue use of the platform immediately.
        </p>
      </LegalSection>

      {/* 2. ELIGIBILITY & ACCOUNTS */}
      <LegalSection id="eligibility" number={2} title="Eligibility & User Accounts">
        <p>
          You must be at least 13 years of age (or the minimum age required in your country) to register an account. If you are under 18, you confirm you have parental or guardian consent.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li><strong>Account Integrity:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
          <li><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete registration details and to update them as needed.</li>
          <li><strong>One Person, One Identity:</strong> Creating multiple accounts for fraudulent purposes, vote manipulation in contests, or ban evasion is strictly prohibited.</li>
        </ul>
      </LegalSection>

      {/* 3. CREATOR IP & CONTENT LICENSE */}
      <LegalSection id="creator-ip" number={3} title="Creator Intellectual Property & Licensing">
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs sm:text-sm leading-relaxed space-y-2">
          <p className="font-bold text-rose-300">100% Creator Ownership Guarantee:</p>
          <p>
            Creators retain full copyright, trademark, and intellectual property ownership over all original manuscripts, novel chapters, comic artwork, characters, and illustrations published on Yomika.
          </p>
        </div>
        <p className="pt-2">
          By publishing content on Yomika, you grant us a worldwide, non-exclusive, royalty-free license to host, cache, display, format, distribute, and promote your work on the platform and its reader applications solely for the purpose of operating the Service. You may remove or unpublish your works at any time.
        </p>
      </LegalSection>

      {/* 4. COMMUNITY & CONTENT GUIDELINES */}
      <LegalSection id="content-guidelines" number={4} title="Community & Content Guidelines">
        <p>To ensure a welcoming and safe storytelling ecosystem, all users must adhere to our standards:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-2">
          {[
            "No plagiarism or unauthorized re-uploads of others' works",
            "No hate speech, harassment, bullying, or targeted threats",
            "No non-consensual explicit content or child exploitation material",
            "Proper age-rating tags (Teen / Mature) on adult-themed stories",
            "No spam, unsolicited advertising, or malicious phishing links",
            "No automated scraping, bot attacks, or server exploitation",
          ].map((rule, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2"
            >
              <span className="text-rose-500 font-bold">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      {/* 5. VIRTUAL COINS & PAYMENTS */}
      <LegalSection id="coins-and-payments" number={5} title="Virtual Coins & Payments">
        <p>
          Yomika offers digital virtual coins that can be purchased through certified payment gateways (e.g. Razorpay, UPI, credit/debit cards).
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
          <li><strong>Digital Goods:</strong> Virtual coins have no monetary value outside Yomika and cannot be exchanged for real currency except by creators receiving verified tipping revenue.</li>
          <li><strong>Purchases are Final:</strong> All coin pack purchases are digital and non-refundable once credited to your account balance, except where required by applicable consumer law.</li>
          <li><strong>Secure Gateway:</strong> Payment processing is handled by PCI-DSS compliant providers. Yomika never stores raw credit/debit card numbers on its servers.</li>
        </ul>
      </LegalSection>

      {/* 6. CREATOR TIPPING & EARNINGS */}
      <LegalSection id="tipping-and-monetization" number={6} title="Creator Tipping & Earnings">
        <p>
          Readers may use virtual coins to tip creators and support ongoing serializations. Creators who meet monetization criteria may request payouts of accumulated earnings in accordance with our Creator Revenue Sharing Agreement.
        </p>
        <p>
          Payouts require identity verification and adherence to local tax and payout provider requirements.
        </p>
      </LegalSection>

      {/* 7. DANMAKU & INTERACTIVE CONDUCT */}
      <LegalSection id="danmaku-and-comments" number={7} title="Danmaku & Interactive Conduct">
        <p>
          Danmaku (floating bullet comments) and chapter discussion threads are intended to enhance the communal reading experience. Users who post spoilers without warning, abusive insults, or inappropriate content in Danmaku streams will face temporary or permanent commenting bans.
        </p>
      </LegalSection>

      {/* 8. CONTESTS & MONTHLY PRIZES */}
      <LegalSection id="contests-and-events" number={8} title="Contests & Monthly Prize Events">
        <p>
          Yomika organizes monthly writing competitions with cash prizes. Contest entries must be 100% original works submitted by the primary author. Any vote manipulation, bot voting, or plagiarism results in immediate disqualification and prize forfeiture.
        </p>
      </LegalSection>

      {/* 9. DMCA & COPYRIGHT TAKEDOWNS */}
      <LegalSection id="dmca-and-copyright" number={9} title="DMCA & Copyright Takedowns">
        <p>
          We respect intellectual property rights and respond promptly to notices of alleged copyright infringement under the Digital Millennium Copyright Act (DMCA).
        </p>
        <p>
          If you believe your copyrighted work has been infringed on Yomika, please submit a formal takedown notice with evidence of ownership to{" "}
          <span className="font-mono text-rose-500 font-semibold">megwansiabhishek7@gmail.com</span>.
        </p>
      </LegalSection>

      {/* 10. SUSPENSION & TERMINATION */}
      <LegalSection id="termination" number={10} title="Suspension & Account Termination">
        <p>
          Yomika reserves the right to suspend or terminate any account that violates these Terms of Service, engages in fraudulent payment activity, or compromises platform security, without prior notice.
        </p>
      </LegalSection>

      {/* 11. DISCLAIMERS */}
      <LegalSection id="disclaimers" number={11} title="Warranty Disclaimers">
        <p>
          The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
        </p>
      </LegalSection>

      {/* 12. LIMITATION OF LIABILITY */}
      <LegalSection id="limitation-of-liability" number={12} title="Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, Yomika and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use the platform.
        </p>
      </LegalSection>

      {/* 13. GOVERNING LAW */}
      <LegalSection id="governing-law" number={13} title="Governing Law & Disputes">
        <p>
          These Terms and any disputes arising out of or related to your use of Yomika shall be governed by and construed in accordance with applicable laws without regard to conflict of law principles.
        </p>
      </LegalSection>

      {/* 14. CONTACT LEGAL */}
      <LegalSection id="contact-legal" number={14} title="Contact & Legal Inquiries">
        <p>If you have questions regarding these Terms & Conditions, please contact us:</p>
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 pt-2">
          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Yomika Legal & Support Team</p>
          <p className="text-xs font-mono text-rose-500">megwansiabhishek7@gmail.com</p>
          <p className="text-xs text-zinc-500">Website: https://youmika.site</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
