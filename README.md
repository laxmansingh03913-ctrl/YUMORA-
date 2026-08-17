# Yumora - Global Web Novel & Comic Platform

**Yumora** is a high-performance, dark-themed storytelling universe where readers discover serial novels, manga, webtoons, and comics, and creators publish original stories with integrated monetization and reader analytics.

---

## 🌟 Key Features

- **📖 Immersive Reading Suite**: Customizable themes (Dark, Sepia, Slate, Light), font resizing, scroll tracking, and distraction-free reader mode.
- **✨ Creator Studio & Upload Engine**: Multi-format publishing (Novels, Illustrated Novels, Webtoons, Manga, and PDF Book auto-converter).
- **🛡️ 100% Profile Gate & Fraud Defense**: Quality gating for creator onboarding and bot-resistant monetization tiers.
- **💳 Royalties & Monetization Suite**: 3-level tier progression (Eligible, Established, Verified) and Stripe Connect payout preparation.
- **👥 Following & Community System**: Release notifications, author following, discussions, chapter comments, and ratings.
- **🔒 Authentication & Intended Destination Guard**: Supabase-powered OAuth (Google, Apple, Email) with seamless post-login reading redirect.
- **📜 Production-Ready Legal Architecture**: Comprehensive Privacy Policy (`/privacy`), Terms, and modular legal layouts.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS & Lucide Icons
- **Backend / Database**: Supabase & PostgreSQL (Prisma ORM)
- **Storage**: Supabase Storage Buckets (`covers`, `comics`, `manuscripts`, `avatars`)

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/laxmansingh03913-ctrl/YUMORA-.git
cd YUMORA-
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` or `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
All rights reserved © 2026 Yumora Platform.
